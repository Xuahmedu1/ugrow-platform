"""
UGROW Analysis Router
API endpoints for file processing and KPI calculation
SRS Section 8 & 9 - Data Analysis Module and Platform Specifications
"""

import os
import uuid
import shutil
from typing import List, Dict, Any, Optional
from datetime import datetime, date
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session

from database import get_db
from models import User, PlatformType
from services.auth_service import get_current_user_dependency, get_current_admin
from services.report_service import KPICalculationService
# Optional import - Excel export is handled separately
try:
    from services.excel_export import ExcelExportService
except ImportError:
    ExcelExportService = None

# Import parsers from backend lib
from lib.parsers import (
    parse_talabat_file,
    parse_keeta_file,
    parse_noon_file,
    parse_smiles_file,
    parse_deliveroo_files,
    parse_careem_file,
)

router = APIRouter(prefix="/api/analysis", tags=["analysis"])

# ============================================
# Configuration
# ============================================

UPLOAD_DIR = Path(os.getenv("LOCAL_STORAGE_PATH", "./storage/uploads"))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# Platform to file extension mapping
PLATFORM_EXTENSIONS = {
    PlatformType.TALABAT: [".xlsx"],
    PlatformType.KEETA: [".xlsx"],
    PlatformType.NOON: [".csv"],
    PlatformType.SMILES: [".xls"],
    PlatformType.DELIVEROO: [".csv"],
    PlatformType.CAREEM: [".xlsx"],
}


# ============================================
# Helper Functions
# ============================================

def validate_platform_file(platform: PlatformType, filename: str) -> bool:
    """Validate file extension for platform"""
    ext = Path(filename).suffix.lower()
    return ext in PLATFORM_EXTENSIONS.get(platform, [])


def save_upload_file(upload_file: UploadFile, platform: PlatformType) -> Path:
    """Save uploaded file to disk with unique name"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    safe_filename = f"{platform.value}_{timestamp}_{unique_id}{Path(upload_file.filename).suffix}"
    file_path = UPLOAD_DIR / safe_filename
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    
    return file_path


def parse_platform_file(
    platform: PlatformType,
    file_path: Path,
    date_from: date,
    date_to: date
) -> Dict[str, Any]:
    """
    Parse file based on platform type
    Returns: {num_orders, total_sales, discount, net_revenue}
    """
    try:
        if platform == PlatformType.TALABAT:
            return parse_talabat_file(str(file_path), date_from, date_to)
        
        elif platform == PlatformType.KEETA:
            return parse_keeta_file(str(file_path), date_from, date_to)
        
        elif platform == PlatformType.NOON:
            return parse_noon_file(str(file_path), date_from, date_to)
        
        elif platform == PlatformType.SMILES:
            return parse_smiles_file(str(file_path), date_from, date_to)
        
        elif platform == PlatformType.DELIVEROO:
            # Deliveroo expects list of files
            return parse_deliveroo_files([str(file_path)], date_from, date_to)
        
        elif platform == PlatformType.CAREEM:
            return parse_careem_file(str(file_path), date_from, date_to)
        
        else:
            raise ValueError(f"Unsupported platform: {platform}")
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error parsing {platform.value} file: {str(e)}"
        )


# ============================================
# Analysis Endpoints
# ============================================

@router.post("/process", response_model=Dict[str, Any])
async def process_analysis(
    restaurant_id: str = Form(...),
    date_from: str = Form(...),
    date_to: str = Form(...),
    platforms: str = Form(...),  # JSON array of platform strings
    settings: str = Form(...),   # JSON object with actualSalesRate and foodCostRate per platform
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Process uploaded platform files and calculate KPIs
    Supports multiple files for Deliveroo
    """
    import json
    
    try:
        # Parse inputs
        platforms_list = [PlatformType(p) for p in json.loads(platforms)]
        settings_dict = json.loads(settings)
        date_from_parsed = date.fromisoformat(date_from)
        date_to_parsed = date.fromisoformat(date_to)
        
    except (json.JSONDecodeError, ValueError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid input format: {str(e)}"
        )
    
    # Validate files
    if not files or len(files) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No files uploaded"
        )
    
    # Group files by platform (for Deliveroo multiple files)
    platform_files: Dict[PlatformType, List[UploadFile]] = {}
    for file in files:
        # Determine platform from filename or form data
        # For now, assume single file per platform except Deliveroo
        platform = None
        for p in platforms_list:
            if p.value in file.filename.lower():
                platform = p
                break
        
        if not platform:
            # Try to match by extension
            ext = Path(file.filename).suffix.lower()
            for p in platforms_list:
                if ext in PLATFORM_EXTENSIONS.get(p, []):
                    platform = p
                    break
        
        if not platform:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Could not determine platform for file: {file.filename}"
            )
        
        if platform not in platform_files:
            platform_files[platform] = []
        platform_files[platform].append(file)
    
    # Check all required platforms have files
    missing_platforms = set(platforms_list) - set(platform_files.keys())
    if missing_platforms:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Missing files for platforms: {[p.value for p in missing_platforms]}"
        )
    
    # Process each platform
    platform_results = []
    saved_files = []
    
    try:
        for platform in platforms_list:
            platform_files_list = platform_files.get(platform, [])
            
            if not platform_files_list:
                continue
            
            # Save files
            saved_paths = []
            for upload_file in platform_files_list:
                file_path = save_upload_file(upload_file, platform)
                saved_paths.append(file_path)
                saved_files.append(file_path)
            
            # Parse files
            if platform == PlatformType.DELIVEROO:
                # Deliveroo can have multiple CSV files
                raw_data = parse_deliveroo_files([str(p) for p in saved_paths], date_from_parsed, date_to_parsed)
            else:
                # Other platforms use single file
                raw_data = parse_platform_file(platform, saved_paths[0], date_from_parsed, date_to_parsed)
            
            # Get settings for this platform
            platform_settings = settings_dict.get(platform.value, {
                "actualSalesRate": 75,
                "foodCostRate": 30
            })
            
            # Calculate KPIs
            kpi_service = KPICalculationService()
            kpis = kpi_service.calculate_kpis(
                num_orders=raw_data.get("num_orders", 0),
                total_sales=raw_data.get("total_sales", 0),
                discount=raw_data.get("discount", 0),
                net_revenue=raw_data.get("net_revenue", 0),
                actual_sales_rate=platform_settings.get("actualSalesRate", 75),
                food_cost_rate=platform_settings.get("foodCostRate", 30)
            )
            
            platform_results.append({
                "platform": platform.value,
                "kpi": kpis,
                "rawData": raw_data
            })
        
        # Calculate totals
        total_kpi = kpi_service.calculate_totals([r["kpi"] for r in platform_results])
        
        return {
            "success": True,
            "restaurantId": restaurant_id,
            "dateRange": {
                "from": date_from,
                "to": date_to
            },
            "platformResults": platform_results,
            "totalKPI": total_kpi,
            "settings": settings_dict
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Processing failed: {str(e)}"
        )
    
    finally:
        # Cleanup uploaded files (optional - can be kept for debugging)
        # for file_path in saved_files:
        #     try:
        #         file_path.unlink(missing_ok=True)
        #     except:
        #         pass
        pass


@router.post("/validate", response_model=Dict[str, Any])
async def validate_kpi_calculation(
    platform_results: List[Dict[str, Any]],
    total_kpi: Dict[str, float],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dependency)
):
    """
    Validate KPI calculations (debug/verification endpoint)
    Ensures total KPIs match sum of platform KPIs
    """
    kpi_service = KPICalculationService()
    validation = kpi_service.validate_kpi_data(platform_results, total_kpi)
    
    return {
        "valid": validation["valid"],
        "discrepancies": validation["discrepancies"] if not validation["valid"] else None,
        "calculatedTotal": validation["calculated_total"]
    }


@router.get("/platforms", response_model=List[Dict[str, Any]])
async def get_platform_requirements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dependency)
):
    """
    Get platform file format requirements
    """
    return [
        {
            "platform": p.value,
            "extensions": PLATFORM_EXTENSIONS[p],
            "description": f"{p.value.title()} export file"
        }
        for p in PlatformType
    ]


# ============================================
# File Preview Endpoint (for debugging)
# ============================================

@router.post("/preview/{platform}", response_model=Dict[str, Any])
async def preview_file(
    platform: PlatformType,
    file: UploadFile = File(...),
    date_from: str = Form(...),
    date_to: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Preview parsed data from a single file (admin debugging)
    """
    try:
        date_from_parsed = date.fromisoformat(date_from)
        date_to_parsed = date.fromisoformat(date_to)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format (YYYY-MM-DD)"
        )
    
    # Validate file extension
    if not validate_platform_file(platform, file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type for {platform.value}. Accepted: {PLATFORM_EXTENSIONS[platform]}"
        )
    
    # Save and parse
    file_path = save_upload_file(file, platform)
    
    try:
        raw_data = parse_platform_file(platform, file_path, date_from_parsed, date_to_parsed)
        
        return {
            "platform": platform.value,
            "filename": file.filename,
            "parsedData": raw_data,
            "sampleRows": raw_data.get("sample_rows", [])[:5]  # First 5 rows for preview
        }
        
    finally:
        # Cleanup
        try:
            file_path.unlink(missing_ok=True)
        except:
            pass