import React, { useState, useEffect } from 'react';
import { MapPin, Search, CheckCircle2, AlertCircle, Droplets, BedDouble, GraduationCap, Compass } from 'lucide-react';
import { api } from '../services/api';

export default function RelocationSites({ onSelectSite }) {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [minSuitability, setMinSuitability] = useState('0');

  useEffect(() => {
    fetchSites();
  }, [searchQuery, minSuitability]);

  const fetchSites = async () => {
    setLoading(true);
    try {
      const data = await api.getRelocationSites({
        searchQuery,
        minSuitability
      });
      setSites(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Candidate Relocation Sites & Land Suitability Catalog</h1>
          <span className="page-subtitle">
            Audited non-hazardous parcels pre-evaluated for slope stability, road connectivity, water yield, and basic amenities
          </span>
        </div>
        <div className="page-actions">
          <span className="badge badge-safe">
            {sites.length} Candidate Sites Verified
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="data-table-container" style={{ marginBottom: '24px' }}>
        <div className="table-toolbar">
          <div className="table-search-box">
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search candidate sites by name, location, recommendation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="table-filters">
            <select
              className="filter-select"
              value={minSuitability}
              onChange={(e) => setMinSuitability(e.target.value)}
            >
              <option value="0">All Suitability Scores</option>
              <option value="85">&ge; 85% Highly Suitable</option>
              <option value="80">&ge; 80% Suitable</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sites Grid */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading candidate parcels...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          {sites.map((site) => {
            const isOptimal = site.capacityStatus === 'Optimal';

            return (
              <div
                key={site.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '14px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{site.id} • {site.district}</span>
                      <h3 style={{ fontSize: '1.05rem', margin: '2px 0 0 0', color: 'var(--text-primary)' }}>{site.name}</h3>
                    </div>
                    <span className="badge badge-safe">
                      {site.suitabilityScore}% Suitability
                    </span>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.4 }}>
                    Overall Status: <strong style={{ color: isOptimal ? 'var(--risk-low)' : 'var(--risk-high)' }}>{site.overallRecommendation}</strong>
                  </div>

                  {/* Core Metrics Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#f8fafc', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.78rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>Safe Hazard Distance:</span>
                      <strong style={{ color: 'var(--gis-blue)' }}>{site.distanceFromRedZoneKm} km outside buffer</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>Usable Land Area:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{site.usableAreaAcres} acres ({site.usableAreaSqm.toLocaleString()} m²)</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>Absorption Ceiling:</span>
                      <strong style={{ color: 'var(--risk-low)' }}>{site.estimatedCapacity.toLocaleString()} people</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>Slope Gradient:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{site.slopeDegree}° (Flat plateau)</strong>
                    </div>
                  </div>

                  {/* Infrastructure Bullet Points */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Droplets size={14} color="var(--gis-blue)" />
                      <span>{site.waterAvailabilityStatus}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <BedDouble size={14} color="var(--gis-blue)" />
                      <span>{site.healthcareStatus}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <GraduationCap size={14} color="var(--gis-blue)" />
                      <span>{site.schoolingStatus}</span>
                    </div>
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                  onClick={() => onSelectSite(site)}
                >
                  Inspect Carrying Capacity Audit
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
