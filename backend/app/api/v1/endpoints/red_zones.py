from typing import List, Optional
from fastapi import APIRouter, Query

from backend.app.db.repository import repository
from backend.app.models.schemas import RedZoneResponse

router = APIRouter(prefix="/hazards", tags=["Hazards & Red Zones"])


@router.get("/red-zones", response_model=List[RedZoneResponse], summary="Get delineated active hazard red zones")
def get_red_zones(
    district: Optional[str] = Query(None, description="Optional district name filter"),
):
    """Returns spatial polygons and risk metrics for severe landslide, flash flood, and cloudburst zones."""
    return repository.get_red_zones(district=district)
