import React from 'react';
import {
  Home,
  ShieldAlert,
  AlertTriangle,
  Users,
  MapPin,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers
} from 'lucide-react';
import KpiCard from '../components/common/KpiCard';
import GisMapViewer from '../components/map/GisMapViewer';
import { KPI_METRICS, VULNERABLE_HABITATIONS, CANDIDATE_RELOCATION_SITES } from '../data/mockData';

export default function Dashboard({
  onSelectHabitation,
  onSelectSite,
  onNavigate
}) {
  const criticalHabitations = VULNERABLE_HABITATIONS.filter(
    (h) => h.riskTier === 'Critical'
  ).slice(0, 5);

  const topSites = CANDIDATE_RELOCATION_SITES.slice(0, 3);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Command Center & Multi-Hazard Overview</h1>
          <span className="page-subtitle">
            Autonomous GIS Relocation Decision Support System • Real-Time Predictive Risk Monitoring
          </span>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => onNavigate('what-if')}>
            <Activity size={16} color="var(--ai-purple)" />
            <span>Run What-If Simulation</span>
          </button>
          <button className="btn btn-primary" onClick={() => onNavigate('priority-planning')}>
            <span>View Relocation Queue</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* 5 KPI Cards Section */}
      <div className="kpi-grid">
        <KpiCard
          title="Total Monitored Habitations"
          value={KPI_METRICS.totalHabitations}
          subtitle="Across 5 disaster corridors"
          icon={Home}
          variant="info"
        />

        <KpiCard
          title="High-Risk Habitations"
          value={KPI_METRICS.highRiskHabitations}
          subtitle="Score &ge; 55.0 threshold"
          icon={AlertTriangle}
          variant="high"
          trend={{ isUp: true, text: 'Active Hazard Zone' }}
        />

        <KpiCard
          title="Critical / Red-Zone Habitations"
          value={KPI_METRICS.criticalRedZoneHabitations}
          subtitle="Requires Immediate Relocation"
          icon={ShieldAlert}
          variant="critical"
          trend={{ isUp: true, text: 'Urgent Evac Plan' }}
        />

        <KpiCard
          title="Population at Critical Risk"
          value={KPI_METRICS.populationExposed}
          subtitle="Exposed to slope & surge"
          icon={Users}
          variant="critical"
        />

        <KpiCard
          title="Candidate Relocation Sites"
          value={KPI_METRICS.potentialRelocationSites}
          subtitle="64 verified safe parcels"
          icon={MapPin}
          variant="safe"
          trend={{ isUp: false, text: '84.6% Avg Suitability' }}
        />
      </div>

      {/* Large Interactive WebGIS Map Canvas */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="var(--gis-blue)" />
            <h3 style={{ margin: 0 }}>Active Geospatial Multi-Hazard & Relocation Canvas</h3>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Projection: EPSG:4326 | Raster Derivatives: Copernicus DEM + GPM IMERG 72h
          </span>
        </div>

        <GisMapViewer
          onSelectHabitation={onSelectHabitation}
          onSelectSite={onSelectSite}
        />
      </div>

      {/* Two-Column Command Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        {/* Left Column: Urgent Relocation Queue Preview */}
        <div className="data-table-container">
          <div className="table-toolbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} color="var(--risk-critical)" />
              <h3 style={{ fontSize: '1.0rem', margin: 0 }}>Urgent Priority 1 Relocation Queue</h3>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('priority-planning')}
            >
              Full Queue ({KPI_METRICS.immediateRelocationQueue})
            </button>
          </div>

          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Habitation</th>
                  <th>Population</th>
                  <th>Risk Score</th>
                  <th>Primary Threat</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {criticalHabitations.map((h) => (
                  <tr key={h.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{h.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{h.district}</div>
                    </td>
                    <td>{h.population.toLocaleString()}</td>
                    <td>
                      <span className="badge badge-critical">{h.riskScore} / 100</span>
                    </td>
                    <td style={{ fontSize: '0.78rem' }}>{h.dominantHazards}</td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onSelectHabitation(h)}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Recommended Safe Parcels Preview */}
        <div className="data-table-container">
          <div className="table-toolbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} color="var(--risk-low)" />
              <h3 style={{ fontSize: '1.0rem', margin: 0 }}>Top Audited Relocation Sites</h3>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('relocation-sites')}
            >
              View All ({KPI_METRICS.potentialRelocationSites})
            </button>
          </div>

          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topSites.map((site) => (
              <div
                key={site.id}
                style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.92rem' }}>{site.name}</span>
                    <span className="badge badge-safe">{site.suitabilityScore}% Suitability</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '4px' }}>
                    Distance: <strong>{site.distanceFromRedZoneKm} km</strong> from danger zone • Capacity: <strong>{site.estimatedCapacity.toLocaleString()}</strong> residents
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#1d4ed8', marginTop: '2px' }}>
                    Water: {site.waterAvailabilityStatus}
                  </div>
                </div>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => onSelectSite(site)}
                >
                  Capacity Audit
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
