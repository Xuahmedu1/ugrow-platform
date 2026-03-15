from fastapi import APIRouter, HTTPException # type: ignore
from pydantic import BaseModel # type: ignore
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

router = APIRouter()

# ── In-memory storage (replace with database later) ───────────────────────────
REPORTS_DB: List[Dict] = []

# ── Schemas ───────────────────────────────────────────────────────────────────
class KPIResult(BaseModel):
    numOrders: float
    totalSales: float
    discount: float
    earnings: float
    actualSales: float
    expenses: float
    netRevenue: float
    difference: float
    foodCost: float
    differenceCost: float

class PlatformResult(BaseModel):
    platform: str
    kpi: KPIResult

class AnalysisSettings(BaseModel):
    actualSalesRate: float
    foodCostRate: float

class SaveReportRequest(BaseModel):
    restaurantId: str
    restaurantName: str
    dateFrom: str
    dateTo: str
    platforms: List[str]
    results: List[PlatformResult]
    totalKPI: KPIResult
    settings: AnalysisSettings
    createdBy: str

# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/save")
def save_report(body: SaveReportRequest):
    """Save a new analysis report"""
    report = {
        "id": str(uuid.uuid4()),
        "restaurantId": body.restaurantId,
        "restaurantName": body.restaurantName,
        "dateFrom": body.dateFrom,
        "dateTo": body.dateTo,
        "platforms": body.platforms,
        "results": [{"platform": r.platform, "kpi": r.kpi.model_dump()} for r in body.results],
        "totalKPI": body.totalKPI.model_dump(),
        "settings": body.settings.model_dump(),
        "createdAt": datetime.utcnow().isoformat() + "Z",
        "createdBy": body.createdBy,
    }
    REPORTS_DB.append(report)
    return {"success": True, "reportId": report["id"], "report": report}


@router.get("/restaurant/{restaurant_id}")
def get_reports_by_restaurant(restaurant_id: str):
    """Get all reports for a specific restaurant"""
    reports = [r for r in REPORTS_DB if r["restaurantId"] == restaurant_id]
    # Sort by createdAt descending (newest first)
    reports.sort(key=lambda x: x["createdAt"], reverse=True)
    return {"reports": reports}


@router.get("/all")
def get_all_reports():
    """Get all reports (admin only)"""
    reports = sorted(REPORTS_DB, key=lambda x: x["createdAt"], reverse=True)
    return {"reports": reports}


@router.get("/{report_id}")
def get_report(report_id: str):
    """Get a single report by ID"""
    report = next((r for r in REPORTS_DB if r["id"] == report_id), None)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.delete("/{report_id}")
def delete_report(report_id: str):
    """Delete a report"""
    global REPORTS_DB
    report = next((r for r in REPORTS_DB if r["id"] == report_id), None)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    REPORTS_DB = [r for r in REPORTS_DB if r["id"] != report_id]
    return {"success": True}