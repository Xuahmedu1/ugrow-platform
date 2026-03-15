"""
UGROW Excel Export Service
Master Sheet generation with placeholder replacement
SRS Section 11 - Master Sheet Export
"""

import os
import re
import shutil
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List

try:
    from openpyxl import load_workbook
    from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
    EXCEL_AVAILABLE = True
except ImportError:
    EXCEL_AVAILABLE = False
    print("WARNING: openpyxl not installed. Excel export functionality disabled.")


class ExcelExportService:
    """
    Handles Excel Master Sheet generation
    Preserves template formatting, replaces only cell values
    """
    
    def __init__(self):
        if not EXCEL_AVAILABLE:
            raise ImportError("openpyxl is required for Excel export. Run: pip install openpyxl")
        
        self.template_path = Path(os.getenv(
            "MASTER_SHEET_TEMPLATE_PATH",
            "./templates/Master_Sheet.xlsx"
        ))
        self.output_dir = Path(os.getenv(
            "EXPORTS_OUTPUT_PATH",
            "./exports"
        ))
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def generate_master_sheet(
        self,
        restaurant_name: str,
        date_from: str,
        date_to: str,
        platform_results: List[Dict[str, Any]],
        total_kpi: Dict[str, float]
    ) -> str:
        """
        Generate Master Sheet Excel file with KPI data
        
        Args:
            restaurant_name: Name of the restaurant
            date_from: Start date (YYYY-MM-DD)
            date_to: End date (YYYY-MM-DD)
            platform_results: List of {platform, kpi} dicts
            total_kpi: Aggregated KPI totals
        
        Returns:
            Path to generated Excel file
        """
        if not EXCEL_AVAILABLE:
            raise ImportError("openpyxl is required for Excel export")
        
        # Validate template exists
        if not self.template_path.exists():
            raise FileNotFoundError(f"Master Sheet template not found: {self.template_path}")
        
        # Load template (preserve formatting)
        wb = load_workbook(self.template_path, data_only=False)
        ws = wb.active
        
        # Replace basic placeholders
        ws = self._replace_basic_placeholders(ws, restaurant_name, date_from, date_to)
        
        # Replace platform KPI placeholders
        ws = self._replace_platform_kpis(ws, platform_results)
        
        # Replace total KPI placeholders
        ws = self._replace_total_kpis(ws, total_kpi)
        
        # Generate output filename
        safe_name = self._sanitize_filename(restaurant_name)
        safe_from = date_from.replace('/', '-')
        safe_to = date_to.replace('/', '-')
        output_filename = f"{safe_name}_{safe_from}_{safe_to}.xlsx"
        output_path = self.output_dir / output_filename
        
        # Save
        wb.save(output_path)
        
        return str(output_path)
    
    def _replace_basic_placeholders(
        self,
        ws,
        restaurant_name: str,
        date_from: str,
        date_to: str
    ):
        """Replace basic info placeholders"""
        # Convert dates to DD/MM/YYYY format
        from_date_formatted = self._format_date(date_from)
        to_date_formatted = self._format_date(date_to)
        
        placeholders = {
            'r_name': restaurant_name,
            'f_date': from_date_formatted,
            't_date': to_date_formatted,
        }
        
        for row in ws.iter_rows():
            for cell in row:
                if cell.value and isinstance(cell.value, str):
                    for placeholder, value in placeholders.items():
                        if placeholder in cell.value:
                            cell.value = cell.value.replace(placeholder, str(value))
        
        return ws
    
    def _replace_platform_kpis(self, ws, platform_results: List[Dict[str, Any]]):
        """
        Replace platform-specific KPI placeholders
        
        Platform mapping:
        1: Talabat
        2: Keeta
        3: Noon
        4: Careem
        5: Deliveroo
        6: Smiles (Eateasily)
        """
        # Map platform names to numbers
        platform_map = {
            'talabat': 1,
            'keeta': 2,
            'noon': 3,
            'careem': 4,
            'deliveroo': 5,
            'smiles': 6,
        }
        
        # KPI field to placeholder suffix mapping
        kpi_fields = {
            'numOrders': 'num_orders',
            'totalSales': 'total_sales',
            'discount': 'discount',
            'earnings': 'earnings',
            'actualSales': 'actual_sales',
            'netRevenue': 'net_revenue',
            'expenses': 'expenses',
            'difference': 'difference',
            'foodCost': 'food_cost',
            'differenceCost': 'd_food_cost',
        }
        
        for result in platform_results:
            platform = result['platform']
            kpi = result['kpi']
            
            platform_num = platform_map.get(platform.lower())
            if not platform_num:
                continue
            
            # Build placeholders for this platform
            placeholders = {}
            for field, suffix in kpi_fields.items():
                placeholder = f"{suffix}_{platform_num}"
                value = kpi.get(field, 0)
                placeholders[placeholder] = self._format_currency(value)
            
            # Replace in worksheet
            for row in ws.iter_rows():
                for cell in row:
                    if cell.value and isinstance(cell.value, str):
                        for placeholder, value in placeholders.items():
                            if placeholder in cell.value:
                                cell.value = cell.value.replace(placeholder, str(value))
        
        return ws
    
    def _replace_total_kpis(self, ws, total_kpi: Dict[str, float]):
        """Replace total/aggregated KPI placeholders (no suffix)"""
        kpi_fields = {
            'numOrders': 'num_orders',
            'totalSales': 'total_sales',
            'discount': 'discount',
            'earnings': 'earnings',
            'actualSales': 'actual_sales',
            'netRevenue': 'net_revenue',
            'expenses': 'expenses',
            'difference': 'difference',
            'foodCost': 'food_cost',
            'differenceCost': 'd_food_cost',
        }
        
        placeholders = {}
        for field, suffix in kpi_fields.items():
            value = total_kpi.get(field, 0)
            placeholders[suffix] = self._format_currency(value)
        
        for row in ws.iter_rows():
            for cell in row:
                if cell.value and isinstance(cell.value, str):
                    for placeholder, value in placeholders.items():
                        # Match exact placeholder (not substrings of other placeholders)
                        pattern = r'\b' + re.escape(placeholder) + r'\b'
                        if re.search(pattern, cell.value):
                            cell.value = re.sub(pattern, str(value), cell.value)
        
        return ws
    
    @staticmethod
    def _sanitize_filename(name: str) -> str:
        """Sanitize restaurant name for filename"""
        # Remove Arabic characters
        name = re.sub(r'[\u0600-\u06FF]', '', name)
        # Replace spaces with underscores
        name = name.replace(' ', '_')
        # Remove special characters
        name = re.sub(r'[^\w\-_]', '', name)
        # Limit length
        return name[:50]
    
    @staticmethod
    def _format_date(date_str: str) -> str:
        """Convert YYYY-MM-DD to DD/MM/YYYY"""
        try:
            dt = datetime.strptime(date_str, '%Y-%m-%d')
            return dt.strftime('%d/%m/%Y')
        except ValueError:
            return date_str
    
    @staticmethod
    def _format_currency(value: float) -> str:
        """Format number as currency string with 2 decimal places"""
        return f"{float(value):.2f}"
    
    def get_export_file(self, file_path: str) -> bytes:
        """Read export file as bytes for download"""
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"Export file not found: {file_path}")
        
        with open(path, 'rb') as f:
            return f.read()
    
    def delete_export_file(self, file_path: str) -> bool:
        """Delete an export file"""
        try:
            Path(file_path).unlink(missing_ok=True)
            return True
        except Exception:
            return False
        
        