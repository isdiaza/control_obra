import React, { useState, useEffect } from 'react';
import { Clock, Wallet } from 'lucide-react';

interface HeaderProps {
  totalPayroll: number;
  activeObra: string;
  companyName: string;
}

export const Header: React.FC<HeaderProps> = ({ totalPayroll, activeObra, companyName }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatLongDate = (d: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    const str = d.toLocaleDateString('es-ES', options);
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false
    });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(val);
  };

  return (
    <header className="main-header" style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: 'var(--space-md) var(--space-xl)',
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-card)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div className="header-info">
        <h1 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
          <span style={{ color: 'var(--accent-primary)', textShadow: '0 0 10px rgba(139, 92, 246, 0.5)' }}>✦</span> {companyName}
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 400 }}>•</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: 500 }}>Control de Asistencia y Nómina</span>
        </h1>
        <p style={{ margin: '0.15rem 0 0', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          Registro semanal y cálculo de pago por obra en tiempo real
        </p>
      </div>

      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {/* Payroll counter */}
        <div className="header-payroll" style={{ 
          display: 'flex',
          alignItems: 'center', 
          gap: '0.5rem', 
          backgroundColor: 'rgba(59, 130, 246, 0.08)', 
          padding: '0.5rem 0.75rem', 
          borderRadius: 'var(--radius-md)', 
          border: '1px solid rgba(59, 130, 246, 0.2)',
          fontSize: '0.8rem',
          color: 'var(--accent-secondary)'
        }}>
          <Wallet size={14} color="var(--accent-secondary)" />
          <span>Nómina Semanal ({activeObra}): <strong>{formatCurrency(totalPayroll)}</strong></span>
        </div>

        {/* Live Clock Widget */}
        <div className="header-clock" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          background: 'var(--bg-input)', 
          padding: '0.5rem 1rem', 
          borderRadius: 'var(--radius-md)', 
          border: '1px solid var(--border-color)',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'monospace' }}>
              {formatTime(time)}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>
              {formatLongDate(time)}
            </span>
          </div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Clock size={16} color="var(--accent-primary)" />
            <span style={{
              position: 'absolute',
              top: -2,
              right: -2,
              width: '6px',
              height: '6px',
              backgroundColor: 'var(--success)',
              borderRadius: '50%',
              boxShadow: '0 0 8px var(--success)',
              animation: 'pulse 1.5s infinite ease-in-out'
            }} />
          </div>
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 0.6; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.6; }
        }
      `}</style>
    </header>
  );
};
