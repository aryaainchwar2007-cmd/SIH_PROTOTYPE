from fastapi import APIRouter, Query

from backend.app.db.repository import repository
from backend.app.models.schemas import UnifiedSearchResponse

router = APIRouter(prefix="/search", tags=["Unified Search"])


@router.get("", response_model=UnifiedSearchResponse, summary="Perform unified search across all GIS entities")
def search(
    q: str = Query(..., min_length=1, description="Search keyword across habitations, candidate sites, and hazards"),
):
    """Searches habitations, candidate relocation sites, and red zones for matching names,
    districts, hazards, or suitability recommendations.
    """
    return repository.search_all(query=q)
