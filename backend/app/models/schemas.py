from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field


# ==============================================================================
# 1. KPI & Analytics Schemas
# ==============================================================================

class KpiMetricsResponse(BaseModel):
    totalHabitations: int = Field(..., description="Total habitations monitored")
    highRiskHabitations: int = Field(..., description="Habitations with risk >= 55")
    criticalRedZoneHabitations: int = Field(..., description="Habitations with risk >= 75 in Red Zones")
    populationExposed: int = Field(..., description="Total population exposed to severe hazard")
    potentialRelocationSites: int = Field(..., description="Verified safe candidate parcels")
    immediateRelocationQueue: int = Field(..., description="Habitations needing Priority 1 action")
    averageSuitabilityScore: float = Field(..., description="Average suitability % across safe parcels")
    districtsMonitored: int = Field(..., description="Total district administrative corridors")
    lastUpdated: str = Field(..., description="ISO timestamp of last update")
    modelConfidence: str = Field(..., description="ML model confidence score")


class RiskDistributionTier(BaseModel):
    tier: str
    count: int
    color: str
    popExposed: int


class HazardContribution(BaseModel):
    hazard: str
    contributionPercent: int


class DistrictComparison(BaseModel):
    district: str
    floodRisk: int
    landslideRisk: int
    rainRisk: int
    composite: int


class RiskAnalyticsResponse(BaseModel):
    distribution: List[RiskDistributionTier]
    hazardContributions: List[HazardContribution]
    districtComparisons: List[DistrictComparison]


# ==============================================================================
# 2. District Schemas
# ==============================================================================

class DistrictProfile(BaseModel):
    id: str
    name: str
    state: str
    habitationsCount: int
    criticalCount: int
    exposedPop: int
    dominantHazard: str


# ==============================================================================
# 3. Habitation Schemas
# ==============================================================================

class AiFactor(BaseModel):
    factor: str
    impact: str
    direction: str
    description: str
    weight: float


class HabitationResponse(BaseModel):
    id: str
    name: str
    district: str
    state: str
    coordinates: List[float] = Field(..., description="Leaflet coordinate pair [latitude, longitude]")
    population: int
    households: int
    riskScore: float
    riskTier: str
    vulnerabilityIndex: float
    dominantHazards: str
    slopeDegree: float
    rainfall3dMm: float
    rainfallAnomalyPercent: float
    kutchaHousingPercent: float
    roadIsolationDistanceKm: float
    hospitalDistanceKm: float
    historicalDisastersCount: int
    recentCasualties: int
    priority: int
    priorityLabel: str
    recommendedSiteId: Optional[str] = None
    aiFactors: Optional[List[AiFactor]] = None


# ==============================================================================
# 4. Relocation Site Schemas
# ==============================================================================

class SuitabilityBreakdown(BaseModel):
    hazardSafety: int
    accessibility: int
    landSuitability: int
    waterAvailability: int
    healthcareAccess: int
    educationAccess: int
    carryingCapacity: int


class CapacityMetrics(BaseModel):
    allocatedPopulation: int
    maximumAbsorption: int
    remainingCapacity: int
    utilizationPercent: float
    potableWaterDailyNeededKl: float
    potableWaterDailySuppliedKl: float
    hospitalBedsRequired: int
    hospitalBedsAvailable: int


class CandidateSiteResponse(BaseModel):
    id: str
    name: str
    district: str
    state: str
    coordinates: List[float] = Field(..., description="Leaflet coordinate pair [latitude, longitude]")
    distanceFromRedZoneKm: float
    usableAreaSqm: float
    usableAreaAcres: float
    estimatedCapacity: int
    slopeDegree: float
    suitabilityScore: float
    capacityStatus: str
    carryingCapacityFactor: float
    waterAvailabilityStatus: str
    distanceToRoadM: float
    roadAccessibility: str
    distanceToHospitalKm: float
    healthcareStatus: str
    distanceToSchoolKm: float
    schoolingStatus: str
    powerGridAccess: str
    overallRecommendation: str
    suitabilityBreakdown: Optional[SuitabilityBreakdown] = None
    capacityMetrics: Optional[CapacityMetrics] = None


# ==============================================================================
# 5. Red Zone Schemas
# ==============================================================================

class RedZoneResponse(BaseModel):
    id: str
    name: str
    hazardType: str
    riskLevel: str
    areaSqKm: float
    enclosedHabitationsCount: int
    exposedPopulation: int
    bufferMarginM: float
    primaryTrigger: str
    coordinates: List[List[float]] = Field(..., description="Polygon boundary ring coordinates [[lat, lng], ...]")


# ==============================================================================
# 6. Prioritization Queue Schemas
# ==============================================================================

class PrioritizedHabitationResponse(HabitationResponse):
    recommendedSite: Optional[CandidateSiteResponse] = None


# ==============================================================================
# 7. What-If Simulation Schemas
# ==============================================================================

class WhatIfRequest(BaseModel):
    targetPopulation: int = Field(4000, ge=100, le=50000, description="Target population to relocate")
    riskThreshold: float = Field(75.0, ge=30.0, le=100.0, description="Risk score cutoff threshold")
    maxDistanceKm: float = Field(15.0, ge=1.0, le=100.0, description="Maximum search distance radius in km")
    minCapacity: int = Field(3000, ge=0, description="Minimum candidate parcel capacity filter")


class EvaluatedSite(CandidateSiteResponse):
    simulatedHeadroom: int
    simulatedUtilizationPercent: int
    absorptionFeasibility: str


class WhatIfResponse(BaseModel):
    simulationTimestamp: str
    parametersUsed: Dict[str, Any]
    totalEligibleFound: int
    highlySuitableCount: int
    capacityDeficitCount: int
    infrastructureImprovementNeededCount: int
    topRecommendedSite: Optional[CandidateSiteResponse] = None
    evaluatedSites: List[EvaluatedSite]


# ==============================================================================
# 8. Alert Schemas
# ==============================================================================

class AlertResponse(BaseModel):
    id: str
    severity: str
    title: str
    message: str
    timestamp: str
    read: bool
    district: str


class MarkAlertsReadResponse(BaseModel):
    success: bool
    markedCount: int


# ==============================================================================
# 9. Unified Search Schemas
# ==============================================================================

class UnifiedSearchResponse(BaseModel):
    query: str
    habitations: List[HabitationResponse]
    sites: List[CandidateSiteResponse]
    redZones: List[RedZoneResponse]


# ==============================================================================
# 10. Report & Dossier Schemas
# ==============================================================================

class ReportExportRequest(BaseModel):
    habitation_id: Optional[str] = None
    report_template_id: str = "REP_01"
    district: Optional[str] = None


class ReportExportResponse(BaseModel):
    report_id: str
    title: str
    generated_at: str
    reference_code: str
    habitation_name: Optional[str] = None
    district: Optional[str] = None
    status: str
    download_url: Optional[str] = None
    content_summary: str


# ==============================================================================
# 11. Generic Error Schema
# ==============================================================================

class ErrorResponse(BaseModel):
    status: str = "error"
    code: str
    message: str
    details: Optional[Any] = None
