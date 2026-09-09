import React from 'react';
import {
  X,
  AlertTriangle,
  MapPin,
  Users,
  ShieldAlert,
  ArrowUpRight,
  BrainCircuit,
  FileDown
} from 'lucide-react';
import { CANDIDATE_RELOCATION_SITES } from '../../data/mockData';

export default function HabitationDetailModal({
  habitation,
  onClose,
  onInspectSite,
  onExportReport
}) {
  if (!habitation) return null;

  const recommendedSite = CANDIDATE_RELOCATION_SITES.find(
    (s) => s.id === habitation.recommendedSiteId
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{ width: '760px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: habitation.riskTier === 'Critical' ? 'var(--risk-critical-bg)' : 'var(--risk-high-bg)',
                border: `1px solid ${habitation.riskTier === 'Critical' ? 'var(--risk-critical-border)' : 'var(--risk-high-border)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: habitation.riskTier === 'Critical' ? 'var(--risk-critical)' : 'var(--risk-high)'
              }}
            >
              <ShieldAlert size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{habitation.name}</h2>
                <span className={`badge badge-${habitation.riskTier.toLowerCase()}`}>
                  {habitation.riskTier} Risk
                </span>
                <span className="badge badge-purple">
                  Priority {habitation.priority} : {habitation.priorityLabel}
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', gap: '12px' }}>
                <span>District: {habitation.district}, {habitation.state}</span>
                <span>Coordinates: {habitation.coordinates[0].toFixed(4)}°N, {habitation.coordinates[1].toFixed(4)}°E</span>
              </div>
            </div>
          </div>

          <button onClick={onClose} style={{ color: 'var(--text-muted)' }} aria-label="Close details">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Top Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>EXPOSED POPULATION</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={17} color="var(--gis-blue)" />
                {habitation.population.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{habitation.households} Households</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>COMPOSITE RISK</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--risk-critical)' }}>
                {habitation.riskScore} <span style={{ fontSize: '0.8rem', color: '#64748b' }}>/ 100</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--risk-critical)' }}>Severe Threshold Breached</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>VULNERABILITY INDEX</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--risk-high)' }}>
                {habitation.vulnerabilityIndex} <span style={{ fontSize: '0.8rem', color: '#64748b' }}>/ 100</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{habitation.kutchaHousingPercent}% Kutcha Dwellings</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>RELOCATION STATUS</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--risk-critical)', marginTop: '4px' }}>
                {habitation.priorityLabel}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Immediate Action Target</div>
            </div>
          </div>

          {/* Environmental & Hazard Factor Matrix */}
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <AlertTriangle size={16} color="var(--risk-high)" />
              <span>Multi-Hazard & Geomorphological Assessment</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', fontSize: '0.82rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Dominant Threat:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{habitation.dominantHazards}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Slope Gradient:</span>
                <span style={{ fontWeight: 600, color: habitation.slopeDegree > 30 ? 'var(--risk-critical)' : 'var(--risk-high)' }}>
                  {habitation.slopeDegree}° (Critical Shear Failure)
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>72-hr Rain Accumulation:</span>
                <span style={{ fontWeight: 600, color: 'var(--risk-critical)' }}>
                  {habitation.rainfall3dMm} mm (+{habitation.rainfallAnomalyPercent}% anomaly)
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Road Evacuation Isolation:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{habitation.roadIsolationDistanceKm} km single-track road</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Emergency Hospital Travel:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{habitation.hospitalDistanceKm} km distance</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Historical Disaster History:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{habitation.historicalDisastersCount} recorded events ({habitation.recentCasualties} casualties)</span>
              </div>
            </div>
          </div>

          {/* AI Decision Explanation (TreeSHAP XAI) */}
          <div className="xai-card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.88rem', color: '#5b21b6' }}>
                <BrainCircuit size={17} color="var(--ai-purple)" />
                <span>AI Decision Explanation: Why is this area categorized as {habitation.riskTier}?</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>TreeSHAP Feature Attribution</span>
            </div>

            <div className="xai-factor-list">
              {habitation.aiFactors?.map((item, index) => (
                <div key={index} className="xai-factor-item">
                  <div className="xai-factor-header">
                    <span className="xai-factor-name">
                      {item.direction === 'up' ? (
                        <span style={{ color: 'var(--risk-critical)', fontWeight: 800 }}>↑</span>
                      ) : (
                        <span style={{ color: 'var(--risk-low)', fontWeight: 800 }}>↓</span>
                      )}
                      {item.factor}
                    </span>
                    <span className="xai-factor-weight">+{item.weight}% Risk Impact</span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{item.description}</div>
                  <div className="xai-meter-bg">
                    <div className="xai-meter-fill" style={{ width: `${Math.min(item.weight * 2.5, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Relocation Site Recommendation */}
          {recommendedSite && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 600 }}>
                  <MapPin size={17} />
                  <span>Proactive Resettlement Target: {recommendedSite.name}</span>
                </div>
                <span className="badge badge-safe">{recommendedSite.suitabilityScore}% Suitability</span>
              </div>

              <div style={{ fontSize: '0.8rem', color: '#334155', marginBottom: '12px', lineHeight: 1.4 }}>
                Identified candidate safe parcel located <strong>{recommendedSite.distanceFromRedZoneKm} km</strong> outside hazardous buffer.
                Flat terrain (slope {recommendedSite.slopeDegree}°), carrying capacity factor <strong>{recommendedSite.carryingCapacityFactor}x</strong> (absorbs {habitation.population} residents with room for 4,100 max).
              </div>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  onClose();
                  onInspectSite(recommendedSite);
                }}
              >
                Inspect Relocation Site Details <ArrowUpRight size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            className="btn btn-primary"
            onClick={() => onExportReport && onExportReport(habitation)}
          >
            <FileDown size={15} />
            <span>Generate Official Relocation Dossier</span>
          </button>
        </div>
      </div>
    </div>
  );
}
