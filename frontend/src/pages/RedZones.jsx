import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, Users, MapPin, Layers, ExternalLink, ArrowRight } from 'lucide-react';
import GisMapViewer from '../components/map/GisMapViewer';
import { RED_ZONES, VULNERABLE_HABITATIONS } from '../data/mockData';

export default function RedZones({ onSelectHabitation, onSelectSite }) {
  const [selectedZone, setSelectedZone] = useState(RED_ZONES[0]);

  const enclosedHabitations = VULNERABLE_HABITATIONS.filter((h) =>
    h.district.toLowerCase().includes(selectedZone.name.toLowerCase().split(' ')[0].toLowerCase()) ||
    h.riskTier === 'Critical'
  ).slice(0, 4);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Multi-Hazard Red Zones & Dynamic Safety Buffers</h1>
          <span className="page-subtitle">
            Delineated spatial exclusion polygons fundamentally unsafe for permanent human settlement
          </span>
        </div>
        <div className="page-actions">
          <span className="badge badge-critical" style={{ fontSize: '0.82rem', padding: '6px 12px' }}>
            {RED_ZONES.length} Active Statewide Red Zones
          </span>
        </div>
      </div>

      {/* Red Zone Selector Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {RED_ZONES.map((zone) => {
          const isSelected = selectedZone.id === zone.id;

          return (
            <div
              key={zone.id}
              onClick={() => setSelectedZone(zone)}
              style={{
                background: isSelected ? '#fef2f2' : 'var(--bg-card)',
                border: `1.5px solid ${isSelected ? 'var(--risk-critical)' : 'var(--border-color)'}`,
                borderRadius: '12px',
                padding: '18px 20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? '0 4px 12px rgba(185, 28, 28, 0.12)' : 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{zone.name}</span>
                <span className="badge badge-critical">{zone.riskLevel}</span>
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                {zone.hazardType}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <div>Spatial Footprint: <strong style={{ color: 'var(--text-primary)' }}>{zone.areaSqKm} km²</strong></div>
                <div>Safety Buffer: <strong style={{ color: 'var(--risk-high)' }}>{zone.bufferMarginM}m</strong></div>
                <div>Exposed Pop: <strong style={{ color: 'var(--risk-critical)' }}>{zone.exposedPopulation.toLocaleString()}</strong></div>
                <div>Villages Trapped: <strong style={{ color: 'var(--text-primary)' }}>{zone.enclosedHabitationsCount}</strong></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Red Zone Detail & Map View */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>
        {/* Map View */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)' }}>Geospatial Perimeter: {selectedZone.name}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Dynamic Slope-Scaled Buffer: {selectedZone.bufferMarginM} meters
            </span>
          </div>

          <GisMapViewer
            onSelectHabitation={onSelectHabitation}
            onSelectSite={onSelectSite}
            selectedFeature={{ coordinates: selectedZone.coordinates[0] }}
          />
        </div>

        {/* Habitations within this Red Zone */}
        <div className="data-table-container" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <ShieldAlert size={18} color="var(--risk-critical)" />
            <h3 style={{ fontSize: '1.0rem', margin: 0, color: 'var(--text-primary)' }}>Vulnerable Villages Enclosed</h3>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Trigger Rule: <em>{selectedZone.primaryTrigger}</em>. All settlements below are recommended for immediate administrative relocation orders.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {enclosedHabitations.map((hab) => (
              <div
                key={hab.id}
                style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '12px 14px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem' }}>{hab.name}</span>
                  <span className="badge badge-critical">{hab.riskScore}/100</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '4px 0' }}>
                  Pop: {hab.population.toLocaleString()} • Slope: {hab.slopeDegree}°
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', marginTop: '6px', fontSize: '0.74rem' }}
                  onClick={() => onSelectHabitation(hab)}
                >
                  <span>Inspect Relocation Target</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
