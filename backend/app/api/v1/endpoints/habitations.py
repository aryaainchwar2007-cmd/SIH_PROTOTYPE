from typing import List, Optional, Union
from fastapi import APIRouter, HTTPException, Query, Path

from backend.app.db.repository import repository
from backend.app.models.schemas import HabitationResponse

router = APIRouter(prefix="/habitations", tags=["Habitations"])


@router.get("", response_model=List[HabitationResponse], summary="List and filter vulnerable habitations")
def list_habitations(
    search: Optional[str] = Query(None, description="Search term for name, district, or hazard"),
    district: Optional[str] = Query(None, description="Filter by administrative district"),
    risk_tier: Optional[str] = Query(None, description="Filter by risk tier: Critical, High, Moderate, Low"),
    priority: Optional[Union[int, str]] = Query(None, description="Filter by priority tier (1, 2, 3, 4)"),
    sort_by: Optional[str] = Query("riskScore", description="Sort by: riskScore, population, priority"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(100, ge=1, le=500, description="Items per page"),
):
    """Returns list of vulnerable habitations with demographic, risk, and geospatial coordinates."""
    return repository.get_habitations(
        search_query=search,
        district=district,
        risk_tier=risk_tier,
        priority=priority,
        sort_by=sort_by,
        page=page,
        limit=limit,
    )


@router.get("/{id}", response_model=HabitationResponse, summary="Get single habitation details by ID")
def get_habitation(
    id: str = Path(..., description="Habitation unique identifier, e.g., HAB_001"),
):
    """Returns full demographic, risk, Shapley factor attributions, and coordinates for a habitation."""
    habitation = repository.get_habitation_by_id(id)
    if not habitation:
        raise HTTPException(status_code=404, detail=f"Habitation with ID '{id}' was not found.")
    return habitation
