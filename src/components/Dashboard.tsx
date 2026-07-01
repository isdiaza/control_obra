import React, { useState, useMemo } from 'react';
import { useAttendanceData } from '../hooks/useAttendanceData';
import { useFinancialData } from '../hooks/useFinancialData';
import { Header } from './Header';
import { KpiCard } from './KpiCard';
import { ObraWorksheet } from './ObraWorksheet';
import { WorkerDirectory } from './WorkerDirectory';
import { PayrollCharts } from './charts/PayrollCharts';
import { ChatWidget } from './ChatWidget';
import { FinancialControl } from './FinancialControl';
import { TableProperties, BarChart3, Users, DollarSign, Percent, Construction, Coins, Settings, Truck, UserCheck, TrendingUp, TrendingDown, Landmark, Camera, Hammer } from 'lucide-react';
import { SettingsPanel } from './SettingsPanel';
import { ObraDirectory } from './ObraDirectory';
import { ProveedorDirectory } from './ProveedorDirectory';
import { ClienteDirectory } from './ClienteDirectory';
import { ReporteFotografico } from './ReporteFotografico';
import { HistorialReportes } from './HistorialReportes';
import { Clock } from 'lucide-react';
import DestajoDirectory from './DestajoDirectory';

type TabType = 'worksheet' | 'analytics' | 'directory' | 'finances' | 'settings' | 'obras' | 'proveedores' | 'clientes' | 'reporte' | 'historial' | 'destajo';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('analytics');
  const {
    workers,
    attendance,
    companyInfo,
    obras,
    filters,
    setFilters,
    uniqueObras,
    worksheetData,
    stats,
    toggleAttendance,
    toggleAllDays,
    addWorker,
    deleteWorker,
    updateWorker,
    updateCompanyInfo,
    addObra,
    updateObra,
    deleteObra,
    resetAllData,
    clearAllData,
    navigateWeek,
  } = useAttendanceData();

  const {
    transactions,
    proveedores,
    clientes,
    addTransaction,
    deleteTransaction,
    addProveedor,
    updateProveedor,
    deleteProveedor,
    addCliente,
    updateCliente,
    deleteCliente,
  } = useFinancialData();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(val);
  };

  const allObrasWeeklyPayroll = React.useMemo(() => {
    const payrolls: Record<string, number> = {};
    workers.forEach(w => {
      const att = attendance.find(a => a.workerId === w.id && a.weekId === filters.weekId);
      if (att) {
        let days = 0;
        if (att.lunes) days++;
        if (att.martes) days++;
        if (att.miercoles) days++;
        if (att.jueves) days++;
        if (att.viernes) days++;
        if (att.sabado) days++;
        const totalPay = days * w.sueldoDiario;
        payrolls[w.obra] = (payrolls[w.obra] || 0) + totalPay;
      }
    });
    return payrolls;
  }, [workers, attendance, filters.weekId]);

  // Dashboard financial computations
  const dashboardFinancials = useMemo(() => {
    const weekTxs = transactions.filter(t => t.weekId === filters.weekId);
    const totalIncome = weekTxs.filter(t => t.type === 'ingreso').reduce((s, t) => s + t.amount, 0);
    const manualExpenses = weekTxs.filter(t => t.type === 'gasto').reduce((s, t) => s + t.amount, 0);
    const totalExpenses = manualExpenses + stats.totalPayroll;
    const balance = totalIncome - totalExpenses;
    return { totalIncome, manualExpenses, totalExpenses, balance };
  }, [transactions, filters.weekId, stats.totalPayroll]);

  // Per-proveedor spend totals
  const proveedorSpends = useMemo(() => {
    return proveedores.map(p => {
      const total = transactions.filter(t => t.proveedorId === p.id && t.type === 'gasto').reduce((s, t) => s + t.amount, 0);
      return { name: p.name, total };
    }).filter(p => p.total > 0).sort((a, b) => b.total - a.total);
  }, [proveedores, transactions]);

  // Per-cliente income totals
  const clienteIncomes = useMemo(() => {
    return clientes.map(c => {
      const total = transactions.filter(t => t.clienteId === c.id && t.type === 'ingreso').reduce((s, t) => s + t.amount, 0);
      return { name: c.name, total };
    }).filter(c => c.total > 0).sort((a, b) => b.total - a.total);
  }, [clientes, transactions]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header totalPayroll={stats.totalPayroll} activeObra={filters.obra} companyName={companyInfo.name} />

      {/* Main Layout Container (Row on desktop, Column on mobile via CSS) */}
      <div className="app-layout-container">
        
        {/* Sidebar Menu (or Top horizontal bar on mobile) */}
        <aside className="sidebar-menu no-print">
          {/* Menu Title / Label (Hidden on mobile) */}
          <div className="sidebar-title">
            Navegación
          </div>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`sidebar-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          >
            <BarChart3 size={18} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('worksheet')}
            className={`sidebar-btn ${activeTab === 'worksheet' ? 'active' : ''}`}
          >
            <TableProperties size={18} />
            <span>Nómina</span>
          </button>

          <button
            onClick={() => setActiveTab('finances')}
            className={`sidebar-btn ${activeTab === 'finances' ? 'active' : ''}`}
          >
            <Coins size={18} />
            <span>Control Financiero</span>
          </button>

          <button
            onClick={() => setActiveTab('obras')}
            className={`sidebar-btn ${activeTab === 'obras' ? 'active' : ''}`}
          >
            <Construction size={18} />
            <span>Obras</span>
          </button>

          <button
            onClick={() => setActiveTab('destajo')}
            className={`sidebar-btn ${activeTab === 'destajo' ? 'active' : ''}`}
          >
            <Hammer size={18} />
            <span>Destajo</span>
          </button>

          <button
            onClick={() => setActiveTab('proveedores')}
            className={`sidebar-btn ${activeTab === 'proveedores' ? 'active' : ''}`}
          >
            <Truck size={18} />
            <span>Proveedores</span>
          </button>

          <button
            onClick={() => setActiveTab('clientes')}
            className={`sidebar-btn ${activeTab === 'clientes' ? 'active' : ''}`}
          >
            <UserCheck size={18} />
            <span>Clientes</span>
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`sidebar-btn ${activeTab === 'directory' ? 'active' : ''}`}
          >
            <Users size={18} />
            <span>Trabajadores</span>
          </button>

          <button
            onClick={() => setActiveTab('reporte')}
            className={`sidebar-btn ${activeTab === 'reporte' ? 'active' : ''}`}
          >
            <Camera size={18} />
            <span>Reporte Fotográfico</span>
          </button>

          <button
            onClick={() => setActiveTab('historial')}
            className={`sidebar-btn ${activeTab === 'historial' ? 'active' : ''}`}
          >
            <Clock size={18} />
            <span>Historial</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`sidebar-btn sidebar-btn-settings ${activeTab === 'settings' ? 'active' : ''}`}
          >
            <Settings size={18} />
            <span>Configuración</span>
          </button>
        </aside>

        {/* Main Content Area */}
        <main style={{ flex: 1, padding: 'var(--space-xl) var(--space-lg)' }}>
          <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
            
            {/* Tab 1: Worksheet Grid */}
            {activeTab === 'worksheet' && (
              <div className="animate-fade-in">
                <ObraWorksheet 
                  worksheetData={worksheetData}
                  workers={workers}
                  attendance={attendance}
                  filters={filters}
                  setFilters={setFilters}
                  uniqueObras={uniqueObras}
                  toggleAttendance={toggleAttendance}
                  toggleAllDays={toggleAllDays}
                  onUpdateWorker={updateWorker}
                  navigateWeek={navigateWeek}
                  companyInfo={companyInfo}
                />
              </div>
            )}

            {/* Tab: Obras Directory */}
            {activeTab === 'obras' && (
              <div className="animate-fade-in">
                <ObraDirectory
                  obras={obras}
                  workers={workers}
                  attendance={attendance}
                  transactions={transactions}
                  activeWeekId={filters.weekId}
                  onAddObra={addObra}
                  onUpdateObra={updateObra}
                  onDeleteObra={deleteObra}
                />
              </div>
            )}

            {/* Tab: Dashboard */}
            {activeTab === 'analytics' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
                
                {/* Financial KPIs Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-lg)' }}>
                  <KpiCard 
                    title="Nómina de la Semana" 
                    value={formatCurrency(stats.totalPayroll)}
                    subtitle={`${stats.totalWorkers} trabajadores activos`}
                    icon={<DollarSign size={20} />} 
                    trend="neutral"
                  />
                  <KpiCard 
                    title="Ingresos Registrados" 
                    value={formatCurrency(dashboardFinancials.totalIncome)}
                    subtitle="Estimaciones y cobros de la semana"
                    icon={<TrendingUp size={20} />} 
                    trend="positive"
                  />
                  <KpiCard 
                    title="Egresos Totales" 
                    value={formatCurrency(dashboardFinancials.totalExpenses)}
                    subtitle="Gastos + Nómina de la semana"
                    icon={<TrendingDown size={20} />} 
                    trend="negative"
                  />
                  <KpiCard 
                    title="Balance Neto" 
                    value={formatCurrency(dashboardFinancials.balance)}
                    subtitle={dashboardFinancials.balance >= 0 ? 'Utilidad positiva' : 'Resultado negativo'}
                    icon={<Landmark size={20} />} 
                    trend={dashboardFinancials.balance >= 0 ? 'positive' : 'negative'}
                  />
                </div>

                {/* Secondary KPIs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
                  <KpiCard 
                    title="Asistencia Semanal" 
                    value={`${stats.attendanceRate}%`}
                    subtitle="Promedio de asistencia"
                    icon={<Percent size={20} />} 
                    trend={stats.attendanceRate >= 85 ? 'positive' : stats.attendanceRate >= 70 ? 'neutral' : 'negative'}
                  />
                  <KpiCard 
                    title="Costo Diario Promedio" 
                    value={formatCurrency(stats.totalWorkers > 0 ? stats.totalPayroll / 6 : 0)}
                    subtitle="Gasto estimado por jornada"
                    icon={<Coins size={20} />} 
                    trend="neutral"
                  />
                  <KpiCard 
                    title="Obras Activas" 
                    value={String(uniqueObras.length)}
                    subtitle="Frentes de obra registrados"
                    icon={<Construction size={20} />} 
                    trend="neutral"
                  />
                </div>

                {/* Proveedores & Clientes Breakdown */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 'var(--space-lg)' }}>
                  
                  {/* Proveedores Breakdown */}
                  <div className="card" style={{ border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                    <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                      <Truck size={16} color="var(--accent-primary)" />
                      Compras por Proveedor (Acumulado)
                    </h3>
                    {proveedorSpends.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {proveedorSpends.map(p => {
                          const maxSpend = proveedorSpends[0].total;
                          const pct = maxSpend > 0 ? (p.total / maxSpend) * 100 : 0;
                          return (
                            <div key={p.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</span>
                                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--danger)' }}>{formatCurrency(p.total)}</span>
                              </div>
                              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-input)', borderRadius: '9999px', overflow: 'hidden' }}>
                                <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--danger)', borderRadius: '9999px', transition: 'width 0.5s ease' }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>Sin compras registradas</p>
                    )}
                  </div>

                  {/* Clientes Breakdown */}
                  <div className="card" style={{ border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                    <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                      <UserCheck size={16} color="var(--success)" />
                      Cobros por Cliente (Acumulado)
                    </h3>
                    {clienteIncomes.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {clienteIncomes.map(c => {
                          const maxIncome = clienteIncomes[0].total;
                          const pct = maxIncome > 0 ? (c.total / maxIncome) * 100 : 0;
                          return (
                            <div key={c.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</span>
                                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--success)' }}>+{formatCurrency(c.total)}</span>
                              </div>
                              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-input)', borderRadius: '9999px', overflow: 'hidden' }}>
                                <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--success)', borderRadius: '9999px', transition: 'width 0.5s ease' }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>Sin cobros registrados</p>
                    )}
                  </div>
                </div>

                {/* Charts Panel */}
                <PayrollCharts 
                  workers={workers}
                  attendance={worksheetData.map(r => r.attendance)}
                  activeWeekId={filters.weekId}
                  activeObra={filters.obra}
                  dailyCounts={stats.dailyCounts}
                />

              </div>
            )}

            {/* Tab 3: Worker Directory */}
            {activeTab === 'directory' && (
              <div className="animate-fade-in">
                <WorkerDirectory 
                  workers={workers}
                  uniqueObras={uniqueObras}
                  onAddWorker={addWorker}
                  onDeleteWorker={deleteWorker}
                  onUpdateWorker={updateWorker}
                />
              </div>
            )}

            {/* Tab 4: Financial Control */}
            {activeTab === 'finances' && (
              <div className="animate-fade-in">
                <FinancialControl 
                  transactions={transactions}
                  proveedores={proveedores}
                  clientes={clientes}
                  addTransaction={addTransaction}
                  deleteTransaction={deleteTransaction}
                  uniqueObras={uniqueObras}
                  filters={filters}
                  setFilters={setFilters}
                  activeWeekPayroll={stats.totalPayroll}
                  allObrasWeeklyPayroll={allObrasWeeklyPayroll}
                  navigateWeek={navigateWeek}
                  companyInfo={companyInfo}
                />
              </div>
            )}

            {/* Tab: Destajo Contracts */}
            {activeTab === 'destajo' && (
              <DestajoDirectory
                obras={obras}
                addTransaction={addTransaction}
              />
            )}

            {/* Tab: Proveedores Directory */}
            {activeTab === 'proveedores' && (
              <div className="animate-fade-in">
                <ProveedorDirectory
                  proveedores={proveedores}
                  transactions={transactions}
                  onAddProveedor={addProveedor}
                  onUpdateProveedor={updateProveedor}
                  onDeleteProveedor={deleteProveedor}
                />
              </div>
            )}

            {/* Tab: Clientes Directory */}
            {activeTab === 'clientes' && (
              <div className="animate-fade-in">
                <ClienteDirectory
                  clientes={clientes}
                  transactions={transactions}
                  onAddCliente={addCliente}
                  onUpdateCliente={updateCliente}
                  onDeleteCliente={deleteCliente}
                />
              </div>
            )}

            {/* Tab 5: Settings Panel */}
            {activeTab === 'settings' && (
              <div className="animate-fade-in">
                <SettingsPanel 
                  onResetData={resetAllData}
                  onClearData={clearAllData}
                  workersCount={workers.length}
                  transactionsCount={transactions.length}
                  attendanceCount={attendance.length}
                  companyInfo={companyInfo}
                  onUpdateCompanyInfo={updateCompanyInfo}
                />
              </div>
            )}

            {/* Tab: Reporte Fotografico */}
            {activeTab === 'reporte' && (
              <div className="animate-fade-in">
                <ReporteFotografico />
              </div>
            )}

            {/* Tab: Historial de Reportes */}
            {activeTab === 'historial' && (
              <div className="animate-fade-in">
                <HistorialReportes />
              </div>
            )}

          </div>
        </main>
      </div>

      {/* AI Assistant chat adapted for construction site and payroll queries */}
      <ChatWidget />
    </div>
  );
};
