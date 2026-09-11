from fastapi import APIRouter

from backend.app.services.simulation_service import simulation_service
from backend.app.models.schemas import WhatIfRequest, WhatIfResponse

router = APIRouter(prefix="/simulation", tags=["What-If Simulation"])


@router.post(
    "/what-if",
    response_model=WhatIfResponse,
    summary="Execute dynamic parametric policy simulation sandbox",
)
def simulate_what_if(payload: WhatIfRequest):
    """Executes dynamic parametric relocation simulation evaluating candidate site absorption
    headroom, travel distance buffers, and infrastructure strain.
    """
    return simulation_service.simulate_what_if(
        target_population=payload.targetPopulation,
        risk_threshold=payload.riskThreshold,
        max_distance_km=payload.maxDistanceKm,
        min_capacity=payload.minCapacity,
    )
