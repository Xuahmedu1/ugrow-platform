"""
UGROW Reports Router
API endpoints for report management
SRS Section 12 - Report History & Client Access
"""

import uuid
from typing import List, Optional
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status, Query # type: ignore
from sqlalchemy.orm import Session # type: ignore

from database import get_db
from models import User, ReportCreate, ReportResponse
from services.auth_service import get_current_user_dependency, get_current_admin
from services.report_service import ReportService, KPICalculationService

router = APIRouter(prefix="/api/reports", tags=["reports"])


# ============================================
# Admin Endpoints
# ============================================

@router.get("/all", response_model=List[dict])
async def get_all_reports(
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    restaurant_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Get all reports (admin only)
    Optional filter by restaurant_id
    """
    service = ReportService(db)
    
    rest_id = uuid.UUID(restaurant_id) if restaurant_id else None
    reports = service.get_all_reports(limit, offset, rest_id)
    
    return service.to_response_list(reports)


@router.get("/restaurant/{restaurant_id}", response_model=List[dict])
async def get_reports_by_restaurant(
    restaurant_id: str,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dependency)
):
    """
    Get reports for a specific restaurant
    Admin can view any, client can only view their own
    """
    service = ReportService(db)
    rest_id = uuid.UUID(restaurant_id)
    
    # Check permissions
    if not current_user.is_admin and current_user.restaurant_id != rest_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this restaurant's reports"
        )
    
    reports = service.get_reports_by_restaurant(rest_id, limit, offset)
    return service.to_response_list(reports)


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_report(
    report_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Create a new report (admin only)
    """
    service = ReportService(db)
    
    try:
        # Validate KPI data structure
        kpi_service = KPICalculationService()
        platform_results = report_data.get("results", [])
        total_kpi = report_data.get("totalKPI", {})
        
        validation = kpi_service.validate_kpi_data(platform_results, total_kpi)
        if not validation["valid"]:
            # Log discrepancy but don't block creation
            print(f"KPI validation warnings: {validation['discrepancies']}")
        
        # Create report
        report = service.create_report(
            restaurant_id=uuid.UUID(report_data["restaurantId"]),
            created_by=current_user.id,
            date_from=date.fromisoformat(report_data["dateFrom"]),
            date_to=date.fromisoformat(report_data["dateTo"]),
            platforms_included=[p for p in report_data.get("platforms", [])],
            kpi_data={
                "platformResults": platform_results,
                "totalKPI": total_kpi,
                "settings": report_data.get("settings", {})
            },
            master_sheet_path=report_data.get("masterSheetPath")
        )
        
        return service.to_response(report)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create report: {str(e)}"
        )


@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Delete a report (admin only)
    Also deletes associated Excel file
    """
    service = ReportService(db)
    
    success = service.delete_report(uuid.UUID(report_id))
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    return None


# ============================================
# Client Endpoints
# ============================================

@router.get("/my-reports", response_model=List[dict])
async def get_my_reports(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dependency)
):
    """
    Get current user's restaurant reports (client only)
    """
    if current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Use /all endpoint for admin access"
        )
    
    if not current_user.restaurant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not associated with any restaurant"
        )
    
    service = ReportService(db)
    reports = service.get_reports_by_restaurant(current_user.restaurant_id, limit, offset)
    
    return service.to_response_list(reports)


@router.get("/{report_id}", response_model=dict)
async def get_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dependency)
):
    """
    Get single report by ID
    Client can only view their own restaurant's reports
    """
    service = ReportService(db)
    report = service.get_report_by_id(uuid.UUID(report_id))
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    # Check permissions
    if not service.can_view_report(report, current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this report"
        )
    
    return service.to_response(report)


# ============================================
# Statistics Endpoints
# ============================================

@router.get("/stats/{restaurant_id}")
async def get_report_stats(
    restaurant_id: str,
    months: int = Query(6, ge=1, le=24),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dependency)
):
    """
    Get report statistics for a restaurant
    """
    service = ReportService(db)
    rest_id = uuid.UUID(restaurant_id)
    
    # Check permissions
    if not current_user.is_admin and current_user.restaurant_id != rest_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    stats = service.get_platform_usage_stats(rest_id, months)
    total_count = service.get_restaurant_report_count(rest_id)
    
    return {
        **stats,
        "total_reports_all_time": total_count
    }