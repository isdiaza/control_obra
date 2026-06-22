import React, { useState, useMemo } from 'react';
import type { Cliente, FinancialTransaction } from '../types';
import { Search, UserCheck, User, Phone, Mail, MapPin, Plus, Edit2, Trash2, X, Check, Receipt } from 'lucide-react';

interface ClienteDirectoryProps {
  clientes: Cliente[];
  transactions: FinancialTransaction[];
  onAddCliente: (name: string, contactName: string, phone: string, email: string, address: string) => void;
  onUpdateCliente: (id: string, name: string, contactName: string, phone: string, email: string, address: string) => void;
  onDeleteCliente: (id: string) => void;
}

export const ClienteDirectory: React.FC<ClienteDirectoryProps> = ({
  clientes,
  transactions,
  onAddCliente,
  onUpdateCliente,
  onDeleteCliente,
}) => {
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Add Form States
  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  // Edit Form States
  const [editName, setEditName] = useState('');
  const [editContactName, setEditContactName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');

  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(val);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddCliente(name.trim(), contactName.trim(), phone.trim(), email.trim(), address.trim());
    setName(''); setContactName(''); setPhone(''); setEmail(''); setAddress('');
    setShowAddForm(false);
  };

  const startEdit = (c: Cliente) => {
    setEditingId(c.id);
    setEditName(c.name);
    setEditContactName(c.contactName);
    setEditPhone(c.phone);
    setEditEmail(c.email);
    setEditAddress(c.address);
  };

  const handleEditSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!editName.trim()) return;
    onUpdateCliente(id, editName.trim(), editContactName.trim(), editPhone.trim(), editEmail.trim(), editAddress.trim());
    setEditingId(null);
  };

  const clientesData = useMemo(() => {
    return clientes.map(c => {
      const clienteIngresos = transactions.filter(t => t.clienteId === c.id && t.type === 'ingreso');
      const totalIncome = clienteIngresos.reduce((sum, t) => sum + t.amount, 0);
      return {
        cliente: c,
        incomesCount: clienteIngresos.length,
        totalIncome,
        incomes: clienteIngresos,
      };
    });
  }, [clientes, transactions]);

  const filteredClientes = useMemo(() => {
    return clientesData.filter(item => {
      const query = search.toLowerCase();
      return (
        item.cliente.name.toLowerCase().includes(query) ||
        item.cliente.contactName.toLowerCase().includes(query) ||
        item.cliente.address.toLowerCase().includes(query) ||
        item.cliente.email.toLowerCase().includes(query)
      );
    });
  }, [clientesData, search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 700 }}>
            Catálogo de Clientes
          </h2>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Administra tus clientes, vincula ingresos y consulta cuánto ha pagado cada uno.
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
          {showAddForm ? 'Cancelar' : 'Registrar Cliente'}
        </button>
      </div>

      {/* Add New Client Collapsible Card */}
      {showAddForm && (
        <div className="card animate-fade-in" style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
          <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCheck size={18} color="var(--accent-primary)" />
            Registrar Cliente
          </h3>
          <form onSubmit={handleAddSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Razón Social / Nombre:</label>
              <input type="text" className="input" placeholder="Ej. Grupo Inmobiliario..." value={name}
                onChange={(e) => setName(e.target.value)} style={{ fontSize: '0.85rem', padding: '0.45rem 0.6rem' }} required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Persona de Contacto:</label>
              <input type="text" className="input" placeholder="Nombre del contacto..." value={contactName}
                onChange={(e) => setContactName(e.target.value)} style={{ fontSize: '0.85rem', padding: '0.45rem 0.6rem' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Teléfono:</label>
              <input type="text" className="input" placeholder="Ej. 81-1234-5678..." value={phone}
                onChange={(e) => setPhone(e.target.value)} style={{ fontSize: '0.85rem', padding: '0.45rem 0.6rem' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Correo Electrónico:</label>
              <input type="email" className="input" placeholder="Ej. contacto@cliente.com..." value={email}
                onChange={(e) => setEmail(e.target.value)} style={{ fontSize: '0.85rem', padding: '0.45rem 0.6rem' }} />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Dirección:</label>
              <input type="text" className="input" placeholder="Dirección del cliente..." value={address}
                onChange={(e) => setAddress(e.target.value)} style={{ fontSize: '0.85rem', padding: '0.45rem 0.6rem' }} />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="submit" style={{
                backgroundColor: 'var(--success)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)',
                padding: '0.5rem 1.5rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)', transition: 'all 0.2s',
              }}
                onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                onMouseOut={(e) => e.currentTarget.style.filter = 'none'}
              >
                <Check size={14} /> Guardar Cliente
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search Bar */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-md)', alignItems: 'center', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem' }} />
          <input type="text" className="input" placeholder="Buscar cliente por nombre, contacto, correo o dirección..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.25rem', fontSize: '0.85rem' }} />
        </div>
      </div>

      {/* Layout Split */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedClienteId ? '1fr 1.2fr' : '1fr', gap: 'var(--space-lg)', alignItems: 'start' }} className="clients-grid">
        
        {/* Client Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {filteredClientes.length > 0 ? (
            filteredClientes.map(({ cliente, totalIncome, incomesCount }) => {
              const isEditing = editingId === cliente.id;
              const isSelected = selectedClienteId === cliente.id;

              return (
                <div 
                  key={cliente.id} 
                  className={`card ${isSelected ? 'selected-provider-card' : ''}`}
                  style={{ 
                    border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)', 
                    backgroundColor: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: '0.65rem',
                    cursor: 'pointer', position: 'relative', transition: 'all 0.2s',
                    boxShadow: isSelected ? '0 0 10px rgba(139, 92, 246, 0.1)' : 'none'
                  }}
                  onClick={() => setSelectedClienteId(isSelected ? null : cliente.id)}
                >
                  {isEditing ? (
                    <form onSubmit={(e) => handleEditSubmit(e, cliente.id)} onClick={(e) => e.stopPropagation()}
                      style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 700 }}>Editar Cliente</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                        <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Razón Social:</label>
                        <input type="text" className="input" value={editName} onChange={(e) => setEditName(e.target.value)}
                          style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }} required />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                        <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Contacto:</label>
                        <input type="text" className="input" value={editContactName} onChange={(e) => setEditContactName(e.target.value)}
                          style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                          <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Teléfono:</label>
                          <input type="text" className="input" value={editPhone} onChange={(e) => setEditPhone(e.target.value)}
                            style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                          <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Email:</label>
                          <input type="email" className="input" value={editEmail} onChange={(e) => setEditEmail(e.target.value)}
                            style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                        <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Dirección:</label>
                        <input type="text" className="input" value={editAddress} onChange={(e) => setEditAddress(e.target.value)}
                          style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setEditingId(null); }}
                          style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                          Cancelar
                        </button>
                        <button type="submit" style={{ backgroundColor: 'var(--success)', color: 'white', border: 'none',
                          borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>
                          Guardar
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <UserCheck size={14} color="var(--success)" />
                            {cliente.name}
                          </h3>
                          {cliente.contactName && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.15rem' }}>
                              <User size={12} /> {cliente.contactName}
                            </span>
                          )}
                        </div>
                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Cobrado</span>
                          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--success)', fontFamily: 'monospace' }}>
                            {formatCurrency(totalIncome)}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {cliente.phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={12} color="var(--text-muted)" /><span>{cliente.phone}</span></div>
                        )}
                        {cliente.email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={12} color="var(--text-muted)" /><span>{cliente.email}</span></div>
                        )}
                        {cliente.address && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={12} color="var(--text-muted)" /><span>{cliente.address}</span></div>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px dashed var(--border-color)', paddingTop: '0.45rem', marginTop: '0.15rem' }}>
                        <span>{incomesCount} {incomesCount === 1 ? 'ingreso registrado' : 'ingresos registrados'}</span>
                        <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Ver historial &gt;</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }} onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => startEdit(cliente)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                            display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem', padding: '0.2rem', borderRadius: 'var(--radius-sm)' }}
                          onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
                          onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                        ><Edit2 size={12} /> Editar</button>
                        <button onClick={() => { if (window.confirm(`¿Estás seguro de eliminar a ${cliente.name}?`)) onDeleteCliente(cliente.id); }}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                            display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem', padding: '0.2rem', borderRadius: 'var(--radius-sm)' }}
                          onMouseOver={(e) => e.currentTarget.style.color = 'var(--danger)'}
                          onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                        ><Trash2 size={12} /> Eliminar</button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          ) : (
            <div className="card" style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
              No se encontraron clientes que coincidan con la búsqueda.
            </div>
          )}
        </div>

        {/* Detailed income log for selected client */}
        {selectedClienteId && (
          <div className="card animate-fade-in" style={{ border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', position: 'sticky', top: '90px', backgroundColor: 'var(--bg-card)' }}>
            {(() => {
              const data = clientesData.find(item => item.cliente.id === selectedClienteId);
              if (!data) return null;
              const { cliente, totalIncome, incomes } = data;
              return (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Historial de Cobros
                      </h3>
                      <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Cliente: <strong>{cliente.name}</strong>
                      </p>
                    </div>
                    <button onClick={() => setSelectedClienteId(null)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}>
                      <X size={16} />
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: 'var(--bg-input)', padding: '0.75rem var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Cobrado</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--success)', fontFamily: 'monospace' }}>{formatCurrency(totalIncome)}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Pagos Totales</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{incomes.length} registros</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <h4 style={{ margin: '0.25rem 0 0.5rem 0', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Receipt size={14} color="var(--accent-primary)" />
                      Registro de Estimaciones y Cobros
                    </h4>
                    <div style={{ overflowX: 'auto', maxHeight: '350px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                            <th style={{ padding: '0.4rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600, width: '90px' }}>Fecha</th>
                            <th style={{ padding: '0.4rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Concepto</th>
                            <th style={{ padding: '0.4rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Categoría</th>
                            <th style={{ padding: '0.4rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right', width: '100px' }}>Importe</th>
                            <th style={{ padding: '0.4rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600, width: '110px' }}>Obra</th>
                          </tr>
                        </thead>
                        <tbody>
                          {incomes.length > 0 ? (
                            incomes.map(i => (
                              <tr key={i.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <td style={{ padding: '0.45rem 0.5rem', fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '0.7rem' }}>{i.date}</td>
                                <td style={{ padding: '0.45rem 0.5rem', fontWeight: 500, color: 'var(--text-primary)' }}>{i.description}</td>
                                <td style={{ padding: '0.45rem 0.5rem', color: 'var(--text-muted)' }}>{i.category}</td>
                                <td style={{ padding: '0.45rem 0.5rem', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600, color: 'var(--success)' }}>
                                  +{formatCurrency(i.amount)}
                                </td>
                                <td style={{ padding: '0.45rem 0.5rem', color: 'var(--text-muted)' }}>{i.obra}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                                No hay ingresos registrados con este cliente.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 1023px) {
          .clients-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
