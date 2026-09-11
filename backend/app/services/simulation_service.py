from datetime import datetime, timezone
from typing import Dict, Any, List
from backend.app.db.repository import repository


class SimulationService:
    """Parametric Policy Simulation Sandbox Engine.
    Evaluates dynamic population resettlement scenarios against candidate parcels,
    safety clearance radii, and municipal carrying capacity limits.
    """

    @classmethod
    def simulate_what_if(
        cls,
        target_population: int = 4000,
        risk_threshold: float = 75.0,
        max_distance_km: float = 15.0,
        min_capacity: int = 3000,
    ) -> Dict[str, Any]:
        """Executes resettlement policy simulation and returns evaluated absorption matrix."""
        all_sites = repository.get_relocation_sites()

        # 1. Filter candidate parcels within maximum distance radius from danger zone
        eligible_sites = [
            s for s in all_sites if s.get("distanceFromRedZoneKm", 0.0) <= max_distance_km
        ]

        # 2. Evaluate absorption feasibility and headroom for each site
        evaluated_sites: List[Dict[str, Any]] = []
        for site in eligible_sites:
            site_eval = dict(site)
            cap = site.get("estimatedCapacity", 4000)
            headroom = cap - target_population
            utilization_pct = round((target_population / max(1, cap)) * 100)

            feasibility = "Feasible" if cap >= target_population else "Requires Split Relocation"

            site_eval["simulatedHeadroom"] = headroom
            site_eval["simulatedUtilizationPercent"] = utilization_pct
            site_eval["absorptionFeasibility"] = feasibility
            evaluated_sites.append(site_eval)

        # 3. Compute aggregate scenario metrics
        highly_suitable = [
            s for s in evaluated_sites
            if s.get("suitabilityScore", 0) >= 85 and s.get("estimatedCapacity", 0) >= target_population
        ]
        capacity_deficits = [
            s for s in evaluated_sites if s.get("estimatedCapacity", 0) < target_population
        ]
        infrastructure_needs = [
            s for s in evaluated_sites
            if s.get("capacityStatus") in ("Moderate", "Deficit Risk")
        ]

        # Top recommended site: best suitability with sufficient absorption capacity
        top_site = None
        if highly_suitable:
            highly_suitable.sort(key=lambda s: s.get("suitabilityScore", 0), reverse=True)
            top_site = highly_suitable[0]
        elif evaluated_sites:
            evaluated_sites.sort(key=lambda s: s.get("suitabilityScore", 0), reverse=True)
            top_site = evaluated_sites[0]

        return {
            "simulationTimestamp": datetime.now(timezone.utc).isoformat(),
            "parametersUsed": {
                "targetPopulation": target_population,
                "riskThreshold": risk_threshold,
                "maxDistanceKm": max_distance_km,
                "minCapacity": min_capacity,
            },
            "totalEligibleFound": len(evaluated_sites),
            "highlySuitableCount": len(highly_suitable),
            "capacityDeficitCount": len(capacity_deficits),
            "infrastructureImprovementNeededCount": len(infrastructure_needs),
            "topRecommendedSite": top_site,
            "evaluatedSites": evaluated_sites,
        }


simulation_service = SimulationService()
