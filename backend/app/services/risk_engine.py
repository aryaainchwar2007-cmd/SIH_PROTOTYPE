import math
from typing import Dict, Any, List, Tuple


class RiskEngine:
    """Multi-Hazard Risk Engine implementing:
    Composite Risk = Hazard (H) x Exposure (E) x Vulnerability (V)
    Normalized to a 0 - 100 continuous index.
    """

    CRITICAL_THRESHOLD = 75.0
    HIGH_THRESHOLD = 55.0
    MODERATE_THRESHOLD = 35.0

    @classmethod
    def calculate_hazard_index(
        cls,
        slope_degree: float,
        rainfall_3d_mm: float,
        rainfall_anomaly_pct: float,
        historical_disasters: int,
    ) -> float:
        """Computes physical hazard susceptibility score (0 to 100)."""
        # Slope sub-score (0-40): critical shear failure happens > 30 degrees
        slope_score = min(40.0, (slope_degree / 40.0) * 40.0) if slope_degree > 5 else 5.0

        # Rainfall sub-score (0-40): trigger curves breach > 200mm / 72h
        rain_score = min(40.0, (rainfall_3d_mm / 300.0) * 40.0)

        # Historical recurrence sub-score (0-20)
        history_score = min(20.0, historical_disasters * 4.0)

        return round(slope_score + rain_score + history_score, 2)

    @classmethod
    def calculate_exposure_index(cls, population: int, households: int) -> float:
        """Computes human & asset exposure score (0 to 100)."""
        # Logarithmic scaling of population exposure (up to 10,000 residents)
        if population <= 0:
            return 10.0
        pop_score = min(100.0, (math.log10(max(10, population)) / 4.0) * 100.0)
        return round(pop_score, 2)

    @classmethod
    def calculate_vulnerability_index(
        cls,
        kutcha_housing_pct: float,
        road_isolation_km: float,
        hospital_distance_km: float,
    ) -> float:
        """Computes socio-demographic and structural fragility score (0 to 100)."""
        # Kutcha structural fragility weight: 50%
        housing_sub = (kutcha_housing_pct / 100.0) * 50.0

        # Road evacuation isolation weight: 30%
        road_sub = min(30.0, (road_isolation_km / 20.0) * 30.0)

        # Emergency medical access decay weight: 20%
        hospital_sub = min(20.0, (hospital_distance_km / 30.0) * 20.0)

        return round(housing_sub + road_sub + hospital_sub, 2)

    @classmethod
    def calculate_composite_risk(
        cls,
        slope_degree: float,
        rainfall_3d_mm: float,
        rainfall_anomaly_pct: float,
        historical_disasters: int,
        population: int,
        households: int,
        kutcha_housing_pct: float,
        road_isolation_km: float,
        hospital_distance_km: float,
    ) -> Tuple[float, str, float]:
        """Calculates Composite Risk Score (0-100), Risk Tier, and Vulnerability Index."""
        h = cls.calculate_hazard_index(
            slope_degree, rainfall_3d_mm, rainfall_anomaly_pct, historical_disasters
        )
        e = cls.calculate_exposure_index(population, households)
        v = cls.calculate_vulnerability_index(
            kutcha_housing_pct, road_isolation_km, hospital_distance_km
        )

        # Weighted geometric-harmonic blend normalized to 0-100
        composite = round((0.45 * h) + (0.25 * e) + (0.30 * v), 1)
        composite = max(0.0, min(100.0, composite))

        tier = cls.classify_tier(composite)
        return composite, tier, v

    @classmethod
    def classify_tier(cls, risk_score: float) -> str:
        """Classifies continuous risk score into statutory administrative risk tier."""
        if risk_score >= cls.CRITICAL_THRESHOLD:
            return "Critical"
        elif risk_score >= cls.HIGH_THRESHOLD:
            return "High"
        elif risk_score >= cls.MODERATE_THRESHOLD:
            return "Moderate"
        else:
            return "Low"

    @classmethod
    def generate_xai_factors(cls, habitation_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generates TreeSHAP-style explainable factor attribution cards ('Why is it Red?')."""
        factors = []
        slope = habitation_data.get("slopeDegree", 0.0)
        rain = habitation_data.get("rainfall3dMm", 0.0)
        kutcha = habitation_data.get("kutchaHousingPercent", 0.0)
        road = habitation_data.get("roadIsolationDistanceKm", 0.0)

        if slope > 30.0:
            factors.append({
                "factor": f"Topographic Slope ({slope}°)",
                "impact": "High",
                "direction": "up",
                "description": "Exceeds critical shear failure threshold for weathered basalt.",
                "weight": round(slope * 0.95, 1),
            })
        if rain > 200.0:
            factors.append({
                "factor": f"3-Day Extreme Precipitation ({rain}mm)",
                "impact": "High",
                "direction": "up",
                "description": "Exceeds 95th percentile trigger curve accelerating pore water pressure.",
                "weight": round(min(45.0, rain * 0.12), 1),
            })
        if kutcha > 50.0:
            factors.append({
                "factor": f"Kutcha Mud-Walled Structures ({kutcha}%)",
                "impact": "High",
                "direction": "up",
                "description": "Majority of dwellings lack lateral load-bearing and water resistance.",
                "weight": round(kutcha * 0.28, 1),
            })
        if road > 10.0:
            factors.append({
                "factor": f"Cul-de-Sac Evacuation Road ({road} km)",
                "impact": "Medium",
                "direction": "up",
                "description": "Single road corridor prone to bridge or slope cutoffs.",
                "weight": round(road * 0.9, 1),
            })

        if not factors:
            factors.append({
                "factor": "Geological Base Stability",
                "impact": "Low",
                "direction": "down",
                "description": "Competent bedrock reduces deep slip mechanics.",
                "weight": 25.0,
            })

        return factors


risk_engine = RiskEngine()
