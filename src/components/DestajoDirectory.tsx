import React, { useState, useMemo } from 'react';
import {
  Plus, ChevronDown, ChevronUp, Trash2, Edit3, DollarSign,
  TrendingUp, Clock, CheckCircle, PauseCircle, X, Save, CreditCard,
  AlertTriangle, Building2, Printer
} from 'lucide-react';
import type { ContratoDestajo, Obra } from '../types';
import {
  useDestajoData,
  calcMontoContrato,
  calcMontoGanado,
  calcTotalPagado,
  calcPendientePago,
  calcAvancePct,
} from '../hooks/useDestajoData';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 }).format(n);

const today = () => new Date().toISOString().split('T')[0];

const UNIDADES = ['m²', 'ml', 'pieza', 'm³', 'global', 'kg', 'lt'];
const STATUS_OPTIONS: ContratoDestajo['status'][] = ['Activo', 'Completado', 'Pausado'];

const statusIcon = (s: ContratoDestajo['status']) => {
  if (s === 'Completado') return <CheckCircle size={14} className="text-green-400" />;
  if (s === 'Pausado') return <PauseCircle size={14} className="text-yellow-400" />;
  return <TrendingUp size={14} className="text-blue-400" />;
};

const statusColor = (s: ContratoDestajo['status']) => {
  if (s === 'Completado') return 'var(--success)';
  if (s === 'Pausado') return 'var(--warning, #fbbf24)';
  return 'var(--accent-primary)';
};

// ─── Empty form state ─────────────────────────────────────────────────────────

const emptyForm = (): Omit<ContratoDestajo, 'id' | 'pagos'> => ({
  obra: '',
  concepto: '',
  contratista: '',
  unidad: 'm²',
  cantidadTotal: 0,
  precioUnitario: 0,
  cantidadAvance: 0,
  fechaInicio: today(),
  status: 'Activo',
});

// ─── Sub-components ──────────────────────────────────────────────────────────

const ProgressBar: React.FC<{ pct: number; color?: string }> = ({ pct, color = 'var(--accent-primary)' }) => (
  <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 999, height: 10, width: '100%', overflow: 'hidden' }}>
    <div
      style={{
        width: `${Math.min(100, pct)}%`,
        height: '100%',
        background: pct >= 100 ? 'var(--success)' : color,
        borderRadius: 999,
        transition: 'width 0.4s ease',
      }}
    />
  </div>
);

// ─── Contrato Card ────────────────────────────────────────────────────────────

const ContratoCard: React.FC<{
  contrato: ContratoDestajo;
  onEdit: (c: ContratoDestajo) => void;
  onDelete: (id: string) => void;
  onAddPago: (c: ContratoDestajo) => void;
  onDeletePago: (contratoId: string, pagoId: string) => void;
}> = ({ contrato, onEdit, onDelete, onAddPago, onDeletePago }) => {
  const [expanded, setExpanded] = useState(false);

  const montoContrato = calcMontoContrato(contrato);
  const montoGanado = calcMontoGanado(contrato);
  const totalPagado = calcTotalPagado(contrato);
  const pendiente = calcPendientePago(contrato);
  const avancePct = calcAvancePct(contrato);

  return (
    <div className="card" style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div
        style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 14 }}
        onClick={() => setExpanded(e => !e)}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>{contrato.concepto}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: statusColor(contrato.status) }}>
              {statusIcon(contrato.status)} {contrato.status}
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
            👷 {contrato.contratista} &nbsp;|&nbsp; 🏗️ {contrato.obra} &nbsp;|&nbsp; 📅 {contrato.fechaInicio}
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Avance: {contrato.cantidadAvance.toLocaleString()} / {contrato.cantidadTotal.toLocaleString()} {contrato.unidad}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: avancePct >= 100 ? 'var(--success)' : 'var(--text-primary)' }}>
                {avancePct.toFixed(1)}%
              </span>
            </div>
            <ProgressBar pct={avancePct} />
          </div>

          {/* Finance pills */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 6 }}>
            <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 999, background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
              Contrato {fmt(montoContrato)}
            </span>
            <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 999, background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
              Pagado {fmt(totalPagado)}
            </span>
            {pendiente > 0 && (
              <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 999, background: 'rgba(245,158,11,0.15)', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 4 }}>
                <AlertTriangle size={11} /> Pendiente {fmt(pendiente)}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons + chevron */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onAddPago(contrato)}
            className="btn btn-primary"
            style={{ padding: '6px 12px', fontSize: 12 }}
            title="Registrar pago"
          >
            <DollarSign size={14} /> Pago
          </button>
          <button onClick={() => onEdit(contrato)} className="btn btn-secondary" style={{ padding: 6 }}>
            <Edit3 size={14} />
          </button>
          <button onClick={() => onDelete(contrato.id)} className="btn btn-danger" style={{ padding: 6 }}>
            <Trash2 size={14} />
          </button>
          <div style={{ color: 'var(--text-muted)' }}>
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </div>

      {/* Expanded: payment history */}
      {expanded && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '14px 20px', background: 'rgba(0,0,0,0.15)' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>
            <CreditCard size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Historial de Pagos
          </p>
          {contrato.pagos.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>Sin pagos registrados.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {contrato.pagos.map(p => (
                <div key={p.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 12px'
                }}>
                  <div>
                    <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>{fmt(p.monto)}</span>
                    {p.descripcion && <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 10 }}>{p.descripcion}</span>}
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 10 }}>📅 {p.fecha}</span>
                  </div>
                  <button
                    onClick={() => onDeletePago(contrato.id, p.id)}
                    className="btn btn-danger"
                    style={{ padding: 4 }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              <div style={{ marginTop: 4, textAlign: 'right', fontSize: 13, color: 'var(--text-muted)' }}>
                Total pagado: <strong style={{ color: 'var(--color-success)' }}>{fmt(totalPagado)}</strong>
              </div>
            </div>
          )}

          {/* Summary */}
          <div style={{
            marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10
          }}>
            {[
              { label: 'Monto Ganado', value: fmt(montoGanado), color: '#818cf8' },
              { label: 'Total Pagado', value: fmt(totalPagado), color: '#34d399' },
              { label: 'Por Liquidar', value: fmt(Math.max(0, montoContrato - totalPagado)), color: '#fbbf24' },
            ].map(k => (
              <div key={k.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{k.label}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: k.color }}>{k.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  obras: Obra[];
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
}

const DestajoDirectory: React.FC<Props> = ({ obras, addTransaction }) => {
  const { contratos, isLoading, addContrato, updateContrato, deleteContrato, addPago, deletePago } = useDestajoData();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [pagoModal, setPagoModal] = useState<ContratoDestajo | null>(null);
  const [pagoForm, setPagoForm] = useState({ fecha: today(), monto: '', descripcion: '' });

  const [filterObra, setFilterObra] = useState('Todas');

  // ── KPIs ──
  const kpis = useMemo(() => {
    const list = filterObra === 'Todas' ? contratos : contratos.filter(c => c.obra === filterObra);
    return {
      totalContrato: list.reduce((s, c) => s + calcMontoContrato(c), 0),
      totalPagado: list.reduce((s, c) => s + calcTotalPagado(c), 0),
      totalPendiente: list.reduce((s, c) => s + calcPendientePago(c), 0),
      activos: list.filter(c => c.status === 'Activo').length,
    };
  }, [contratos, filterObra]);

  const filteredContratos = useMemo(() =>
    filterObra === 'Todas' ? contratos : contratos.filter(c => c.obra === filterObra),
    [contratos, filterObra]
  );

  // ── Form validation ──
  const validate = (f: typeof form) => {
    const e: Record<string, string> = {};
    if (!f.obra) e.obra = 'Selecciona una obra';
    if (!f.concepto.trim()) e.concepto = 'Describe el trabajo';
    if (!f.contratista.trim()) e.contratista = 'Ingresa el nombre del contratista';
    if (f.cantidadTotal <= 0) e.cantidadTotal = 'Ingresa la cantidad contratada';
    if (f.precioUnitario <= 0) e.precioUnitario = 'Ingresa el precio por unidad';
    return e;
  };

  const handleSave = async () => {
    const errors = validate(form);
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    if (editingId) {
      await updateContrato(editingId, form);
    } else {
      await addContrato(form);
    }
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm());
    setFormErrors({});
  };

  const handleEdit = (c: ContratoDestajo) => {
    setForm({ obra: c.obra, concepto: c.concepto, contratista: c.contratista, unidad: c.unidad, cantidadTotal: c.cantidadTotal, precioUnitario: c.precioUnitario, cantidadAvance: c.cantidadAvance, fechaInicio: c.fechaInicio, status: c.status });
    setEditingId(c.id);
    setShowForm(true);
    setFormErrors({});
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este contrato de destajo?')) await deleteContrato(id);
  };

  const handleAddPago = async () => {
    if (!pagoModal) return;
    const monto = parseFloat(pagoForm.monto);
    if (!monto || monto <= 0) return;
    await addPago(pagoModal.id, { fecha: pagoForm.fecha, monto, descripcion: pagoForm.descripcion }, addTransaction);
    setPagoModal(null);
    setPagoForm({ fecha: today(), monto: '', descripcion: '' });
  };

  const obraOptions = ['Todas', ...obras.map(o => o.name)];

  if (isLoading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>;

  return (
    <div className="animate-fade-in" style={{ padding: '0 4px' }}>
      {/* ─── ENCABEZADO DE IMPRESIÓN (PDF) ─── */}
      <table className="print-header-table">
        <tbody>
          <tr>
            <td className="print-header-logo">
              <div className="brand">DIBERSA</div>
              <div className="subtitle">CONTROL DE OBRA Y FINANZAS</div>
            </td>
            <td className="print-header-title">
              REPORTE DE CONTRATOS A DESTAJO
            </td>
            <td className="print-header-meta">
              <strong>Obra:</strong> {filterObra === 'Todas' ? 'Todas las Obras' : filterObra}<br />
              <strong>Fecha Emisión:</strong> {new Date().toLocaleDateString('es-MX')}<br />
              <strong>Estado:</strong> Reporte General
            </td>
          </tr>
        </tbody>
      </table>

      {/* ─── RESUMEN DE IMPRESIÓN (PDF) ─── */}
      <div className="print-summary-box">
        <div className="print-summary-card">
          <div className="print-summary-card-label">Total Contratado</div>
          <div className="print-summary-card-value">{fmt(kpis.totalContrato)}</div>
        </div>
        <div className="print-summary-card">
          <div className="print-summary-card-label">Total Pagado</div>
          <div className="print-summary-card-value success">{fmt(kpis.totalPagado)}</div>
        </div>
        <div className="print-summary-card">
          <div className="print-summary-card-label">Pendiente por Pagar</div>
          <div className="print-summary-card-value danger">{fmt(kpis.totalPendiente)}</div>
        </div>
        <div className="print-summary-card">
          <div className="print-summary-card-label">Contratos Activos</div>
          <div className="print-summary-card-value">{kpis.activos}</div>
        </div>
      </div>

      {/* Header en Pantalla */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Contratos a Destajo</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Seguimiento de trabajos por avance y pago de destajeros
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            onClick={() => window.print()}
            style={{
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.6rem 1.25rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              minHeight: 44,
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Printer size={16} /> Generar Reporte (PDF)
          </button>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm()); setFormErrors({}); }}
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '0.6rem 1.25rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              minHeight: 44,
              boxShadow: '0 4px 6px rgba(139, 92, 246, 0.2)',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
            onMouseOut={(e) => e.currentTarget.style.filter = 'none'}
          >
            <Plus size={16} /> Nuevo Contrato
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Contratado', value: fmt(kpis.totalContrato), color: '#818cf8', icon: <Building2 size={18} /> },
          { label: 'Total Pagado', value: fmt(kpis.totalPagado), color: '#34d399', icon: <CheckCircle size={18} /> },
          { label: 'Pendiente de Pago', value: fmt(kpis.totalPendiente), color: '#fbbf24', icon: <AlertTriangle size={18} /> },
          { label: 'Contratos Activos', value: kpis.activos.toString(), color: '#60a5fa', icon: <TrendingUp size={18} /> },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding: '16px 18px', textAlign: 'center' }}>
            <div style={{ color: k.color, marginBottom: 8, display: 'flex', justifyContent: 'center' }}>{k.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="no-print" style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {obraOptions.map(o => (
          <button
            key={o}
            onClick={() => setFilterObra(o)}
            style={{
              padding: '5px 14px', borderRadius: 999, fontSize: 13, border: 'none', cursor: 'pointer',
              background: filterObra === o ? 'var(--color-accent)' : 'rgba(255,255,255,0.07)',
              color: filterObra === o ? '#fff' : 'var(--text-secondary)',
              fontWeight: filterObra === o ? 600 : 400,
              transition: 'all 0.2s',
            }}
          >
            {o}
          </button>
        ))}
      </div>

      {/* Contracts list */}
      <div className="no-print">
        {filteredContratos.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <Clock size={40} style={{ color: 'var(--text-muted)', marginBottom: 12, marginLeft: 'auto', marginRight: 'auto' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>No hay contratos a destajo registrados.</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Crea el primero con el botón "Nuevo Contrato".</p>
          </div>
        ) : (
          filteredContratos.map(c => (
            <ContratoCard
              key={c.id}
              contrato={c}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAddPago={setPagoModal}
              onDeletePago={deletePago}
            />
          ))
        )}
      </div>

      {/* ─── Form Modal ─────────────────────────────────────────────────── */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10, 15, 30, 0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', padding: 32, border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {editingId ? 'Editar Contrato de Destajo' : 'Nuevo Contrato a Destajo'}
              </h3>
              <button 
                onClick={() => setShowForm(false)} 
                style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 'var(--radius-sm)', padding: 8, cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Obra */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Obra *</label>
                <select 
                  className={`input select ${formErrors.obra ? 'error' : ''}`} 
                  value={form.obra} 
                  onChange={e => setForm(f => ({ ...f, obra: e.target.value }))}
                  style={{ width: '100%', border: formErrors.obra ? '1px solid var(--color-danger)' : undefined }}
                >
                  <option value="">Selecciona la obra...</option>
                  {obras.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
                </select>
                {formErrors.obra && <span style={{ fontSize: 11, color: 'var(--color-danger)', marginTop: 2 }}>{formErrors.obra}</span>}
              </div>

              {/* Concepto */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Concepto de trabajo *</label>
                <input 
                  className="input" 
                  placeholder="Ej: Yeso en muros interiores sala principal" 
                  value={form.concepto} 
                  onChange={e => setForm(f => ({ ...f, concepto: e.target.value }))}
                  style={{ width: '100%', border: formErrors.concepto ? '1px solid var(--color-danger)' : undefined }}
                />
                {formErrors.concepto && <span style={{ fontSize: 11, color: 'var(--color-danger)', marginTop: 2 }}>{formErrors.concepto}</span>}
              </div>

              {/* Contratista */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contratista / Destajero *</label>
                <input 
                  className="input" 
                  placeholder="Nombre del contratista o maestro" 
                  value={form.contratista} 
                  onChange={e => setForm(f => ({ ...f, contratista: e.target.value }))}
                  style={{ width: '100%', border: formErrors.contratista ? '1px solid var(--color-danger)' : undefined }}
                />
                {formErrors.contratista && <span style={{ fontSize: 11, color: 'var(--color-danger)', marginTop: 2 }}>{formErrors.contratista}</span>}
              </div>

              {/* Grid 2 Columnas */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unidad</label>
                  <select className="input select" value={form.unidad} onChange={e => setForm(f => ({ ...f, unidad: e.target.value }))} style={{ width: '100%' }}>
                    {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fecha de inicio</label>
                  <input type="date" className="input" value={form.fechaInicio} onChange={e => setForm(f => ({ ...f, fechaInicio: e.target.value }))} style={{ width: '100%' }} />
                </div>
              </div>

              {/* Grid 2 Columnas: Finanzas */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cantidad total ({form.unidad}) *</label>
                  <input 
                    type="number" 
                    min="0" 
                    className="input" 
                    value={form.cantidadTotal || ''} 
                    onChange={e => setForm(f => ({ ...f, cantidadTotal: parseFloat(e.target.value) || 0 }))}
                    style={{ width: '100%', border: formErrors.cantidadTotal ? '1px solid var(--color-danger)' : undefined }}
                  />
                  {formErrors.cantidadTotal && <span style={{ fontSize: 11, color: 'var(--color-danger)', marginTop: 2 }}>{formErrors.cantidadTotal}</span>}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Precio por {form.unidad} ($) *</label>
                  <input 
                    type="number" 
                    min="0" 
                    className="input" 
                    value={form.precioUnitario || ''} 
                    onChange={e => setForm(f => ({ ...f, precioUnitario: parseFloat(e.target.value) || 0 }))}
                    style={{ width: '100%', border: formErrors.precioUnitario ? '1px solid var(--color-danger)' : undefined }}
                  />
                  {formErrors.precioUnitario && <span style={{ fontSize: 11, color: 'var(--color-danger)', marginTop: 2 }}>{formErrors.precioUnitario}</span>}
                </div>
              </div>

              {/* Grid 2 Columnas: Avance y Estado */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avance actual ({form.unidad})</label>
                  <input type="number" min="0" max={form.cantidadTotal} className="input" value={form.cantidadAvance || ''} onChange={e => setForm(f => ({ ...f, cantidadAvance: parseFloat(e.target.value) || 0 }))} style={{ width: '100%' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estado</label>
                  <select className="input select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ContratoDestajo['status'] }))} style={{ width: '100%' }}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Preview total */}
              {form.cantidadTotal > 0 && form.precioUnitario > 0 && (
                <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px dashed rgba(99,102,241,0.25)', borderRadius: 'var(--radius-md)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Monto total proyectado:</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#818cf8' }}>
                    {fmt(form.cantidadTotal * form.precioUnitario)}
                  </span>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div style={{ display: 'flex', gap: 14, marginTop: 28, justifyContent: 'flex-end' }}>
              <button 
                type="button"
                onClick={() => setShowForm(false)} 
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.6rem 1.25rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: 44,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={handleSave} 
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.6rem 1.25rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  minHeight: 44,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 10px rgba(139, 92, 246, 0.2)',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                onMouseOut={(e) => e.currentTarget.style.filter = 'none'}
              >
                <Save size={16} /> {editingId ? 'Guardar Cambios' : 'Crear Contrato'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Pago Modal ──────────────────────────────────────────────────── */}
      {pagoModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10, 15, 30, 0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: 440, padding: 32, border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Registrar Pago
              </h3>
              <button 
                onClick={() => setPagoModal(null)} 
                style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 'var(--radius-sm)', padding: 8, cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 'var(--radius-md)', padding: '14px 18px', marginBottom: 20 }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{pagoModal.concepto}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{pagoModal.contratista} · {pagoModal.obra}</div>
              <div style={{ marginTop: 10, display: 'flex', gap: 16, fontSize: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
                <span style={{ color: '#34d399', fontWeight: 600 }}>Pagado: {fmt(calcTotalPagado(pagoModal))}</span>
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>Pendiente: {fmt(calcPendientePago(pagoModal))}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fecha del pago</label>
                <input type="date" className="input" value={pagoForm.fecha} onChange={e => setPagoForm(f => ({ ...f, fecha: e.target.value }))} style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Importe ($) *</label>
                <input type="number" min="0" className="input" placeholder="0.00" value={pagoForm.monto} onChange={e => setPagoForm(f => ({ ...f, monto: e.target.value }))} style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Concepto / Nota</label>
                <input className="input" placeholder="Ej: Primer adelanto" value={pagoForm.descripcion} onChange={e => setPagoForm(f => ({ ...f, descripcion: e.target.value }))} style={{ width: '100%' }} />
              </div>
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 18, lineHeight: '1.4' }}>
              ℹ️ Este pago se registrará automáticamente como gasto de la obra <strong>{pagoModal.obra}</strong> en Control Financiero.
            </p>

            <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
              <button 
                type="button"
                onClick={() => setPagoModal(null)} 
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.6rem 1.25rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: 44,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAddPago}
                disabled={!pagoForm.monto || parseFloat(pagoForm.monto) <= 0}
                style={{
                  backgroundColor: (!pagoForm.monto || parseFloat(pagoForm.monto) <= 0) ? 'rgba(255,255,255,0.08)' : 'var(--accent-primary)',
                  color: (!pagoForm.monto || parseFloat(pagoForm.monto) <= 0) ? 'var(--text-muted)' : 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.6rem 1.25rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: (!pagoForm.monto || parseFloat(pagoForm.monto) <= 0) ? 'not-allowed' : 'pointer',
                  minHeight: 44,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  if (pagoForm.monto && parseFloat(pagoForm.monto) > 0) {
                    e.currentTarget.style.filter = 'brightness(1.1)';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.filter = 'none';
                }}
              >
                <DollarSign size={16} /> Registrar Pago
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ─── VISTA EXCLUSIVA DE IMPRESIÓN (PDF) ─── */}
      <div className="print-only">
        <h4 style={{ margin: '15px 0 10px 0', fontSize: '0.85rem', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Detalle de Contratos de Destajos y Avances Registrados
        </h4>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Obra</th>
              <th style={{ textAlign: 'left' }}>Concepto</th>
              <th style={{ textAlign: 'left' }}>Destajero / Contratista</th>
              <th style={{ textAlign: 'center' }}>Avance</th>
              <th style={{ textAlign: 'right' }}>Total Contrato</th>
              <th style={{ textAlign: 'right' }}>Total Pagado</th>
              <th style={{ textAlign: 'right' }}>Pendiente</th>
              <th style={{ textAlign: 'center' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filteredContratos.map(c => {
              const total = calcMontoContrato(c);
              const pagado = calcTotalPagado(c);
              const pendiente = calcPendientePago(c);
              const pct = calcAvancePct(c);
              return (
                <tr key={c.id}>
                  <td>{c.obra}</td>
                  <td style={{ fontWeight: 600 }}>{c.concepto}</td>
                  <td>{c.contratista}</td>
                  <td style={{ textAlign: 'center' }}>
                    {c.cantidadAvance} / {c.cantidadTotal} {c.unidad} ({pct.toFixed(1)}%)
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{fmt(total)}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#047857' }}>{fmt(pagado)}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: pendiente > 0 ? '#b91c1c' : '#334155' }}>{fmt(pendiente)}</td>
                  <td style={{ textAlign: 'center' }}>{c.status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Firmas en impresión */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', marginTop: '60px', padding: '0 40px' }}>
          <div style={{ textAlign: 'center', borderTop: '1px solid #94a3b8', paddingTop: '8px', fontSize: '0.75rem', color: '#475569' }}>
            Firma Residente de Obra
          </div>
          <div style={{ textAlign: 'center', borderTop: '1px solid #94a3b8', paddingTop: '8px', fontSize: '0.75rem', color: '#475569' }}>
            Firma Dirección Administrativa
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestajoDirectory;
