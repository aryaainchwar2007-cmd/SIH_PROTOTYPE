from typing import List, Optional
from fastapi import APIRouter, Query

from backend.app.db.repository import repository
from backend.app.models.schemas import AlertResponse, MarkAlertsReadResponse

router = APIRouter(prefix="/alerts", tags=["Early Warning Alerts"])


@router.get("", response_model=List[AlertResponse], summary="Get early warning system alerts")
def get_alerts(
    unread_only: bool = Query(False, description="Filter for unread alerts only"),
):
    """Returns early warning alerts generated from sensor anomalies, rainfall breach curves,
    and ground displacement sensors.
    """
    return repository.get_alerts(unread_only=unread_only)


@router.post("/mark-all-read", response_model=MarkAlertsReadResponse, summary="Mark all alerts as acknowledged")
def mark_all_alerts_read():
    """Marks all early warning alerts as acknowledged in the repository."""
    count = repository.mark_all_alerts_read()
    return MarkAlertsReadResponse(success=True, markedCount=count)
