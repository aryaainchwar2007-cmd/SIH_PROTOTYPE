import sys
import os

# Ensure project root is on sys.path for absolute imports
_project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    description="Intelligent GIS-Based Proactive Relocation Decision Support System API (SIH 2026 PS ID 191)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API v1 router
from backend.app.api.v1.router import api_v1_router
app.include_router(api_v1_router, prefix="/api/v1")


@app.on_event("startup")
def on_startup():
    from backend.app.db.session import warm_connection_pool
    warm_connection_pool(concurrency=3)


@app.get("/", tags=["Root"])
async def root():
    return {
        "service": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "docs_url": "/docs",
        "openapi_url": "/openapi.json",
        "health_url": "/health",
    }


@app.get("/health", tags=["Health"])
async def health():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "environment": settings.APP_ENV,
    }


@app.get("/health/db", tags=["Health"])
def health_db():
    """Reports Supabase PostgreSQL & PostGIS extension connectivity status."""
    from backend.app.db.session import check_db_health
    return check_db_health()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.APP_DEBUG,
    )
