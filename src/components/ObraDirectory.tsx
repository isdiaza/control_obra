import React, { useState, useMemo } from 'react';
import type { Obra, Worker, WeekAttendance, FinancialTransaction } from '../types';
import { Search, Construction, MapPin, User, Calendar, DollarSign, Users, Plus, Edit2, Trash2, X, Check } from 'lucide-react';

interface ObraDirectoryProps {
  obras: Obra[];
  workers: Worker[];
  attendance: WeekAttendance[];
  transactions: FinancialTransaction[];
  activeWeekId: string;
  onAddObra: (name: string, location: string, supervisor: string, budget: number, startDate: string, status: 'Activa' | 'Finalizada' | 'Pausada') => void;
  onUpdateObra: (id: string, name: string, location: string, supervisor: string, budget: number, startDate: string, status: 'Activa' | 'Finalizada' | 'Pausada') => void;
  onDeleteObra: (id: string) => void;
}

export const ObraDirectory: React.FC<ObraDirectoryProps> = ({
  obras,
  workers,
  attendance,
  transactions,
  activeWeekId,
  onAddObra,
  onUpdateObra,
  onDeleteObra,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Activa' | 'Pausada' | 'Finalizada'>('Todos');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingObraId, setEditingObraId] = useState<string | null>(null);

  // Add Form Local States
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [supervisor, setSupervisor] = useState('');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'Activa' | 'Finalizada' | 'Pausada'>('Activa');

  // Edit Form Local States
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editSupervisor, setEditSupervisor] = useState('');
  const [editBudget, setEditBudget] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editStatus, setEditStatus] = useState<'Activa' | 'Finalizada' | 'Pausada'>('Activa');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(val);
  };

  const startEdit = (obra: Obra) => {
    setEditingObraId(obra.id);
    setEditName(obra.name);
    setEditLocation(obra.location);
    setEditSupervisor(obra.supervisor);
    setEditBudget(String(obra.budget));
    setEditStartDate(obra.startDate);
    setEditStatus(obra.status);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddObra(
      name,
      location,
      supervisor,
      parseFloat(budget) || 0,
      startDate,
      status
    );
    // Reset Form
    setName('');
    setLocation('');
    setSupervisor('');
    setBudget('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setStatus('Activa');
    setShowAddForm(false);
  };

  const handleEditSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!editName.trim()) return;
    onUpdateObra(
      id,
      editName,
      editLocation,
      editSupervisor,
      parseFloat(editBudget) || 0,
      editStartDate,
      editStatus
    );
    setEditingObraId(null);
  };

  // Compute stats per Obra for the active week
  const obrasData = useMemo(() => {
    return obras.map(obra => {
      // 1. Active workers count in this Obra
      const obraWorkers = workers.filter(w => w.obra === obra.name);
      const activeWorkersCount = obraWorkers.length;

      // 2. Weekly payroll for this Obra (calculated from active week attendance)
      let payrollCost = 0;
      obraWorkers.forEach(w => {
        const att = attendance.find(a => a.workerId === w.id && a.weekId === activeWeekId);
        if (att) {
          let days = 0;
          if (att.lunes) days++;
          if (att.martes) days++;
          if (att.miercoles) days++;
          if (att.jueves) days++;
          if (att.viernes) days++;
          if (att.sabado) days++;
          payrollCost += days * w.sueldoDiario;
        }
      });

      // 3. Financial expenses from FinancialControl assigned to this Obra
      const obraManualExpenses = transactions
        .filter(t => t.obra === obra.name && t.weekId === activeWeekId && t.type === 'gasto')
        .reduce((sum, t) => sum + t.amount, 0);

      // 4. Financial incomes assigned to this Obra
      const obraIncomes = transactions
        .filter(t => t.obra === obra.name && t.weekId === activeWeekId && t.type === 'ingreso')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpenses = payrollCost + obraManualExpenses;
      const budgetUtilizedPercent = obra.budget > 0 ? Math.round((totalExpenses / obra.budget) * 100) : 0;

      return {
        obra,
        activeWorkersCount,
        payrollCost,
        obraManualExpenses,
        totalExpenses,
        obraIncomes,
        budgetUtilizedPercent
      };
    });
  }, [obras, workers, attendance, transactions, activeWeekId]);

  // Filtered Obras
  const filteredObrasData = useMemo(() => {
    return obrasData.filter(item => {
      const matchSearch = 
        item.obra.name.toLowerCase().includes(search.toLowerCase()) ||
        item.obra.supervisor.toLowerCase().includes(search.toLowerCase()) ||
        item.obra.location.toLowerCase().includes(search.toLowerCase());
      
      const matchStatus = statusFilter === 'Todos' || item.obra.status === statusFilter;
      
      return matchSearch && matchStatus;
    });
  }, [obrasData, search, statusFilter]);

  const getStatusColor = (status: 'Activa' | 'Finalizada' | 'Pausada') => {
    switch (status) {
      case 'Activa':
        return { bg: 'var(--success-bg)', text: 'var(--success)', border: 'rgba(16, 185, 129, 0.2)' };
      case 'Pausada':
        return { bg: 'var(--warning-bg)', text: 'var(--warning)', border: 'rgba(245, 158, 11, 0.2)' };
      case 'Finalizada':
        return { bg: 'rgba(59, 130, 246, 0.1)', text: 'var(--accent-secondary)', border: 'rgba(59, 130, 246, 0.2)' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 700 }}>
            Obras y Proyectos
          </h2>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Administra los frentes de obra, supervisores, presupuestos y consulta su avance de nómina y costos.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            backgroundColor: 'var(--accent-primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            padding: '0.6rem 1.25rem',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 6px rgba(139, 92, 246, 0.2)',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
          onMouseOut={(e) => e.currentTarget.style.filter = 'none'}
        >
          {showAddForm ? <X size={16} /> : <Plus size={16} />}
          {showAddForm ? 'Cancelar' : 'Registrar Nueva Obra'}
        </button>
      </div>

      {/* Add New Obra Form (Collapsible Card) */}
      {showAddForm && (
        <div className="card animate-fade-in" style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
          <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Construction size={18} color="var(--accent-primary)" />
            Registrar Frente de Obra
          </h3>
          <form onSubmit={handleAddSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Nombre de la Obra:</label>
              <input
                type="text"
                className="input"
                placeholder="Ej. Torre Beta, Puentes Centrales..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ fontSize: '0.85rem', padding: '0.45rem 0.6rem' }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Ubicación / Dirección:</label>
              <input
                type="text"
                className="input"
                placeholder="Ej. Av. Juárez #500..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{ fontSize: '0.85rem', padding: '0.45rem 0.6rem' }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Ingeniero / Arquitecto a Cargo:</label>
              <input
                type="text"
                className="input"
                placeholder="Nombre del supervisor..."
                value={supervisor}
                onChange={(e) => setSupervisor(e.target.value)}
                style={{ fontSize: '0.85rem', padding: '0.45rem 0.6rem' }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Presupuesto Estimado (MXN):</label>
              <input
                type="number"
                className="input"
                placeholder="Monto del presupuesto..."
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                style={{ fontSize: '0.85rem', padding: '0.45rem 0.6rem', fontFamily: 'monospace' }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Fecha de Inicio:</label>
              <input
                type="date"
                className="input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ fontSize: '0.85rem', padding: '0.45rem 0.6rem' }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Estado de la Obra:</label>
              <select
                className="input select"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Activa' | 'Finalizada' | 'Pausada')}
                style={{ fontSize: '0.85rem', padding: '0.45rem 0.6rem', width: '100%' }}
              >
                <option value="Activa">Activa / En Ejecución</option>
                <option value="Pausada">Pausada temporalmente</option>
                <option value="Finalizada">Finalizada / Entregada</option>
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="submit"
                style={{
                  backgroundColor: 'var(--success)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.5rem 1.5rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                onMouseOut={(e) => e.currentTarget.style.filter = 'none'}
              >
                <Check size={14} />
                Guardar Obra
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Filters Bar Card */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-md)', alignItems: 'center', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
        {/* Search */}
        <div style={{ flex: 1, minWidth: '240px', position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem' }} />
          <input
            type="text"
            className="input"
            placeholder="Buscar por obra, supervisor o ubicación..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.25rem', fontSize: '0.85rem' }}
          />
        </div>

        {/* Status Pills */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {(['Todos', 'Activa', 'Pausada', 'Finalizada'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '9999px',
                border: '1px solid var(--border-color)',
                backgroundColor: statusFilter === s ? 'var(--accent-primary)' : 'var(--bg-input)',
                color: statusFilter === s ? 'white' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.75rem',
                transition: 'all 0.2s'
              }}
            >
              {s === 'Todos' ? 'Todos los Estados' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Obras Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-lg)' }}>
        {filteredObrasData.length > 0 ? (
          filteredObrasData.map(({ obra, activeWorkersCount, payrollCost, totalExpenses, budgetUtilizedPercent }) => {
            const isEditing = editingObraId === obra.id;
            const styleBadge = getStatusColor(obra.status);
            
            return (
              <div key={obra.id} className="card" style={{ border: '1px solid var(--border-color)', position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {isEditing ? (
                  /* Edit Form Mode */
                  <form onSubmit={(e) => handleEditSubmit(e, obra.id)} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 700 }}>Editar Ficha de Obra</h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Nombre:</label>
                      <input
                        type="text"
                        className="input"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }}
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Ubicación:</label>
                      <input
                        type="text"
                        className="input"
                        value={editLocation}
                        onChange={(e) => setEditLocation(e.target.value)}
                        style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }}
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Supervisor:</label>
                      <input
                        type="text"
                        className="input"
                        value={editSupervisor}
                        onChange={(e) => setEditSupervisor(e.target.value)}
                        style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }}
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Presupuesto (MXN):</label>
                      <input
                        type="number"
                        className="input"
                        value={editBudget}
                        onChange={(e) => setEditBudget(e.target.value)}
                        style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem', fontFamily: 'monospace' }}
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                        <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Inicio:</label>
                        <input
                          type="date"
                          className="input"
                          value={editStartDate}
                          onChange={(e) => setEditStartDate(e.target.value)}
                          style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }}
                          required
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                        <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Estado:</label>
                        <select
                          className="input select"
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as 'Activa' | 'Finalizada' | 'Pausada')}
                          style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem', width: '100%' }}
                        >
                          <option value="Activa">Activa</option>
                          <option value="Pausada">Pausada</option>
                          <option value="Finalizada">Finalizada</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <button
                        type="button"
                        onClick={() => setEditingObraId(null)}
                        style={{
                          backgroundColor: 'transparent',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        style={{
                          backgroundColor: 'var(--success)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        Guardar
                      </button>
                    </div>

                  </form>
                ) : (
                  /* Display Mode Card */
                  <>
                    {/* Header: Name and Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Construction size={15} color="var(--accent-primary)" />
                          {obra.name}
                        </h3>
                      </div>
                      <span className="badge" style={{
                        backgroundColor: styleBadge.bg,
                        color: styleBadge.text,
                        border: `1px solid ${styleBadge.border}`,
                        fontSize: '0.6rem',
                        padding: '0.15rem 0.5rem'
                      }}>
                        {obra.status}
                      </span>
                    </div>

                    {/* Metadata details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={13} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                        <span>{obra.location}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User size={13} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                        <span>Residente: <strong>{obra.supervisor}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={13} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                        <span>Inicio: <strong>{obra.startDate.split('-').reverse().join('/')}</strong></span>
                      </div>
                    </div>

                    {/* Active Metrics linked */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', borderTop: '1px dashed var(--border-color)', borderBottom: '1px dashed var(--border-color)', padding: '0.5rem 0', margin: '0.25rem 0' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Colaboradores Activos</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                          <Users size={12} color="var(--accent-secondary)" />
                          {activeWorkersCount} activos
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1/7rem' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Nómina Semanal</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700, color: 'var(--success)', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                          <DollarSign size={12} color="var(--success)" />
                          {formatCurrency(payrollCost)}
                        </div>
                      </div>
                    </div>

                    {/* Budget progress bar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        <span>Presupuesto Consumido:</span>
                        <span>{budgetUtilizedPercent}% ({formatCurrency(totalExpenses)} de {formatCurrency(obra.budget)})</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-input)', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.min(100, budgetUtilizedPercent)}%`,
                          backgroundColor: budgetUtilizedPercent > 100 ? 'var(--danger)' : budgetUtilizedPercent > 80 ? 'var(--warning)' : 'var(--accent-primary)',
                          height: '100%',
                          borderRadius: '9999px',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>

                    {/* Actions footer row */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.25rem' }}>
                      <button
                        onClick={() => startEdit(obra)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.75rem',
                          padding: '0.25rem',
                          borderRadius: 'var(--radius-sm)',
                          transition: 'color 0.2s',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
                        onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                        title="Editar datos de obra"
                      >
                        <Edit2 size={13} />
                        Editar
                      </button>

                      <button
                        onClick={() => onDeleteObra(obra.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.75rem',
                          padding: '0.25rem',
                          borderRadius: 'var(--radius-sm)',
                          transition: 'color 0.2s',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.color = 'var(--danger)'}
                        onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                        title="Eliminar obra"
                      >
                        <Trash2 size={13} />
                        Eliminar
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        ) : (
          <div className="card" style={{ gridColumn: '1 / -1', padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
            No se encontraron frentes de obra que coincidan con la búsqueda o filtros seleccionados.
          </div>
        )}
      </div>

    </div>
  );
};
