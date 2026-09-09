import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, Maximize2, Minimize2, ShieldAlert, MapPin, Home } from 'lucide-react';
import { VULNERABLE_HABITATIONS, CANDIDATE_RELOCATION_SITES, RED_ZONES } from '../../data/mockData';

export default function GisMapViewer({
  onSelectHabitation,
  onSelectSite,
  selectedFeature,
  isExpanded = false,
  onToggleExpand
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({
    redZones: null,
    habitations: null,
    relocationSites: null,
    rivers: null
  });

  // Layer Visibility State
  const [layersVisible, setLayersVisible] = useState({
    redZones: true,
    habitations: true,
    relocationSites: true,
    rivers: true
  });

  // Initialize Leaflet Map with Light Basemap
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create Map instance centered on Raigad / Western Ghats corridor
    const map = L.map(mapContainerRef.current, {
      center: [18.06, 73.48],
      zoom: 11,
      zoomControl: true,
      attributionControl: false
    });

    mapInstanceRef.current = map;

    // Clean Enterprise Light Basemap (CartoDB Positron)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    // Layer Group 1: Red Zones (Polygons)
    const redZoneGroup = L.layerGroup();
    RED_ZONES.forEach((rz) => {
      const polygon = L.polygon(rz.coordinates, {
        color: '#b91c1c',
        weight: 2,
        fillColor: '#b91c1c',
        fillOpacity: 0.18,
        dashArray: '5, 5'
      });

      polygon.bindPopup(`
        <div class="map-popup-card">
          <div class="map-popup-header">
            <span class="map-popup-title">${rz.name}</span>
            <span class="badge badge-critical">${rz.riskLevel}</span>
          </div>
          <div style="font-size: 0.76rem; color: #475569;">${rz.hazardType}</div>
          <div class="map-popup-stats">
            <div>Area: <strong>${rz.areaSqKm} km²</strong></div>
            <div>Safety Buffer: <strong>${rz.bufferMarginM}m</strong></div>
            <div>Habitations: <strong>${rz.enclosedHabitationsCount} villages</strong></div>
            <div>Exposed: <strong>${rz.exposedPopulation.toLocaleString()}</strong></div>
          </div>
        </div>
      `);

      redZoneGroup.addLayer(polygon);
    });

    // Layer Group 2: Rivers / Drainage Paths
    const riverGroup = L.layerGroup();
    const riverCoords = [
      [18.01, 73.49], [18.04, 73.45], [18.07, 73.43], [18.10, 73.41], [18.14, 73.38]
    ];
    const riverLine = L.polyline(riverCoords, {
      color: '#2563eb',
      weight: 3,
      opacity: 0.8,
      dashArray: '6, 6'
    });
    riverLine.bindTooltip('Savitri River Basin (Flash Inundation Corridor)', { sticky: true });
    riverGroup.addLayer(riverLine);

    // Layer Group 3: Vulnerable Habitations (Markers)
    const habitationGroup = L.layerGroup();
    VULNERABLE_HABITATIONS.forEach((h) => {
      const color =
        h.riskTier === 'Critical' ? '#b91c1c' :
        h.riskTier === 'High' ? '#c2410c' :
        h.riskTier === 'Moderate' ? '#b45309' : '#15803d';

      const marker = L.circleMarker(h.coordinates, {
        radius: h.riskTier === 'Critical' ? 8 : 6,
        fillColor: color,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9
      });

      marker.bindPopup(`
        <div class="map-popup-card">
          <div class="map-popup-header">
            <span class="map-popup-title">${h.name}</span>
            <span class="badge badge-${h.riskTier.toLowerCase()}">${h.riskTier}</span>
          </div>
          <div style="font-size: 0.76rem; color: #64748b;">${h.district} • Pop: <strong>${h.population.toLocaleString()}</strong></div>
          <div style="font-size: 0.74rem; color: #0f172a; margin: 3px 0;">Threat: ${h.dominantHazards}</div>
          <div style="font-size: 0.72rem; color: #475569;">Risk Score: <strong style="color: ${color};">${h.riskScore}/100</strong></div>
          <button id="inspect-hab-${h.id}" class="map-popup-action-btn">
            Inspect AI Risk & Relocation
          </button>
        </div>
      `);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`inspect-hab-${h.id}`);
        if (btn) {
          btn.onclick = () => onSelectHabitation(h);
        }
      });

      habitationGroup.addLayer(marker);
    });

    // Layer Group 4: Candidate Relocation Sites (Green Safe Haven Markers)
    const relocationGroup = L.layerGroup();
    CANDIDATE_RELOCATION_SITES.forEach((site) => {
      const marker = L.circleMarker(site.coordinates, {
        radius: 9,
        fillColor: '#15803d',
        color: '#ffffff',
        weight: 2.5,
        opacity: 1,
        fillOpacity: 0.95
      });

      marker.bindPopup(`
        <div class="map-popup-card">
          <div class="map-popup-header">
            <span class="map-popup-title">${site.name}</span>
            <span class="badge badge-safe">${site.suitabilityScore}% Suitable</span>
          </div>
          <div style="font-size: 0.76rem; color: #475569;">Safe Relocation Zone (${site.usableAreaAcres} acres)</div>
          <div class="map-popup-stats">
            <div>Capacity: <strong>${site.estimatedCapacity.toLocaleString()}</strong></div>
            <div>Slope: <strong>${site.slopeDegree}° (Flat)</strong></div>
            <div>Safe Dist: <strong>${site.distanceFromRedZoneKm} km</strong></div>
            <div>Status: <strong>${site.capacityStatus}</strong></div>
          </div>
          <button id="inspect-site-${site.id}" class="map-popup-action-btn" style="background: #15803d;">
            Inspect Carrying Capacity
          </button>
        </div>
      `);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`inspect-site-${site.id}`);
        if (btn) {
          btn.onclick = () => onSelectSite(site);
        }
      });

      relocationGroup.addLayer(marker);
    });

    // Store references
    layersRef.current = {
      redZones: redZoneGroup,
      habitations: habitationGroup,
      relocationSites: relocationGroup,
      rivers: riverGroup
    };

    // Add visible layers to map
    redZoneGroup.addTo(map);
    riverGroup.addTo(map);
    habitationGroup.addTo(map);
    relocationGroup.addTo(map);

    return () => {
      map.remove();
    };
  }, []);

  // Synchronize layer visibility toggles
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const { redZones, habitations, relocationSites, rivers } = layersRef.current;

    if (redZones) layersVisible.redZones ? redZones.addTo(map) : map.removeLayer(redZones);
    if (habitations) layersVisible.habitations ? habitations.addTo(map) : map.removeLayer(habitations);
    if (relocationSites) layersVisible.relocationSites ? relocationSites.addTo(map) : map.removeLayer(relocationSites);
    if (rivers) layersVisible.rivers ? rivers.addTo(map) : map.removeLayer(rivers);
  }, [layersVisible]);

  // Center on selected feature if provided
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedFeature || !selectedFeature.coordinates) return;

    map.flyTo(selectedFeature.coordinates, 13, { duration: 1.2 });
  }, [selectedFeature]);

  const toggleLayer = (key) => {
    setLayersVisible((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className={`gis-map-container ${isExpanded ? 'expanded' : ''}`}>
      <div ref={mapContainerRef} className="leaflet-map-element" />

      {/* Floating Layer Control Panel */}
      <div className="map-layer-panel">
        <div className="layer-panel-header">
          <div className="layer-panel-title">
            <Layers size={14} color="var(--gis-blue)" />
            <span>Map Layers</span>
          </div>
          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              style={{ color: '#64748b' }}
              title={isExpanded ? 'Collapse Map' : 'Expand Map'}
            >
              {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          )}
        </div>

        <div className="layer-toggle-list">
          <label className="layer-toggle-item">
            <div className="layer-label-group">
              <span className="layer-swatch" style={{ background: '#b91c1c' }} />
              <span>Multi-Hazard Red Zones</span>
            </div>
            <input
              type="checkbox"
              className="custom-checkbox"
              checked={layersVisible.redZones}
              onChange={() => toggleLayer('redZones')}
            />
          </label>

          <label className="layer-toggle-item">
            <div className="layer-label-group">
              <span className="layer-swatch" style={{ background: '#c2410c' }} />
              <span>Vulnerable Habitations</span>
            </div>
            <input
              type="checkbox"
              className="custom-checkbox"
              checked={layersVisible.habitations}
              onChange={() => toggleLayer('habitations')}
            />
          </label>

          <label className="layer-toggle-item">
            <div className="layer-label-group">
              <span className="layer-swatch" style={{ background: '#15803d' }} />
              <span>Candidate Relocation Sites</span>
            </div>
            <input
              type="checkbox"
              className="custom-checkbox"
              checked={layersVisible.relocationSites}
              onChange={() => toggleLayer('relocationSites')}
            />
          </label>

          <label className="layer-toggle-item">
            <div className="layer-label-group">
              <span className="layer-swatch" style={{ background: '#2563eb' }} />
              <span>River & Floodplain Paths</span>
            </div>
            <input
              type="checkbox"
              className="custom-checkbox"
              checked={layersVisible.rivers}
              onChange={() => toggleLayer('rivers')}
            />
          </label>
        </div>
      </div>

      {/* Floating Map Legend */}
      <div className="map-legend-panel">
        <div className="legend-title">Disaster Risk Legend</div>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-color-dot" style={{ background: 'var(--risk-critical)' }} />
            <span>Critical (&ge;75)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color-dot" style={{ background: 'var(--risk-high)' }} />
            <span>High (55-74)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color-dot" style={{ background: 'var(--risk-moderate)' }} />
            <span>Moderate</span>
          </div>
          <div className="legend-item">
            <span className="legend-color-dot" style={{ background: 'var(--risk-low)' }} />
            <span>Safe Haven Site</span>
          </div>
        </div>
      </div>
    </div>
  );
}
