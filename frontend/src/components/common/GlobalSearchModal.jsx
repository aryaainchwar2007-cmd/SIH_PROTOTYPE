import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Home, MapPin, ShieldAlert, ArrowRight } from 'lucide-react';
import { VULNERABLE_HABITATIONS, CANDIDATE_RELOCATION_SITES, RED_ZONES } from '../../data/mockData';

export default function GlobalSearchModal({ isOpen, onClose, onSelectHabitation, onSelectSite }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? onClose() : onClose(); // handled by parent
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredHabitations = q
    ? VULNERABLE_HABITATIONS.filter(
        (h) => h.name.toLowerCase().includes(q) || h.district.toLowerCase().includes(q) || h.dominantHazards.toLowerCase().includes(q)
      )
    : VULNERABLE_HABITATIONS.slice(0, 4);

  const filteredSites = q
    ? CANDIDATE_RELOCATION_SITES.filter(
        (s) => s.name.toLowerCase().includes(q) || s.district.toLowerCase().includes(q) || s.overallRecommendation.toLowerCase().includes(q)
      )
    : CANDIDATE_RELOCATION_SITES.slice(0, 3);

  const filteredRedZones = q
    ? RED_ZONES.filter((r) => r.name.toLowerCase().includes(q) || r.hazardType.toLowerCase().includes(q))
    : [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{ width: '580px', marginTop: '60px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc' }}>
          <Search size={20} color="var(--gis-blue)" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search vulnerable habitations, candidate relocation sites, districts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ color: 'var(--text-muted)' }}>
              <X size={18} />
            </button>
          )}
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>ESC to close</span>
        </div>

        {/* Results Body */}
        <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '16px' }}>
          {/* Habitations Section */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.05em' }}>
              Vulnerable Habitations ({filteredHabitations.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {filteredHabitations.map((h) => (
                <div
                  key={h.id}
                  onClick={() => {
                    onSelectHabitation(h);
                    onClose();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: '#f8fafc',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--gis-blue)';
                    e.currentTarget.style.backgroundColor = '#eff6ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Home size={16} color={h.riskTier === 'Critical' ? 'var(--risk-critical)' : 'var(--risk-high)'} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{h.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{h.district} • Pop: {h.population.toLocaleString()} • {h.dominantHazards}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`badge badge-${h.riskTier.toLowerCase()}`}>
                      Risk {h.riskScore}
                    </span>
                    <ArrowRight size={14} color="var(--text-muted)" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Relocation Sites Section */}
          <div>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.05em' }}>
              Candidate Relocation Sites ({filteredSites.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {filteredSites.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    onSelectSite(s);
                    onClose();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: '#f8fafc',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--risk-low)';
                    e.currentTarget.style.backgroundColor = '#f0fdf4';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MapPin size={16} color="var(--risk-low)" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{s.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.district} • Capacity: {s.estimatedCapacity.toLocaleString()} • {s.distanceFromRedZoneKm} km to Hazard</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-safe">
                      {s.suitabilityScore}% Suitable
                    </span>
                    <ArrowRight size={14} color="var(--text-muted)" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
