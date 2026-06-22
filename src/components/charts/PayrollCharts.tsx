import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import type { Worker, WeekAttendance } from '../../types';

interface PayrollChartsProps {
  workers: Worker[];
  attendance: WeekAttendance[];
  activeWeekId: string;
  activeObra: string;
  dailyCounts: {
    lunes: number;
    martes: number;
    miercoles: number;
    jueves: number;
    viernes: number;
    sabado: number;
  };
}

export const PayrollCharts: React.FC<PayrollChartsProps> = ({
  workers,
  attendance,
  activeWeekId,
  activeObra,
  dailyCounts,
}) => {

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(val);
  };

  // 1. Bar Chart: Historical payroll totals per week
  const weeklyPayrollData = useMemo(() => {
    const uniqueWeeks = Array.from(new Set(attendance.map(a => a.weekId))).sort();
    
    return uniqueWeeks.map(wk => {
      let payrollTotal = 0;
      workers.forEach(w => {
        // Filter by construction site if activeObra is set
        if (activeObra !== 'Todas' && w.obra !== activeObra) return;

        const att = attendance.find(a => a.workerId === w.id && a.weekId === wk);
        if (att) {
          let days = 0;
          if (att.lunes) days++;
          if (att.martes) days++;
          if (att.miercoles) days++;
          if (att.jueves) days++;
          if (att.viernes) days++;
          if (att.sabado) days++;
          payrollTotal += days * w.sueldoDiario;
        }
      });

      return {
        name: wk.replace('2026-W', 'Semana '),
        'Nómina': payrollTotal,
      };
    });
  }, [workers, attendance, activeObra]);

  // 2. Pie Chart: Payroll distribution by construction site (active week)
  const obraDistributionData = useMemo(() => {
    const map: Record<string, number> = {};
    
    workers.forEach(w => {
      const att = attendance.find(a => a.workerId === w.id && a.weekId === activeWeekId);
      if (att) {
        let days = 0;
        if (att.lunes) days++;
        if (att.martes) days++;
        if (att.miercoles) days++;
        if (att.jueves) days++;
        if (att.viernes) days++;
        if (att.sabado) days++;
        const cost = days * w.sueldoDiario;
        
        map[w.obra] = (map[w.obra] || 0) + cost;
      }
    });

    const colors = ['var(--accent-primary)', 'var(--accent-secondary)', 'var(--warning)', 'var(--success)', '#6366F1'];
    return Object.entries(map).map(([name, value], i) => ({
      name,
      value,
      color: colors[i % colors.length]
    }));
  }, [workers, attendance, activeWeekId]);

  const totalPayrollSum = useMemo(() => {
    return obraDistributionData.reduce((sum, item) => sum + item.value, 0);
  }, [obraDistributionData]);

  // 3. Bar Chart: Active week daily attendance counts
  const dailyAttendanceData = useMemo(() => {
    return [
      { name: 'Lun', 'Asistencias': dailyCounts.lunes },
      { name: 'Mar', 'Asistencias': dailyCounts.martes },
      { name: 'Mié', 'Asistencias': dailyCounts.miercoles },
      { name: 'Jue', 'Asistencias': dailyCounts.jueves },
      { name: 'Vie', 'Asistencias': dailyCounts.viernes },
      { name: 'Sáb', 'Asistencias': dailyCounts.sabado },
    ];
  }, [dailyCounts]);

  const customTooltipStyle = {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
      
      {/* 1. Bar Chart: Weekly payroll totals */}
      <div className="card" style={{ height: '320px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 600 }}>
          Historial de Nómina Semanal ({activeObra === 'Todas' ? 'Todas las obras' : activeObra})
        </h3>
        <div style={{ flex: 1, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyPayrollData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={(v) => `$${v}`} />
              <Tooltip contentStyle={customTooltipStyle} formatter={(value) => [formatCurrency(Number(value)), 'Nómina']} />
              <Bar dataKey="Nómina" fill="var(--accent-secondary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Bar Chart: Daily attendance active week */}
      <div className="card" style={{ height: '320px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 600 }}>
          Asistencias Diarias ({activeWeekId.replace('2026-W', 'Semana ')})
        </h3>
        <div style={{ flex: 1, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyAttendanceData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Bar dataKey="Asistencias" fill="var(--success)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Pie Chart: Payroll distribution by site */}
      <div className="card" style={{ height: '320px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 600 }}>
          Distribución de Nómina por Obra ({activeWeekId.replace('2026-W', 'Semana ')})
        </h3>
        <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={obraDistributionData}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {obraDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={customTooltipStyle} formatter={(value) => [formatCurrency(Number(value)), 'Nómina']} />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Numerical Breakdown: Payroll breakdown by Obra */}
      <div className="card" style={{ height: '320px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 600 }}>
          Resumen de Nómina por Frente de Obra ({activeWeekId.replace('2026-W', 'Semana ')})
        </h3>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.25rem' }}>
          {obraDistributionData.map((item) => {
            const percentage = totalPayrollSum > 0 ? (item.value / totalPayrollSum) * 100 : 0;
            return (
              <div key={item.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }} className="flex justify-between">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color }} />
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ color: 'var(--success)', fontFamily: 'monospace', fontWeight: 700 }}>
                      {formatCurrency(item.value)}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                {/* Horizontal progress bar */}
                <div style={{ width: '100%', height: '5px', backgroundColor: 'var(--bg-input)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${percentage}%`,
                    backgroundColor: item.color,
                    height: '100%',
                    borderRadius: '9999px'
                  }} />
                </div>
              </div>
            );
          })}
          {obraDistributionData.length === 0 && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '2rem 0' }}>
              No hay nómina registrada en esta semana.
            </div>
          )}
        </div>
        {/* Footer row with grand total */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.85rem',
          fontWeight: 700,
          color: 'var(--text-primary)'
        }}>
          <span>Total de Raya Semanal:</span>
          <span style={{ color: 'var(--success)', fontFamily: 'monospace', fontSize: '0.95rem' }}>
            {formatCurrency(totalPayrollSum)}
          </span>
        </div>
      </div>

    </div>
  );
};
