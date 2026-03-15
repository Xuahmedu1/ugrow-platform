from fastapi import APIRouter # type: ignore
from fastapi.responses import StreamingResponse # pyright: ignore[reportMissingImports]
from pydantic import BaseModel # type: ignore
from typing import List, Dict, Any
import io

from services.excel_export import generate_master_sheet

router = APIRouter()

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

class ExportRequest(BaseModel):
    restaurantName: str
    dateFrom: str
    dateTo: str
    platformResults: List[PlatformResult]
    totalKPI: KPIResult

# ── Routes ────────────────────────────────────────────────────────────────────
@router.post("/master-sheet")
def export_master_sheet(body: ExportRequest):
    """Generate and return Master Sheet Excel file"""

    excel_bytes = generate_master_sheet(
        restaurant_name  = body.restaurantName,
        date_from        = body.dateFrom,
        date_to          = body.dateTo,
        platform_results = [{"platform": r.platform, "kpi": r.kpi.model_dump()} for r in body.platformResults],
        total_kpi        = body.totalKPI.model_dump(),
    )

    filename = f"UGROW_MasterSheet_{body.restaurantName.replace(' ', '_')}_{body.dateFrom}_{body.dateTo}.xlsx"

    return StreamingResponse(
        io.BytesIO(excel_bytes),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )