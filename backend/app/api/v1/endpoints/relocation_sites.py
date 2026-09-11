from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, Path

from backend.app.db.repository import repository
from backend.app.models.schemas import CandidateSiteResponse

router = APIRouter(prefix="/relocation-sites", tags=["Relocation Sites"])


@router.get("", response_model=List[CandidateSiteResponse], summary="List and filter candidate safe relocation sites")
def list_relocation_sites(
    search: Optional[str] = Query(None, description="Search term for name, district, or recommendation"),
    district: Optional[str] = Query(None, description="Filter by administrative district"),
    min_suitability: Optional[float] = Query(None, ge=0, le=100, description="Minimum AHP suitability score %"),
    min_capacity: Optional[int] = Query(None, ge=0, description="Minimum absorption capacity"),
):
    """Returns candidate safe relocation parcels audited for multi-criteria suitability and carrying capacity."""
    return repository.get_relocation_sites(
        search_query=search,
        district=district,
        min_suitability=min_suitability,
        min_capacity=min_capacity,
    )


@router.get("/{id}", response_model=CandidateSiteResponse, summary="Get single relocation site details by ID")
def get_relocation_site(
    id: str = Path(..., description="Candidate relocation site unique identifier, e.g., SITE_001"),
):
    """Returns full multi-criteria suitability breakdown, carrying capacity metrics, and coordinates for a site."""
    site = repository.get_relocation_site_by_id(id)
    if not site:
        raise HTTPException(status_code=404, detail=f"Candidate relocation site with ID '{id}' was not found.")
    return site
