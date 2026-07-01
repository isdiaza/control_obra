import React, { useState, useMemo } from 'react';
import {
  Plus, ChevronDown, ChevronUp, Trash2, Edit3, DollarSign,
  TrendingUp, Clock, CheckCircle, PauseCircle, X, Save, CreditCard,
  AlertTriangle, Building2
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
  if (s === 'Completado') return 'var(--color-success)';
  if (s === 'Pausado') return 'var(--color-warning, #F59E0B)';
  return 'var(--color-accent)';
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

const ProgressBar: React.FC<{ pct: number; color?: string }> = ({ pct, color = 'var(--color-accent)' }) => (
  <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 999, height: 8, width: '100%', overflow: 'hidden' }}>
    <div
      style={{
        width: `${Math.min(100, pct)}%`,
        height: '100%',
        background: pct >= 100 ? 'var(--color-success)' : color,
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
              <span style={{ fontSize: 12, fontWeight: 700, color: avancePct >= 100 ? 'var(--color-success)' : 'var(--text-primary)' }}>
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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Contratos a Destajo</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Seguimiento de trabajos por avance y pago de destajeros
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm()); setFormErrors({}); }} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> Nuevo Contrato
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
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
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
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
      {filteredContratos.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <Clock size={40} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
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

      {/* ─── Form Modal ─────────────────────────────────────────────────── */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div className="card" style={{ width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {editingId ? 'Editar Contrato' : 'Nuevo Contrato a Destajo'}
              </h3>
              <button onClick={() => setShowForm(false)} className="btn btn-secondary" style={{ padding: 6 }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {/* Obra */}
              <div style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Obra *</label>
                <select className={`form-input ${formErrors.obra ? 'error' : ''}`} value={form.obra} onChange={e => setForm(f => ({ ...f, obra: e.target.value }))}>
                  <option value="">Selecciona la obra...</option>
                  {obras.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
                </select>
                {formErrors.obra && <span style={{ fontSize: 12, color: 'var(--color-danger)' }}>{formErrors.obra}</span>}
              </div>

              {/* Concepto */}
              <div style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Concepto de trabajo *</label>
                <input className={`form-input ${formErrors.concepto ? 'error' : ''}`} placeholder="Ej: Yeso en muros interiores sala principal" value={form.concepto} onChange={e => setForm(f => ({ ...f, concepto: e.target.value }))} />
                {formErrors.concepto && <span style={{ fontSize: 12, color: 'var(--color-danger)' }}>{formErrors.concepto}</span>}
              </div>

              {/* Contratista */}
              <div style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Contratista / Destajero *</label>
                <input className={`form-input ${formErrors.contratista ? 'error' : ''}`} placeholder="Nombre del contratista" value={form.contratista} onChange={e => setForm(f => ({ ...f, contratista: e.target.value }))} />
                {formErrors.contratista && <span style={{ fontSize: 12, color: 'var(--color-danger)' }}>{formErrors.contratista}</span>}
              </div>

              {/* Unidad */}
              <div>
                <label className="form-label">Unidad</label>
                <select className="form-input" value={form.unidad} onChange={e => setForm(f => ({ ...f, unidad: e.target.value }))}>
                  {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>

              {/* Fecha */}
              <div>
                <label className="form-label">Fecha de inicio</label>
                <input type="date" className="form-input" value={form.fechaInicio} onChange={e => setForm(f => ({ ...f, fechaInicio: e.target.value }))} />
              </div>

              {/* Cantidad total */}
              <div>
                <label className="form-label">Cantidad total ({form.unidad}) *</label>
                <input type="number" min="0" className={`form-input ${formErrors.cantidadTotal ? 'error' : ''}`} value={form.cantidadTotal || ''} onChange={e => setForm(f => ({ ...f, cantidadTotal: parseFloat(e.target.value) || 0 }))} />
                {formErrors.cantidadTotal && <span style={{ fontSize: 12, color: 'var(--color-danger)' }}>{formErrors.cantidadTotal}</span>}
              </div>

              {/* Precio unitario */}
              <div>
                <label className="form-label">Precio por {form.unidad} ($) *</label>
                <input type="number" min="0" className={`form-input ${formErrors.precioUnitario ? 'error' : ''}`} value={form.precioUnitario || ''} onChange={e => setForm(f => ({ ...f, precioUnitario: parseFloat(e.target.value) || 0 }))} />
                {formErrors.precioUnitario && <span style={{ fontSize: 12, color: 'var(--color-danger)' }}>{formErrors.precioUnitario}</span>}
              </div>

              {/* Avance */}
              <div>
                <label className="form-label">Avance actual ({form.unidad})</label>
                <input type="number" min="0" max={form.cantidadTotal} className="form-input" value={form.cantidadAvance || ''} onChange={e => setForm(f => ({ ...f, cantidadAvance: parseFloat(e.target.value) || 0 }))} />
              </div>

              {/* Status */}
              <div>
                <label className="form-label">Estado</label>
                <select className="form-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ContratoDestajo['status'] }))}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Preview total */}
              {form.cantidadTotal > 0 && form.precioUnitario > 0 && (
                <div style={{ gridColumn: '1/-1', background: 'rgba(99,102,241,0.1)', borderRadius: 10, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Monto total del contrato:</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#818cf8' }}>
                    {fmt(form.cantidadTotal * form.precioUnitario)}
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Save size={16} /> {editingId ? 'Guardar Cambios' : 'Crear Contrato'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Pago Modal ──────────────────────────────────────────────────── */}
      {pagoModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div className="card" style={{ width: '100%', maxWidth: 420, padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Registrar Pago
              </h3>
              <button onClick={() => setPagoModal(null)} className="btn btn-secondary" style={{ padding: 6 }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 14px', marginBottom: 18 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{pagoModal.concepto}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{pagoModal.contratista} · {pagoModal.obra}</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 12, fontSize: 13 }}>
                <span style={{ color: '#34d399' }}>Pagado: {fmt(calcTotalPagado(pagoModal))}</span>
                <span style={{ color: '#fbbf24' }}>Pendiente: {fmt(calcPendientePago(pagoModal))}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="form-label">Fecha del pago</label>
                <input type="date" className="form-input" value={pagoForm.fecha} onChange={e => setPagoForm(f => ({ ...f, fecha: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Importe ($) *</label>
                <input type="number" min="0" className="form-input" placeholder="0.00" value={pagoForm.monto} onChange={e => setPagoForm(f => ({ ...f, monto: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Concepto / Nota</label>
                <input className="form-input" placeholder="Ej: Primer adelanto" value={pagoForm.descripcion} onChange={e => setPagoForm(f => ({ ...f, descripcion: e.target.value }))} />
              </div>
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 14 }}>
              ℹ️ Este pago se registrará automáticamente como gasto de la obra <strong>{pagoModal.obra}</strong> en Control Financiero.
            </p>

            <div style={{ display: 'flex', gap: 12, marginTop: 18, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setPagoModal(null)}>Cancelar</button>
              <button
                className="btn btn-primary"
                onClick={handleAddPago}
                disabled={!pagoForm.monto || parseFloat(pagoForm.monto) <= 0}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <DollarSign size={16} /> Registrar Pago
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DestajoDirectory;
