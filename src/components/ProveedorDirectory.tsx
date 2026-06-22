import React, { useState, useMemo } from 'react';
import type { Proveedor, FinancialTransaction } from '../types';
import { Search, Truck, User, Phone, Mail, MapPin, Plus, Edit2, Trash2, X, Check, PackageOpen } from 'lucide-react';

interface ProveedorDirectoryProps {
  proveedores: Proveedor[];
  transactions: FinancialTransaction[];
  onAddProveedor: (name: string, contactName: string, phone: string, email: string, address: string) => void;
  onUpdateProveedor: (id: string, name: string, contactName: string, phone: string, email: string, address: string) => void;
  onDeleteProveedor: (id: string) => void;
}

export const ProveedorDirectory: React.FC<ProveedorDirectoryProps> = ({
  proveedores,
  transactions,
  onAddProveedor,
  onUpdateProveedor,
  onDeleteProveedor,
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

  // Selected supplier to view purchase logs (expanded card)
  const [selectedProveedorId, setSelectedProveedorId] = useState<string | null>(null);

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
    onAddProveedor(name.trim(), contactName.trim(), phone.trim(), email.trim(), address.trim());
    // Reset Add Form
    setName('');
    setContactName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setShowAddForm(false);
  };

  const startEdit = (p: Proveedor) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditContactName(p.contactName);
    setEditPhone(p.phone);
    setEditEmail(p.email);
    setEditAddress(p.address);
  };

  const handleEditSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!editName.trim()) return;
    onUpdateProveedor(id, editName.trim(), editContactName.trim(), editPhone.trim(), editEmail.trim(), editAddress.trim());
    setEditingId(null);
  };

  // Compile calculations for each Proveedor
  const suppliersData = useMemo(() => {
    return proveedores.map(p => {
      // Find all financial transactions associated with this supplier
      const supplierPurchases = transactions.filter(t => t.proveedorId === p.id && t.type === 'gasto');
      const totalSpend = supplierPurchases.reduce((sum, t) => sum + t.amount, 0);
      
      // Filter detailed transactions (those that have materialName)
      const materialPurchases = supplierPurchases.filter(t => !!t.materialName);

      return {
        proveedor: p,
        purchasesCount: supplierPurchases.length,
        totalSpend,
        purchases: supplierPurchases,
        materialPurchases
      };
    });
  }, [proveedores, transactions]);

  // Filtered Suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliersData.filter(item => {
      const query = search.toLowerCase();
      return (
        item.proveedor.name.toLowerCase().includes(query) ||
        item.proveedor.contactName.toLowerCase().includes(query) ||
        item.proveedor.address.toLowerCase().includes(query) ||
        item.proveedor.email.toLowerCase().includes(query)
      );
    });
  }, [suppliersData, search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 700 }}>
            Catálogo de Proveedores
          </h2>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Administra tus contactos de proveedores, registra compras de materiales y consulta precios históricos.
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
          {showAddForm ? 'Cancelar' : 'Registrar Proveedor'}
        </button>
      </div>

      {/* Add New Supplier Collapsible Card */}
      {showAddForm && (
        <div className="card animate-fade-in" style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
          <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Truck size={18} color="var(--accent-primary)" />
            Registrar Proveedor
          </h3>
          <form onSubmit={handleAddSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Razón Social / Nombre:</label>
              <input
                type="text"
                className="input"
                placeholder="Ej. Distribuidora Metálica..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ fontSize: '0.85rem', padding: '0.45rem 0.6rem' }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Persona de Contacto:</label>
              <input
                type="text"
                className="input"
                placeholder="Nombre del ejecutivo..."
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                style={{ fontSize: '0.85rem', padding: '0.45rem 0.6rem' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Teléfono:</label>
              <input
                type="text"
                className="input"
                placeholder="Ej. 81-1234-5678..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ fontSize: '0.85rem', padding: '0.45rem 0.6rem' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Correo Electrónico:</label>
              <input
                type="email"
                className="input"
                placeholder="Ej. contacto@proveedor.com..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ fontSize: '0.85rem', padding: '0.45rem 0.6rem' }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Dirección Comercial:</label>
              <input
                type="text"
                className="input"
                placeholder="Dirección del corporativo o sucursal..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ fontSize: '0.85rem', padding: '0.45rem 0.6rem' }}
              />
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
                Guardar Proveedor
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Search Bar */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-md)', alignItems: 'center', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem' }} />
          <input
            type="text"
            className="input"
            placeholder="Buscar proveedor por nombre, contacto, correo o dirección..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.25rem', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Layout Split: Left suppliers list, Right expanded purchase log */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedProveedorId ? '1fr 1.2fr' : '1fr', gap: 'var(--space-lg)', alignItems: 'start' }} className="providers-grid">
        
        {/* Suppliers List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {filteredSuppliers.length > 0 ? (
            filteredSuppliers.map(({ proveedor, totalSpend, purchasesCount }) => {
              const isEditing = editingId === proveedor.id;
              const isSelected = selectedProveedorId === proveedor.id;

              return (
                <div 
                  key={proveedor.id} 
                  className={`card ${isSelected ? 'selected-provider-card' : ''}`}
                  style={{ 
                    border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)', 
                    backgroundColor: 'var(--bg-card)', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '0.65rem',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s',
                    boxShadow: isSelected ? '0 0 10px rgba(139, 92, 246, 0.1)' : 'none'
                  }}
                  onClick={() => setSelectedProveedorId(isSelected ? null : proveedor.id)}
                >
                  {isEditing ? (
                    /* Edit Form Mode */
                    <form 
                      onSubmit={(e) => handleEditSubmit(e, proveedor.id)} 
                      onClick={(e) => e.stopPropagation()} 
                      style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}
                    >
                      <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 700 }}>Editar Proveedor</h4>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                        <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Razón Social:</label>
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
                        <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Contacto:</label>
                        <input
                          type="text"
                          className="input"
                          value={editContactName}
                          onChange={(e) => setEditContactName(e.target.value)}
                          style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                          <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Teléfono:</label>
                          <input
                            type="text"
                            className="input"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                          <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Email:</label>
                          <input
                            type="email"
                            className="input"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                        <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Dirección:</label>
                        <input
                          type="text"
                          className="input"
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                          style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setEditingId(null); }}
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
                    /* Display Mode */
                    <>
                      {/* Name Header and Spent amount */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Truck size={14} color="var(--accent-primary)" />
                            {proveedor.name}
                          </h3>
                          {proveedor.contactName && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2' + 'rem', marginTop: '0.15rem' }}>
                              <User size={12} />
                              {proveedor.contactName}
                            </span>
                          )}
                        </div>
                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Comprado</span>
                          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--success)', fontFamily: 'monospace' }}>
                            {formatCurrency(totalSpend)}
                          </span>
                        </div>
                      </div>

                      {/* Contact metadata */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {proveedor.phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Phone size={12} color="var(--text-muted)" />
                            <span>{proveedor.phone}</span>
                          </div>
                        )}
                        {proveedor.email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Mail size={12} color="var(--text-muted)" />
                            <span>{proveedor.email}</span>
                          </div>
                        )}
                        {proveedor.address && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MapPin size={12} color="var(--text-muted)" />
                            <span>{proveedor.address}</span>
                          </div>
                        )}
                      </div>

                      {/* Spend details footer summary bar */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px dashed var(--border-color)', paddingTop: '0.45rem', marginTop: '0.15rem' }}>
                        <span>{purchasesCount} {purchasesCount === 1 ? 'compra registrada' : 'compras registradas'}</span>
                        <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Ver historial &gt;</span>
                      </div>

                      {/* Actions hover row */}
                      <div 
                        style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }} 
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => startEdit(proveedor)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                            fontSize: '0.7rem',
                            padding: '0.2rem',
                            borderRadius: 'var(--radius-sm)',
                          }}
                          onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
                          onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                        >
                          <Edit2 size={12} />
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Estás seguro de eliminar a ${proveedor.name}?`)) {
                              onDeleteProveedor(proveedor.id);
                            }
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                            fontSize: '0.7rem',
                            padding: '0.2rem',
                            borderRadius: 'var(--radius-sm)',
                          }}
                          onMouseOver={(e) => e.currentTarget.style.color = 'var(--danger)'}
                          onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                        >
                          <Trash2 size={12} />
                          Eliminar
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          ) : (
            <div className="card" style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
              No se encontraron proveedores que coincidan con la búsqueda.
            </div>
          )}
        </div>

        {/* Detailed purchases log for selected supplier */}
        {selectedProveedorId && (
          <div className="card animate-fade-in" style={{ border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', position: 'sticky', top: '90px', backgroundColor: 'var(--bg-card)' }}>
            {(() => {
              const data = suppliersData.find(item => item.proveedor.id === selectedProveedorId);
              if (!data) return null;

              const { proveedor, totalSpend, purchases } = data;
              return (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Historial de Compras
                      </h3>
                      <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Proveedor: <strong>{proveedor.name}</strong>
                      </p>
                    </div>
                    <button 
                      onClick={() => setSelectedProveedorId(null)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Summary spend */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: 'var(--bg-input)', padding: '0.75rem var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Invertido</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--success)', fontFamily: 'monospace' }}>
                        {formatCurrency(totalSpend)}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Compras Totales</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {purchases.length} registros
                      </div>
                    </div>
                  </div>

                  {/* Detailed Materials Table */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <h4 style={{ margin: '0.25rem 0 0.5rem 0', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <PackageOpen size={14} color="var(--accent-primary)" />
                      Registro de Materiales y Costos
                    </h4>

                    <div style={{ overflowX: 'auto', maxHeight: '350px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                            <th style={{ padding: '0.4rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600, width: '90px' }}>Fecha</th>
                            <th style={{ padding: '0.4rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Material / Detalle</th>
                            <th style={{ padding: '0.4rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center', width: '50px' }}>Cant.</th>
                            <th style={{ padding: '0.4rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right', width: '85px' }}>P. Unit</th>
                            <th style={{ padding: '0.4rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right', width: '85px' }}>Total</th>
                            <th style={{ padding: '0.4rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600, width: '100px' }}>Obra</th>
                          </tr>
                        </thead>
                        <tbody>
                          {purchases.length > 0 ? (
                            purchases.map(p => (
                              <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <td style={{ padding: '0.45rem 0.5rem', fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                                  {p.date}
                                </td>
                                <td style={{ padding: '0.45rem 0.5rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                  {p.materialName || p.description}
                                </td>
                                <td style={{ padding: '0.45rem 0.5rem', textAlign: 'center', fontFamily: 'monospace' }}>
                                  {p.quantity !== undefined ? p.quantity : '-'}
                                </td>
                                <td style={{ padding: '0.45rem 0.5rem', textAlign: 'right', fontFamily: 'monospace' }}>
                                  {p.unitPrice !== undefined ? formatCurrency(p.unitPrice) : '-'}
                                </td>
                                <td style={{ padding: '0.45rem 0.5rem', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>
                                  {formatCurrency(p.amount)}
                                </td>
                                <td style={{ padding: '0.45rem 0.5rem', color: 'var(--text-muted)' }}>
                                  {p.obra}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                                No hay compras de materiales registradas con este proveedor.
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
        @media (min-width: 1024px) {
          .providers-grid {
            grid-template-columns: ${selectedProveedorId ? '1fr 1.2fr' : '1fr'};
          }
        }
      `}</style>

    </div>
  );
};
