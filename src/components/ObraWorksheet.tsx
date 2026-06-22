import React, { useState, useMemo } from 'react';
import { Search, Calendar, ChevronLeft, ChevronRight, Check, X, Download, RotateCcw, UserCheck, UserX, Printer, DollarSign, Users, Percent } from 'lucide-react';
import type { Worker, WeekAttendance, ObraFilters, CompanyInfo } from '../types';
import { formatWeekDatesText, getWeekDatesRange, getWeeksInMonth, getWeeksInYear } from '../hooks/useAttendanceData';

type ReportRange = 'semana' | 'mes' | 'ejercicio';

interface WorksheetProps {
  worksheetData: {
    worker: Worker;
    attendance: WeekAttendance;
    daysAttended: number;
    pagoSemanal: number;
  }[];
  workers: Worker[];
  attendance: WeekAttendance[];
  filters: ObraFilters;
  setFilters: React.Dispatch<React.SetStateAction<ObraFilters>>;
  uniqueObras: string[];
  toggleAttendance: (workerId: string, weekId: string, day: 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado') => void;
  toggleAllDays?: (workerId: string, weekId: string, present: boolean) => void;
  onUpdateWorker: (id: string, name: string, role: string, obra: string, sueldoDiario: number) => void;
  navigateWeek: (offset: number) => void;
  companyInfo: CompanyInfo;
}

export const ObraWorksheet: React.FC<WorksheetProps> = ({
  worksheetData,
  workers,
  attendance,
  filters,
  setFilters,
  uniqueObras,
  toggleAttendance,
  toggleAllDays,
  onUpdateWorker,
  navigateWeek,
  companyInfo,
}) => {
  const [reportRange, setReportRange] = useState<ReportRange>('semana');

  // Group worksheetData by Obra
  const groupedData = useMemo(() => {
    const groups: Record<string, typeof worksheetData> = {};
    worksheetData.forEach(row => {
      const obra = row.worker.obra;
      if (!groups[obra]) {
        groups[obra] = [];
      }
      groups[obra].push(row);
    });
    return groups;
  }, [worksheetData]);

  // Determine the target weekIds for the selected range
  const rangeWeekIds = useMemo(() => {
    if (reportRange === 'semana') return [filters.weekId];
    const { start } = getWeekDatesRange(filters.weekId);
    const year = start.getFullYear();
    const month = start.getMonth();
    if (reportRange === 'mes') return getWeeksInMonth(year, month);
    return getWeeksInYear(year);
  }, [reportRange, filters.weekId]);

  // Consolidated data per worker for month / year ranges
  const consolidatedData = useMemo(() => {
    if (reportRange === 'semana') return null; // use original worksheetData

    const relevantWorkers = workers.filter(w => {
      if (filters.obra !== 'Todas' && w.obra !== filters.obra) return false;
      if (filters.search && !w.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });

    return relevantWorkers.map(w => {
      let totalDays = 0;
      rangeWeekIds.forEach(wk => {
        const att = attendance.find(a => a.workerId === w.id && a.weekId === wk);
        if (att) {
          if (att.lunes) totalDays++;
          if (att.martes) totalDays++;
          if (att.miercoles) totalDays++;
          if (att.jueves) totalDays++;
          if (att.viernes) totalDays++;
          if (att.sabado) totalDays++;
        }
      });
      const totalPago = totalDays * w.sueldoDiario;
      return { worker: w, totalDays, totalPago };
    });
  }, [reportRange, workers, attendance, rangeWeekIds, filters]);

  // Consolidated group data (grouped by obra)
  const consolidatedGrouped = useMemo(() => {
    if (!consolidatedData) return null;
    const groups: Record<string, typeof consolidatedData> = {};
    consolidatedData.forEach(row => {
      const obra = row.worker.obra;
      if (!groups[obra]) groups[obra] = [];
      groups[obra].push(row);
    });
    return groups;
  }, [consolidatedData]);

  const isConsolidatedView = reportRange !== 'semana';

  // Stats for consolidated view
  const consolidatedStats = useMemo(() => {
    if (!consolidatedData) return { totalPayroll: 0, totalDays: 0, totalWorkers: 0 };
    return {
      totalPayroll: consolidatedData.reduce((s, r) => s + r.totalPago, 0),
      totalDays: consolidatedData.reduce((s, r) => s + r.totalDays, 0),
      totalWorkers: consolidatedData.length,
    };
  }, [consolidatedData]);

  // Range label helpers
  const rangeLabel = useMemo(() => {
    const { start } = getWeekDatesRange(filters.weekId);
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    if (reportRange === 'mes') return `${months[start.getMonth()]} ${start.getFullYear()}`;
    if (reportRange === 'ejercicio') return `Ejercicio ${start.getFullYear()}`;
    return formatWeekDatesText(filters.weekId);
  }, [reportRange, filters.weekId]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(val);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };


  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // CSV Export utility
  const exportToCSV = () => {
    if (worksheetData.length === 0) return;

    const headers = ['Nombre', 'Cargo', 'Obra', 'Sueldo Diario', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Dias Asistidos', 'Pago Semanal'];
    const rows = worksheetData.map(row => [
      row.worker.name,
      row.worker.role,
      row.worker.obra,
      row.worker.sueldoDiario,
      row.attendance.lunes ? 'Asistio' : 'Falta',
      row.attendance.martes ? 'Asistio' : 'Falta',
      row.attendance.miercoles ? 'Asistio' : 'Falta',
      row.attendance.jueves ? 'Asistio' : 'Falta',
      row.attendance.viernes ? 'Asistio' : 'Falta',
      row.attendance.sabado ? 'Asistio' : 'Falta',
      row.daysAttended,
      row.pagoSemanal
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Planilla_Asistencia_${filters.weekId}_${filters.obra.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const daysList: { key: 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado'; label: string }[] = [
    { key: 'lunes', label: 'Lu' },
    { key: 'martes', label: 'Ma' },
    { key: 'miercoles', label: 'Mi' },
    { key: 'jueves', label: 'Ju' },
    { key: 'viernes', label: 'Vi' },
    { key: 'sabado', label: 'Sa' },
  ];

  const totalPayroll = isConsolidatedView ? consolidatedStats.totalPayroll : worksheetData.reduce((sum, r) => sum + r.pagoSemanal, 0);
  const totalWorkers = isConsolidatedView ? consolidatedStats.totalWorkers : worksheetData.length;
  const totalDaysAttended = isConsolidatedView ? consolidatedStats.totalDays : worksheetData.reduce((sum, r) => sum + r.daysAttended, 0);
  const totalPossibleDays = isConsolidatedView ? (totalWorkers * 6 * rangeWeekIds.length) : (totalWorkers * 6);
  const avgAttendanceRate = totalPossibleDays > 0 ? Math.round((totalDaysAttended / totalPossibleDays) * 100) : 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      
      {/* Print-Only Header (using professional print-header-table class) */}
      <table className="print-header-table">
        <tbody>
          <tr>
            <td className="print-header-logo">
              <div className="brand">{companyInfo.name}</div>
              <div className="subtitle">{companyInfo.subtitle}</div>
            </td>
            <td className="print-header-title">
              {isConsolidatedView ? `Reporte de Nómina — ${reportRange === 'mes' ? 'Mensual' : 'Ejercicio Anual'}` : 'Control de Asistencia y Raya Semanal'}
            </td>
            <td className="print-header-meta">
              <strong>Periodo:</strong> {rangeLabel}<br />
              <strong>Obra:</strong> {filters.obra === 'Todas' ? 'Todas las Obras' : filters.obra}<br />
              <strong>Fecha Emisión:</strong> {new Date().toLocaleDateString('es-MX')}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Print-Only Summary Box */}
      <div className="print-summary-box">
        <div className="print-summary-card">
          <div className="print-summary-card-label">{isConsolidatedView ? `Total Nómina (${reportRange === 'mes' ? 'Mes' : 'Año'})` : 'Total Raya Semanal'}</div>
          <div className="print-summary-card-value success">{formatCurrency(totalPayroll)}</div>
        </div>
        <div className="print-summary-card">
          <div className="print-summary-card-label">Colaboradores Activos</div>
          <div className="print-summary-card-value">{totalWorkers}</div>
        </div>
        <div className="print-summary-card">
          <div className="print-summary-card-label">Jornadas Registradas</div>
          <div className="print-summary-card-value">{totalDaysAttended} jor.</div>
        </div>
        <div className="print-summary-card">
          <div className="print-summary-card-label">Tasa de Asistencia</div>
          <div className="print-summary-card-value">{avgAttendanceRate}%</div>
        </div>
      </div>

      {/* Resumen de Nómina Rápido (KPIs de Cabecera en la Planilla) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)' }} className="no-print">
        <div className="card" style={{ padding: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
          <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', display: 'flex' }}>
            <DollarSign size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{isConsolidatedView ? `Nómina ${reportRange === 'mes' ? 'Mensual' : 'del Ejercicio'}` : `Nómina Semanal (${filters.obra})`}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success)', fontFamily: 'monospace' }}>{formatCurrency(totalPayroll)}</div>
          </div>
        </div>
        
        <div className="card" style={{ padding: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
          <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-secondary)', display: 'flex' }}>
            <Users size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Trabajadores Activos</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalWorkers}</div>
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
          <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', display: 'flex' }}>
            <Percent size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Tasa de Asistencia</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{avgAttendanceRate}%</div>
          </div>
        </div>
      </div>
      
      {/* Week Selector and Obra Filters Row */}
      <div className="card no-print" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        
        {/* Navigation / Actions row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          {/* Week Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button 
              onClick={() => navigateWeek(-1)}
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <div style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.5rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 600,
              fontSize: '0.9rem',
              minWidth: '220px',
              justifyContent: 'center',
            }}>
              <Calendar size={16} color="var(--accent-primary)" />
              <span>{formatWeekDatesText(filters.weekId)}</span>
            </div>
            <button 
              onClick={() => navigateWeek(1)}
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Export / Reset Row */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={exportToCSV}
              disabled={worksheetData.length === 0}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'var(--bg-input)',
                color: worksheetData.length === 0 ? 'var(--text-muted)' : 'var(--accent-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0.5rem 1rem',
                cursor: worksheetData.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => {
                if (worksheetData.length > 0) e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-input)';
              }}
            >
              <Download size={14} />
              Exportar Planilla
            </button>
            <button 
              onClick={() => window.print()}
              disabled={worksheetData.length === 0}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'var(--bg-input)',
                color: worksheetData.length === 0 ? 'var(--text-muted)' : 'var(--accent-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0.5rem 1rem',
                cursor: worksheetData.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => {
                if (worksheetData.length > 0) e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-input)';
              }}
            >
              <Printer size={14} />
              Imprimir Planilla
            </button>
            <button 
              onClick={() => {
                setFilters(prev => ({
                  ...prev,
                  search: '',
                  obra: 'Todas'
                }));
                setReportRange('semana');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'transparent',
                color: 'var(--text-muted)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 500,
              }}
            >
              <RotateCcw size={14} />
              Restablecer Filtros
            </button>
          </div>
        </div>

        {/* Report Range Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Alcance del Reporte / Impresión:</span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
            {([['semana', 'Semana Activa'], ['mes', 'Mes Completo'], ['ejercicio', 'Ejercicio Completo']] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setReportRange(key)}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '9999px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: reportRange === key ? 'var(--accent-secondary)' : 'var(--bg-input)',
                  color: reportRange === key ? 'white' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  transition: 'all 0.2s',
                  boxShadow: reportRange === key ? '0 0 10px rgba(59, 130, 246, 0.3)' : 'none',
                }}
              >
                {label}
              </button>
            ))}
            {isConsolidatedView && (
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', alignSelf: 'center', marginLeft: '0.5rem' }}>
                📊 {rangeLabel} • {rangeWeekIds.length} semanas incluidas
              </span>
            )}
          </div>
        </div>

        {/* Filters Row */}
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-md)'
        }}>
          {/* Obra selector (Pills) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Filtrar por Sitio de Obra:</span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
              <button
                type="button"
                onClick={() => setFilters(prev => ({ ...prev, obra: 'Todas' }))}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '9999px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: filters.obra === 'Todas' ? 'var(--accent-primary)' : 'var(--bg-input)',
                  color: filters.obra === 'Todas' ? 'white' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  transition: 'all 0.2s',
                  boxShadow: filters.obra === 'Todas' ? '0 0 10px rgba(139, 92, 246, 0.3)' : 'none',
                }}
              >
                Todas las Obras
              </button>
              {uniqueObras.map(o => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setFilters(prev => ({ ...prev, obra: o }))}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '9999px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: filters.obra === o ? 'var(--accent-primary)' : 'var(--bg-input)',
                    color: filters.obra === o ? 'white' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    transition: 'all 0.2s',
                    boxShadow: filters.obra === o ? '0 0 10px rgba(139, 92, 246, 0.3)' : 'none',
                  }}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          {/* Search Worker */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Buscar por Trabajador:</span>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem' }} />
              <input
                type="text"
                className="input"
                placeholder="Escribe el nombre..."
                value={filters.search}
                onChange={handleSearchChange}
                style={{ width: '100%', paddingLeft: '2.25rem', fontSize: '0.875rem' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Worksheet Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
        <div className="table-container">
          {/* ===== WEEKLY VIEW (day-by-day checkboxes) ===== */}
          {!isConsolidatedView ? (
          <table>
            <thead>
              <tr>
                <th style={{ minWidth: '180px' }}>Trabajador</th>
                <th>Obra</th>
                <th>Sueldo Diario</th>
                {daysList.map(d => (
                  <th key={d.key} style={{ textAlign: 'center', width: '70px' }}>{d.label}</th>
                ))}
                <th style={{ textAlign: 'center', width: '100px' }}>Asistencias</th>
                <th style={{ textAlign: 'right', width: '130px' }}>Pago Semanal</th>
                <th style={{ textAlign: 'center', width: '90px' }} className="no-print">Acción Rápida</th>
              </tr>
            </thead>
            <tbody>
              {worksheetData.length > 0 ? (
                Object.entries(groupedData).map(([obraName, rows]) => {
                  const subtotalPayroll = rows.reduce((sum, r) => sum + r.pagoSemanal, 0);
                  const subtotalDays = rows.reduce((sum, r) => sum + r.daysAttended, 0);

                  return (
                    <React.Fragment key={obraName}>
                      {/* Group Header Row */}
                      <tr className="obra-group-header">
                        <td colSpan={12} style={{ padding: '0.6rem 1rem', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          📍 Obra: {obraName}
                        </td>
                      </tr>

                      {/* Worker rows for this group */}
                      {rows.map(({ worker, attendance: att, daysAttended, pagoSemanal }) => (
                        <tr key={worker.id}>
                          {/* Worker Info */}
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div className="no-print" style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: worker.avatarColor,
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                              }}>
                                {getInitials(worker.name)}
                              </div>
                              <div>
                                <div className="worker-name">{worker.name}</div>
                                <div className="no-print" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{worker.role}</div>
                              </div>
                            </div>
                          </td>

                          {/* Obra */}
                          <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                            {worker.obra}
                          </td>

                          {/* Sueldo Diario */}
                          <td>
                            <span className="print-only" style={{ fontFamily: 'monospace', textAlign: 'right', fontSize: '0.8rem', color: '#1e293b' }}>
                              {formatCurrency(worker.sueldoDiario)}
                            </span>
                            <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>$</span>
                              <input
                                key={worker.id + '_' + worker.sueldoDiario}
                                type="number"
                                step="any"
                                className="input"
                                defaultValue={worker.sueldoDiario}
                                onBlur={(e) => {
                                  const val = Math.max(0, parseFloat(e.target.value) || 0);
                                  if (val !== worker.sueldoDiario) {
                                    onUpdateWorker(worker.id, worker.name, worker.role, worker.obra, val);
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const val = Math.max(0, parseFloat(e.currentTarget.value) || 0);
                                    if (val !== worker.sueldoDiario) {
                                      onUpdateWorker(worker.id, worker.name, worker.role, worker.obra, val);
                                    }
                                    e.currentTarget.blur();
                                  }
                                }}
                                style={{
                                  width: '85px',
                                  padding: '0.25rem 0.4rem',
                                  fontSize: '0.85rem',
                                  fontFamily: 'monospace',
                                  textAlign: 'right',
                                  backgroundColor: 'rgba(0,0,0,0.25)',
                                }}
                              />
                            </div>
                          </td>

                          {/* Attendance checkmarks (Mon to Sat) */}
                          {daysList.map(d => {
                            const isPresent = att[d.key];
                            return (
                              <td key={d.key} style={{ textAlign: 'center' }}>
                                <span className={`print-only-inline badge-${isPresent ? 'present' : 'absent'}`} style={{
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: '50%',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.65rem',
                                  fontWeight: 'bold',
                                  backgroundColor: isPresent ? '#d1fae5' : '#fee2e2',
                                  color: isPresent ? '#065f46' : '#991b1b',
                                  lineHeight: '18px',
                                  border: isPresent ? '1px solid #a7f3d0' : '1px solid #fecaca',
                                }}>
                                  {isPresent ? '✓' : '✗'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => toggleAttendance(worker.id, filters.weekId, d.key)}
                                  className={`attendance-btn ${isPresent ? 'present' : 'absent'} no-print`}
                                  style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    border: 'none',
                                    backgroundColor: isPresent ? 'var(--success-bg)' : 'var(--danger-bg)',
                                    color: isPresent ? 'var(--success)' : 'var(--danger)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'transform 0.15s, background-color 0.15s',
                                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
                                  }}
                                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                  title={isPresent ? 'Registrado: Asistencia' : 'Registrado: Falta'}
                                >
                                  {isPresent ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
                                </button>
                              </td>
                            );
                          })}

                          {/* Days Attended counter */}
                          <td style={{ textAlign: 'center' }}>
                            <span className={`badge ${daysAttended === 6 ? 'badge-present' : daysAttended > 0 ? 'badge-partial' : 'badge-absent'}`} style={{ 
                              backgroundColor: daysAttended === 6 ? 'var(--success-bg)' : daysAttended > 0 ? 'var(--warning-bg)' : 'var(--danger-bg)', 
                              color: daysAttended === 6 ? 'var(--success)' : daysAttended > 0 ? 'var(--warning)' : 'var(--danger)',
                              border: '1px solid rgba(255,255,255,0.05)',
                              fontSize: '0.8rem',
                              padding: '0.2rem 0.6rem',
                              fontFamily: 'monospace'
                            }}>
                              {daysAttended} / 6
                            </span>
                          </td>

                          {/* Weekly Pay */}
                          <td className="weekly-pay" style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {formatCurrency(pagoSemanal)}
                          </td>

                          {/* Quick present/absent all days */}
                          <td style={{ textAlign: 'center' }} className="no-print">
                            {toggleAllDays && (
                              <div style={{ display: 'inline-flex', gap: '0.25rem' }}>
                                <button
                                  onClick={() => toggleAllDays(worker.id, filters.weekId, true)}
                                  style={{
                                    backgroundColor: 'var(--bg-input)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--success)',
                                    borderRadius: 'var(--radius-sm)',
                                    padding: '0.2rem 0.35rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    fontSize: '0.65rem',
                                  }}
                                  title="Presente toda la semana"
                                >
                                  <UserCheck size={11} />
                                </button>
                                <button
                                  onClick={() => toggleAllDays(worker.id, filters.weekId, false)}
                                  style={{
                                    backgroundColor: 'var(--bg-input)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--danger)',
                                    borderRadius: 'var(--radius-sm)',
                                    padding: '0.2rem 0.35rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    fontSize: '0.65rem',
                                  }}
                                  title="Falta toda la semana"
                                >
                                  <UserX size={11} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}

                      {/* Subtotal Row for this group */}
                      <tr className="obra-group-subtotal">
                        <td colSpan={2} style={{ paddingLeft: '2rem', fontStyle: 'italic', fontWeight: 600 }}>
                          Subtotal {obraName}
                        </td>
                        <td colSpan={7}></td>
                        <td style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 700 }}>
                          {subtotalDays} jor.
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 800 }}>
                          {formatCurrency(subtotalPayroll)}
                        </td>
                        <td className="no-print"></td>
                      </tr>
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={12} style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-muted)' }}>
                    No se encontraron colaboradores para la obra o filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr style={{ 
                backgroundColor: 'var(--bg-input)', 
                borderTop: '2px solid var(--border-color)',
                fontWeight: 700
              }}>
                <td colSpan={3} style={{ 
                  padding: 'var(--space-md)', 
                  color: 'var(--text-primary)', 
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Total {filters.obra === 'Todas' ? 'Todas las Obras' : filters.obra}
                </td>
                <td colSpan={6}></td>
                <td style={{ 
                  textAlign: 'center', 
                  color: 'var(--text-primary)', 
                  fontSize: '0.9rem',
                  fontFamily: 'monospace'
                }}>
                  {totalDaysAttended} jor.
                </td>
                <td className="footer-payroll" style={{ 
                  textAlign: 'right', 
                  color: 'var(--success)', 
                  fontSize: '1rem',
                  fontWeight: 800,
                  fontFamily: 'monospace'
                }}>
                  {formatCurrency(totalPayroll)}
                </td>
                <td className="no-print"></td>
              </tr>
            </tfoot>
          </table>
          ) : (
          /* ===== CONSOLIDATED VIEW (Month / Year) ===== */
          <table>
            <thead>
              <tr>
                <th style={{ minWidth: '180px' }}>Trabajador</th>
                <th>Obra</th>
                <th>Sueldo Diario</th>
                <th style={{ textAlign: 'center', width: '130px' }}>Jornadas Asistidas</th>
                <th style={{ textAlign: 'right', width: '150px' }}>Pago {reportRange === 'mes' ? 'Mensual' : 'del Ejercicio'}</th>
              </tr>
            </thead>
            <tbody>
              {consolidatedGrouped && Object.keys(consolidatedGrouped).length > 0 ? (
                Object.entries(consolidatedGrouped).map(([obraName, rows]) => {
                  const subtotalPago = rows.reduce((s, r) => s + r.totalPago, 0);
                  const subtotalDays = rows.reduce((s, r) => s + r.totalDays, 0);
                  return (
                    <React.Fragment key={obraName}>
                      <tr className="obra-group-header">
                        <td colSpan={5} style={{ padding: '0.6rem 1rem', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          📍 Obra: {obraName}
                        </td>
                      </tr>
                      {rows.map(({ worker, totalDays: tDays, totalPago: tPago }) => (
                        <tr key={worker.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div className="no-print" style={{
                                width: '32px', height: '32px', borderRadius: '50%',
                                backgroundColor: worker.avatarColor, color: 'white', fontWeight: 700,
                                fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                              }}>{getInitials(worker.name)}</div>
                              <div>
                                <div className="worker-name">{worker.name}</div>
                                <div className="no-print" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{worker.role}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{worker.obra}</td>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{formatCurrency(worker.sueldoDiario)}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span className="badge" style={{
                              backgroundColor: 'var(--accent-secondary)',
                              color: 'white',
                              fontSize: '0.8rem',
                              padding: '0.2rem 0.6rem',
                              fontFamily: 'monospace'
                            }}>{tDays} jor.</span>
                          </td>
                          <td className="weekly-pay" style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {formatCurrency(tPago)}
                          </td>
                        </tr>
                      ))}
                      <tr className="obra-group-subtotal">
                        <td colSpan={2} style={{ paddingLeft: '2rem', fontStyle: 'italic', fontWeight: 600 }}>Subtotal {obraName}</td>
                        <td></td>
                        <td style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 700 }}>{subtotalDays} jor.</td>
                        <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 800 }}>{formatCurrency(subtotalPago)}</td>
                      </tr>
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-muted)' }}>
                    No se encontraron colaboradores para este periodo.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: 'var(--bg-input)', borderTop: '2px solid var(--border-color)', fontWeight: 700 }}>
                <td colSpan={3} style={{ padding: 'var(--space-md)', color: 'var(--text-primary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Total {filters.obra === 'Todas' ? 'Todas las Obras' : filters.obra} — {rangeLabel}
                </td>
                <td style={{ textAlign: 'center', color: 'var(--text-primary)', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                  {totalDaysAttended} jor.
                </td>
                <td className="footer-payroll" style={{ textAlign: 'right', color: 'var(--success)', fontSize: '1rem', fontWeight: 800, fontFamily: 'monospace' }}>
                  {formatCurrency(totalPayroll)}
                </td>
              </tr>
            </tfoot>
          </table>
          )}
        </div>
      </div>

      {/* Grid instruction */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', flexWrap: 'wrap', gap: 'var(--space-md)' }} className="no-print">
        <div>💡 <em>Haz clic sobre cualquier círculo verde o rojo de lunes a sábado para alternar la asistencia del colaborador. Puedes administrar los datos semilla y respaldos desde el menú lateral en "Configuración".</em></div>
      </div>

      {/* Print-Only Signatures (hidden on screen, visible during printing) */}
      <div className="print-signatures" style={{ display: 'none' }}>
        <div className="signature-line">
          Firma del Supervisor de Obra
        </div>
        <div className="signature-line">
          Autorizó (Recursos Humanos)
        </div>
      </div>

    </div>
  );
};
