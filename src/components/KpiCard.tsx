import React from 'react';

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'positive' | 'negative' | 'neutral';
}

export const KpiCard: React.FC<KpiCardProps> = ({ title, value, subtitle, icon, trend = 'neutral' }) => {
  let valueColor = 'var(--text-primary)';
  if (trend === 'positive') valueColor = 'var(--success)';
  if (trend === 'negative') valueColor = 'var(--danger)';

  return (
    <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          {title}
        </h3>
        <div style={{ color: 'var(--accent-primary)', opacity: 0.8 }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: valueColor, marginTop: '0.25rem' }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {subtitle}
        </div>
      )}
    </div>
  );
};
