import React, { useState } from 'react';
import { Sliders, CheckCircle2, ShieldCheck, Droplets, BedDouble, GraduationCap } from 'lucide-react';
import CarryingCapacityGauge from '../components/relocation/CarryingCapacityGauge';
import { CANDIDATE_RELOCATION_SITES } from '../data/mockData';

export default function SiteSuitability() {
  const [selectedSiteId, setSelectedSiteId] = useState(CANDIDATE_RELOCATION_SITES[0].id);
  const [compareSiteId, setCompareSiteId] = useState(CANDIDATE_RELOCATION_SITES[1].id);

  const siteA = CANDIDATE_RELOCATION_SITES.find((s) => s.id === selectedSiteId) || CANDIDATE_RELOCATION_SITES[0];
  const siteB = CANDIDATE_RELOCATION_SITES.find((s) => s.id === compareSiteId) || CANDIDATE_RELOCATION_SITES[1];

  const factors = [
    { key: 'hazardSafety', label: 'Hazard Safety Margin (Zero Red Zone Overlap)', weight: '25%' },
    { key: 'accessibility', label: 'All-Weather Road Network Access', weight: '20%' },
    { key: 'landSuitability', label: 'Gentle Slope & Soil Stability', weight: '15%' },
    { key: 'waterAvailability', label: 'Perennial Potable Water Yield', weight: '15%' },
    { key: 'healthcareAccess', label: 'Proximity to PHC / Hospital', weight: '10%' },
    { key: 'educationAccess', label: 'Educational Seating Capacity', weight: '10%' },
    { key: 'carryingCapacity', label: 'Carrying Capacity Absorption Headroom', weight: '5%' }
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Multi-Criteria Site Suitability & Capacity Audit</h1>
          <span className="page-subtitle">
            Comparative evaluation using Analytical Hierarchy Process (AHP) across geophysical, infrastructural, and social dimensions
          </span>
        </div>
      </div>

      {/* Selectors */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
          <label style={{ fontSize: '0.76rem', color: 'var(--gis-blue)', fontWeight: 700, textTransform: 'uppercase' }}>
            Primary Evaluated Parcel (Site A)
          </label>
          <select
            className="filter-select"
            style={{ width: '100%', marginTop: '6px', fontSize: '0.88rem' }}
            value={selectedSiteId}
            onChange={(e) => setSelectedSiteId(e.target.value)}
          >
            {CANDIDATE_RELOCATION_SITES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.suitabilityScore}% Suitability)
              </option>
            ))}
          </select>
        </div>

        <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <label style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Comparison Benchmark Parcel (Site B)
          </label>
          <select
            className="filter-select"
            style={{ width: '100%', marginTop: '6px', fontSize: '0.88rem' }}
            value={compareSiteId}
            onChange={(e) => setCompareSiteId(e.target.value)}
          >
            {CANDIDATE_RELOCATION_SITES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.suitabilityScore}% Suitability)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparative Factor Table */}
      <div className="data-table-container" style={{ marginBottom: '24px' }}>
        <div className="table-toolbar">
          <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Suitability Factor Comparison</h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>MCDA Weighted Scoring Matrix</span>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '35%' }}>Evaluated Factor</th>
                <th>Weight</th>
                <th style={{ color: 'var(--gis-blue)' }}>{siteA.name}</th>
                <th style={{ color: 'var(--text-muted)' }}>{siteB.name}</th>
              </tr>
            </thead>
            <tbody>
              {factors.map((f) => {
                const scoreA = siteA.suitabilityBreakdown?.[f.key] || 85;
                const scoreB = siteB.suitabilityBreakdown?.[f.key] || 80;

                return (
                  <tr key={f.key}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{f.label}</td>
                    <td><span className="badge badge-purple">{f.weight}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--gis-blue)', minWidth: '35px' }}>{scoreA}%</span>
                        <div style={{ height: '6px', width: '140px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${scoreA}%`, background: '#2563eb', borderRadius: '4px' }} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, color: '#64748b', minWidth: '35px' }}>{scoreB}%</span>
                        <div style={{ height: '6px', width: '140px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${scoreB}%`, background: '#94a3b8', borderRadius: '4px' }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              <tr style={{ background: '#f8fafc' }}>
                <td style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>Composite Suitability Index</td>
                <td>100%</td>
                <td>
                  <span className="badge badge-safe" style={{ fontSize: '0.82rem', padding: '5px 12px' }}>
                    {siteA.suitabilityScore}% Highly Suitable
                  </span>
                </td>
                <td>
                  <span className="badge badge-safe" style={{ fontSize: '0.82rem', padding: '5px 12px' }}>
                    {siteB.suitabilityScore}% Suitable
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Integrated Carrying Capacity Gauge Component for Site A */}
      <CarryingCapacityGauge site={siteA} targetPopulation={2480} />
    </div>
  );
}
