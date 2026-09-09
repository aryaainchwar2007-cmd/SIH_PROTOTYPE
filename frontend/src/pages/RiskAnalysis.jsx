import React from 'react';
import { BarChart3, TrendingUp, AlertTriangle, ShieldAlert, Layers, Droplets, Mountain } from 'lucide-react';
import { RISK_ANALYTICS_DATA, DISTRICT_PROFILES } from '../data/mockData';

export default function RiskAnalysis({ onNavigate }) {
  const { distribution, hazardContributions, districtComparisons } = RISK_ANALYTICS_DATA;

  const totalHabitations = distribution.reduce((sum, d) => sum + d.count, 0);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Multi-Hazard Risk Analysis & Statistical Distribution</h1>
          <span className="page-subtitle">
            Quantitative assessment of cascading flood, landslide, and precipitation anomalies across vulnerable sectors
          </span>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => onNavigate('red-zones')}>
            <ShieldAlert size={16} color="var(--risk-critical)" />
            <span>Inspect Red Zones</span>
          </button>
        </div>
      </div>

      {/* Grid: Risk Distribution Bar & Hazard Factors */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Risk Distribution Breakdown */}
        <div className="data-table-container" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={18} color="var(--gis-blue)" />
              <h3 style={{ margin: 0 }}>Statewide Settlement Risk Distribution</h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Total: {totalHabitations.toLocaleString()} habitations
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {distribution.map((item) => {
              const percent = Math.round((item.count / totalHabitations) * 100);

              return (
                <div key={item.tier} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: item.color }} />
                      <strong style={{ color: 'var(--text-primary)' }}>{item.tier} Tier</strong>
                      <span style={{ color: 'var(--text-muted)' }}>({item.count} settlements)</span>
                    </div>
                    <span style={{ fontWeight: 700, color: item.color }}>
                      {percent}% ({item.popExposed.toLocaleString()} people)
                    </span>
                  </div>

                  <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${percent}%`,
                        background: item.color,
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hazard Contributions Breakdown */}
        <div className="data-table-container" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="var(--risk-high)" />
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Primary Geophysical Risk Drivers</h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Weight Matrix Contribution
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {hazardContributions.map((hc, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{hc.hazard}</span>
                  <span style={{ fontWeight: 700, color: 'var(--gis-blue)' }}>{hc.contributionPercent}%</span>
                </div>
                <div style={{ height: '7px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${hc.contributionPercent * 2.5}%`,
                      background: 'linear-gradient(90deg, #1d4ed8, #4f46e5)',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* District-by-District Multi-Hazard Comparison Matrix */}
      <div className="data-table-container">
        <div className="table-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mountain size={18} color="var(--gis-blue)" />
            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>District-Level Multi-Hazard Susceptibility Comparison</h3>
          </div>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>District Corridor</th>
                <th>Flood Inundation Risk</th>
                <th>Landslide Susceptibility</th>
                <th>Rainfall Trigger Anomaly</th>
                <th>Composite Multi-Hazard Score</th>
                <th>Vulnerability Status</th>
              </tr>
            </thead>
            <tbody>
              {districtComparisons.map((dc) => (
                <tr key={dc.district}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{dc.district}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Droplets size={14} color="var(--gis-blue)" />
                      <span>{dc.floodRisk}/100</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mountain size={14} color="var(--risk-high)" />
                      <span>{dc.landslideRisk}/100</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <TrendingUp size={14} color="var(--risk-moderate)" />
                      <span>{dc.rainRisk}/100</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${dc.composite >= 75 ? 'badge-critical' : 'badge-high'}`}>
                      {dc.composite} / 100
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.78rem', color: dc.composite >= 75 ? 'var(--risk-critical)' : 'var(--risk-high)' }}>
                      {dc.composite >= 75 ? 'Critical Relocation Zone' : 'High Vigilance Required'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
