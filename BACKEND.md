# Backend Architecture & Implementation Documentation

**Project Title:** Intelligent GIS-Based Proactive Relocation Decision Support System  
**Smart India Hackathon (SIH) 2026:** Problem Statement ID 191  
**Scope:** Backend Architecture, FastAPI Services, Supabase PostgreSQL + PostGIS, and Spatial Infrastructure  
**Repository Location:** `SIH_PROTOTYPE/`  
**Last Updated:** September 2026  

---

## 1. Backend Overview

The **Intelligent GIS-Based Proactive Relocation Decision Support System (PS ID 191)** provides a data-driven administrative backend that transforms disaster management from a reactive posture (evacuation camps and rebuilding in hazard paths) to a proactive posture (identifying settlements in hazard zones in advance and prioritizing relocation to audited, safe recipient land parcels).

The backend delivers:
- **Spatial Red Zone Demarcation:** Ingestion and delineation of multi-hazard exclusion zones (landslide slopes, extreme rainfall triggers, flood inundation).
- **Vulnerability Profiling:** Continuous profiling of revenue villages and habitations, evaluating geomorphology, physical access cutoff, and demographic exposure.
- **Relocation Parcel Evaluation:** AHP-based suitability scoring across 7 spatial dimensions and carrying capacity auditing (land per capita, potable water aquifers, healthcare, schooling).
- **Phased Action Prioritization:** Automatic assignment of habitations into 4 administrative action tiers (Priority 1 to 4).
- **Interactive Policy Sandbox:** Real-time parametric simulation ("What-If" modeling) for relief commissioners and district collectors.
- **Statutory Reporting:** Export of official relocation action briefs and gazetted dossiers under Section 38 of the Disaster Management Act.

---

## 2. Architecture

The backend follows a strict 4-tier separation of concerns:

```text
┌─────────────────────────────────────────────────────────┐
│                      Client Layer                       │
│    React 18 / Vite / Leaflet WebGIS Client Dashboard    │
└────────────────────────────┬────────────────────────────┘
                             │ HTTP / JSON REST APIs
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    FastAPI API Layer                    │
│      Routers (v1), Pydantic Schemas, CORS, Lifespan     │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│               Business & Simulation Engines             │
│   RiskEngine, SuitabilityEngine, CapacityEngine,        │
│   PrioritizationEngine, SimulationService, ReportService │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│             Repository & Persistence Layer              │
│       DataRepository (Dual-Mode: Supabase / Mock)       │
│  SQLAlchemy 2.0 ORM + GeoAlchemy2 + Alembic Migrations  │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                Database Infrastructure                  │
│       Supabase Hosted PostgreSQL 15+ with PostGIS        │
│       Spatial GiST Indexes, SRID 4326 Point & Polygon   │
└─────────────────────────────────────────────────────────┘
```

### Key Architectural Tenets
1. **Dual-Mode Data Resilience:** The `DataRepository` connects primarily to Supabase PostgreSQL/PostGIS. If the database is unreachable or unconfigured, it transparently falls back to an in-memory repository (`mock_data.py`), guaranteeing zero system downtime during network drops or isolated testing.
2. **Stateless Service Layer:** Calculation engines operate purely on passed inputs and repository data, ensuring high concurrency and testability.
3. **Strict Coordinate Handling:** Standardized projection and geographic translation between database storage (WGS84 `Point(lon, lat)`), GeoJSON standard (`[lon, lat]`), and Leaflet mapping client (`[lat, lng]`).

---

## 3. Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Runtime** | Python | 3.14+ | Core programming runtime |
| **Framework** | FastAPI | >= 0.110.0 | High-performance asynchronous REST API framework |
| **ASGI Server** | Uvicorn | >= 0.28.0 | ASGI web server implementation |
| **Validation** | Pydantic / Pydantic Settings | >= 2.6.0 | Request/response data validation and settings management |
| **ORM** | SQLAlchemy | >= 2.0.0 | Object Relational Mapper and SQL abstraction |
| **Spatial ORM** | GeoAlchemy2 | >= 0.14.0 | PostGIS spatial extensions for SQLAlchemy |
| **Database Driver** | psycopg2-binary | >= 2.9.0 | Synchronous PostgreSQL database adapter |
| **Async Driver** | asyncpg | >= 0.29.0 | Asynchronous PostgreSQL driver specification |
| **Migrations** | Alembic | >= 1.13.0 | Database schema versioning and DDL migrations |
| **Spatial Geometry**| Shapely | >= 2.0.0 | Geometric manipulation and GeoJSON conversions |
| **PDF Generation** | ReportLab | >= 4.2.0 | Section 38 statutory dossier PDF generation |
| **Database** | Supabase PostgreSQL + PostGIS | 15+ | Cloud PostgreSQL instance with native spatial capabilities |

---

## 4. Repository Structure

The backend application is fully contained in `SIH_PROTOTYPE/backend/` and `SIH_PROTOTYPE/alembic.ini`:

```text
SIH_PROTOTYPE/
├── alembic.ini                                  # Alembic migration configuration
├── BACKEND.md                                   # Authoritative backend documentation (this file)
├── README.md                                    # Master project documentation
├── .env.example                                 # Public environment variable template
├── .gitignore                                   # Git ignore rules
│
├── backend/
│   ├── requirements.txt                         # Python package dependencies
│   ├── alembic/
│   │   ├── env.py                               # Alembic runtime environment (GeoAlchemy2 integrated)
│   │   ├── script.py.mako                       # Migration script template
│   │   ├── README                               # Alembic instructions
│   │   └── versions/
│   │       └── 0001_initial_schema.py           # Initial DDL migration with PostGIS geometries
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                              # FastAPI app entrypoint, CORS, lifespan, health checks
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── router.py                    # Aggregates all v1 endpoint routers
│   │   │       └── endpoints/
│   │   │           ├── alerts.py                # Early warning alerts API
│   │   │           ├── analytics.py             # KPIs and multi-hazard risk distributions
│   │   │           ├── districts.py             # Monitored district profiles
│   │   │           ├── habitations.py           # Vulnerable settlements listing and detail
│   │   │           ├── prioritization.py        # Phased action queue
│   │   │           ├── red_zones.py             # Delineated hazard boundary polygons
│   │   │           ├── relocation_sites.py      # Candidate safe parcels catalog
│   │   │           ├── reports.py               # Section 38 dossier metadata & PDF stream
│   │   │           ├── search.py                # Unified cross-entity search
│   │   │           └── simulation.py            # What-If policy simulation sandbox
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   └── config.py                        # Pydantic Settings and CRS configurations
│   │   ├── db/
│   │   │   ├── __init__.py
│   │   │   ├── session.py                       # Connection pooling and PostGIS health checks
│   │   │   ├── repository.py                    # Dual-mode data access layer
│   │   │   ├── seed_data.py                     # Database population script with geometries
│   │   │   └── mock_data.py                     # Canonical fallback dataset
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── orm_models.py                    # SQLAlchemy ORM definitions & GiST indexes
│   │   │   └── schemas.py                       # Pydantic request/response schemas
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── risk_engine.py                   # Multi-hazard composite risk calculation
│   │   │   ├── suitability_engine.py            # 7-factor AHP candidate site scoring
│   │   │   ├── capacity_engine.py               # Carrying capacity resource audits
│   │   │   ├── prioritization_engine.py         # Multi-attribute action ranking
│   │   │   ├── simulation_service.py            # Parametric resettlement sandbox
│   │   │   └── report_service.py                # Government dossier PDF generator
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── geo_utils.py                     # Haversine distance, Ray-casting, GeoJSON helpers
│   └── tests/
│       ├── __init__.py
│       ├── test_api_endpoints.py                # Tests for all 17 REST endpoints
│       ├── test_database.py                     # Tests for DB connectivity, PostGIS, ORM models
│       ├── test_engines.py                      # Tests for mathematical and GIS calculation engines
│       └── test_supabase_read.py                # Tests for live Supabase integration and coordinate format
│
├── data/                                        # Spatial data directories (raw, processed, exports)
├── docs/                                        # Architecture specifications and diagrams
├── frontend/                                    # React WebGIS frontend
├── gis/                                         # GIS pipeline scaffolds (raster, vector, pipelines)
└── ml/                                          # Machine learning scaffolds (features, models, training)
```

---

## 5. FastAPI Setup

### Application Initialization (`backend/app/main.py`)
- Application instance initialized with title, description, and OpenAPI docs paths:
  - Swagger UI: `GET /docs`
  - ReDoc: `GET /redoc`
  - OpenAPI JSON: `GET /openapi.json`
- **CORS Middleware:** Configured with `allow_credentials=True`, `allow_methods=["*"]`, `allow_headers=["*"]`, and origins bound to `settings.CORS_ORIGINS` (defaults: `http://localhost:5173`, `http://127.0.0.1:5173`).
- **Startup Pool Pre-Warming:** On startup event, invokes `warm_connection_pool(concurrency=3)` in `backend/app/db/session.py` to establish worker connections ahead of incoming traffic and eliminate cold-start handshake latency.
- **Prefix Mounting:** All v1 API routes are mounted under `/api/v1` via `api_v1_router`.

---

## 6. Complete API Endpoint Catalog

The backend exposes 14 required business endpoints plus 3 root/health endpoints (17 total HTTP routes):

| # | Method | Path | Summary | Query / Body Parameters | Response Model |
|---|---|---|---|---|---|
| **1** | `GET` | `/` | Root service descriptor | None | Service metadata JSON |
| **2** | `GET` | `/health` | API liveness health check | None | `{"status": "healthy", ...}` |
| **3** | `GET` | `/health/db` | Supabase & PostGIS health check | None | DB connection & PostGIS version JSON |
| **4** | `GET` | `/api/v1/analytics/kpis` | Disaster management headline KPIs | `district` (optional) | `KpiMetricsResponse` |
| **5** | `GET` | `/api/v1/analytics/risk-distribution` | Multi-hazard risk distribution | None | `RiskDistributionResponse` |
| **6** | `GET` | `/api/v1/districts` | Monitored administrative districts | None | `List[DistrictProfile]` |
| **7** | `GET` | `/api/v1/habitations` | Searchable/filterable habitations list | `search`, `district`, `risk_tier`, `priority`, `sort_by`, `page`, `limit` | `List[HabitationResponse]` |
| **8** | `GET` | `/api/v1/habitations/{id}` | Single settlement profile + TreeSHAP XAI | `id` (path string) | `HabitationResponse` (404 if not found) |
| **9** | `GET` | `/api/v1/relocation-sites` | Candidate safe parcels catalog | None | `List[CandidateSiteResponse]` |
| **10** | `GET` | `/api/v1/relocation-sites/{id}` | Single candidate parcel profile + AHP | `id` (path string) | `CandidateSiteResponse` (404 if not found) |
| **11** | `GET` | `/api/v1/hazards/red-zones` | Severe hazard boundary polygons | None | `List[RedZoneResponse]` |
| **12** | `GET` | `/api/v1/prioritization/queue` | Phased relocation action queue (P1–P4)| None | `List[PriorityQueueItemResponse]` |
| **13** | `POST`| `/api/v1/simulation/what-if` | Parametric resettlement simulation | Body: `SimulationRequest` (`targetPopulation`, `riskThreshold`, `maxDistanceKm`, `minCapacity`) | `SimulationResponse` |
| **14** | `GET` | `/api/v1/alerts` | Early warning alert stream | None | `List[AlertResponse]` |
| **15** | `POST`| `/api/v1/alerts/mark-all-read` | Acknowledge all active alerts | None | `{"status": "success", "markedCount": N}` |
| **16** | `GET` | `/api/v1/search` | Unified multi-entity search | `q` (query string, min length 1) | `SearchResponse` (`habitations`, `sites`, `redZones`) |
| **17** | `POST`| `/api/v1/reports/export-dossier` | Generate relocation dossier metadata | Body: `DossierRequest` (`habitationId`, `officerName`, `includeAhp`, `includeCarryingCapacity`) | `DossierMetadataResponse` |
| **18** | `GET` | `/api/v1/reports/download` | Binary download of Section 38 PDF | `habitation_id` (optional query string) | Binary `application/pdf` stream (`attachment; filename=...`) |

---

## 7. Database Architecture

The persistence layer is architected around **PostgreSQL with the PostGIS spatial extension**, hosted on Supabase.

```text
                                 ┌─────────────────────────┐
                                 │        districts        │
                                 │─────────────────────────│
                                 │ PK id VARCHAR(50)       │
                                 │    name VARCHAR(100)    │
                                 │    state VARCHAR(100)   │
                                 └───────────┬─────────────┘
                                             │ 1:N
                    ┌────────────────────────┴────────────────────────┐
                    │ 1:N                                             │ 1:N
                    ▼                                                 ▼
     ┌─────────────────────────────┐                   ┌─────────────────────────────┐
     │         habitations         │                   │  candidate_relocation_sites │
     │─────────────────────────────│                   │─────────────────────────────│
     │ PK id VARCHAR(50)           │                   │ PK id VARCHAR(50)           │
     │ FK district_id VARCHAR(50)  │                   │ FK district_id VARCHAR(50)  │
     │ FK recommended_site_id      │◀──────────────────│    name VARCHAR(150)        │
     │    name VARCHAR(150)        │   assigned to     │    suitability_score FLOAT  │
     │    risk_score FLOAT         │                   │    geom GEOMETRY(POINT,4326)│
     │    geom GEOMETRY(POINT,4326)│                   └─────────────────────────────┘
     └──────────────┬──────────────┘
                    │ 1:N
                    ▼
     ┌─────────────────────────────┐
     │    habitation_ai_factors    │
     │─────────────────────────────│
     │ PK id INTEGER (Auto-Inc)    │
     │ FK habitation_id (CASCADE)  │
     │    factor VARCHAR(150)      │
     │    impact VARCHAR(50)       │
     └─────────────────────────────┘

     ┌─────────────────────────────┐                   ┌─────────────────────────────┐
     │          red_zones          │                   │        system_alerts        │
     │─────────────────────────────│                   │─────────────────────────────│
     │ PK id VARCHAR(50)           │                   │ PK id VARCHAR(50)           │
     │    name VARCHAR(150)        │                   │    severity VARCHAR(30)     │
     │    geom GEOMETRY(POLY,4326) │                   │    read BOOLEAN             │
     └─────────────────────────────┘                   └─────────────────────────────┘
```

---

## 8. Supabase PostgreSQL Configuration

The connection manager (`backend/app/db/session.py`) initializes the database engine:
- **Dialect Handling:** Standardizes connection strings starting with `postgres://` into SQLAlchemy's required `postgresql://`.
- **Credential Escaping:** Special characters (such as `@` inside generated passwords) are automatically URL-encoded using `urllib.parse.quote_plus` via field validators in `backend/app/core/config.py`.
- **Connection Pool Configuration:**
  - `pool_size`: 5 (configurable via `DB_POOL_SIZE`, defaults to 10 in settings)
  - `max_overflow`: 10 (configurable via `DB_MAX_OVERFLOW`, defaults to 5 in settings)
  - `pool_timeout`: 15 seconds
  - `pool_recycle`: 300 seconds (prevents stale connections dropped by Supabase firewall)
  - `pool_pre_ping`: True (tests connection liveness before checking out from pool)
  - `connect_timeout`: 10 seconds (enforced via driver `connect_args`)
- **Session Dependency:** `get_db_session()` yields transactional SQLAlchemy `Session` instances with guaranteed closure in `finally` blocks.

---

## 9. PostGIS Configuration

PostGIS provides native spatial data types, coordinate reference system awareness, and spatial indexing inside PostgreSQL.
- **Extension Name:** `postgis`
- **Activation Command:** `CREATE EXTENSION IF NOT EXISTS postgis;`
- **Verification Query:** `SELECT PostGIS_Full_Version();`
- **Storage Coordinate Reference System:** **WGS84 (`EPSG:4326`)**
- **Projected Coordinate Reference System:** **UTM Zone 43N (`EPSG:32643`)** (used for high-precision metric buffering in India Western Ghats)
- **Spatial Indexing:** Automatically binds GiST indexes (`USING GIST (geom)`) to all geometry columns.

---

## 10. Database Tables (All 6 Tables)

### Table 1: `districts`
Monitored administrative district corridors.
- `id` (VARCHAR(50), Primary Key)
- `name` (VARCHAR(100), Not Null)
- `state` (VARCHAR(100), Not Null)
- `habitations_count` (INTEGER, Default 0)
- `critical_count` (INTEGER, Default 0)
- `exposed_pop` (INTEGER, Default 0)
- `dominant_hazard` (VARCHAR(200), Nullable)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Table 2: `habitations`
Vulnerable settlements exposed to natural hazards.
- `id` (VARCHAR(50), Primary Key)
- `name` (VARCHAR(150), Not Null)
- `district_id` (VARCHAR(50), Foreign Key -> `districts.id`)
- `district_name` (VARCHAR(100), Not Null)
- `state` (VARCHAR(100), Not Null)
- `population` (INTEGER, Not Null)
- `households` (INTEGER, Not Null)
- `kutcha_housing_percent` (FLOAT)
- `risk_score` (FLOAT, Not Null)
- `risk_tier` (VARCHAR(50), Not Null)
- `vulnerability_index` (FLOAT)
- `dominant_hazards` (VARCHAR(255))
- `slope_degree` (FLOAT)
- `rainfall_3d_mm` (FLOAT)
- `rainfall_anomaly_percent` (FLOAT)
- `road_isolation_distance_km` (FLOAT)
- `hospital_distance_km` (FLOAT)
- `historical_disasters_count` (INTEGER)
- `recent_casualties` (INTEGER)
- `priority` (INTEGER, Not Null, 1 to 4)
- `priority_label` (VARCHAR(100))
- `recommended_site_id` (VARCHAR(50), Foreign Key -> `candidate_relocation_sites.id`, Nullable)
- `geom` (GEOMETRY(POINT, 4326), PostGIS Point with GiST spatial index)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Table 3: `habitation_ai_factors`
Explainable AI / TreeSHAP factor attributions for settlements.
- `id` (INTEGER, Primary Key, Auto-Incrementing)
- `habitation_id` (VARCHAR(50), Foreign Key -> `habitations.id` on delete CASCADE, Not Null)
- `factor` (VARCHAR(150), Not Null)
- `impact` (VARCHAR(50), Not Null)
- `direction` (VARCHAR(20), Not Null: "increases_risk" or "decreases_risk")
- `description` (TEXT)
- `weight` (FLOAT, Default 0.0)

### Table 4: `candidate_relocation_sites`
Audited candidate safe parcels for population resettlement.
- `id` (VARCHAR(50), Primary Key)
- `name` (VARCHAR(150), Not Null)
- `district_id` (VARCHAR(50), Foreign Key -> `districts.id`)
- `district_name` (VARCHAR(100), Not Null)
- `state` (VARCHAR(100), Not Null)
- `distance_from_red_zone_km` (FLOAT)
- `usable_area_sqm` (FLOAT, Not Null)
- `usable_area_acres` (FLOAT)
- `estimated_capacity` (INTEGER, Not Null)
- `slope_degree` (FLOAT)
- `suitability_score` (FLOAT, Not Null)
- `overall_recommendation` (VARCHAR(100))
- `factor_hazard_safety` (INTEGER, 0–100)
- `factor_accessibility` (INTEGER, 0–100)
- `factor_land_suitability` (INTEGER, 0–100)
- `factor_water_availability` (INTEGER, 0–100)
- `factor_healthcare_access` (INTEGER, 0–100)
- `factor_education_access` (INTEGER, 0–100)
- `factor_carrying_capacity` (INTEGER, 0–100)
- `capacity_status` (VARCHAR(50))
- `carrying_capacity_factor` (FLOAT)
- `water_availability_status` (VARCHAR(255))
- `distance_to_road_m` (FLOAT)
- `road_accessibility` (VARCHAR(255))
- `distance_to_hospital_km` (FLOAT)
- `healthcare_status` (VARCHAR(255))
- `distance_to_school_km` (FLOAT)
- `schooling_status` (VARCHAR(255))
- `power_grid_access` (VARCHAR(255))
- `allocated_population` (INTEGER, Default 0)
- `maximum_absorption` (INTEGER)
- `remaining_capacity` (INTEGER)
- `utilization_percent` (FLOAT)
- `potable_water_daily_needed_kl` (FLOAT)
- `potable_water_daily_supplied_kl` (FLOAT)
- `hospital_beds_required` (INTEGER)
- `hospital_beds_available` (INTEGER)
- `geom` (GEOMETRY(POINT, 4326), PostGIS Point with GiST spatial index)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Table 5: `red_zones`
Delineated severe hazard boundary polygons (landslide, flood, cloudburst).
- `id` (VARCHAR(50), Primary Key)
- `name` (VARCHAR(150), Not Null)
- `hazard_type` (VARCHAR(100), Not Null)
- `risk_level` (VARCHAR(50), Not Null)
- `area_sq_km` (FLOAT)
- `enclosed_habitations_count` (INTEGER)
- `exposed_population` (INTEGER)
- `buffer_margin_m` (FLOAT, Default 300.0)
- `primary_trigger` (VARCHAR(255))
- `geom` (GEOMETRY(POLYGON, 4326), PostGIS Polygon with GiST spatial index)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Table 6: `system_alerts`
Early warning system alerts generated from sensor/hazard anomalies.
- `id` (VARCHAR(50), Primary Key)
- `severity` (VARCHAR(30), Not Null)
- `title` (VARCHAR(200), Not Null)
- `message` (TEXT, Not Null)
- `timestamp_text` (VARCHAR(100))
- `read` (BOOLEAN, Not Null, Default False)
- `district` (VARCHAR(100), Not Null)
- `created_at` (TIMESTAMP)

---

## 11. Relationships and Indexes

### Foreign Key Relationships
1. `habitations.district_id` -> `districts.id`
2. `candidate_relocation_sites.district_id` -> `districts.id`
3. `habitations.recommended_site_id` -> `candidate_relocation_sites.id`
4. `habitation_ai_factors.habitation_id` -> `habitations.id` (with `ON DELETE CASCADE`)

### Indexes
- **Spatial Indexes (GiST):**
  - `idx_habitations_geom` ON `habitations USING GIST (geom)`
  - `idx_candidate_relocation_sites_geom` ON `candidate_relocation_sites USING GIST (geom)`
  - `idx_red_zones_geom` ON `red_zones USING GIST (geom)`
- **Query Optimization Indexes (B-Tree):**
  - `idx_habitations_district` ON `habitations (district_name)`
  - `idx_habitations_risk_tier` ON `habitations (risk_tier)`
  - `idx_habitations_priority` ON `habitations (priority)`
  - `idx_sites_district` ON `candidate_relocation_sites (district_name)`
  - `idx_sites_suitability` ON `candidate_relocation_sites (suitability_score)`
  - `idx_alerts_read` ON `system_alerts (read)`

---

## 12. GIS Geometry Types & EPSG:4326

All spatial columns use **EPSG:4326 (WGS84)** geographic latitude and longitude:
- **Points:** `Geometry(geometry_type="POINT", srid=4326, spatial_index=True)` used for Habitations and Relocation Sites.
- **Polygons:** `Geometry(geometry_type="POLYGON", srid=4326, spatial_index=True)` used for Red Zone hazard boundaries.
- **GeoAlchemy2 Integration:** GeoAlchemy2 automatically generates PostGIS DDL with the `geometry(GeometryType, 4326)` type constraint and invokes `ST_SetSRID` during insertion.

---

## 13. Coordinate Conventions

The system enforces strict coordinate ordering rules to eliminate latitude/longitude transposition errors:

| Representation Layer | Format | Example | Implementation |
|---|---|---|---|
| **PostGIS Database** | `POINT(lon, lat)` (WGS84) | `POINT(73.4912 18.0645)` | WKT / PostGIS internal geometry |
| **GeoJSON Standard** | `[longitude, latitude]` | `[73.4912, 18.0645]` | `backend/app/utils/geo_utils.py` |
| **Leaflet WebGIS Client** | `[latitude, longitude]` | `[18.0645, 73.4912]` | Serialized in API response coordinates |

In `backend/app/db/repository.py`:
```python
# Convert PostGIS shapely Point (x=lon, y=lat) to Leaflet [lat, lng]
pt = to_shape(h.geom)
coords = [float(pt.y), float(pt.x)]

# Convert PostGIS Polygon exterior (lon, lat) to Leaflet ring [[lat, lng], ...]
coords = [[float(c[1]), float(c[0])] for c in poly.exterior.coords]
```

---

## 14. GeoJSON Conversion

Utility functions in `backend/app/utils/geo_utils.py` provide bi-directional conversion:
- `to_geojson_point(leaflet_coords: [lat, lng]) -> {"type": "Point", "coordinates": [lng, lat]}`
- `to_geojson_polygon(leaflet_coords_ring: [[lat, lng], ...]) -> {"type": "Polygon", "coordinates": [[[lng, lat], ...]]}` (automatically ensures closed ring where first point equals last point).

---

## 15. Spatial Queries

The backend utilizes PostGIS spatial functions when executing spatial analysis:
- **Spatial Containment:** `ST_Contains(red_zone.geom, habitation.geom)` finds habitations trapped within hazard boundaries.
- **Metric Distance:** `ST_Distance(ST_Transform(habitation.geom, 32643), ST_Transform(site.geom, 32643))` calculates geodesic distance in meters using the UTM Zone 43N projected coordinate system.
- **Spatial Buffering:** `ST_Buffer(ST_Transform(red_zone.geom, 32643), margin_meters)` generates spatial exclusion zones around severe hazards.

---

## 16. Distance Calculations

In addition to database-level PostGIS queries, the backend implements a pure-Python, zero-dependency **Haversine Great-Circle Distance** calculation (`backend/app/utils/geo_utils.py`):

$$\Delta\sigma = 2 \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)}\right)$$
$$d = R \times \Delta\sigma \quad (\text{where } R = 6371.0\text{ km})$$

Used by `PrioritizationEngine`, `SimulationService`, and `SuitabilityEngine` during offline execution and real-time What-If simulations.

---

## 17. Red-Zone Spatial Queries

Red Zone polygons are evaluated through two complementary spatial methods:
1. **PostGIS Spatial Join:**
   ```sql
   SELECT h.id, h.name, rz.name AS red_zone_name
   FROM habitations h
   JOIN red_zones rz ON ST_Within(h.geom, rz.geom);
   ```
2. **Ray-Casting Algorithm (`geo_utils.point_in_polygon`):**
   A pure Python ray-casting algorithm testing horizontal ray intersections against the polygon ring vertices for offline mock-mode verification and simulation queries.

---

## 18. Repository & Data-Access Layer

The `DataRepository` class (`backend/app/db/repository.py`) provides the core data-access abstraction:
- **Single Aggregate KPI Query:** Aggregates totals, counts, exposed populations, and averages into a single database round-trip query using SQL subqueries, eliminating N+1 overhead.
- **Eager Loading:** Uses SQLAlchemy `selectinload(Habitation.ai_factors)` to load TreeSHAP explainability records in a single query.
- **Transparent Fallback:** Catches database disconnections or unconfigured credentials and falls back to in-memory datasets (`mock_data.py`), returning an identical dictionary structure.
- **Origin Tracking:** Exposes `repository.data_source` returning `"supabase"` or `"mock_fallback"`, enabling the UI and automated tests to verify the active data origin.

---

## 19. Backend Services & Business Logic

### `RiskEngine` (`backend/app/services/risk_engine.py`)
Calculates composite disaster risk using the multi-hazard formulation:
$$\text{Composite Risk} = 0.45 \times H + 0.25 \times E + 0.30 \times V$$
- **Hazard ($H$):** Slope angle (>30°), 3-day extreme precipitation (>200mm pore-pressure curve), and historical recurrence.
- **Exposure ($E$):** Population density and single-road isolation distance.
- **Vulnerability ($V$):** Percentage of kutcha (mud/thatch) housing and proximity to medical trauma centers.
- Categorizes settlements into **Critical** ($\ge 75$), **High** ($55\text{--}74$), **Moderate** ($35\text{--}54$), or **Low** ($< 35$).
- Generates **TreeSHAP explainability factor attributions** detailing which environmental factor contributed most to the risk classification.

### `SuitabilityEngine` (`backend/app/services/suitability_engine.py`)
Scores candidate relocation parcels using the Analytical Hierarchy Process (AHP) across 7 weighted criteria:
$$\text{Suitability Score} = \sum_{i=1}^{7} w_i \times F_i$$
1. Hazard Safety ($w_1 = 0.25$) — Buffer distance from active Red Zones.
2. Land Suitability ($w_2 = 0.20$) — Flat terrain (slope < 15°).
3. Water Availability ($w_3 = 0.15$) — Aquifer yield vs CPHEEO norms.
4. Road Accessibility ($w_4 = 0.15$) — Proximity to all-weather state highways.
5. Healthcare Access ($w_5 = 0.10$) — Distance to primary health centers.
6. Education Access ($w_6 = 0.08$) — Distance to secondary schools.
7. Carrying Capacity ($w_7 = 0.07$) — Expansion capacity and contiguous land bank.

### `CapacityEngine` (`backend/app/services/capacity_engine.py`)
Audits infrastructure limits to prevent secondary humanitarian disasters:
- **Land Area Norm:** Minimum 45 m² per person (revenue land acquisition standard).
- **Potable Water Norm:** 135 Liters per capita per day (CPHEEO municipal benchmark).
- **Health Facilities:** Minimum 1 hospital bed per 500 relocated individuals.
- Computes `carrying_capacity_factor` ($\le 1.0$) and status: **Optimal**, **Near Capacity**, or **Exceeded**.

### `PrioritizationEngine` (`backend/app/services/prioritization_engine.py`)
Ranks settlements into a 4-tier administrative queue:
- **Priority 1 (Immediate Action — 0–6 months):** High risk ($\ge 75$), single-road cutoff, critical housing vulnerability.
- **Priority 2 (Short-Term — 6–18 months):** Risk score 60–74, near red zone perimeter.
- **Priority 3 (Medium-Term — 18–36 months):** Risk score 40–59, planned phased resettlement.
- **Priority 4 (In-Situ Monitoring):** Structurally defensible; low-hazard terrain.
- Automatically pairs each priority settlement with the closest suitable relocation site.

### `SimulationService` (`backend/app/services/simulation_service.py`)
Executes real-time parametric resettlement simulations:
- Filters habitations exceeding the user-specified `riskThreshold`.
- Filters recipient sites matching minimum acreage and maximum haul distance (`maxDistanceKm`).
- Simulates cumulative population absorption, calculates infrastructure deficits (water shortfalls, additional hospital beds), and returns an evaluated parcel comparison.

### `ReportService` (`backend/app/services/report_service.py`)
Generates statutory administrative briefs under Section 38 of the Disaster Management Act, 2005:
- Compiles settlement risk profile, Census statistics, and AHP suitability scores.
- Renders an official two-page PDF dossier with styling, data tables, and signature blocks using ReportLab.

---

## 20. Alembic Migrations

Database schema versioning is managed with Alembic:
- **Config File:** `SIH_PROTOTYPE/alembic.ini`
- **Migration Directory:** `SIH_PROTOTYPE/backend/alembic/`
- **Environment Script (`env.py`):** Configured to import `Base` from `backend.app.models.orm_models` and connect dynamically using `settings.DATABASE_URL`.
- **Baseline Migration:** `0001_initial_schema.py`
  - Creates tables: `districts`, `candidate_relocation_sites`, `habitations`, `habitation_ai_factors`, `red_zones`, `system_alerts`.
  - Configures PostGIS geometry types and GiST spatial indexes.
- **Execution Commands:**
  ```bash
  # Run pending migrations against Supabase
  alembic upgrade head

  # Rollback migration
  alembic downgrade -1
  ```

---

## 21. Seed Data

The database seeder (`backend/app/db/seed_data.py`) populates the Supabase instance:
- Ingests:
  - 5 administrative districts (Raigad, Pune, Ratnagiri, Wayanad, Shimla).
  - 15 vulnerable habitations with exact coordinates, TreeSHAP AI factors, and demographics.
  - 5 candidate relocation sites with 7-factor AHP suitability scores and carrying capacity metrics.
  - 3 severe hazard Red Zone boundary polygons with enclosed habitations and buffer margins.
  - 4 early warning system alerts.
- Converts coordinates into PostGIS WKT `ST_GeomFromText('POINT(...)', 4326)` and `ST_GeomFromText('POLYGON(...)', 4326)`.
- Idempotent: Can be executed multiple times without creating duplicate primary keys.
- Run Command:
  ```bash
  python -m backend.app.db.seed_data
  ```

---

## 22. Environment Variables

All configuration is declared in `backend/app/core/config.py`. Values are loaded from local `.env` files discovered in the workspace.

| Variable Name | Type | Purpose | Default / Example |
|---|---|---|---|
| `DATABASE_URL` | String | Supabase PostgreSQL/PostGIS connection URI | `postgresql://user:password@host:port/dbname` |
| `APP_NAME` | String | Application title in Swagger and headers | `"Intelligent GIS-Based Proactive Relocation DSS API"` |
| `APP_ENV` | String | Application environment | `"development"` |
| `APP_DEBUG` | Boolean | Enables debug logging and automatic reloader | `True` |
| `API_V1_STR` | String | API routing prefix | `"/api/v1"` |
| `PORT` | Integer | HTTP listening port | `8000` |
| `HOST` | String | Network interface binding | `"127.0.0.1"` |
| `USE_DATABASE` | Boolean | Enables/disables live database queries | `True` |
| `DB_FIRST_MODE` | Boolean | Prioritizes database queries over mock data | `True` |
| `CORS_ORIGINS` | List/String | Allowed frontend HTTP origins for CORS | `"http://localhost:5173,http://127.0.0.1:5173"` |
| `DB_POOL_SIZE` | Integer | Maximum persistent connections in pool | `5` |
| `DB_MAX_OVERFLOW` | Integer | Maximum overflow connections during bursts | `10` |
| `DB_TIMEOUT_SECONDS`| Integer | TCP connection timeout for database socket | `10` |
| `DEFAULT_STORAGE_CRS`| String | Storage Coordinate Reference System | `"EPSG:4326"` |
| `DEFAULT_PROJECTED_CRS`| String| Projected Coordinate Reference System | `"EPSG:32643"` |

> [!CAUTION]
> Never commit `.env` files to Git. The repository includes `.env.example` as a safe, secret-free template.

---

## 23. Testing & Test Results

The backend features an automated test suite with **54 comprehensive tests** spanning unit, mathematical, and database integration tests:

| Test Module | Tests | Focus Area | Result |
|---|:---:|---|:---:|
| `test_api_endpoints.py` | 19 | Verifies all 17 REST endpoints, parameter validation, 404 handling, PDF download stream | **PASS** |
| `test_database.py` | 6 | Verifies DB health checks, geometry generation, ORM table mappings, secret security | **PASS** |
| `test_engines.py` | 17 | Verifies RiskEngine, SuitabilityEngine, CapacityEngine, PrioritizationEngine, GeoUtils | **PASS** |
| `test_supabase_read.py` | 12 | Verifies live Supabase reading, Leaflet coordinates, eager joins, mock fallback switch | **PASS** |
| **Total** | **54** | **Complete backend test suite** | **54/54 PASS** |

### Execution Command:
```bash
python -m unittest discover -s backend/tests -v
```

---

## 24. Frontend / API Integration

The React/Vite frontend communicates with the FastAPI backend through `frontend/src/services/api.js`:
- **Base URL:** `http://127.0.0.1:8000/api/v1`
- **Graceful Fallback:** If the FastAPI backend is offline, `api.js` catches fetch exceptions and seamlessly serves data from `frontend/src/data/mockData.js`, displaying an in-app banner indicating offline status.
- **Component Mapping:**
  - `Dashboard.jsx` consumes `/analytics/kpis` and `/habitations`.
  - `GisMapViewer.jsx` renders spatial layers from `/habitations`, `/relocation-sites`, and `/hazards/red-zones`.
  - `RiskAnalysis.jsx` consumes `/analytics/risk-distribution`.
  - `PriorityPlanning.jsx` consumes `/prioritization/queue`.
  - `WhatIfSimulation.jsx` posts to `/simulation/what-if`.
  - `Reports.jsx` triggers `/reports/export-dossier` and downloads from `/reports/download`.

---

## 25. Backend Setup & Run Commands

### 1. Install Dependencies
```bash
cd SIH_PROTOTYPE
pip install -r backend/requirements.txt
```

### 2. Configure Environment
Create `.env` in the workspace root or in `SIH_PROTOTYPE/` (using `.env.example` as a reference):
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/[DATABASE]
```

### 3. Apply Database Migrations
```bash
alembic upgrade head
```

### 4. Seed Database
```bash
python -m backend.app.db.seed_data
```

### 5. Start Backend Server
```bash
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

---

## 26. Health-Check Endpoints

- **General API Liveness:**
  - `GET http://127.0.0.1:8000/health`
  - Response:
    ```json
    {
      "status": "healthy",
      "service": "Intelligent GIS-Based Proactive Relocation DSS API",
      "environment": "development"
    }
    ```

- **Database & PostGIS Health:**
  - `GET http://127.0.0.1:8000/health/db`
  - Response (Connected):
    ```json
    {
      "configured": true,
      "status": "healthy",
      "postgis_available": true,
      "postgis_version": "POSTGIS=\"3.3...\" ...",
      "message": "Successfully connected to Supabase PostgreSQL/PostGIS."
    }
    ```
  - Response (Offline / Fallback):
    ```json
    {
      "configured": false,
      "status": "unconfigured",
      "message": "DATABASE_URL environment variable is not set. System using in-memory mock repository fallback.",
      "postgis_available": false
    }
    ```

---

## 27. Current Completed Status

- [x] FastAPI modular architecture with v1 router and 10 endpoint modules.
- [x] All 14 required business REST API endpoints implemented and operational.
- [x] Supabase PostgreSQL connection pool with connection recycling and pre-warming.
- [x] PostGIS spatial columns (`Point`, `Polygon`) with WGS84 (`SRID:4326`) and GiST indexes.
- [x] 6 SQLAlchemy ORM models with relationship mappings and cascade rules.
- [x] Dual-mode repository pattern supporting both Supabase and transparent mock fallback.
- [x] Mathematical business engines (Risk, AHP Suitability, Carrying Capacity, Prioritization).
- [x] Parametric What-If simulation engine.
- [x] Statutory Section 38 PDF report generator using ReportLab.
- [x] Alembic migration suite establishing tables and spatial constraints.
- [x] Automated database seeder with spatial geometry ingestion.
- [x] Complete test suite with 54 passing automated tests.
- [x] React frontend integrated with backend API.

---

## 28. Remaining Backend / DB Work

The foundational backend and database layer is complete and fully functional. Future enhancements during subsequent phases include:
1. **Automated Raster Ingestion Worker:** Connecting Celery or background tasks to ingest satellite GeoTIFFs (DEM, precipitation anomalies) directly into PostGIS raster tables (`raster2pgsql`).
2. **Dynamic Live IoT Webhook:** Exposing an ingestion endpoint for IMD Doppler radar and automated river water-level gauges for real-time risk recomputation.
3. **Multi-User RBAC & Audit Trails:** Implementing JWT-based role authentication (Collector, Planner, Field Surveyor) and audit logging for gazetted relocation orders.

---

## 29. Known Limitations

1. **Synchronous Database Driver:** The current implementation uses synchronous SQLAlchemy with `psycopg2-binary` connection pooling. While sufficient for hackathon demonstration loads, high-throughput production deployments could transition to an asynchronous driver (`asyncpg`).
2. **Static Buffer Radius:** The default Red Zone safety buffer is set to 300m in prototype models. Real-world debris flow runout zones may vary based on geotechnical friction angles.
3. **Mock Data Mirroring:** If changes are made to `mock_data.py`, `seed_data.py` must be re-run to ensure the database reflects the updated seed values.

---

## 30. Security Notes

1. **Credential Isolation:** No live credentials, passwords, or Supabase project secrets are committed to Git. All credentials reside exclusively in unversioned local `.env` files.
2. **SQL Injection Prevention:** All queries in `DataRepository` and `SQLAlchemy` use parameterized queries or ORM abstractions. No raw string interpolation is performed on user inputs.
3. **CORS Whitelisting:** Cross-Origin Resource Sharing is explicitly restricted to designated development and staging domains (`http://localhost:5173`, `http://127.0.0.1:5173`).
4. **Coordinate Validation:** All spatial endpoints validate incoming coordinates against mathematical bounds (Latitude: $-90^\circ$ to $+90^\circ$, Longitude: $-180^\circ$ to $+180^\circ$).
