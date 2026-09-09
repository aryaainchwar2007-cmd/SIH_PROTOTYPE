import React, { useState, useEffect } from 'react';
import { FlaskConical, Play, RotateCcw, AlertTriangle, CheckCircle2, TrendingUp, MapPin } from 'lucide-react';
import { api } from '../services/api';

export default function WhatIfSimulation({ onSelectSite }) {
  const [targetPopulation, setTargetPopulation] = useState(4500);
  const [riskThreshold, setRiskThreshold] = useState(75);
  const [maxDistanceKm, setMaxDistanceKm] = useState(15);
  const [minCapacity, setMinCapacity] = useState(3500);

  const [simulationResult, setSimulationResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    runSimulation();
  }, []);

  const runSimulation = async () => {
    setIsSimulating(true);
    try {
      const result = await api.simulateWhatIf({
        targetPopulation,
        riskThreshold,
        maxDistanceKm,
        minCapacity
      });
      setSimulationResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  const resetDefaults = () => {
    setTargetPopulation(4500);
    setRiskThreshold(75);
    setMaxDistanceKm(15);
    setMinCapacity(3500);
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>What-If Policy Simulation & Resettlement Sandbox</h1>
          <span className="page-subtitle">
            Simulate relocation scenarios by tuning population demand, risk cutoffs, and infrastructure capacity constraints
          </span>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={resetDefaults}>
            <RotateCcw size={15} />
            <span>Reset Parameters</span>
          </button>
          <button className="btn btn-primary" onClick={runSimulation} disabled={isSimulating}>
            <Play size={15} />
            <span>{isSimulating ? 'Simulating...' : 'Execute Simulation'}</span>
          </button>
        </div>
      </div>

      {/* Simulation Banner Notice */}
      <div
        style={{
          background: '#faf5ff',
          border: '1px solid #e9d5ff',
          borderRadius: '10px',
          padding: '12px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <FlaskConical size={22} color="var(--ai-purple)" />
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          <strong>Interactive Policy Sandbox:</strong> Adjust the control sliders below to test how different demographic volumes and safety distance criteria affect candidate land absorption and infrastructure deficits.
        </div>
      </div>

      {/* Control Sliders & KPI Outputs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Sliders Control Panel */}
        <div className="data-table-container" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.05rem', margin: '0 0 16px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', color: 'var(--text-primary)' }}>
            Simulation Control Variables
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Slider 1: Target Population */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Target Population to Relocate</span>
                <span style={{ color: 'var(--gis-blue)', fontWeight: 700 }}>{targetPopulation.toLocaleString()} residents</span>
              </div>
              <input
                type="range"
                min="1000"
                max="8000"
                step="250"
                value={targetPopulation}
                onChange={(e) => setTargetPopulation(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                <span>1,000</span>
                <span>8,000</span>
              </div>
            </div>

            {/* Slider 2: Risk Threshold */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Red Zone Risk Cutoff Score</span>
                <span style={{ color: 'var(--risk-critical)', fontWeight: 700 }}>&ge; {riskThreshold} / 100</span>
              </div>
              <input
                type="range"
                min="50"
                max="90"
                step="5"
                value={riskThreshold}
                onChange={(e) => setRiskThreshold(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                <span>50 (Broad High Risk)</span>
                <span>90 (Severe Critical Only)</span>
              </div>
            </div>

            {/* Slider 3: Max Relocation Distance */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Max Safe Distance Radius</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{maxDistanceKm} km</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={maxDistanceKm}
                onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                <span>5 km (Local)</span>
                <span>30 km (District Wide)</span>
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '8px' }}
              onClick={runSimulation}
            >
              Re-Calculate Absorption Matrix
            </button>
          </div>
        </div>

        {/* Simulation Output Dashboard */}
        <div>
          {simulationResult && (
            <>
              {/* 4 Output Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '16px' }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>CANDIDATE PARCELS</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gis-blue)', marginTop: '4px' }}>
                    {simulationResult.totalEligibleFound}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Within {maxDistanceKm} km radius</div>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>HIGHLY SUITABLE</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--risk-low)', marginTop: '4px' }}>
                    {simulationResult.highlySuitableCount}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Capacity &ge; {targetPopulation}</div>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>CAPACITY DEFICITS</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--risk-critical)', marginTop: '4px' }}>
                    {simulationResult.capacityDeficitCount}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Requires Split Relocation</div>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>INFRA UPGRADE REQ</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--risk-high)', marginTop: '4px' }}>
                    {simulationResult.infrastructureImprovementNeededCount}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Water/Road augmentation</div>
                </div>
              </div>

              {/* Simulation Result Table */}
              <div className="data-table-container">
                <div className="table-toolbar">
                  <h3 style={{ fontSize: '1.0rem', margin: 0, color: 'var(--text-primary)' }}>Simulated Recipient Parcel Absorption Capacity</h3>
                </div>
                <div className="data-table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Candidate Parcel</th>
                        <th>Distance to Hazard</th>
                        <th>Ceiling Capacity</th>
                        <th>Simulated Headroom</th>
                        <th>Utilization</th>
                        <th>Feasibility Assessment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {simulationResult.evaluatedSites?.map((s) => (
                        <tr key={s.id}>
                          <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</td>
                          <td>{s.distanceFromRedZoneKm} km</td>
                          <td>{s.estimatedCapacity.toLocaleString()} people</td>
                          <td style={{ color: s.simulatedHeadroom >= 0 ? 'var(--risk-low)' : 'var(--risk-critical)', fontWeight: 700 }}>
                            {s.simulatedHeadroom >= 0 ? `+${s.simulatedHeadroom.toLocaleString()}` : s.simulatedHeadroom.toLocaleString()}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span>{s.simulatedUtilizationPercent}%</span>
                              <div style={{ width: '60px', height: '5px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                <div
                                  style={{
                                    height: '100%',
                                    width: `${Math.min(s.simulatedUtilizationPercent, 100)}%`,
                                    background: s.simulatedUtilizationPercent > 100 ? 'var(--risk-critical)' : 'var(--risk-low)'
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${s.simulatedHeadroom >= 0 ? 'badge-safe' : 'badge-critical'}`}>
                              {s.absorptionFeasibility}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
