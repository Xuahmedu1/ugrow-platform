"""
UGROW Services Package
Business logic services for the UGROW platform
"""

from .auth_service import AuthService, get_current_user_dependency, get_current_admin
from .report_service import ReportService, KPICalculationService

# Try to import ExcelExportService, provide fallback if not available
try:
    from .excel_export import ExcelExportService
except ImportError:
    # Create a dummy class if excel_export is not available
    class ExcelExportService:
        def __init__(self):
            raise NotImplementedError("Excel export service not available. Install openpyxl and xlsxwriter.")
    
    print("WARNING: ExcelExportService not available. Excel export functionality disabled.")

__all__ = [
    "AuthService",
    "ReportService",
    "KPICalculationService",
    "ExcelExportService",
    "get_current_user_dependency",
    "get_current_admin",
]