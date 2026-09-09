import React from 'react';
import { Users, Droplets, BedDouble, GraduationCap } from 'lucide-react';

export default function CarryingCapacityGauge({ site, targetPopulation = 2480 }) {
  if (!site) return null;

  const capacity = site.estimatedCapacity || 4000;
  const utilization = Math.round((targetPopulation / capacity) * 100);
  const remaining = capacity - targetPopulation;

  let progressClass = 'safe';
  let statusBadge = 'badge-safe';
  let statusText = 'Safe: Adequate Absorption Capacity';

  if (utilization > 100) {
    progressClass = 'danger';
    statusBadge = 'badge-critical';
    statusText = 'DEFICIT: Exceeds Carrying Capacity (Secondary Hazard Risk)';
  } else if (utilization > 85) {
    progressClass = 'warning';
    statusBadge = 'badge-high';
    statusText = 'Near Capacity: Requires Infrastructure Augmentation';
  }

  // Water calculations (135 L/person/day)
  const waterNeededKl = Math.round((targetPopulation * 135) / 1000);
  const waterAvailableKl = site.capacityMetrics?.potableWaterDailySuppliedKl || 450;
  const isWaterSafe = waterAvailableKl >= waterNeededKl;

  return (
    <div className="capacity-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Carrying Capacity & Resource Threshold Audit</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Target Parcel: {site.name} ({site.usableAreaAcres} usable acres)
          </span>
        </div>
        <span className={`badge ${statusBadge}`}>{statusText}</span>
      </div>

      {/* Numerical Metrics Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '12px' }}>
        <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>TARGET POPULATION</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>{targetPopulation.toLocaleString()}</div>
          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Displaced residents</div>
        </div>

        <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SITE CEILING CAPACITY</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--gis-blue)' }}>{capacity.toLocaleString()}</div>
          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Maximum sustainable limit</div>
        </div>

        <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>HEADROOM / BUFFER</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: remaining >= 0 ? 'var(--risk-low)' : 'var(--risk-critical)' }}>
            {remaining >= 0 ? `+${remaining.toLocaleString()}` : remaining.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Remaining absorption space</div>
        </div>

        <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>CAPACITY UTILIZATION</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: utilization > 100 ? 'var(--risk-critical)' : 'var(--text-primary)' }}>
            {utilization}%
          </div>
          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Footprint threshold</div>
        </div>
      </div>

      {/* Progress Bar Gauge */}
      <div className="capacity-progress-bar-container">
        <div
          className={`capacity-progress-bar ${progressClass}`}
          style={{ width: `${Math.min(utilization, 100)}%` }}
        />
      </div>

      {/* Resource Lifeline Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '16px', fontSize: '0.8rem' }}>
        <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Droplets size={20} color={isWaterSafe ? 'var(--risk-low)' : 'var(--risk-critical)'} />
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Potable Water Supply</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Demand: {waterNeededKl} kL/d | Supply: {waterAvailableKl} kL/d {isWaterSafe ? '(Adequate)' : '(Deficit)'}
            </div>
          </div>
        </div>

        <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BedDouble size={20} color="var(--gis-blue)" />
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Healthcare Access</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
              {site.healthcareStatus} ({site.distanceToHospitalKm} km)
            </div>
          </div>
        </div>

        <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <GraduationCap size={20} color="var(--gis-blue)" />
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Educational Facilities</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
              {site.schoolingStatus} ({site.distanceToSchoolKm} km)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
