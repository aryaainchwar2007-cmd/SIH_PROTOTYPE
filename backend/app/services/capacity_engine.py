from typing import Dict, Any


class CapacityEngine:
    """Carrying Capacity Assessment Engine.
    Prevents secondary humanitarian and environmental disasters by auditing
    population absorption against CPHEEO potable water norms (135 LPD)
    and per-capita land allocation thresholds (45 m²/person).
    """

    PER_CAPITA_LAND_SQM = 45.0  # Indian Town Planning rehabilitation standard
    PER_CAPITA_WATER_LPD = 135.0  # CPHEEO Potable Water Supply Standard (Liters/Person/Day)

    @classmethod
    def calculate_water_demand_kl(cls, population: int) -> float:
        """Calculates daily potable water demand in kilo-liters (kL/day).
        Demand = (Population x 135 Liters) / 1000
        """
        return round((population * cls.PER_CAPITA_WATER_LPD) / 1000.0, 1)

    @classmethod
    def calculate_land_capacity(cls, usable_area_sqm: float) -> int:
        """Calculates maximum sustainable resident population based on usable land acreage."""
        if usable_area_sqm <= 0:
            return 0
        return int(usable_area_sqm / cls.PER_CAPITA_LAND_SQM)

    @classmethod
    def evaluate_carrying_capacity(
        cls,
        site_capacity: int,
        target_population: int,
        potable_water_supply_kl: float,
        available_hospital_beds: int = 10,
    ) -> Dict[str, Any]:
        """Performs full carrying capacity audit for a candidate relocation parcel."""
        headroom = site_capacity - target_population
        utilization_pct = round((target_population / max(1, site_capacity)) * 100, 1)
        water_needed_kl = cls.calculate_water_demand_kl(target_population)
        is_water_safe = potable_water_supply_kl >= water_needed_kl
        carrying_capacity_factor = round(site_capacity / max(1, target_population), 2)

        # Beds required norm: ~ 1 bed per 500 population
        beds_required = max(1, int(target_population / 500))

        if utilization_pct > 100:
            capacity_status = "Deficit Risk"
            feasibility = "Requires Split Relocation"
        elif utilization_pct > 85:
            capacity_status = "Moderate"
            feasibility = "Suitable with Minor Works"
        else:
            capacity_status = "Optimal"
            feasibility = "Feasible"

        return {
            "allocatedPopulation": target_population,
            "maximumAbsorption": site_capacity,
            "remainingCapacity": headroom,
            "utilizationPercent": utilization_pct,
            "potableWaterDailyNeededKl": water_needed_kl,
            "potableWaterDailySuppliedKl": potable_water_supply_kl,
            "isWaterSafe": is_water_safe,
            "hospitalBedsRequired": beds_required,
            "hospitalBedsAvailable": available_hospital_beds,
            "carryingCapacityFactor": carrying_capacity_factor,
            "capacityStatus": capacity_status,
            "absorptionFeasibility": feasibility,
        }


capacity_engine = CapacityEngine()
