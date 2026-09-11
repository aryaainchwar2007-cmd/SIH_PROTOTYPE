from typing import List, Dict, Any, Optional
from backend.app.db.repository import repository
from backend.app.utils.geo_utils import haversine_distance


class PrioritizationEngine:
    """Multi-Attribute Relocation Prioritization Engine.
    Generates the statutory phased intervention queue matching vulnerable settlements
    to audited candidate safe recipient parcels.
    """

    @classmethod
    def get_ranked_queue(cls, tier_filter: str = "All") -> List[Dict[str, Any]]:
        """Generates ranked priority queue with resolved candidate site details."""
        habitations = repository.get_habitations(limit=200)
        sites = repository.get_relocation_sites()

        # Build site lookup map
        site_map = {s["id"]: s for s in sites}

        # Multi-attribute sorting: Priority (1=Immediate -> 4=Monitoring), then Risk Score DESC, then Population DESC
        habitations.sort(key=lambda h: (h["priority"], -h["riskScore"], -h["population"]))

        # Filter by tier if specified
        if tier_filter and tier_filter.lower() != "all":
            habitations = [h for h in habitations if str(h["priority"]) == str(tier_filter)]

        # Attach recommended site metadata and compute distance if not already assigned
        ranked_queue = []
        for hab in habitations:
            hab_item = dict(hab)
            site_id = hab.get("recommendedSiteId")
            recommended_site = site_map.get(site_id) if site_id else None

            # If no site is explicitly assigned, attempt spatial matching to nearest safe parcel
            if not recommended_site and hab.get("coordinates"):
                h_lat, h_lon = hab["coordinates"][0], hab["coordinates"][1]
                eligible_sites = []
                for s in sites:
                    if s.get("coordinates"):
                        dist = haversine_distance(h_lat, h_lon, s["coordinates"][0], s["coordinates"][1])
                        eligible_sites.append((dist, s))
                if eligible_sites:
                    eligible_sites.sort(key=lambda x: x[0])
                    # Pick nearest if within 25km
                    if eligible_sites[0][0] <= 25.0:
                        recommended_site = eligible_sites[0][1]

            hab_item["recommendedSite"] = recommended_site
            ranked_queue.append(hab_item)

        return ranked_queue


prioritization_engine = PrioritizationEngine()
