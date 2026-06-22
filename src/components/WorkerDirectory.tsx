import React, { useState, useMemo, useRef, useEffect } from 'react';
import { UserPlus, Trash2, BadgeDollarSign, HardHat, Hammer, Construction, Edit2, Check, X, LayoutGrid, List, IdCard } from 'lucide-react';
import type { Worker } from '../types';

interface SignaturePadProps {
  onSave: (dataUrl: string | null) => void;
  initialValueUrl: string | null;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, initialValueUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Clear canvas and draw initial value if exists
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (initialValueUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = initialValueUrl;
    }
  }, [initialValueUrl]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Check if touch event
    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL());
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      onSave(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '100%' }}>
      <canvas
        ref={canvasRef}
        width={300}
        height={90}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        style={{
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: '#ffffff',
          cursor: 'crosshair',
          touchAction: 'none',
          width: '100%',
          height: '90px'
        }}
      />
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={clearCanvas}
          style={{
            flex: 1,
            backgroundColor: 'var(--bg-input)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.2rem 0.5rem',
            fontSize: '0.7rem',
            cursor: 'pointer'
          }}
        >
          Limpiar Firma
        </button>
      </div>
    </div>
  );
};

interface DirectoryProps {
  workers: Worker[];
  uniqueObras: string[];
  onAddWorker: (name: string, role: string, obra: string, sueldoDiario: number) => void;
  onDeleteWorker: (id: string) => void;
  onUpdateWorker: (
    id: string,
    name: string,
    role: string,
    obra: string,
    sueldoDiario: number,
    photo?: string,
    bloodType?: string,
    allergies?: string,
    diseases?: string
  ) => void;
}

export const WorkerDirectory: React.FC<DirectoryProps> = ({
  workers,
  uniqueObras,
  onAddWorker,
  onDeleteWorker,
  onUpdateWorker,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Ayudante General');
  const [obra, setObra] = useState('');
  const [sueldoDiario, setSueldoDiario] = useState<string | number>(350);

  // Editing states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editObra, setEditObra] = useState('');
  const [editSueldoDiario, setEditSueldoDiario] = useState<string | number>(350);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  // Credential states
  const [selectedCredentialWorker, setSelectedCredentialWorker] = useState<Worker | null>(null);
  const [credentialEmpresa, setCredentialEmpresa] = useState('CRABSA');
  const [credentialNombre, setCredentialNombre] = useState('');
  const [credentialPuesto, setCredentialPuesto] = useState('');
  const [credentialSangre, setCredentialSangre] = useState('O+');
  const [credentialAlergias, setCredentialAlergias] = useState('Ninguna');
  const [credentialEnfermedades, setCredentialEnfermedades] = useState('Ninguna');
  const [credentialFoto, setCredentialFoto] = useState<string | null>(null);
  const [credentialHeader, setCredentialHeader] = useState('CREDENCIAL DE OBRA PUNTO MAR');
  const [credentialFooter, setCredentialFooter] = useState('Documento propiedad del Condominio Punto Mar');
  const [credentialBorderColor, setCredentialBorderColor] = useState('#0056b3');
  const [credentialSignature, setCredentialSignature] = useState<string | null>(null);

  const openCredentialModal = (worker: Worker) => {
    setSelectedCredentialWorker(worker);
    setCredentialEmpresa('CRABSA');
    setCredentialNombre(worker.name);
    setCredentialPuesto(worker.role);
    setCredentialSangre(worker.bloodType || 'O+');
    setCredentialAlergias(worker.allergies || 'Ninguna');
    setCredentialEnfermedades(worker.diseases || 'Ninguna');
    setCredentialFoto(worker.photo || null);
    setCredentialHeader('CREDENCIAL DE OBRA PUNTO MAR');
    setCredentialFooter('Documento propiedad del Condominio Punto Mar');
    setCredentialBorderColor('#0056b3');
    setCredentialSignature(null);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCredentialFoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCredentialSignature(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = () => {
    if (!selectedCredentialWorker) return;
    
    // Save to the parent state (updates workers catalogue)
    onUpdateWorker(
      selectedCredentialWorker.id,
      credentialNombre,
      credentialPuesto,
      selectedCredentialWorker.obra,
      selectedCredentialWorker.sueldoDiario,
      credentialFoto || undefined,
      credentialSangre,
      credentialAlergias,
      credentialEnfermedades
    );
    
    // Also update the local state for this worker so changes reflect in preview
    setSelectedCredentialWorker(prev => prev ? {
      ...prev,
      name: credentialNombre,
      role: credentialPuesto,
      photo: credentialFoto || undefined,
      bloodType: credentialSangre,
      allergies: credentialAlergias,
      diseases: credentialEnfermedades
    } : null);
  };

  const handlePrintCredential = () => {
    // Automatically save changes first so they are persisted!
    handleSaveChanges();
    
    document.body.classList.add('printing-credential');
    window.print();
    window.addEventListener('afterprint', () => {
      document.body.classList.remove('printing-credential');
    }, { once: true });
  };

  React.useEffect(() => {
    let active = true;
    if (uniqueObras.length > 0 && !obra) {
      Promise.resolve().then(() => {
        if (active) setObra(uniqueObras[0]);
      });
    }
    return () => {
      active = false;
    };
  }, [uniqueObras, obra]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;

    const selectedObra = obra || uniqueObras[0];
    if (!selectedObra) {
      alert('Debes registrar al menos una obra en la pestaña "Sitios de Obra" antes de dar de alta a un trabajador.');
      return;
    }

    onAddWorker(name.trim(), role.trim(), selectedObra, parseFloat(sueldoDiario.toString()) || 0);
    
    // Reset form
    setName('');
    setShowAddForm(false);
  };

  const startEdit = (worker: Worker) => {
    setEditingId(worker.id);
    setEditName(worker.name);
    setEditRole(worker.role);
    setEditObra(worker.obra);
    setEditSueldoDiario(worker.sueldoDiario);
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim() || !editRole.trim() || !editObra.trim()) return;
    onUpdateWorker(id, editName.trim(), editRole.trim(), editObra.trim(), parseFloat(editSueldoDiario.toString()) || 0);
    setEditingId(null);
  };

  const getInitials = (nameStr: string) => {
    return nameStr
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(val);
  };



  // Group workers by Obra
  const workersByObra = useMemo(() => {
    const groups: Record<string, Worker[]> = {};
    workers.forEach(w => {
      if (!groups[w.obra]) groups[w.obra] = [];
      groups[w.obra].push(w);
    });
    return groups;
  }, [workers]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-xl)', alignItems: 'start' }} className="employee-layout">
      
      {/* Sidebar form to add employee / Header to toggle */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 700 }}>
              Catálogo por Obra
            </h3>
            {/* View Switcher Toggle */}
            <div style={{ display: 'inline-flex', backgroundColor: 'var(--bg-input)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border-color)' }} className="no-print">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  border: 'none',
                  backgroundColor: viewMode === 'cards' ? 'var(--accent-primary)' : 'transparent',
                  color: viewMode === 'cards' ? 'white' : 'var(--text-secondary)',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <LayoutGrid size={13} /> Tarjetas
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  border: 'none',
                  backgroundColor: viewMode === 'list' ? 'var(--accent-primary)' : 'transparent',
                  color: viewMode === 'list' ? 'white' : 'var(--text-secondary)',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <List size={13} /> Lista
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              backgroundColor: showAddForm ? 'var(--bg-input)' : 'var(--accent-primary)',
              color: 'white',
              border: showAddForm ? '1px solid var(--border-color)' : 'none',
              borderRadius: 'var(--radius-md)',
              padding: '0.5rem 1rem',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'background-color 0.2s',
            }}
          >
            <UserPlus size={14} />
            {showAddForm ? 'Cancelar' : 'Alta de Personal'}
          </button>
        </div>

        {/* Add Worker Form */}
        {showAddForm && (
          <form 
            onSubmit={handleSubmit}
            className="card animate-fade-in"
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 'var(--space-md)',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
            }}
          >
            <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <HardHat size={16} color="var(--accent-primary)" />
              Registrar Trabajador en Obra
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Nombre Completo:</label>
              <input
                type="text"
                className="input"
                required
                placeholder="Ej. Juan Pérez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ fontSize: '0.875rem' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Oficio / Puesto:</label>
              <select
                className="input select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ fontSize: '0.875rem' }}
              >
                <option value="Maestro de Obra">Maestro de Obra</option>
                <option value="Albañil Oficial">Albañil Oficial</option>
                <option value="Fierrero Oficial">Fierrero Oficial</option>
                <option value="Carpintero Oficial">Carpintero Oficial</option>
                <option value="Yesero Oficial">Yesero Oficial</option>
                <option value="Ayudante General">Ayudante General</option>
                <option value="Personal Administrativo">Personal Administrativo</option>
                <option value="Personal de Compras">Personal de Compras</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Obra Asignada:</label>
              <select
                className="input select"
                value={obra}
                onChange={(e) => setObra(e.target.value)}
                style={{ fontSize: '0.875rem' }}
                required
              >
                {uniqueObras.map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
                {uniqueObras.length === 0 && (
                  <option value="">-- Registra una obra primero --</option>
                )}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Sueldo Diario (MXN):
              </label>
              <input
                type="number"
                step="any"
                className="input"
                required
                min="0"
                placeholder="Ej. 350"
                value={sueldoDiario}
                onChange={(e) => setSueldoDiario(e.target.value)}
                style={{ fontSize: '0.875rem' }}
              />
            </div>

            <button
              type="submit"
              style={{
                backgroundColor: 'var(--success)',
                color: 'var(--bg-main)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: '0.65rem',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                marginTop: '0.5rem',
                boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)',
              }}
            >
              Dar de Alta Trabajador
            </button>
          </form>
        )}
      </div>

      {/* Main List grouped by Obra */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {Object.entries(workersByObra).length > 0 ? (
          Object.entries(workersByObra).map(([obraName, obraWorkers]) => (
            <div key={obraName} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="animate-fade-in">
              
              {/* Obra Header Section */}
              <h3 style={{ 
                margin: 0, 
                fontSize: '1.05rem', 
                color: 'var(--text-primary)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                borderBottom: '1px solid var(--border-color)', 
                paddingBottom: '0.5rem',
                fontWeight: 700
              }}>
                <Construction size={16} color="var(--accent-primary)" />
                <span>Obra: <strong>{obraName}</strong></span>
                <span className="badge" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-secondary)', textTransform: 'lowercase', fontSize: '0.75rem', fontWeight: 500, padding: '0.15rem 0.5rem' }}>
                  {obraWorkers.length} {obraWorkers.length === 1 ? 'trabajador' : 'trabajadores'}
                </span>
              </h3>

              {/* Conditional View Rendering */}
              {viewMode === 'cards' ? (
                /* Workers Grid for this Obra */
                <div 
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', 
                    gap: 'var(--space-lg)' 
                  }}
                >
                  {obraWorkers.map((worker) => {
                    const isEditing = editingId === worker.id;

                    return (
                      <div 
                        key={worker.id} 
                        className="card" 
                        style={{ 
                          padding: 'var(--space-lg)', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: 'var(--space-md)',
                          border: isEditing ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                          boxShadow: isEditing ? 'var(--shadow-glow)' : 'var(--shadow-md)',
                          position: 'relative',
                          overflow: 'hidden',
                          backgroundColor: 'var(--bg-card)',
                        }}
                      >
                        {isEditing ? (
                          /* EDIT MODE (CARD) */
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }} className="animate-fade-in">
                            <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 700 }}>Editar Trabajador</h4>
                            
                            {/* Edit Name */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Nombre:</span>
                              <input
                                type="text"
                                className="input"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                              />
                            </div>

                            {/* Edit Role */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Oficio:</span>
                              <select
                                className="input select"
                                value={editRole}
                                onChange={(e) => setEditRole(e.target.value)}
                                style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                              >
                                <option value="Maestro de Obra">Maestro de Obra</option>
                                <option value="Albañil Oficial">Albañil Oficial</option>
                                <option value="Fierrero Oficial">Fierrero Oficial</option>
                                <option value="Carpintero Oficial">Carpintero Oficial</option>
                                <option value="Yesero Oficial">Yesero Oficial</option>
                                <option value="Ayudante General">Ayudante General</option>
                                <option value="Personal Administrativo">Personal Administrativo</option>
                                <option value="Personal de Compras">Personal de Compras</option>
                              </select>
                            </div>

                            {/* Edit Obra */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Mover a Obra:</span>
                              <select
                                className="input select"
                                value={editObra}
                                onChange={(e) => setEditObra(e.target.value)}
                                style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                              >
                                {uniqueObras.map(o => (
                                  <option key={o} value={o}>{o}</option>
                                ))}
                                {editObra && !uniqueObras.includes(editObra) && <option value={editObra}>{editObra}</option>}
                              </select>
                            </div>

                            {/* Edit Sueldo Diario */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Sueldo Diario:</span>
                              <input
                                type="number"
                                step="any"
                                className="input"
                                value={editSueldoDiario}
                                onChange={(e) => setEditSueldoDiario(e.target.value)}
                                style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                              />
                            </div>

                            {/* Edit Actions */}
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-sm)' }}>
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(worker.id)}
                                style={{
                                  flex: 1,
                                  backgroundColor: 'var(--success)',
                                  color: 'var(--bg-main)',
                                  border: 'none',
                                  borderRadius: 'var(--radius-sm)',
                                  padding: '0.4rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  fontSize: '0.75rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '0.2rem'
                                }}
                              >
                                <Check size={12} /> Guardar
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                style={{
                                  flex: 1,
                                  backgroundColor: 'var(--bg-input)',
                                  color: 'var(--text-secondary)',
                                  border: '1px solid var(--border-color)',
                                  borderRadius: 'var(--radius-sm)',
                                  padding: '0.4rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  fontSize: '0.75rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '0.2rem'
                                }}
                              >
                                <X size={12} /> Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* DISPLAY MODE (CARD) */
                          <>
                            {/* Corner Sueldo Diario */}
                            <div style={{ position: 'absolute', top: 'var(--space-md)', right: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--success)' }}>
                              <BadgeDollarSign size={14} />
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'monospace' }}>
                                {formatCurrency(worker.sueldoDiario)}
                              </span>
                            </div>

                            {/* Profile Avatar & Title */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
                              <div style={{
                                width: '46px',
                                height: '46px',
                                borderRadius: '50%',
                                backgroundColor: worker.avatarColor,
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
                                flexShrink: 0
                              }}>
                                {getInitials(worker.name)}
                              </div>
                              <div style={{ overflow: 'hidden' }}>
                                <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                  {worker.name}
                                </h4>
                                <p style={{ margin: '0.15rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.75rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                  {worker.role}
                                </p>
                              </div>
                            </div>

                            {/* Metadata */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-input)', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <Construction size={11} color="var(--accent-primary)" />
                                <span>Obra actual: <strong>{worker.obra}</strong></span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <Hammer size={11} color="var(--warning)" />
                                <span>Pago Semanal (6d): <strong>{formatCurrency(worker.sueldoDiario * 6)}</strong></span>
                              </div>
                            </div>

                            {/* Actions (Edit / Delete) */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-sm)', marginTop: 'var(--space-xs)' }}>
                              <button
                                onClick={() => startEdit(worker)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--text-muted)',
                                  cursor: 'pointer',
                                  padding: '0.25rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  fontSize: '0.7rem',
                                  fontWeight: 500,
                                }}
                                onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
                                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                              >
                                <Edit2 size={12} />
                                Editar Datos
                              </button>
                              <button
                                onClick={() => openCredentialModal(worker)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--text-muted)',
                                  cursor: 'pointer',
                                  padding: '0.25rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  fontSize: '0.7rem',
                                  fontWeight: 500,
                                }}
                                onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
                                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                              >
                                <IdCard size={12} />
                                Credencial
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`¿Estás seguro de eliminar a ${worker.name}? Se borrarán permanentemente sus registros de asistencia.`)) {
                                    onDeleteWorker(worker.id);
                                  }
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--text-muted)',
                                  cursor: 'pointer',
                                  padding: '0.25rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  fontSize: '0.7rem',
                                  fontWeight: 500,
                                }}
                                onMouseOver={(e) => e.currentTarget.style.color = 'var(--danger)'}
                                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                              >
                                <Trash2 size={12} />
                                Dar de Baja
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Workers List Table for this Obra */
                <div className="table-container card" style={{ padding: 0, overflowX: 'auto', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '12px 16px', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>Trabajador</th>
                        <th style={{ padding: '12px 16px', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>Puesto / Oficio</th>
                        <th style={{ padding: '12px 16px', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>Obra</th>
                        <th style={{ padding: '12px 16px', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, borderBottom: '1px solid var(--border-color)', textAlign: 'right' }}>Sueldo Diario</th>
                        <th style={{ padding: '12px 16px', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, borderBottom: '1px solid var(--border-color)', textAlign: 'right' }}>Pago Semanal (6d)</th>
                        <th style={{ padding: '12px 16px', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, borderBottom: '1px solid var(--border-color)', textAlign: 'center' }} className="no-print">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {obraWorkers.map((worker) => {
                        const isEditing = editingId === worker.id;

                        if (isEditing) {
                          return (
                            <tr key={worker.id} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(139, 92, 246, 0.05)' }} className="animate-fade-in">
                              <td style={{ padding: '10px 16px', verticalAlign: 'middle' }}>
                                <input
                                  type="text"
                                  className="input"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  style={{ width: '100%', padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                                />
                              </td>
                              <td style={{ padding: '10px 16px', verticalAlign: 'middle' }}>
                                <select
                                  className="input select"
                                  value={editRole}
                                  onChange={(e) => setEditRole(e.target.value)}
                                  style={{ width: '100%', padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                                >
                                  <option value="Maestro de Obra">Maestro de Obra</option>
                                  <option value="Albañil Oficial">Albañil Oficial</option>
                                  <option value="Fierrero Oficial">Fierrero Oficial</option>
                                  <option value="Carpintero Oficial">Carpintero Oficial</option>
                                  <option value="Yesero Oficial">Yesero Oficial</option>
                                  <option value="Ayudante General">Ayudante General</option>
                                  <option value="Personal Administrativo">Personal Administrativo</option>
                                  <option value="Personal de Compras">Personal de Compras</option>
                                </select>
                              </td>
                              <td style={{ padding: '10px 16px', verticalAlign: 'middle' }}>
                                <select
                                  className="input select"
                                  value={editObra}
                                  onChange={(e) => setEditObra(e.target.value)}
                                  style={{ width: '100%', padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                                >
                                  {uniqueObras.map(o => (
                                    <option key={o} value={o}>{o}</option>
                                  ))}
                                  {editObra && !uniqueObras.includes(editObra) && <option value={editObra}>{editObra}</option>}
                                </select>
                              </td>
                              <td style={{ padding: '10px 16px', verticalAlign: 'middle', textAlign: 'right' }}>
                                <input
                                  type="number"
                                  step="any"
                                  className="input"
                                  value={editSueldoDiario}
                                  onChange={(e) => setEditSueldoDiario(e.target.value)}
                                  style={{ width: '110px', padding: '0.35rem 0.5rem', fontSize: '0.85rem', textAlign: 'right' }}
                                />
                              </td>
                              <td style={{ padding: '10px 16px', verticalAlign: 'middle', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: 'var(--success)', fontSize: '0.875rem' }}>
                                {formatCurrency((parseFloat(editSueldoDiario.toString()) || 0) * 6)}
                              </td>
                              <td style={{ padding: '10px 16px', verticalAlign: 'middle', textAlign: 'center' }} className="no-print">
                                <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveEdit(worker.id)}
                                    style={{
                                      backgroundColor: 'var(--success)',
                                      color: 'var(--bg-main)',
                                      border: 'none',
                                      borderRadius: 'var(--radius-sm)',
                                      padding: '0.4rem 0.6rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      fontSize: '0.75rem',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.2rem'
                                    }}
                                    title="Guardar"
                                  >
                                    <Check size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingId(null)}
                                    style={{
                                      backgroundColor: 'var(--bg-input)',
                                      color: 'var(--text-secondary)',
                                      border: '1px solid var(--border-color)',
                                      borderRadius: 'var(--radius-sm)',
                                      padding: '0.4rem 0.6rem',
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                      fontSize: '0.75rem',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.2rem'
                                    }}
                                    title="Cancelar"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        }

                        return (
                          <tr key={worker.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
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
                                  flexShrink: 0,
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}>
                                  {getInitials(worker.name)}
                                </div>
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                                  {worker.name}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px', verticalAlign: 'middle', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                              {worker.role}
                            </td>
                            <td style={{ padding: '12px 16px', verticalAlign: 'middle', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                              {worker.obra}
                            </td>
                            <td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                              {formatCurrency(worker.sueldoDiario)}
                            </td>
                            <td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: 'var(--success)', fontSize: '0.875rem' }}>
                              {formatCurrency(worker.sueldoDiario * 6)}
                            </td>
                            <td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'center' }} className="no-print">
                              <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'center' }}>
                                <button
                                  onClick={() => startEdit(worker)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    padding: '0.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    transition: 'color 0.2s'
                                  }}
                                  onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
                                  onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                                >
                                  <Edit2 size={12} />
                                  Editar
                                </button>
                                <button
                                  onClick={() => openCredentialModal(worker)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    padding: '0.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    transition: 'color 0.2s'
                                  }}
                                  onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
                                  onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                                >
                                  <IdCard size={12} />
                                  Credencial
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm(`¿Estás seguro de eliminar a ${worker.name}? Se borrarán permanentemente sus registros de asistencia.`)) {
                                      onDeleteWorker(worker.id);
                                    }
                                  }}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    padding: '0.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    transition: 'color 0.2s'
                                  }}
                                  onMouseOver={(e) => e.currentTarget.style.color = 'var(--danger)'}
                                  onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                                >
                                  <Trash2 size={12} />
                                  Dar de Baja
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: 'var(--space-xl)', 
            backgroundColor: 'var(--bg-card)', 
            borderRadius: 'var(--radius-lg)', 
            border: '1px dashed var(--border-color)',
            color: 'var(--text-muted)' 
          }}>
            No hay trabajadores registrados en la base de datos.
          </div>
        )}
      </div>

      {/* Credential Modal */}
      {selectedCredentialWorker && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '1rem',
          overflowY: 'auto'
        }} className="no-print animate-fade-in">
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-lg)',
            width: '100%',
            maxWidth: '860px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: 'var(--shadow-lg)'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 700 }}>
                <IdCard size={18} color="var(--accent-primary)" />
                <span>Generar Credencial de Obra</span>
              </h3>
              <button 
                onClick={() => setSelectedCredentialWorker(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              
              {/* Form Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '65vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
                <h4 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>Datos del Anverso</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Cabecera:</label>
                    <input 
                      type="text" 
                      className="input" 
                      value={credentialHeader} 
                      onChange={e => setCredentialHeader(e.target.value)} 
                      style={{ fontSize: '0.85rem', padding: '0.4rem 0.65rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Empresa:</label>
                    <input 
                      type="text" 
                      className="input" 
                      value={credentialEmpresa} 
                      onChange={e => setCredentialEmpresa(e.target.value)} 
                      style={{ fontSize: '0.85rem', padding: '0.4rem 0.65rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Nombre:</label>
                    <input 
                      type="text" 
                      className="input" 
                      value={credentialNombre} 
                      onChange={e => setCredentialNombre(e.target.value)} 
                      style={{ fontSize: '0.85rem', padding: '0.4rem 0.65rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Puesto:</label>
                    <input 
                      type="text" 
                      className="input" 
                      value={credentialPuesto} 
                      onChange={e => setCredentialPuesto(e.target.value)} 
                      style={{ fontSize: '0.85rem', padding: '0.4rem 0.65rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tipo de Sangre:</label>
                    <input 
                      type="text" 
                      className="input" 
                      value={credentialSangre} 
                      onChange={e => setCredentialSangre(e.target.value)} 
                      style={{ fontSize: '0.85rem', padding: '0.4rem 0.65rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Color de Borde:</label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input 
                        type="color" 
                        value={credentialBorderColor} 
                        onChange={e => setCredentialBorderColor(e.target.value)} 
                        style={{ border: 'none', background: 'transparent', width: '32px', height: '32px', cursor: 'pointer', padding: 0 }}
                      />
                      <span style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{credentialBorderColor}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Alergias:</label>
                    <input 
                      type="text" 
                      className="input" 
                      value={credentialAlergias} 
                      onChange={e => setCredentialAlergias(e.target.value)} 
                      style={{ fontSize: '0.85rem', padding: '0.4rem 0.65rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Enfermedades:</label>
                    <input 
                      type="text" 
                      className="input" 
                      value={credentialEnfermedades} 
                      onChange={e => setCredentialEnfermedades(e.target.value)} 
                      style={{ fontSize: '0.85rem', padding: '0.4rem 0.65rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Leyenda del Pie:</label>
                  <input 
                    type="text" 
                    className="input" 
                    value={credentialFooter} 
                    onChange={e => setCredentialFooter(e.target.value)} 
                    style={{ fontSize: '0.85rem', padding: '0.4rem 0.65rem' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Foto del Trabajador (Se asignará de forma permanente):</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Firma del Trabajador (Dibujar o subir imagen):</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem', alignItems: 'start' }}>
                    <SignaturePad onSave={setCredentialSignature} initialValueUrl={credentialSignature} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>O sube una imagen de firma transparente:</span>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleSignatureUpload}
                        style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Column */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', backgroundColor: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <h4 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, alignSelf: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem', width: '100%' }}>Vista Previa</h4>
                
                {/* ID Cards Layout Wrapper */}
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center', padding: '0.5rem 0' }}>
                  
                  {/* FRONT CARD (ANVERSO) */}
                  <div style={{
                    width: '54mm',
                    height: '85.6mm',
                    border: `2.5mm solid ${credentialBorderColor}`,
                    borderRadius: '3mm',
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    position: 'relative',
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '3mm 2.5mm',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                    fontFamily: "'Arial', sans-serif"
                  }}>
                    {/* Header */}
                    <div style={{
                      fontSize: '5.5px',
                      fontWeight: 800,
                      textAlign: 'center',
                      width: '100%',
                      marginBottom: '2mm',
                      color: '#000000',
                      lineHeight: '1.2',
                      textTransform: 'uppercase'
                    }}>
                      {credentialHeader}
                    </div>

                    {/* Photo & Signature Row */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                      height: '24mm',
                      marginBottom: '2.5mm',
                      gap: '2mm'
                    }}>
                      {/* Photo (Left) */}
                      <div style={{
                        width: '18mm',
                        height: '24mm',
                        border: '0.4mm solid #9ca3af',
                        backgroundColor: '#f3f4f6',
                        overflow: 'hidden',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative'
                      }}>
                        {credentialFoto ? (
                          <img src={credentialFoto} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: '5px', fontWeight: 700, color: '#9ca3af' }}>FOTO</span>
                        )}
                      </div>

                      {/* Signature (Right) */}
                      <div style={{
                        width: '24mm',
                        height: '24mm',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative',
                        border: credentialSignature ? 'none' : '0.2mm dashed #d1d5db',
                        backgroundColor: credentialSignature ? 'transparent' : '#fafafa'
                      }}>
                        {credentialSignature ? (
                          <img src={credentialSignature} alt="Firma" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        ) : (
                          <span style={{ fontSize: '4.5px', color: '#9ca3af' }}>Área de Firma</span>
                        )}
                      </div>
                    </div>

                    {/* Details List */}
                    <div style={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.8mm',
                      textAlign: 'left',
                      lineHeight: '1.15',
                      marginBottom: '2mm'
                    }}>
                      <div style={{ fontSize: '5.2px', color: '#000000' }}>
                        <strong>EMPRESA:</strong> <span style={{ fontWeight: 700 }}>{credentialEmpresa}</span>
                      </div>
                      <div style={{ fontSize: '5.2px', color: '#000000' }}>
                        <strong>Nombre:</strong> <span style={{ fontWeight: 700 }}>{credentialNombre}</span>
                      </div>
                      <div style={{ fontSize: '5.2px', color: '#000000' }}>
                        <strong>Puesto:</strong> <span style={{ fontWeight: 700 }}>{credentialPuesto}</span>
                      </div>
                      <div style={{ fontSize: '5.2px', color: '#000000' }}>
                        <strong>Tipo de Sangre:</strong> <span style={{ fontWeight: 700 }}>{credentialSangre}</span>
                      </div>
                      <div style={{ fontSize: '5.2px', color: '#000000' }}>
                        <strong>Alergia:</strong> <span style={{ fontWeight: 700 }}>{credentialAlergias}</span>
                      </div>
                      <div style={{ fontSize: '5.2px', color: '#000000' }}>
                        <strong>Enfermedades:</strong> <span style={{ fontWeight: 700 }}>{credentialEnfermedades}</span>
                      </div>
                    </div>

                    {/* Signature Line */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      width: '100%',
                      marginTop: 'auto',
                      marginBottom: '1.5mm'
                    }}>
                      <div style={{ width: '30mm', borderTop: '0.25mm solid #000000' }}></div>
                      <span style={{ fontSize: '4.5px', fontWeight: 800, color: '#000000', marginTop: '0.5mm', textTransform: 'uppercase', letterSpacing: '0.1px' }}>FIRMA DEL TRABAJADOR</span>
                    </div>

                    {/* Footer text */}
                    <div style={{
                      fontSize: '4.5px',
                      fontWeight: 800,
                      color: '#000000',
                      textAlign: 'center',
                      width: '100%'
                    }}>
                      {credentialFooter}
                    </div>
                  </div>

                  {/* BACK CARD (REVERSO) */}
                  <div style={{
                    width: '54mm',
                    height: '85.6mm',
                    border: `2.5mm solid ${credentialBorderColor}`,
                    borderRadius: '3mm',
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    position: 'relative',
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '3mm 2.5mm',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                    fontFamily: "'Arial', sans-serif"
                  }}>
                    {/* Brush Logo SVG */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '1mm', marginBottom: '2.5mm' }}>
                      <svg viewBox="0 0 100 100" width="22" height="22" style={{ color: '#1e293b' }}>
                        <path d="M52 14 C70.5 14 86 29.5 86 48 C86 65.5 73 82 52 82 C30.5 82 14 66.5 14 48 C14 32.5 24.5 19 38 15 C34.5 17.5 32 22 32 27 C32 39.5 42 49 54 49 C60 49 65.5 46.5 69.5 42.5 C63.5 56 49.5 65 33 65 C22.5 65 14 56.5 14 46 C14 27 29.5 12 48.5 12 C58.5 12 67.5 16.5 73.5 24 C72 21 68 18 64 16 C60.5 14.5 56.5 14 52 14 Z" fill="currentColor" />
                      </svg>
                      <span style={{ fontSize: '5.5px', fontWeight: 600, color: '#000000', letterSpacing: '1.2px', marginTop: '0.8mm', textTransform: 'uppercase' }}>PUNTO MAR</span>
                    </div>

                    {/* Emergency details */}
                    <div style={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.6mm',
                      textAlign: 'center',
                      lineHeight: '1.2',
                      marginBottom: '2.5mm',
                      color: '#000000'
                    }}>
                      <div style={{ fontSize: '4.8px', fontWeight: 800 }}>
                        Tel. Emergencia: <strong style={{ fontSize: '5px' }}>744.207.8035</strong>
                      </div>
                      <div style={{ fontSize: '4.8px', fontWeight: 800 }}>
                        Seguros Monterrey - Póliza:
                      </div>
                      <div style={{ fontSize: '5.5px', fontWeight: 900, marginTop: '0.2mm' }}>
                        GM0000338952(N)
                      </div>
                    </div>

                    {/* Lineamientos de seguridad */}
                    <div style={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5mm',
                      textAlign: 'justify',
                      lineHeight: '1.15',
                      marginBottom: '3mm'
                    }}>
                      <span style={{ fontSize: '4.8px', fontWeight: 800, color: '#000000', textAlign: 'center', textTransform: 'uppercase' }}>LINEAMIENTOS DE SEGURIDAD</span>
                      <p style={{ fontSize: '3.6px', fontWeight: 600, color: '#000000', margin: 0, textIndent: '0' }}>
                        Todo contratista y/o prestador de servicios que realice trabajos dentro de la obra, tales como construcción, mantenimiento, modificaciones y/o tareas administrativas, deberán acatar las normas de seguridad, higiene y medio ambiente establecidas en el reglamento de obra, en la legislación laboral mexicana aplicable, en los ordenamientos corporativos, así como en cualquier disposición emitida por el Departamento de Seguridad y/o Administración.
                      </p>
                    </div>

                    {/* Signature Line */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      width: '100%',
                      marginTop: 'auto',
                      marginBottom: '1.5mm'
                    }}>
                      <div style={{ width: '30mm', borderTop: '0.25mm solid #000000' }}></div>
                      <span style={{ fontSize: '4.5px', fontWeight: 800, color: '#000000', marginTop: '0.5mm', textTransform: 'uppercase', letterSpacing: '0.1px' }}>FIRMA DE AUTORIZACIÓN</span>
                    </div>

                    {/* Footer text */}
                    <div style={{
                      fontSize: '4.5px',
                      fontWeight: 800,
                      color: '#000000',
                      textAlign: 'center',
                      width: '100%'
                    }}>
                      Documento propiedad del Condominio Punto Mar
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setSelectedCredentialWorker(null)}
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.5rem 1.25rem',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={handleSaveChanges}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--success)',
                  border: '1px solid var(--success)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.5rem 1.25rem',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--success-bg)'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Guardar Datos
              </button>
              <button
                type="button"
                onClick={handlePrintCredential}
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.5rem 1.5rem',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 4px 10px rgba(139, 92, 246, 0.2)'
                }}
              >
                <IdCard size={15} />
                Imprimir Credencial
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Print Layout */}
      {selectedCredentialWorker && (
        <div id="credential-print-layout" style={{ display: 'none' }}>
          {/* FRONT CARD (ANVERSO) */}
          <div className="credential-card-print" style={{ borderColor: credentialBorderColor, borderWidth: '2.5mm', borderStyle: 'solid', padding: '3mm 2.5mm', fontFamily: "'Arial', sans-serif" }}>
            {/* Header */}
            <div style={{
              fontSize: '5.5px',
              fontWeight: 800,
              textAlign: 'center',
              width: '100%',
              marginBottom: '2mm',
              color: '#000000',
              lineHeight: '1.2',
              textTransform: 'uppercase'
            }}>
              {credentialHeader}
            </div>

            {/* Photo & Signature Row */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              height: '24mm',
              marginBottom: '2.5mm',
              gap: '2mm'
            }}>
              {/* Photo (Left) */}
              <div style={{
                width: '18mm',
                height: '24mm',
                border: '0.4mm solid #9ca3af',
                backgroundColor: '#f3f4f6',
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative'
              }}>
                {credentialFoto ? (
                  <img src={credentialFoto} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '5px', fontWeight: 700, color: '#9ca3af' }}>FOTO</span>
                )}
              </div>

              {/* Signature (Right) */}
              <div style={{
                width: '24mm',
                height: '24mm',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                border: credentialSignature ? 'none' : '0.2mm dashed #d1d5db',
                backgroundColor: credentialSignature ? 'transparent' : '#fafafa'
              }}>
                {credentialSignature ? (
                  <img src={credentialSignature} alt="Firma" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontSize: '4.5px', color: '#9ca3af' }}>Área de Firma</span>
                )}
              </div>
            </div>

            {/* Details List */}
            <div style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.8mm',
              textAlign: 'left',
              lineHeight: '1.15',
              marginBottom: '2mm'
            }}>
              <div style={{ fontSize: '5.2px', color: '#000000' }}>
                <strong>EMPRESA:</strong> <span style={{ fontWeight: 700 }}>{credentialEmpresa}</span>
              </div>
              <div style={{ fontSize: '5.2px', color: '#000000' }}>
                <strong>Nombre:</strong> <span style={{ fontWeight: 700 }}>{credentialNombre}</span>
              </div>
              <div style={{ fontSize: '5.2px', color: '#000000' }}>
                <strong>Puesto:</strong> <span style={{ fontWeight: 700 }}>{credentialPuesto}</span>
              </div>
              <div style={{ fontSize: '5.2px', color: '#000000' }}>
                <strong>Tipo de Sangre:</strong> <span style={{ fontWeight: 700 }}>{credentialSangre}</span>
              </div>
              <div style={{ fontSize: '5.2px', color: '#000000' }}>
                <strong>Alergia:</strong> <span style={{ fontWeight: 700 }}>{credentialAlergias}</span>
              </div>
              <div style={{ fontSize: '5.2px', color: '#000000' }}>
                <strong>Enfermedades:</strong> <span style={{ fontWeight: 700 }}>{credentialEnfermedades}</span>
              </div>
            </div>

            {/* Signature Line */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              marginTop: 'auto',
              marginBottom: '1.5mm'
            }}>
              <div style={{ width: '30mm', borderTop: '0.25mm solid #000000' }}></div>
              <span style={{ fontSize: '4.5px', fontWeight: 800, color: '#000000', marginTop: '0.5mm', textTransform: 'uppercase', letterSpacing: '0.1px' }}>FIRMA DEL TRABAJADOR</span>
            </div>

            {/* Footer text */}
            <div style={{
              fontSize: '4.5px',
              fontWeight: 800,
              color: '#000000',
              textAlign: 'center',
              width: '100%'
            }}>
              {credentialFooter}
            </div>
          </div>

          {/* BACK CARD (REVERSO) */}
          <div className="credential-card-print" style={{ borderColor: credentialBorderColor, borderWidth: '2.5mm', borderStyle: 'solid', padding: '3mm 2.5mm', fontFamily: "'Arial', sans-serif" }}>
            {/* Brush Logo SVG */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '1mm', marginBottom: '2.5mm' }}>
              <svg viewBox="0 0 100 100" width="22" height="22" style={{ color: '#1e293b' }}>
                <path d="M52 14 C70.5 14 86 29.5 86 48 C86 65.5 73 82 52 82 C30.5 82 14 66.5 14 48 C14 32.5 24.5 19 38 15 C34.5 17.5 32 22 32 27 C32 39.5 42 49 54 49 C60 49 65.5 46.5 69.5 42.5 C63.5 56 49.5 65 33 65 C22.5 65 14 56.5 14 46 C14 27 29.5 12 48.5 12 C58.5 12 67.5 16.5 73.5 24 C72 21 68 18 64 16 C60.5 14.5 56.5 14 52 14 Z" fill="currentColor" />
              </svg>
              <span style={{ fontSize: '5.5px', fontWeight: 600, color: '#000000', letterSpacing: '1.2px', marginTop: '0.8mm', textTransform: 'uppercase' }}>PUNTO MAR</span>
            </div>

            {/* Emergency details */}
            <div style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6mm',
              textAlign: 'center',
              lineHeight: '1.2',
              marginBottom: '2.5mm',
              color: '#000000'
            }}>
              <div style={{ fontSize: '4.8px', fontWeight: 800 }}>
                Tel. Emergencia: <strong style={{ fontSize: '5px' }}>744.207.8035</strong>
              </div>
              <div style={{ fontSize: '4.8px', fontWeight: 800 }}>
                Seguros Monterrey - Póliza:
              </div>
              <div style={{ fontSize: '5.5px', fontWeight: 900, marginTop: '0.2mm' }}>
                GM0000338952(N)
              </div>
            </div>

            {/* Lineamientos de seguridad */}
            <div style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5mm',
              textAlign: 'justify',
              lineHeight: '1.15',
              marginBottom: '3mm'
            }}>
              <span style={{ fontSize: '4.8px', fontWeight: 800, color: '#000000', textAlign: 'center', textTransform: 'uppercase' }}>LINEAMIENTOS DE SEGURIDAD</span>
              <p style={{ fontSize: '3.6px', fontWeight: 600, color: '#000000', margin: 0, textIndent: '0' }}>
                Todo contratista y/o prestador de servicios que realice trabajos dentro de la obra, tales como construcción, mantenimiento, modificaciones y/o tareas administrativas, deberán acatar las normas de seguridad, higiene y medio ambiente establecidas en el reglamento de obra, en la legislación laboral mexicana aplicable, en los ordenamientos corporativos, así como en cualquier disposición emitida por el Departamento de Seguridad y/o Administración.
              </p>
            </div>

            {/* Signature Line */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              marginTop: 'auto',
              marginBottom: '1.5mm'
            }}>
              <div style={{ width: '30mm', borderTop: '0.25mm solid #000000' }}></div>
              <span style={{ fontSize: '4.5px', fontWeight: 800, color: '#000000', marginTop: '0.5mm', textTransform: 'uppercase', letterSpacing: '0.1px' }}>FIRMA DE AUTORIZACIÓN</span>
            </div>

            {/* Footer text */}
            <div style={{
              fontSize: '4.5px',
              fontWeight: 800,
              color: '#000000',
              textAlign: 'center',
              width: '100%'
            }}>
              Documento propiedad del Condominio Punto Mar
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 1024px) {
          .employee-layout {
            grid-template-columns: 320px 1fr;
          }
        }
      `}</style>
    </div>
  );
};
