import React, { useState } from 'react';
import {
  Bell,
  Search,
  MapPin,
  ShieldAlert,
  ChevronDown,
  Menu,
  X,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { DISTRICT_PROFILES, RECENT_SYSTEM_ALERTS } from '../../data/mockData';

export default function Navbar({
  currentDistrict,
  onDistrictChange,
  onOpenSearch,
  onToggleSidebar,
  isSidebarOpen
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [alerts, setAlerts] = useState(RECENT_SYSTEM_ALERTS);

  const unreadCount = alerts.filter((a) => !a.read).length;

  const markAllRead = () => {
    setAlerts(alerts.map((a) => ({ ...a, read: true })));
  };

  return (
    <header className="top-navbar">
      {/* Brand & Identity */}
      <div className="nav-brand">
        <button
          className="collapse-sidebar-btn"
          onClick={onToggleSidebar}
          title="Toggle Navigation Menu"
          aria-label="Toggle Navigation Menu"
          style={{ marginRight: '4px' }}
        >
          {isSidebarOpen ? <X size={19} /> : <Menu size={19} />}
        </button>

        <img src="/logo.svg" alt="SIH PS 191 Emblem" />

        <div className="nav-brand-text">
          <div className="brand-title">
            <span>Intelligent GIS Proactive Relocation DSS</span>
            <span className="brand-badge">SIH PS 191</span>
          </div>
          <span className="brand-subtitle">State Disaster Management Authority • Proactive Resettlement Command</span>
        </div>
      </div>

      {/* Center & Right Controls */}
      <div className="nav-controls">
        {/* District / Region Selector */}
        <div className="region-selector">
          <MapPin size={15} color="var(--gis-blue)" />
          <select
            value={currentDistrict}
            onChange={(e) => onDistrictChange(e.target.value)}
            aria-label="Select Target District"
          >
            <option value="All">All Monitored Regions (Macro View)</option>
            {DISTRICT_PROFILES.map((dist) => (
              <option key={dist.id} value={dist.name.split(' ')[0]}>
                {dist.name} ({dist.criticalCount} Red Zones)
              </option>
            ))}
          </select>
        </div>

        {/* Global Search Button */}
        <button
          className="global-search-btn"
          onClick={onOpenSearch}
          title="Search villages, sites, coordinates (Ctrl+K)"
        >
          <Search size={15} />
          <span>Search habitations, sites...</span>
          <span className="search-shortcut">Ctrl+K</span>
        </button>

        {/* Notifications Dropdown (Light Theme) */}
        <div style={{ position: 'relative' }}>
          <button
            className="nav-icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Active Hazard & Relocation Alerts"
            aria-label="System Alerts"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="nav-badge-pill">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: '44px',
                right: '0',
                width: '360px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 600,
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#f8fafc'
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a' }}>
                  <ShieldAlert size={16} color="var(--risk-critical)" />
                  <span>Disaster & Relocation Alerts</span>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    style={{ fontSize: '0.72rem', color: '#1d4ed8', fontWeight: 500 }}
                  >
                    Mark read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #f1f5f9',
                      background: alert.read ? '#ffffff' : '#f8fafc',
                      display: 'flex',
                      gap: '10px'
                    }}
                  >
                    {alert.severity === 'critical' ? (
                      <AlertTriangle size={18} color="var(--risk-critical)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    ) : alert.severity === 'warning' ? (
                      <AlertTriangle size={18} color="var(--risk-high)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    ) : (
                      <Info size={18} color="var(--gis-blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#0f172a', marginBottom: '2px' }}>
                        {alert.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.35 }}>
                        {alert.message}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '4px' }}>
                        {alert.district} • {alert.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Identity / Role */}
        <div className="user-profile">
          <div className="user-avatar">SD</div>
          <div className="user-info">
            <span className="user-name">Shri S. Deshmukh, IAS</span>
            <span className="user-role">Relief Commissioner & Secy (SDMA)</span>
          </div>
        </div>
      </div>
    </header>
  );
}
