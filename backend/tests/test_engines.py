import unittest

from backend.app.services.risk_engine import RiskEngine
from backend.app.services.suitability_engine import SuitabilityEngine
from backend.app.services.capacity_engine import CapacityEngine
from backend.app.services.prioritization_engine import PrioritizationEngine
from backend.app.services.simulation_service import SimulationService
from backend.app.services.report_service import ReportService
from backend.app.utils.geo_utils import (
    haversine_distance,
    to_geojson_point,
    to_geojson_polygon,
    point_in_polygon,
    validate_coordinates,
)


class TestGeoUtils(unittest.TestCase):
    def test_haversine_distance(self):
        # Coordinates for Wayanad (approx 11.6854, 76.1320) to Meppadi (11.5540, 76.1280) ~14-15 km
        dist = haversine_distance(11.6854, 76.1320, 11.5540, 76.1280)
        self.assertGreater(dist, 10.0)
        self.assertLess(dist, 20.0)

    def test_haversine_same_point(self):
        dist = haversine_distance(11.6854, 76.1320, 11.6854, 76.1320)
        self.assertEqual(dist, 0.0)

    def test_coordinate_conversion(self):
        leaflet_pt = [11.554, 76.128]  # [lat, lng]
        geojson_pt = to_geojson_point(leaflet_pt)  # [lng, lat]
        self.assertEqual(geojson_pt["coordinates"], [76.128, 11.554])

        poly_ring = [[11.0, 76.0], [12.0, 76.0], [12.0, 77.0]]
        geojson_poly = to_geojson_polygon(poly_ring)
        self.assertEqual(geojson_poly["type"], "Polygon")
        self.assertEqual(geojson_poly["coordinates"][0][0], [76.0, 11.0])

    def test_point_in_polygon(self):
        poly = [
            [11.0, 76.0],
            [12.0, 76.0],
            [12.0, 77.0],
            [11.0, 77.0],
            [11.0, 76.0],
        ]
        # Point inside
        self.assertTrue(point_in_polygon((11.5, 76.5), poly))
        # Point outside
        self.assertFalse(point_in_polygon((10.5, 76.5), poly))
        self.assertFalse(point_in_polygon((11.5, 77.5), poly))

    def test_validate_coordinates(self):
        self.assertTrue(validate_coordinates(11.554, 76.128))
        self.assertFalse(validate_coordinates(95.0, 76.128))
        self.assertFalse(validate_coordinates(11.554, 190.0))


class TestRiskEngine(unittest.TestCase):
    def test_risk_score_range(self):
        score, tier, v = RiskEngine.calculate_composite_risk(
            slope_degree=38.5,
            rainfall_3d_mm=285.0,
            rainfall_anomaly_pct=142.0,
            historical_disasters=4,
            population=1420,
            households=340,
            kutcha_housing_pct=72.0,
            road_isolation_km=14.5,
            hospital_distance_km=22.0,
        )
        self.assertGreaterEqual(score, 0.0)
        self.assertLessEqual(score, 100.0)
        self.assertEqual(tier, "Critical")
        self.assertGreater(v, 0.0)

    def test_low_risk_computation(self):
        score, tier, v = RiskEngine.calculate_composite_risk(
            slope_degree=3.0,
            rainfall_3d_mm=25.0,
            rainfall_anomaly_pct=0.0,
            historical_disasters=0,
            population=120,
            households=30,
            kutcha_housing_pct=10.0,
            road_isolation_km=1.0,
            hospital_distance_km=2.0,
        )
        self.assertLess(score, 40.0)
        self.assertIn(tier, ["Low", "Moderate"])

    def test_generate_xai_factors(self):
        factors = RiskEngine.generate_xai_factors({
            "slopeDegree": 38.5,
            "rainfall3dMm": 285.0,
            "kutchaHousingPercent": 72.0,
            "roadIsolationDistanceKm": 14.5,
        })
        self.assertIsInstance(factors, list)
        self.assertGreater(len(factors), 0)
        for f in factors:
            self.assertIn("factor", f)
            self.assertIn("impact", f)
            self.assertIn("weight", f)


class TestSuitabilityEngine(unittest.TestCase):
    def test_evaluate_factors_weights(self):
        factors = SuitabilityEngine.evaluate_factors(
            distance_from_hazard_km=12.5,
            distance_to_road_m=120.0,
            slope_degree=3.2,
            potable_water_kl=750.0,
            target_water_needed_kl=540.0,
            distance_to_hospital_km=3.5,
            distance_to_school_km=1.2,
            carrying_capacity_factor=1.45,
        )
        self.assertIn("hazardSafety", factors)
        self.assertIn("accessibility", factors)
        self.assertIn("landSuitability", factors)
        self.assertIn("waterAvailability", factors)
        self.assertIn("healthcareAccess", factors)
        self.assertIn("educationAccess", factors)
        self.assertIn("carryingCapacity", factors)

        score, rec = SuitabilityEngine.calculate_suitability(factors)
        self.assertGreaterEqual(score, 80.0)
        self.assertIn(rec, ["Highly Suitable", "Suitable"])


class TestCapacityEngine(unittest.TestCase):
    def test_water_demand(self):
        # 4,000 population x 135 LPD = 540,000 L = 540.0 kL/day
        water_kl = CapacityEngine.calculate_water_demand_kl(4000)
        self.assertEqual(water_kl, 540.0)

    def test_land_capacity(self):
        # 180,000 sqm / 45 sqm = 4,000 capacity
        capacity = CapacityEngine.calculate_land_capacity(180000.0)
        self.assertEqual(capacity, 4000)

    def test_evaluate_carrying_capacity(self):
        eval_res = CapacityEngine.evaluate_carrying_capacity(
            site_capacity=2000,
            target_population=4000,
            potable_water_supply_kl=300.0,
        )
        self.assertEqual(eval_res["capacityStatus"], "Deficit Risk")
        self.assertEqual(eval_res["absorptionFeasibility"], "Requires Split Relocation")
        self.assertFalse(eval_res["isWaterSafe"])


class TestPrioritizationEngine(unittest.TestCase):
    def test_ranked_queue(self):
        queue = PrioritizationEngine.get_ranked_queue()
        self.assertGreater(len(queue), 0)
        # Check that top priority items appear first
        self.assertLessEqual(queue[0]["priority"], queue[-1]["priority"])
        for item in queue:
            self.assertIn("id", item)
            self.assertIn("riskScore", item)
            self.assertIn("priority", item)


class TestSimulationService(unittest.TestCase):
    def test_simulation_execution(self):
        res = SimulationService.simulate_what_if(
            target_population=4000,
            risk_threshold=75.0,
            max_distance_km=15.0,
            min_capacity=3000,
        )
        self.assertIn("simulationTimestamp", res)
        self.assertIn("parametersUsed", res)
        self.assertIn("evaluatedSites", res)
        self.assertGreater(len(res["evaluatedSites"]), 0)


class TestReportService(unittest.TestCase):
    def test_pdf_generation(self):
        pdf_bytes = ReportService.generate_dossier_pdf("HAB_001")
        self.assertIsInstance(pdf_bytes, bytes)
        self.assertGreater(len(pdf_bytes), 1000)
        self.assertTrue(pdf_bytes.startswith(b"%PDF-"))

    def test_metadata_generation(self):
        meta = ReportService.generate_dossier_metadata("HAB_001")
        self.assertEqual(meta["report_id"], "REP_01")
        self.assertIn("Taliye Wadi", meta["title"])


if __name__ == "__main__":
    unittest.main()
