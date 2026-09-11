import unittest
from fastapi.testclient import TestClient

from backend.app.main import app


class TestApiEndpoints(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    # 1. System Health
    def test_root_endpoint(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("service", data)
        self.assertIn("docs_url", data)

    def test_health_endpoint(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "healthy")

    # 2. Analytics
    def test_get_kpis(self):
        response = self.client.get("/api/v1/analytics/kpis")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("totalHabitations", data)
        self.assertIn("highRiskHabitations", data)
        self.assertIn("criticalRedZoneHabitations", data)
        self.assertIn("districtsMonitored", data)
        self.assertGreater(data["totalHabitations"], 0)

    def test_get_risk_distribution(self):
        response = self.client.get("/api/v1/analytics/risk-distribution")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("distribution", data)
        self.assertIn("hazardContributions", data)
        self.assertIn("districtComparisons", data)
        self.assertGreater(len(data["distribution"]), 0)

    # 3. Districts
    def test_get_districts(self):
        response = self.client.get("/api/v1/districts")
        self.assertEqual(response.status_code, 200)
        districts = response.json()
        self.assertIsInstance(districts, list)
        self.assertGreater(len(districts), 0)
        first = districts[0]
        self.assertIn("id", first)
        self.assertIn("name", first)
        self.assertIn("habitationsCount", first)

    # 4. Habitations
    def test_list_habitations(self):
        response = self.client.get("/api/v1/habitations")
        self.assertEqual(response.status_code, 200)
        habs = response.json()
        self.assertIsInstance(habs, list)
        self.assertGreater(len(habs), 0)
        first = habs[0]
        self.assertIn("id", first)
        self.assertIn("coordinates", first)
        self.assertEqual(len(first["coordinates"]), 2)  # [lat, lng]

    def test_get_habitation_by_id_success(self):
        response = self.client.get("/api/v1/habitations/HAB_001")
        self.assertEqual(response.status_code, 200)
        hab = response.json()
        self.assertEqual(hab["id"], "HAB_001")
        self.assertEqual(hab["name"], "Taliye Wadi (Upper Sector)")
        self.assertIn("aiFactors", hab)

    def test_get_habitation_by_id_not_found(self):
        response = self.client.get("/api/v1/habitations/HAB_NONEXISTENT")
        self.assertEqual(response.status_code, 404)
        self.assertIn("detail", response.json())

    # 5. Relocation Sites
    def test_list_relocation_sites(self):
        response = self.client.get("/api/v1/relocation-sites")
        self.assertEqual(response.status_code, 200)
        sites = response.json()
        self.assertIsInstance(sites, list)
        self.assertGreater(len(sites), 0)
        first = sites[0]
        self.assertIn("id", first)
        self.assertIn("suitabilityScore", first)
        self.assertIn("capacityMetrics", first)

    def test_get_relocation_site_by_id_success(self):
        response = self.client.get("/api/v1/relocation-sites/SITE_001")
        self.assertEqual(response.status_code, 200)
        site = response.json()
        self.assertEqual(site["id"], "SITE_001")
        self.assertIn("suitabilityBreakdown", site)

    def test_get_relocation_site_by_id_not_found(self):
        response = self.client.get("/api/v1/relocation-sites/SITE_UNKNOWN")
        self.assertEqual(response.status_code, 404)

    # 6. Hazards & Red Zones
    def test_get_red_zones(self):
        response = self.client.get("/api/v1/hazards/red-zones")
        self.assertEqual(response.status_code, 200)
        zones = response.json()
        self.assertIsInstance(zones, list)
        self.assertGreater(len(zones), 0)
        first = zones[0]
        self.assertIn("id", first)
        self.assertIn("coordinates", first)
        self.assertGreater(len(first["coordinates"]), 2)  # polygon ring

    # 7. Prioritization Queue
    def test_get_prioritization_queue(self):
        response = self.client.get("/api/v1/prioritization/queue")
        self.assertEqual(response.status_code, 200)
        queue = response.json()
        self.assertIsInstance(queue, list)
        self.assertGreater(len(queue), 0)
        self.assertIn("priority", queue[0])

    # 8. What-If Simulation
    def test_simulate_what_if(self):
        payload = {
            "targetPopulation": 3500,
            "riskThreshold": 70.0,
            "maxDistanceKm": 20.0,
            "minCapacity": 2500,
        }
        response = self.client.post("/api/v1/simulation/what-if", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("simulationTimestamp", data)
        self.assertIn("parametersUsed", data)
        self.assertIn("evaluatedSites", data)
        self.assertGreater(len(data["evaluatedSites"]), 0)

    # 9. Alerts
    def test_get_alerts(self):
        response = self.client.get("/api/v1/alerts")
        self.assertEqual(response.status_code, 200)
        alerts = response.json()
        self.assertIsInstance(alerts, list)
        self.assertGreater(len(alerts), 0)

    def test_mark_alerts_read(self):
        response = self.client.post("/api/v1/alerts/mark-all-read")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertIsInstance(data["markedCount"], int)

    # 10. Unified Search
    def test_unified_search(self):
        response = self.client.get("/api/v1/search?q=Wadi")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("habitations", data)
        self.assertIn("sites", data)
        self.assertIn("redZones", data)
        self.assertGreater(len(data["habitations"]), 0)

    # 11. Reports & Dossier
    def test_export_dossier_metadata(self):
        payload = {
            "habitation_id": "HAB_001",
            "report_template_id": "REP_01",
            "district": "Raigad",
        }
        response = self.client.post("/api/v1/reports/export-dossier", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["report_id"], "REP_01")
        self.assertIn("reference_code", data)
        self.assertIn("download_url", data)

    def test_download_dossier_pdf(self):
        response = self.client.get("/api/v1/reports/download?habitation_id=HAB_001")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["content-type"], "application/pdf")
        self.assertTrue(response.content.startswith(b"%PDF-"))


if __name__ == "__main__":
    unittest.main()
