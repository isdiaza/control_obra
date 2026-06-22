import React, { useState, useMemo, useEffect } from 'react';
import type { FinancialTransaction, ObraFilters, CompanyInfo, Proveedor, Cliente } from '../types';
import { CalendarCheck, ArrowUpCircle, ArrowDownCircle, Plus, Trash2, Calendar, TrendingUp, TrendingDown, Info, Landmark, PlusCircle, Download, Printer, Truck, UserCheck } from 'lucide-react';
import { formatWeekDatesText, getWeekDatesRange } from '../hooks/useAttendanceData';

interface FinancialControlProps {
  transactions: FinancialTransaction[];
  proveedores: Proveedor[];
  clientes: Cliente[];
  addTransaction: (
    description: string,
    type: 'ingreso' | 'gasto',
    category: string,
    amount: number,
    obra: string,
    dateString: string,
    proveedorId?: string,
    materialName?: string,
    quantity?: number,
    unitPrice?: number,
    clienteId?: string
  ) => void;
  deleteTransaction: (id: string) => void;
  uniqueObras: string[];
  filters: ObraFilters;
  setFilters: React.Dispatch<React.SetStateAction<ObraFilters>>;
  activeWeekPayroll: number; // The computed payroll for the active filters (week + obra)
  allObrasWeeklyPayroll: Record<string, number>; // Payroll of each individual obra for the active week
  navigateWeek: (offset: number) => void;
  companyInfo: CompanyInfo;
}

export const FinancialControl: React.FC<FinancialControlProps> = ({
  transactions,
  proveedores,
  clientes,
  addTransaction,
  deleteTransaction,
  uniqueObras,
  filters,
  setFilters,
  activeWeekPayroll,
  allObrasWeeklyPayroll,
  navigateWeek,
  companyInfo,
}) => {
  // Local state for the new transaction form
  const [desc, setDesc] = useState('');
  const [type, setType] = useState<'ingreso' | 'gasto'>('gasto');
  const [category, setCategory] = useState('Materiales');
  const [amount, setAmount] = useState('');
  const [obra, setObra] = useState(uniqueObras[0] || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Supplier & purchase detailing state
  const [selectedProveedorId, setSelectedProveedorId] = useState('');
  const [selectedClienteId, setSelectedClienteId] = useState('');
  const [detailPurchase, setDetailPurchase] = useState(false);
  const [materialName, setMaterialName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');

  useEffect(() => {
    let active = true;
    if (proveedores.length > 0 && !selectedProveedorId) {
      Promise.resolve().then(() => {
        if (active) setSelectedProveedorId(proveedores[0].id);
      });
    }
    return () => {
      active = false;
    };
  }, [proveedores, selectedProveedorId]);

  useEffect(() => {
    let active = true;
    if (clientes.length > 0 && !selectedClienteId) {
      Promise.resolve().then(() => {
        if (active) setSelectedClienteId(clientes[0].id);
      });
    }
    return () => {
      active = false;
    };
  }, [clientes, selectedClienteId]);

  React.useEffect(() => {
    let active = true;
    if (uniqueObras.length > 0 && (!obra || !uniqueObras.includes(obra))) {
      Promise.resolve().then(() => {
        if (active) setObra(uniqueObras[0]);
      });
    }
    return () => {
      active = false;
    };
  }, [uniqueObras, obra]);

  // Adjust categories when transaction type changes
  const handleTypeChange = (newType: 'ingreso' | 'gasto') => {
    setType(newType);
    if (newType === 'ingreso') {
      setCategory('Estimación Cliente');
    } else {
      setCategory('Materiales');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(val);
  };

  // Filter transactions based on active week and obra filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Filter by Week
      if (t.weekId !== filters.weekId) return false;
      // Filter by Obra
      if (filters.obra !== 'Todas' && t.obra !== filters.obra) return false;
      return true;
    });
  }, [transactions, filters]);

  // Calculate totals
  const financials = useMemo(() => {
    // 1. Incomes (Ingresos)
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'ingreso')
      .reduce((sum, t) => sum + t.amount, 0);

    // 2. Manual Expenses (Egresos manuales)
    const manualExpenses = filteredTransactions
      .filter(t => t.type === 'gasto')
      .reduce((sum, t) => sum + t.amount, 0);

    // 3. Automatic Payroll Expense (Nómina Automática)
    const payrollExpense = activeWeekPayroll;

    // 4. Total Expenses (Gastos Totales)
    const totalExpenses = manualExpenses + payrollExpense;

    // 5. Balance (Saldo Neto)
    const balance = totalIncome - totalExpenses;

    // Margin percentage
    const profitMargin = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0;

    return {
      totalIncome,
      manualExpenses,
      payrollExpense,
      totalExpenses,
      balance,
      profitMargin
    };
  }, [filteredTransactions, activeWeekPayroll]);

  // Profitability per Obra for the active week (used when filters.obra === 'Todas')
  const obrasProfits = useMemo(() => {
    return uniqueObras.map(o => {
      const obraTxs = transactions.filter(t => t.weekId === filters.weekId && t.obra === o);
      
      const income = obraTxs.filter(t => t.type === 'ingreso').reduce((sum, t) => sum + t.amount, 0);
      const manualGasto = obraTxs.filter(t => t.type === 'gasto').reduce((sum, t) => sum + t.amount, 0);
      const payroll = allObrasWeeklyPayroll[o] || 0;
      const expenses = manualGasto + payroll;
      const balance = income - expenses;
      const margin = income > 0 ? Math.round((balance / income) * 100) : 0;

      return {
        name: o,
        income,
        expenses,
        balance,
        margin
      };
    });
  }, [transactions, filters.weekId, uniqueObras, allObrasWeeklyPayroll]);

  // CSV Export utility
  const exportToCSV = () => {
    const headers = ['Fecha', 'Descripción', 'Obra', 'Tipo', 'Categoría', 'Importe'];
    
    // Injected payroll row data
    const payrollDate = getWeekDatesRange(filters.weekId).start.toISOString().split('T')[0];
    const payrollRow = activeWeekPayroll > 0 ? [[
      payrollDate,
      'Nómina Semanal Automática',
      filters.obra === 'Todas' ? 'Múltiples Obras' : filters.obra,
      'Egreso',
      'Nómina',
      activeWeekPayroll
    ]] : [];

    const rows = filteredTransactions.map(t => [
      t.date,
      t.description,
      t.obra,
      t.type === 'ingreso' ? 'Ingreso' : 'Egreso',
      t.category,
      t.amount
    ]);

    const allRows = [...payrollRow, ...rows];

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...allRows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Reporte_Financiero_${filters.weekId}_${filters.obra.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = detailPurchase && type === 'gasto'
      ? (parseFloat(quantity) || 0) * (parseFloat(unitPrice) || 0)
      : parseFloat(amount);

    if (!desc.trim() || !finalAmount || finalAmount <= 0 || !obra) return;

    addTransaction(
      desc.trim(),
      type,
      category,
      finalAmount,
      obra,
      date,
      type === 'gasto' ? selectedProveedorId || undefined : undefined,
      detailPurchase && type === 'gasto' ? materialName.trim() : undefined,
      detailPurchase && type === 'gasto' ? (parseFloat(quantity) || undefined) : undefined,
      detailPurchase && type === 'gasto' ? (parseFloat(unitPrice) || undefined) : undefined,
      type === 'ingreso' ? selectedClienteId || undefined : undefined
    );

    // Reset inputs except date and project
    setDesc('');
    setAmount('');
    setMaterialName('');
    setQuantity('');
    setUnitPrice('');
    setDetailPurchase(false);
  };

  const getCategoryBadgeStyle = (cat: string) => {
    switch (cat) {
      case 'Estimación Cliente':
        return { backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.3)' };
      case 'Anticipo':
        return { backgroundColor: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-secondary)', border: '1px solid rgba(59, 130, 246, 0.3)' };
      case 'Nómina':
        return { backgroundColor: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-primary)', border: '1px solid rgba(139, 92, 246, 0.3)' };
      case 'Materiales':
        return { backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)', border: '1px solid rgba(245, 158, 11, 0.3)' };
      case 'Flete / Acarreo':
        return { backgroundColor: 'rgba(14, 116, 144, 0.15)', color: '#06b6d4', border: '1px solid rgba(14, 116, 144, 0.3)' };
      case 'Herramientas / Renta':
        return { backgroundColor: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', border: '1px solid rgba(236, 72, 153, 0.3)' };
      case 'Viáticos / Combustible':
        return { backgroundColor: 'rgba(100, 116, 139, 0.15)', color: 'var(--text-secondary)', border: '1px solid rgba(100, 116, 139, 0.3)' };
      default:
        return { backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' };
    }
  };

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
              Reporte de Control Financiero
            </td>
            <td className="print-header-meta">
              <strong>Semana:</strong> {formatWeekDatesText(filters.weekId)}<br />
              <strong>Obra:</strong> {filters.obra === 'Todas' ? 'Todas las Obras' : filters.obra}<br />
              <strong>Fecha Emisión:</strong> {new Date().toLocaleDateString('es-MX')}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Print-Only Summary Box */}
      <div className="print-summary-box">
        <div className="print-summary-card">
          <div className="print-summary-card-label">Ingresos Registrados</div>
          <div className="print-summary-card-value success">{formatCurrency(financials.totalIncome)}</div>
        </div>
        <div className="print-summary-card">
          <div className="print-summary-card-label">Egresos Totales (Con Nómina)</div>
          <div className="print-summary-card-value danger">{formatCurrency(financials.totalExpenses)}</div>
        </div>
        <div className="print-summary-card">
          <div className="print-summary-card-label">Saldo Neto / Utilidad</div>
          <div className="print-summary-card-value" style={{ color: financials.balance >= 0 ? '#047857' : '#b91c1c' }}>
            {formatCurrency(financials.balance)}
          </div>
        </div>
        <div className="print-summary-card">
          <div className="print-summary-card-label">Margen de Rentabilidad</div>
          <div className="print-summary-card-value">{financials.totalIncome > 0 ? `${financials.profitMargin}%` : '0%'}</div>
        </div>
      </div>
      
      {/* Financial KPIs */}
      <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-md)' }}>
        {/* Income Card */}
        <div className="card" style={{ padding: 'var(--space-md) var(--space-lg)', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
          <div style={{ padding: '0.65rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', display: 'flex' }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Ingresos Registrados</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)', fontFamily: 'monospace' }}>{formatCurrency(financials.totalIncome)}</div>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="card" style={{ padding: 'var(--space-md) var(--space-lg)', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
          <div style={{ padding: '0.65rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', display: 'flex' }}>
            <TrendingDown size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Egresos Totales (Con Nómina)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--danger)', fontFamily: 'monospace' }}>{formatCurrency(financials.totalExpenses)}</div>
          </div>
        </div>

        {/* Net Profit Card */}
        <div className="card" style={{ 
          padding: 'var(--space-md) var(--space-lg)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem', 
          border: `1px solid ${financials.balance >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`, 
          backgroundColor: 'var(--bg-card)',
          boxShadow: financials.balance >= 0 ? '0 0 15px rgba(16, 185, 129, 0.05)' : 'none'
        }}>
          <div style={{ 
            padding: '0.65rem', 
            borderRadius: 'var(--radius-md)', 
            backgroundColor: financials.balance >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
            color: financials.balance >= 0 ? 'var(--success)' : 'var(--danger)', 
            display: 'flex' 
          }}>
            <Landmark size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Saldo Neto / Utilidad</span>
              {financials.totalIncome > 0 && (
                <span className="badge" style={{ 
                  backgroundColor: financials.balance >= 0 ? 'var(--success-bg)' : 'var(--danger-bg)', 
                  color: financials.balance >= 0 ? 'var(--success)' : 'var(--danger)',
                  fontSize: '0.65rem',
                  padding: '0.1rem 0.4rem'
                }}>{financials.profitMargin}% Rentab.</span>
              )}
            </div>
            <div style={{ 
              fontSize: '1.5rem', 
              fontWeight: 800, 
              color: financials.balance >= 0 ? 'var(--success)' : 'var(--danger)', 
              fontFamily: 'monospace' 
            }}>{formatCurrency(financials.balance)}</div>
          </div>
        </div>
      </div>

      {/* Week Selector and Obra Filters Row */}
      <div className="card no-print filters-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <div className="filters-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
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
              <CalendarCheck size={16} />
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
              <CalendarCheck size={16} style={{ transform: 'scaleX(-1)' }} />
            </button>
          </div>

          {/* Export / Print Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button 
              onClick={exportToCSV}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'var(--bg-input)',
                color: 'var(--accent-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-input)'}
            >
              <Download size={14} />
              Exportar Reporte
            </button>
            <button 
              onClick={() => window.print()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'var(--bg-input)',
                color: 'var(--accent-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-input)'}
            >
              <Printer size={14} />
              Imprimir Reporte
            </button>
          </div>
        </div>

        {/* Obra Filters Pills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Filtrar por Frente de Obra:</span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
            <button
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
              }}
            >
              Todas las Obras
            </button>
            {uniqueObras.map(o => (
              <button
                key={o}
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
                }}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visual health metric (Progress Bar of Expenses vs Income) */}
      {financials.totalIncome > 0 && (
        <div className="card no-print" style={{ padding: 'var(--space-md) var(--space-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            <span>Proporción Gastos / Ingresos:</span>
            <span>{Math.round((financials.totalExpenses / financials.totalIncome) * 100)}% Consumido</span>
          </div>
          <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--bg-input)', borderRadius: '9999px', overflow: 'hidden', display: 'flex' }}>
            {/* Payroll expense bar */}
            <div style={{ 
              width: `${(financials.payrollExpense / financials.totalIncome) * 100}%`, 
              backgroundColor: 'var(--accent-primary)',
              height: '100%'
            }} title={`Nómina: ${formatCurrency(financials.payrollExpense)}`} />
            
            {/* Manual expense bar */}
            <div style={{ 
              width: `${(financials.manualExpenses / financials.totalIncome) * 100}%`, 
              backgroundColor: 'var(--danger)',
              height: '100%'
            }} title={`Otros Gastos: ${formatCurrency(financials.manualExpenses)}`} />
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)' }}></div>
              <span>Nómina Semanal ({Math.round((financials.payrollExpense / financials.totalIncome) * 100)}%)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--danger)' }}></div>
              <span>Otros Egresos ({Math.round((financials.manualExpenses / financials.totalIncome) * 100)}%)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }}>
              <span>Disponible/Utilidad: {formatCurrency(financials.balance)} ({financials.profitMargin}%)</span>
            </div>
          </div>
        </div>
      )}

      {/* Group Profits breakdown by Obra (Visible when viewing 'Todas') */}
      {filters.obra === 'Todas' && (
        <>
          <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-md)' }}>
            {obrasProfits.map(op => (
              <div key={op.name} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{op.name}</span>
                  <span className="badge" style={{
                    backgroundColor: op.balance >= 0 ? 'var(--success-bg)' : 'var(--danger-bg)',
                    color: op.balance >= 0 ? 'var(--success)' : 'var(--danger)',
                    fontSize: '0.65rem'
                  }}>{op.income > 0 ? `${op.margin}% Margin` : 'Sin Ingresos'}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Ingresos:</span>
                    <div style={{ fontWeight: 600, color: 'var(--success)', fontSize: '0.85rem' }}>{formatCurrency(op.income)}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Gastos Totales:</span>
                    <div style={{ fontWeight: 600, color: 'var(--danger)', fontSize: '0.85rem' }}>{formatCurrency(op.expenses)}</div>
                  </div>
                </div>
                <div style={{ marginTop: '0.5rem', borderTop: '1px dashed var(--border-color)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Balance Neto:</span>
                  <span style={{ fontWeight: 800, color: op.balance >= 0 ? 'var(--success)' : 'var(--danger)', fontFamily: 'monospace' }}>
                    {op.balance >= 0 ? '+' : ''}{formatCurrency(op.balance)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Print-Only Project Breakdown Table */}
          <div className="print-only" style={{ marginTop: '0.5rem', marginBottom: '1.25rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: 700, color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Desglose de Rentabilidad por Frente de Obra
            </h4>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Frente de Obra</th>
                  <th style={{ textAlign: 'right' }}>Ingresos</th>
                  <th style={{ textAlign: 'right' }}>Gastos Totales</th>
                  <th style={{ textAlign: 'right' }}>Utilidad / Saldo</th>
                  <th style={{ textAlign: 'center', width: '90px' }}>Margen %</th>
                </tr>
              </thead>
              <tbody>
                {obrasProfits.map(op => (
                  <tr key={op.name}>
                    <td style={{ fontWeight: 600, color: '#1e293b' }}>{op.name}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#047857' }}>{formatCurrency(op.income)}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#b91c1c' }}>{formatCurrency(op.expenses)}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: op.balance >= 0 ? '#047857' : '#b91c1c' }}>
                      {op.balance >= 0 ? '+' : ''}{formatCurrency(op.balance)}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: op.balance >= 0 ? '#047857' : '#b91c1c' }}>
                      {op.income > 0 ? `${op.margin}%` : '0%'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Main Content Layout (Table & Entry Form) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-lg)', alignItems: 'start' }} className="dashboard-grid">
        
        {/* Transactions Table Column (Left) */}
        <div className="card main-content-col" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Landmark size={16} color="var(--accent-primary)" />
              Historial de Transacciones de la Semana ({filters.obra})
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Mostrando {filteredTransactions.length + 1} movimientos
            </span>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '110px' }}>Fecha</th>
                  <th>Descripción</th>
                  <th>Obra</th>
                  <th style={{ width: '90px', textAlign: 'center' }}>Tipo</th>
                  <th>Categoría</th>
                  <th style={{ textAlign: 'right', width: '130px' }}>Importe</th>
                  <th style={{ textAlign: 'center', width: '80px' }} className="no-print">Acción</th>
                </tr>
              </thead>
              <tbody>
                {/* Dynamically Injected Payroll Row (Automatic / Read Only) */}
                {activeWeekPayroll > 0 && (
                  <tr style={{ backgroundColor: 'rgba(139, 92, 246, 0.03)' }}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {/* Mid-week Wednesday representation */}
                      {getWeekDatesRange(filters.weekId).start.toISOString().split('T')[0]}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontWeight: 600 }}>Nómina Semanal Automática</span>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.1rem', backgroundColor: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-primary)', fontSize: '0.55rem', padding: '0.1rem 0.35rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(139, 92, 246, 0.2)', fontWeight: 700, textTransform: 'uppercase' }} title="Generada desde la planilla de asistencia">
                          <Info size={9} />
                          Automático
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {filters.obra === 'Todas' ? 'Múltiples Obras' : filters.obra}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: 'var(--danger)', fontSize: '0.75rem', fontWeight: 600 }}>
                        <ArrowDownCircle size={12} />
                        Egreso
                      </span>
                    </td>
                    <td>
                      <span className="badge" style={getCategoryBadgeStyle('Nómina')}>
                        Nómina
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: 'var(--danger)', fontSize: '0.9rem' }}>
                      {formatCurrency(activeWeekPayroll)}
                    </td>
                    <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.7rem' }} className="no-print">
                      <em>Solo Lectura</em>
                    </td>
                  </tr>
                )}

                {/* Manual Transactions */}
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map(t => {
                    const supplier = proveedores.find(p => p.id === t.proveedorId);
                    const client = clientes.find(c => c.id === t.clienteId);
                    return (
                      <tr key={t.id}>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          {t.date}
                        </td>
                        <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                          <div>{t.description}</div>
                          {t.materialName && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}>
                              <span>📦 {t.materialName}</span>
                              <span>•</span>
                              <span>{t.quantity} x {formatCurrency(t.unitPrice || 0)}</span>
                            </div>
                          )}
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <div>{t.obra}</div>
                          {supplier && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.15rem', marginTop: '0.15rem' }}>
                              <Truck size={10} />
                              <span>{supplier.name}</span>
                            </div>
                          )}
                          {client && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.15rem', marginTop: '0.15rem' }}>
                              <UserCheck size={10} />
                              <span>{client.name}</span>
                            </div>
                          )}
                        </td>
                      <td style={{ textAlign: 'center' }}>
                        {t.type === 'ingreso' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: 'var(--success)', fontSize: '0.75rem', fontWeight: 600 }}>
                            <ArrowUpCircle size={12} />
                            Ingreso
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: 'var(--danger)', fontSize: '0.75rem', fontWeight: 600 }}>
                            <ArrowDownCircle size={12} />
                            Egreso
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="badge" style={getCategoryBadgeStyle(t.category)}>
                          {t.category}
                        </span>
                      </td>
                      <td style={{ 
                        textAlign: 'right', 
                        fontFamily: 'monospace', 
                        fontWeight: 700, 
                        color: t.type === 'ingreso' ? 'var(--success)' : 'var(--danger)',
                        fontSize: '0.9rem'
                      }}>
                        {t.type === 'ingreso' ? '+' : '-'}{formatCurrency(t.amount)}
                      </td>
                      <td style={{ textAlign: 'center' }} className="no-print">
                        <button
                          onClick={() => deleteTransaction(t.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '0.25rem',
                            borderRadius: 'var(--radius-sm)',
                            transition: 'all 0.2s',
                          }}
                          onMouseOver={(e) => e.currentTarget.style.color = 'var(--danger)'}
                          onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                          title="Eliminar transacción"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
                ) : (
                  activeWeekPayroll === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-muted)' }}>
                        No hay movimientos registrados para esta semana u obra.
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Capture Form Column (Right) */}
        <div className="card sticky-sidebar no-print" style={{ border: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <PlusCircle size={16} color="var(--accent-primary)" />
            Registrar Movimiento Financiero
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            
            {/* Type Selector (Tabs) */}
            <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '0.25rem' }}>
              <button
                type="button"
                onClick={() => handleTypeChange('gasto')}
                style={{
                  flex: 1,
                  padding: '0.4rem',
                  border: 'none',
                  backgroundColor: type === 'gasto' ? 'var(--danger-bg)' : 'transparent',
                  color: type === 'gasto' ? 'var(--danger)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  transition: 'all 0.15s'
                }}
              >
                Egreso / Gasto
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('ingreso')}
                style={{
                  flex: 1,
                  padding: '0.4rem',
                  border: 'none',
                  backgroundColor: type === 'ingreso' ? 'var(--success-bg)' : 'transparent',
                  color: type === 'ingreso' ? 'var(--success)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  transition: 'all 0.15s'
                }}
              >
                Ingreso
              </button>
            </div>

            {/* Obra Dropdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Asignar a Obra:</label>
              <select
                className="input select"
                value={obra}
                onChange={(e) => setObra(e.target.value)}
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem', width: '100%' }}
                required
              >
                {uniqueObras.map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            {/* Category Dropdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Categoría:</label>
              <select
                className="input select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem', width: '100%' }}
                required
              >
                {type === 'ingreso' ? (
                  <>
                    <option value="Estimación Cliente">Estimación Cliente</option>
                    <option value="Anticipo">Anticipo</option>
                    <option value="Cobro Extra">Cobro Extra</option>
                    <option value="Otros">Otros Ingresos</option>
                  </>
                ) : (
                  <>
                    <option value="Materiales">Materiales</option>
                    <option value="Flete / Acarreo">Flete / Acarreo</option>
                    <option value="Herramientas / Renta">Herramientas / Renta</option>
                    <option value="Viáticos / Combustible">Viáticos / Combustible</option>
                    <option value="Otros Gastos">Otros Gastos</option>
                  </>
                )}
              </select>
            </div>

            {/* Date Picker */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Fecha:</label>
              <input
                type="date"
                className="input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem', width: '100%' }}
                required
              />
            </div>

            {/* Client (Ingresos Only) */}
            {type === 'ingreso' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Cliente / Pagador:</label>
                <select
                  className="input select"
                  value={selectedClienteId}
                  onChange={(e) => setSelectedClienteId(e.target.value)}
                  style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem', width: '100%' }}
                >
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                  {clientes.length === 0 && (
                    <option value="">-- No hay clientes registrados --</option>
                  )}
                </select>
              </div>
            )}

            {/* Supplier and Purchase Detailing (Egresos Only) */}
            {type === 'gasto' && (
              <>
                {/* Supplier select */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Proveedor:</label>
                  <select
                    className="input select"
                    value={selectedProveedorId}
                    onChange={(e) => setSelectedProveedorId(e.target.value)}
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem', width: '100%' }}
                  >
                    {proveedores.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                    {proveedores.length === 0 && (
                      <option value="">-- No hay proveedores registrados --</option>
                    )}
                  </select>
                </div>

                {/* Detail Purchase Checkbox */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.25rem 0' }}>
                  <input
                    type="checkbox"
                    id="detailPurchase"
                    checked={detailPurchase}
                    onChange={(e) => setDetailPurchase(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <label htmlFor="detailPurchase" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}>
                    Detallar Material / Precios
                  </label>
                </div>

                {/* Detail inputs */}
                {detailPurchase && (
                  <div className="card animate-fade-in" style={{ padding: '0.75rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>Material Comprado:</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="Ej. Varilla 3/8, Cemento Grey..."
                        value={materialName}
                        onChange={(e) => setMaterialName(e.target.value)}
                        style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }}
                        required={detailPurchase}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>Cantidad:</label>
                        <input
                          type="number"
                          className="input"
                          placeholder="Cantidad"
                          min="0.01"
                          step="any"
                          value={quantity}
                          onChange={(e) => {
                            setQuantity(e.target.value);
                            if (e.target.value && unitPrice) {
                              setAmount(String((parseFloat(e.target.value) || 0) * (parseFloat(unitPrice) || 0)));
                            }
                          }}
                          style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem', fontFamily: 'monospace' }}
                          required={detailPurchase}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>Precio Unitario (MXN):</label>
                        <input
                          type="number"
                          className="input"
                          placeholder="P. Unit"
                          min="0.01"
                          step="0.01"
                          value={unitPrice}
                          onChange={(e) => {
                            setUnitPrice(e.target.value);
                            if (quantity && e.target.value) {
                              setAmount(String((parseFloat(quantity) || 0) * (parseFloat(e.target.value) || 0)));
                            }
                          }}
                          style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem', fontFamily: 'monospace' }}
                          required={detailPurchase}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Description Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Descripción / Concepto:</label>
              <input
                type="text"
                className="input"
                placeholder="Ej. Compra de 50 bultos de cemento..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
                required
              />
            </div>

            {/* Amount Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Monto / Importe (MXN) {detailPurchase && '(Calculado)'}:
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '0.6rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>$</span>
                <input
                  type="number"
                  className="input"
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ width: '100%', paddingLeft: '1.25rem', fontSize: '0.8rem', paddingRight: '0.5rem', fontFamily: 'monospace', opacity: detailPurchase ? 0.7 : 1 }}
                  required
                  readOnly={detailPurchase}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              style={{
                marginTop: '0.5rem',
                backgroundColor: 'var(--accent-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: '0.6rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s',
                boxShadow: '0 4px 6px rgba(139, 92, 246, 0.2)'
              }}
              onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
              onMouseOut={(e) => e.currentTarget.style.filter = 'none'}
            >
              <Plus size={14} />
              Registrar Movimiento
            </button>
          </form>
        </div>

      </div>

      {/* Print-Only Signatures (hidden on screen, visible during printing) */}
      <div className="print-signatures" style={{ display: 'none' }}>
        <div className="signature-line">
          Elaboró (Control de Obra)
        </div>
        <div className="signature-line">
          Autorizó (Dirección Financiera)
        </div>
      </div>

    </div>
  );
};
