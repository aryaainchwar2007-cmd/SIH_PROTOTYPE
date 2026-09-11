from typing import Optional
from fastapi import APIRouter, Query

from backend.app.db.repository import repository
from backend.app.models.schemas import KpiMetricsResponse, RiskAnalyticsResponse

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/kpis", response_model=KpiMetricsResponse, summary="Get high-level disaster management KPIs")
def get_kpis(
    district: Optional[str] = Query(None, description="Optional district name filter"),
):
    """Returns headline KPIs: total habitations, critical habitations, exposed population,
    safe parcels, queue length, average suitability, and ML confidence.
    """
    return repository.get_kpis(district=district)


@router.get(
    "/risk-distribution",
    response_model=RiskAnalyticsResponse,
    summary="Get multi-hazard risk distribution and district metrics",
)
def get_risk_distribution(
    district: Optional[str] = Query(None, description="Optional district filter"),
):
    """Returns risk distribution by tier, hazard breakdown percentages, and district comparisons."""
    return repository.get_risk_analytics(district=district)
