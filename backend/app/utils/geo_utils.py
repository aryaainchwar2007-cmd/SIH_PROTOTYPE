import math
from typing import List, Tuple, Dict, Any


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance between two points on the Earth's surface in kilometers."""
    R = 6371.0  # Earth's radius in km

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 2)


def to_geojson_point(leaflet_coords: List[float]) -> Dict[str, Any]:
    """Convert Leaflet [latitude, longitude] to GeoJSON Point [longitude, latitude]."""
    if len(leaflet_coords) >= 2:
        return {"type": "Point", "coordinates": [leaflet_coords[1], leaflet_coords[0]]}
    return {"type": "Point", "coordinates": leaflet_coords}


def to_geojson_polygon(leaflet_coords_ring: List[List[float]]) -> Dict[str, Any]:
    """Convert Leaflet [[lat, lng], ...] polygon ring to GeoJSON Polygon [[[lng, lat], ...]]."""
    geojson_ring = [[pt[1], pt[0]] for pt in leaflet_coords_ring if len(pt) >= 2]
    # Ensure closed ring
    if geojson_ring and geojson_ring[0] != geojson_ring[-1]:
        geojson_ring.append(geojson_ring[0])
    return {"type": "Polygon", "coordinates": [geojson_ring]}


def point_in_polygon(point: Tuple[float, float], polygon: List[List[float]]) -> bool:
    """Ray-casting algorithm to determine if a point [lat, lng] is inside a polygon [[lat, lng], ...]."""
    x, y = point[0], point[1]
    n = len(polygon)
    inside = False

    p1x, p1y = polygon[0][0], polygon[0][1]
    for i in range(n + 1):
        p2x, p2y = polygon[i % n][0], polygon[i % n][1]
        if min(p1y, p2y) < y <= max(p1y, p2y):
            if x <= max(p1x, p2x):
                if p1y != p2y:
                    xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                if p1x == p2x or x <= xinters:
                    inside = not inside
        p1x, p1y = p2x, p2y

    return inside


def validate_coordinates(lat: float, lon: float) -> bool:
    """Validate latitude (-90 to 90) and longitude (-180 to 180)."""
    return -90.0 <= lat <= 90.0 and -180.0 <= lon <= 180.0
