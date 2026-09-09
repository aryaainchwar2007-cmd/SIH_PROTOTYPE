import React from 'react';

export default function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'info',
  trend,
  onClick
}) {
  const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;

  return (
    <div
      className={`kpi-card ${variant}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="kpi-header">
        <span className="kpi-title">{title}</span>
        {Icon && (
          <div className="kpi-icon-wrapper">
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="kpi-value">{formattedValue}</div>

      <div className="kpi-footer">
        <span>{subtitle}</span>
        {trend && (
          <span className="kpi-trend" style={{ color: trend.isUp ? 'var(--risk-critical)' : 'var(--risk-low)' }}>
            {trend.isUp ? '↑' : '↓'} {trend.text}
          </span>
        )}
      </div>
    </div>
  );
}
