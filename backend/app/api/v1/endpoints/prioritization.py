from typing import List, Optional
from fastapi import APIRouter, Query

from backend.app.services.prioritization_engine import prioritization_engine
from backend.app.models.schemas import PrioritizedHabitationResponse

router = APIRouter(prefix="/prioritization", tags=["Relocation Prioritization"])


@router.get(
    "/queue",
    response_model=List[PrioritizedHabitationResponse],
    summary="Get multi-attribute ranked relocation queue",
)
def get_prioritization_queue(
    tier: Optional[str] = Query("All", description="Filter by priority tier: 1, 2, 3, 4 or 'All'"),
):
    """Returns statutory ranked action queue (Priority 1: Immediate, Priority 2: High,
    Priority 3: Moderate, Priority 4: Monitoring) paired with optimal candidate parcels.
    """
    return prioritization_engine.get_ranked_queue(tier_filter=tier)
