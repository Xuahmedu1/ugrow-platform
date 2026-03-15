"""
UGROW Report Service
Business logic for report management and history
SRS Section 12 - Report History & Client Access
"""

import json
import uuid
from datetime import datetime, date
from typing import List, Optional, Dict, Any
from pathlib import Path

from sqlalchemy.orm import Session # type: ignore
from sqlalchemy import desc, and_ # type: ignore

from models import (
    Report, 
    Restaurant, 
    User, 
    ReportCreate, 
    ReportResponse,
    KPIResultSchema,
    PlatformType
)
from services.auth_service import AuthService


# ============================================
# Report Service
# ============================================

class ReportService:
    def __init__(self, db: Session):
        self.db = db
        self.auth_service = AuthService(db)

    # ============================================
    # Create Report
    # ============================================

    def create_report(
        self,
        restaurant_id: uuid.UUID,
        created_by: uuid.UUID,
        date_from: date,
        date_to: date,
        platforms_included: List[PlatformType],
        kpi_data: Dict[str, Any],
        master_sheet_path: Optional[str] = None
    ) -> Report:
        """Create a new report record"""
        report = Report(
            id=uuid.uuid4(),
            restaurant_id=restaurant_id,
            created_by=created_by,
            date_from=date_from,
            date_to=date_to,
            platforms_included=[p.value for p in platforms_included],
            kpi_data_json=kpi_data,
            master_sheet_path=master_sheet_path,
            created_at=datetime.utcnow()
        )
        
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        
        return report

    # ============================================
    # Get Reports
    # ============================================

    def get_report_by_id(self, report_id: uuid.UUID) -> Optional[Report]:
        """Get single report by ID"""
        return self.db.query(Report).filter(Report.id == report_id).first()

    def get_reports_by_restaurant(
        self, 
        restaurant_id: uuid.UUID,
        limit: int = 50,
        offset: int = 0
    ) -> List[Report]:
        """Get all reports for a restaurant, newest first"""
        return (
            self.db.query(Report)
            .filter(Report.restaurant_id == restaurant_id)
            .order_by(desc(Report.created_at))
            .offset(offset)
            .limit(limit)
            .all()
        )

    def get_all_reports(
        self,
        limit: int = 100,
        offset: int = 0,
        restaurant_id: Optional[uuid.UUID] = None
    ) -> List[Report]:
        """Get all reports (admin view), optionally filtered by restaurant"""
        query = self.db.query(Report)
        
        if restaurant_id:
            query = query.filter(Report.restaurant_id == restaurant_id)
        
        return (
            query.order_by(desc(Report.created_at))
            .offset(offset)
            .limit(limit)
            .all()
        )

    def get_reports_by_date_range(
        self,
        restaurant_id: uuid.UUID,
        date_from: date,
        date_to: date
    ) -> List[Report]:
        """Get reports within a specific date range"""
        return (
            self.db.query(Report)
            .filter(
                and_(
                    Report.restaurant_id == restaurant_id,
                    Report.date_from >= date_from,
                    Report.date_to <= date_to
                )
            )
            .order_by(desc(Report.created_at))
            .all()
        )

    # ============================================
    # Delete Report
    # ============================================

    def delete_report(self, report_id: uuid.UUID) -> bool:
        """Delete a report and its associated files"""
        report = self.get_report_by_id(report_id)
        
        if not report:
            return False
        
        # Delete associated Excel file if exists
        if report.master_sheet_path:
            try:
                file_path = Path(report.master_sheet_path)
                if file_path.exists():
                    file_path.unlink()
            except Exception as e:
                # Log error but continue with DB deletion
                print(f"Error deleting file {report.master_sheet_path}: {e}")
        
        self.db.delete(report)
        self.db.commit()
        
        return True

    # ============================================
    # Update Report
    # ============================================

    def update_master_sheet_path(
        self,
        report_id: uuid.UUID,
        master_sheet_path: str
    ) -> bool:
        """Update the master sheet path for a report"""
        report = self.get_report_by_id(report_id)
        
        if not report:
            return False
        
        report.master_sheet_path = master_sheet_path
        self.db.commit()
        
        return True

    # ============================================
    # Validation & Permissions
    # ============================================

    def can_view_report(self, report: Report, user: User) -> bool:
        """Check if user can view a specific report"""
        # Admin can view all
        if user.is_admin:
            return True
        
        # Client can only view their own restaurant's reports
        if user.restaurant_id == report.restaurant_id:
            return True
        
        return False

    def can_delete_report(self, report: Report, user: User) -> bool:
        """Check if user can delete a report"""
        # Only admin can delete
        return user.is_admin

    # ============================================
    # Data Transformation
    # ============================================

    def to_response(self, report: Report) -> Dict[str, Any]:
        """Convert Report model to API response format"""
        return {
            "id": str(report.id),
            "restaurant_id": str(report.restaurant_id),
            "restaurant_name": report.restaurant.name if report.restaurant else "Unknown",
            "created_by": str(report.created_by),
            "created_by_name": report.created_by_user.username if report.created_by_user else "Unknown",
            "date_from": report.date_from.isoformat(),
            "date_to": report.date_to.isoformat(),
            "platforms_included": report.platforms_included,
            "kpi_data": report.kpi_data_json,
            "master_sheet_path": report.master_sheet_path,
            "created_at": report.created_at.isoformat(),
            "label": report.label
        }

    def to_response_list(self, reports: List[Report]) -> List[Dict[str, Any]]:
        """Convert list of Reports to response format"""
        return [self.to_response(r) for r in reports]

    # ============================================
    # Statistics & Analytics
    # ============================================

    def get_restaurant_report_count(self, restaurant_id: uuid.UUID) -> int:
        """Get total number of reports for a restaurant"""
        return (
            self.db.query(Report)
            .filter(Report.restaurant_id == restaurant_id)
            .count()
        )

    def get_platform_usage_stats(
        self,
        restaurant_id: uuid.UUID,
        months: int = 6
    ) -> Dict[str, Any]:
        """Get platform usage statistics for a restaurant"""
        from_date = datetime.utcnow().replace(day=1)
        for _ in range(months - 1):
            if from_date.month == 1:
                from_date = from_date.replace(year=from_date.year - 1, month=12)
            else:
                from_date = from_date.replace(month=from_date.month - 1)
        
        reports = (
            self.db.query(Report)
            .filter(
                and_(
                    Report.restaurant_id == restaurant_id,
                    Report.created_at >= from_date
                )
            )
            .all()
        )
        
        platform_counts = {}
        for report in reports:
            for platform in report.platforms_included:
                platform_counts[platform] = platform_counts.get(platform, 0) + 1
        
        return {
            "total_reports": len(reports),
            "platform_usage": platform_counts,
            "period_months": months
        }


# ============================================
# KPI Calculation Service
# ============================================

class KPICalculationService:
    """
    Backend verification of KPI calculations
    Ensures frontend calculations match server-side logic
    """

    @staticmethod
    def calculate_kpis(
        num_orders: int,
        total_sales: float,
        discount: float,
        net_revenue: float,
        actual_sales_rate: float,
        food_cost_rate: float
    ) -> Dict[str, float]:
        """
        Calculate all KPIs based on raw data and settings
        Matches frontend calculation logic exactly
        """
        # Basic calculations
        earnings = total_sales - discount
        actual_sales = total_sales * (actual_sales_rate / 100)
        expenses = earnings - net_revenue
        difference = net_revenue - actual_sales
        food_cost = actual_sales * (food_cost_rate / 100)
        difference_cost = net_revenue - food_cost

        return {
            "numOrders": num_orders,
            "totalSales": round(total_sales, 2),
            "discount": round(discount, 2),
            "earnings": round(earnings, 2),
            "actualSales": round(actual_sales, 2),
            "netRevenue": round(net_revenue, 2),
            "expenses": round(expenses, 2),
            "difference": round(difference, 2),
            "foodCost": round(food_cost, 2),
            "differenceCost": round(difference_cost, 2),
        }

    @staticmethod
    def calculate_totals(
        platform_results: List[Dict[str, Any]]
    ) -> Dict[str, float]:
        """
        Calculate total KPIs across all platforms
        Recalculates derived values rather than summing
        """
        # Sum base metrics
        total_sales = sum(p["totalSales"] for p in platform_results)
        discount = sum(p["discount"] for p in platform_results)
        net_revenue = sum(p["netRevenue"] for p in platform_results)
        num_orders = sum(p["numOrders"] for p in platform_results)
        
        # Calculate derived metrics
        earnings = total_sales - discount
        
        # For totals, we need weighted actual sales rate
        # This is an approximation - ideally we'd store the rate used
        actual_sales = sum(p.get("actualSales", 0) for p in platform_results)
        expenses = earnings - net_revenue
        difference = net_revenue - actual_sales
        food_cost = sum(p.get("foodCost", 0) for p in platform_results)
        difference_cost = net_revenue - food_cost

        return {
            "numOrders": num_orders,
            "totalSales": round(total_sales, 2),
            "discount": round(discount, 2),
            "earnings": round(earnings, 2),
            "actualSales": round(actual_sales, 2),
            "netRevenue": round(net_revenue, 2),
            "expenses": round(expenses, 2),
            "difference": round(difference, 2),
            "foodCost": round(food_cost, 2),
            "differenceCost": round(difference_cost, 2),
        }

    @staticmethod
    def validate_kpi_data(
        platform_results: List[Dict[str, Any]],
        total_kpi: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Validate that total KPIs match sum of platform KPIs
        Returns validation result with any discrepancies
        """
        calculated_total = KPICalculationService.calculate_totals(platform_results)
        
        discrepancies = {}
        tolerance = 0.01  # Allow for floating point differences
        
        for key in calculated_total:
            expected = calculated_total[key]
            actual = total_kpi.get(key, 0)
            if abs(expected - actual) > tolerance:
                discrepancies[key] = {
                    "expected": expected,
                    "actual": actual,
                    "difference": abs(expected - actual)
                }
        
        return {
            "valid": len(discrepancies) == 0,
            "discrepancies": discrepancies,
            "calculated_total": calculated_total
        }