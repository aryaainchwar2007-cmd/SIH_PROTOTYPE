from typing import Dict, Any, Tuple


class SuitabilityEngine:
    """Multi-Criteria Decision Analysis (MCDA) Site Suitability Engine using
    Analytical Hierarchy Process (AHP) across 7 weighted criteria.
    """

    # Weights defined in SiteSuitability.jsx
    WEIGHTS = {
        "hazardSafety": 0.25,
        "accessibility": 0.20,
        "landSuitability": 0.15,
        "waterAvailability": 0.15,
        "healthcareAccess": 0.10,
        "educationAccess": 0.10,
        "carryingCapacity": 0.05,
    }

    @classmethod
    def evaluate_factors(
        cls,
        distance_from_hazard_km: float,
        distance_to_road_m: float,
        slope_degree: float,
        potable_water_kl: float,
        target_water_needed_kl: float,
        distance_to_hospital_km: float,
        distance_to_school_km: float,
        carrying_capacity_factor: float,
    ) -> Dict[str, int]:
        """Evaluates each of the 7 individual factors on a 0-100 percentage scale."""
        # 1. Hazard Safety Margin (25% weight): > 5km is optimal (95-100)
        if distance_from_hazard_km >= 10.0:
            hazard_safety = 98
        elif distance_from_hazard_km >= 6.0:
            hazard_safety = 94
        elif distance_from_hazard_km >= 3.0:
            hazard_safety = 85
        else:
            hazard_safety = max(40, int(distance_from_hazard_km * 25))

        # 2. Road Network Accessibility (20% weight): < 200m is optimal
        if distance_to_road_m <= 200:
            accessibility = 94
        elif distance_to_road_m <= 500:
            accessibility = 86
        elif distance_to_road_m <= 1000:
            accessibility = 74
        else:
            accessibility = 60

        # 3. Land Suitability / Slope (15% weight): < 5 degrees is flat/optimal
        if slope_degree <= 4.0:
            land_suitability = 94
        elif slope_degree <= 8.0:
            land_suitability = 88
        elif slope_degree <= 15.0:
            land_suitability = 75
        else:
            land_suitability = 50

        # 4. Potable Water Availability (15% weight)
        if target_water_needed_kl > 0:
            water_ratio = potable_water_kl / target_water_needed_kl
            water_availability = min(100, int(water_ratio * 80))
        else:
            water_availability = 85

        # 5. Proximity to Hospital (10% weight): < 3km is optimal
        if distance_to_hospital_km <= 3.5:
            healthcare_access = 90
        elif distance_to_hospital_km <= 6.0:
            healthcare_access = 82
        else:
            healthcare_access = max(50, 95 - int(distance_to_hospital_km * 3))

        # 6. Educational Seating Access (10% weight): < 2km is optimal
        if distance_to_school_km <= 2.0:
            education_access = 90
        elif distance_to_school_km <= 4.0:
            education_access = 80
        else:
            education_access = 65

        # 7. Carrying Capacity Headroom (5% weight)
        if carrying_capacity_factor >= 1.5:
            carrying_cap = 95
        elif carrying_capacity_factor >= 1.0:
            carrying_cap = 88
        else:
            carrying_cap = 68

        return {
            "hazardSafety": hazard_safety,
            "accessibility": accessibility,
            "landSuitability": land_suitability,
            "waterAvailability": water_availability,
            "healthcareAccess": healthcare_access,
            "educationAccess": education_access,
            "carryingCapacity": carrying_cap,
        }

    @classmethod
    def calculate_suitability(cls, factor_scores: Dict[str, int]) -> Tuple[float, str]:
        """Calculates composite AHP weighted suitability score and classification."""
        total_score = 0.0
        for factor, weight in cls.WEIGHTS.items():
            total_score += factor_scores.get(factor, 80) * weight

        total_score = round(total_score, 1)

        if total_score >= 85.0:
            recommendation = "Highly Suitable"
        elif total_score >= 75.0:
            recommendation = "Suitable"
        else:
            recommendation = "Requires Water & Road Investment"

        return total_score, recommendation


suitability_engine = SuitabilityEngine()
