import React, { useState, useEffect } from 'react';
import { ListOrdered, ShieldAlert, FileText, CheckCircle2, ArrowRight, Clock, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

export default function PriorityPlanning({ onSelectHabitation, onExportReport }) {
  const [queue, setQueue] = useState([]);
  const [tierFilter, setTierFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueue();
  }, [tierFilter]);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const data = await api.getPriorityQueue(tierFilter);
      setQueue(data);
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
          <h1>Relocation Priority Planning & Phased Execution Queue</h1>
          <span className="page-subtitle">
            Algorithmically ranked administrative intervention queue optimizing budget, life safety, and recipient site readiness
          </span>
        </div>
      </div>

      {/* Phased Action Tier Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
        <div
          onClick={() => setTierFilter('1')}
          style={{
            background: tierFilter === '1' ? '#fef2f2' : 'var(--bg-card)',
            border: `1px solid ${tierFilter === '1' ? 'var(--risk-critical)' : 'var(--border-color)'}`,
            borderRadius: '10px',
            padding: '14px 16px',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="badge badge-critical">Priority 1</span>
            <Clock size={15} color="var(--risk-critical)" />
          </div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', marginTop: '6px' }}>Immediate Action</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>0 - 6 Months Horizon (14 villages)</div>
        </div>

        <div
          onClick={() => setTierFilter('2')}
          style={{
            background: tierFilter === '2' ? '#fff7ed' : 'var(--bg-card)',
            border: `1px solid ${tierFilter === '2' ? 'var(--risk-high)' : 'var(--border-color)'}`,
            borderRadius: '10px',
            padding: '14px 16px',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="badge badge-high">Priority 2</span>
            <Clock size={15} color="var(--risk-high)" />
          </div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', marginTop: '6px' }}>Short-Term Move</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>6 - 18 Months Horizon</div>
        </div>

        <div
          onClick={() => setTierFilter('3')}
          style={{
            background: tierFilter === '3' ? '#fffbeb' : 'var(--bg-card)',
            border: `1px solid ${tierFilter === '3' ? 'var(--risk-moderate)' : 'var(--border-color)'}`,
            borderRadius: '10px',
            padding: '14px 16px',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="badge badge-moderate">Priority 3</span>
            <Clock size={15} color="var(--risk-moderate)" />
          </div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', marginTop: '6px' }}>Medium-Term Scheme</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>18 - 36 Months Horizon</div>
        </div>

        <div
          onClick={() => setTierFilter('All')}
          style={{
            background: tierFilter === 'All' ? '#eff6ff' : 'var(--bg-card)',
            border: `1px solid ${tierFilter === 'All' ? 'var(--gis-blue)' : 'var(--border-color)'}`,
            borderRadius: '10px',
            padding: '14px 16px',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="badge badge-blue">Complete Queue</span>
            <ListOrdered size={15} color="var(--gis-blue)" />
          </div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', marginTop: '6px' }}>View All Tiers</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Full Ranked Database</div>
        </div>
      </div>

      {/* Ranked Queue Table */}
      <div className="data-table-container">
        <div className="table-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ListOrdered size={18} color="var(--gis-blue)" />
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
              Ranked Decision Queue (Showing {queue.length} Habitations)
            </h3>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onExportReport && onExportReport(null, 'Full Priority Relocation Queue')}
          >
            <FileText size={14} />
            <span>Export Gazette Action Dossier</span>
          </button>
        </div>

        <div className="data-table-wrapper">
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Calculating multi-attribute ranking...
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Rank</th>
                  <th>Habitation & District</th>
                  <th>Population</th>
                  <th>Risk Score</th>
                  <th>Priority Level</th>
                  <th>Recommended Safe Parcel</th>
                  <th>Execution Window</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((item, index) => {
                  const site = item.recommendedSite;

                  return (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 800, fontSize: '1.05rem', color: index < 3 ? 'var(--risk-critical)' : 'var(--text-muted)' }}>
                        #{index + 1}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.district}, {item.state}</div>
                      </td>
                      <td>{item.population.toLocaleString()}</td>
                      <td>
                        <span className={`badge badge-${item.riskTier.toLowerCase()}`}>
                          {item.riskScore}/100
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-purple">
                          Priority {item.priority}: {item.priorityLabel}
                        </span>
                      </td>
                      <td>
                        {site ? (
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--risk-low)', fontSize: '0.82rem' }}>
                              {site.name}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              Cap: {site.estimatedCapacity.toLocaleString()} • {site.distanceFromRedZoneKm} km away
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>In-situ retention</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {item.priority === 1 ? 'Before Next Monsoon' : item.priority === 2 ? 'Next Financial Year' : 'Phased Plan'}
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onSelectHabitation(item)}
                        >
                          Dossier
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
