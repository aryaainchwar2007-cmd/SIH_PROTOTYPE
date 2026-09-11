from typing import List
from fastapi import APIRouter

from backend.app.db.repository import repository
from backend.app.models.schemas import DistrictProfile

router = APIRouter(prefix="/districts", tags=["Districts"])


@router.get("", response_model=List[DistrictProfile], summary="Get monitored administrative district corridors")
def get_districts():
    """Returns profiles of monitored districts including vulnerable habitation counts,
    exposed population figures, and dominant hazard types.
    """
    return repository.get_districts()
