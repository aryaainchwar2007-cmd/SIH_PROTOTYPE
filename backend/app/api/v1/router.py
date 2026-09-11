from fastapi import APIRouter

from backend.app.api.v1.endpoints.analytics import router as analytics_router
from backend.app.api.v1.endpoints.districts import router as districts_router
from backend.app.api.v1.endpoints.habitations import router as habitations_router
from backend.app.api.v1.endpoints.relocation_sites import router as relocation_sites_router
from backend.app.api.v1.endpoints.red_zones import router as red_zones_router
from backend.app.api.v1.endpoints.prioritization import router as prioritization_router
from backend.app.api.v1.endpoints.simulation import router as simulation_router
from backend.app.api.v1.endpoints.alerts import router as alerts_router
from backend.app.api.v1.endpoints.search import router as search_router
from backend.app.api.v1.endpoints.reports import router as reports_router

api_v1_router = APIRouter()

api_v1_router.include_router(analytics_router)
api_v1_router.include_router(districts_router)
api_v1_router.include_router(habitations_router)
api_v1_router.include_router(relocation_sites_router)
api_v1_router.include_router(red_zones_router)
api_v1_router.include_router(prioritization_router)
api_v1_router.include_router(simulation_router)
api_v1_router.include_router(alerts_router)
api_v1_router.include_router(search_router)
api_v1_router.include_router(reports_router)
