import React, { useState, useEffect } from 'react';
import { Search, Filter, Home, ArrowUpDown, Eye, ShieldAlert, FileDown } from 'lucide-react';
import { api } from '../services/api';

export default function Habitations({ onSelectHabitation }) {
  const [habitations, setHabitations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedRiskTier, setSelectedRiskTier] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [sortBy, setSortBy] = useState('riskScore');

  useEffect(() => {
    fetchData();
  }, [searchQuery, selectedDistrict, selectedRiskTier, selectedPriority, sortBy]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await api.getHabitations({
        searchQuery,
        district: selectedDistrict,
        riskTier: selectedRiskTier,
        priority: selectedPriority,
        sortBy
      });
      setHabitations(data);
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
          <h1>Vulnerable Habitations Registry & Risk Profiler</h1>
          <span className="page-subtitle">
            Catalog of settlements exposed to severe natural hazards, ranked by vulnerability and demographic footprint
          </span>
        </div>
        <div className="page-actions">
          <span className="badge badge-blue">
            {habitations.length} Habitations Matched
          </span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="data-table-container">
        <div className="table-toolbar">
          <div className="table-search-box">
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search by village name, district, hazard..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="table-filters">
            <select
              className="filter-select"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
            >
              <option value="All">All Districts</option>
              <option value="Raigad">Raigad</option>
              <option value="Pune">Pune</option>
              <option value="Ratnagiri">Ratnagiri</option>
              <option value="Wayanad">Wayanad</option>
            </select>

            <select
              className="filter-select"
              value={selectedRiskTier}
              onChange={(e) => setSelectedRiskTier(e.target.value)}
            >
              <option value="All">All Risk Tiers</option>
              <option value="Critical">Critical (&ge;75)</option>
              <option value="High">High (55-74)</option>
              <option value="Moderate">Moderate</option>
              <option value="Low">Low / Safe</option>
            </select>

            <select
              className="filter-select"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
            >
              <option value="All">All Priorities</option>
              <option value="1">Priority 1 (Immediate)</option>
              <option value="2">Priority 2 (Short-Term)</option>
              <option value="3">Priority 3 (Medium-Term)</option>
              <option value="4">Priority 4 (Monitoring)</option>
            </select>

            <select
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="riskScore">Sort by Risk Score (Highest)</option>
              <option value="population">Sort by Population (Largest)</option>
              <option value="priority">Sort by Relocation Urgency</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="data-table-wrapper">
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading geospatial records...
            </div>
          ) : habitations.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No habitations found matching the selected criteria.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Habitation Name</th>
                  <th>District</th>
                  <th>Exposed Population</th>
                  <th>Risk Score</th>
                  <th>Vulnerability</th>
                  <th>Dominant Hazard</th>
                  <th>Action Priority</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {habitations.map((hab) => (
                  <tr key={hab.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Home size={15} color={hab.riskTier === 'Critical' ? 'var(--risk-critical)' : 'var(--risk-high)'} />
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{hab.name}</span>
                      </div>
                    </td>
                    <td>{hab.district}</td>
                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>{hab.population.toLocaleString()}</strong> residents
                    </td>
                    <td>
                      <span className={`badge badge-${hab.riskTier.toLowerCase()}`}>
                        {hab.riskScore} / 100
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                        {hab.vulnerabilityIndex}/100
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '4px' }}>({hab.kutchaHousingPercent}% kutcha)</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{hab.dominantHazards}</td>
                    <td>
                      <span className="badge badge-purple">
                        P{hab.priority}: {hab.priorityLabel}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onSelectHabitation(hab)}
                      >
                        <Eye size={13} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
