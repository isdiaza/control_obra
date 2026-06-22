import { useState, useEffect } from 'react';
import type { FinancialTransaction, Proveedor, Cliente } from '../types';
import { getWeekId } from './useAttendanceData';

const DEFAULT_CLIENTES: Cliente[] = [
  { id: 'c_1', name: 'Grupo Inmobiliario Regio', contactName: 'Lic. Roberto Villarreal', phone: '81-2222-3333', email: 'rvillarreal@girsa.mx', address: 'Av. Vasconcelos 800, San Pedro' },
  { id: 'c_2', name: 'Desarrollos Campestre SA', contactName: 'Arq. Mariana Torres', phone: '81-4444-5555', email: 'mtorres@descampestre.com', address: 'Calzada del Valle 200, Monterrey' },
  { id: 'c_3', name: 'Corporativo Alfa Construcciones', contactName: 'Ing. Javier Mendoza', phone: '81-6666-7777', email: 'jmendoza@alfaconst.mx', address: 'Blvd. Constitución 1500, Guadalupe' },
];

const DEFAULT_PROVEEDORES: Proveedor[] = [
  { id: 'p_1', name: 'Aceros del Norte', contactName: 'Ing. Pedro Páramo', phone: '81-1234-5678', email: 'ventas@acerosnorte.com', address: 'Av. Industriales 100, Monterrey' },
  { id: 'p_2', name: 'Cementos Monterrey', contactName: 'Lic. Patricia Garza', phone: '81-8765-4321', email: 'contacto@cementosmty.mx', address: 'Carretera Laredo Km 15, Escobedo' },
  { id: 'p_3', name: 'Eléctrica del Centro', contactName: 'Sr. Felipe Soto', phone: '81-5555-1234', email: 'soto.felipe@elcentro.com', address: 'Zaragoza 405 Sur, Monterrey' },
];

const SEED_TRANSACTIONS: FinancialTransaction[] = [
  // Semana 24 (Pasada)
  {
    id: 't_1',
    date: '2026-06-08',
    description: 'Estimación #01 - Avance de Cimentación',
    type: 'ingreso',
    category: 'Estimación Cliente',
    amount: 65000,
    obra: 'Torre Alfa',
    weekId: '2026-W24',
    clienteId: 'c_1'
  },
  {
    id: 't_2',
    date: '2026-06-09',
    description: 'Compra de Varillas de Acero 3/8 y 1/2',
    type: 'gasto',
    category: 'Materiales',
    amount: 15400,
    obra: 'Torre Alfa',
    weekId: '2026-W24',
    proveedorId: 'p_1',
    materialName: 'Varilla de Acero 3/8 y 1/2',
    quantity: 1,
    unitPrice: 15400
  },
  {
    id: 't_3',
    date: '2026-06-11',
    description: 'Servicio de Flete y Acarreo de Tierra',
    type: 'gasto',
    category: 'Flete / Acarreo',
    amount: 2800,
    obra: 'Torre Alfa',
    weekId: '2026-W24'
  },
  {
    id: 't_4',
    date: '2026-06-08',
    description: 'Anticipo del Proyecto Plaza Central',
    type: 'ingreso',
    category: 'Anticipo',
    amount: 45000,
    obra: 'Plaza Central',
    weekId: '2026-W24',
    clienteId: 'c_3'
  },
  {
    id: 't_5',
    date: '2026-06-10',
    description: 'Compra de Cemento Gris Tolteca (50 bultos)',
    type: 'gasto',
    category: 'Materiales',
    amount: 9250,
    obra: 'Plaza Central',
    weekId: '2026-W24',
    proveedorId: 'p_2',
    materialName: 'Cemento Gris Tolteca (Bultos)',
    quantity: 50,
    unitPrice: 185
  },
  {
    id: 't_6',
    date: '2026-06-09',
    description: 'Cobro por Avance de Estructura Metálica',
    type: 'ingreso',
    category: 'Estimación Cliente',
    amount: 50000,
    obra: 'Residencial Campestre',
    weekId: '2026-W24',
    clienteId: 'c_2'
  },
  {
    id: 't_7',
    date: '2026-06-12',
    description: 'Renta de Revolvedora de Concreto (Semana)',
    type: 'gasto',
    category: 'Herramientas / Renta',
    amount: 3200,
    obra: 'Residencial Campestre',
    weekId: '2026-W24'
  },

  // Semana 25 (Actual)
  {
    id: 't_8',
    date: '2026-06-15',
    description: 'Estimación #02 - Columnas y Losas de Nivel 1',
    type: 'ingreso',
    category: 'Estimación Cliente',
    amount: 82000,
    obra: 'Torre Alfa',
    weekId: '2026-W25',
    clienteId: 'c_1'
  },
  {
    id: 't_9',
    date: '2026-06-16',
    description: 'Herramientas Menores y Alambre Recocido',
    type: 'gasto',
    category: 'Herramientas / Renta',
    amount: 4150,
    obra: 'Torre Alfa',
    weekId: '2026-W25',
    proveedorId: 'p_3',
    materialName: 'Herramientas y Alambre',
    quantity: 1,
    unitPrice: 4150
  },
  {
    id: 't_10',
    date: '2026-06-17',
    description: 'Viáticos de Transporte de Supervisor',
    type: 'gasto',
    category: 'Viáticos / Combustible',
    amount: 1250,
    obra: 'Torre Alfa',
    weekId: '2026-W25'
  },
  {
    id: 't_11',
    date: '2026-06-15',
    description: 'Compra de Tabique Rojo (1000 pzas)',
    type: 'gasto',
    category: 'Materiales',
    amount: 6800,
    obra: 'Plaza Central',
    weekId: '2026-W25',
    proveedorId: 'p_2',
    materialName: 'Tabique Rojo',
    quantity: 1000,
    unitPrice: 6.8
  },
  {
    id: 't_12',
    date: '2026-06-16',
    description: 'Estimación #01 - Albañilería de Interiores',
    type: 'ingreso',
    category: 'Estimación Cliente',
    amount: 55000,
    obra: 'Residencial Campestre',
    weekId: '2026-W25',
    clienteId: 'c_2'
  },
  {
    id: 't_13',
    date: '2026-06-16',
    description: 'Flete de Arena y Grava Triturada',
    type: 'gasto',
    category: 'Flete / Acarreo',
    amount: 3400,
    obra: 'Residencial Campestre',
    weekId: '2026-W25'
  }
];

export const useFinancialData = () => {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  useEffect(() => {
    const isInitialized = localStorage.getItem('dibersa_initialized') === 'true';
    const stored = localStorage.getItem('dibersa_financial_transactions');
    const storedProveedores = localStorage.getItem('dibersa_proveedores_catalogue');
    
    if (!isInitialized && !stored) {
      localStorage.setItem('dibersa_financial_transactions', JSON.stringify(SEED_TRANSACTIONS));
      setTransactions(SEED_TRANSACTIONS);
    } else {
      setTransactions(stored ? JSON.parse(stored) : []);
    }

    let finalProveedores: Proveedor[] = [];
    if (storedProveedores) {
      finalProveedores = JSON.parse(storedProveedores);
    } else {
      finalProveedores = [...DEFAULT_PROVEEDORES];
      localStorage.setItem('dibersa_proveedores_catalogue', JSON.stringify(finalProveedores));
    }
    setProveedores(finalProveedores);

    // Clientes
    const storedClientes = localStorage.getItem('dibersa_clientes_catalogue');
    let finalClientes: Cliente[] = [];
    if (storedClientes) {
      finalClientes = JSON.parse(storedClientes);
    } else {
      finalClientes = [...DEFAULT_CLIENTES];
      localStorage.setItem('dibersa_clientes_catalogue', JSON.stringify(finalClientes));
    }
    setClientes(finalClientes);
  }, []);

  const saveTransactions = (updated: FinancialTransaction[]) => {
    setTransactions(updated);
    localStorage.setItem('dibersa_financial_transactions', JSON.stringify(updated));
  };

  const saveProveedores = (updated: Proveedor[]) => {
    setProveedores(updated);
    localStorage.setItem('dibersa_proveedores_catalogue', JSON.stringify(updated));
  };

  const addTransaction = (
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
  ) => {
    const dateObj = new Date(dateString + 'T12:00:00');
    const weekId = getWeekId(dateObj);

    const newTx: FinancialTransaction = {
      id: `t_${Date.now()}`,
      date: dateString,
      description,
      type,
      category,
      amount,
      obra,
      weekId,
      proveedorId,
      clienteId,
      materialName,
      quantity,
      unitPrice
    };

    const updated = [newTx, ...transactions];
    saveTransactions(updated);
  };

  const deleteTransaction = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    saveTransactions(updated);
  };

  const addProveedor = (name: string, contactName: string, phone: string, email: string, address: string) => {
    const newP: Proveedor = {
      id: `p_${Date.now()}`,
      name,
      contactName,
      phone,
      email,
      address
    };
    const updated = [...proveedores, newP];
    saveProveedores(updated);
  };

  const updateProveedor = (id: string, name: string, contactName: string, phone: string, email: string, address: string) => {
    const updated = proveedores.map(p => p.id === id ? { id, name, contactName, phone, email, address } : p);
    saveProveedores(updated);
  };

  const deleteProveedor = (id: string) => {
    const hasTransactions = transactions.some(t => t.proveedorId === id);
    if (hasTransactions) {
      alert("No se puede eliminar este proveedor porque tiene transacciones de compra registradas.");
      return;
    }
    const updated = proveedores.filter(p => p.id !== id);
    saveProveedores(updated);
  };

  // ---- Clientes CRUD ----
  const saveClientes = (updated: Cliente[]) => {
    setClientes(updated);
    localStorage.setItem('dibersa_clientes_catalogue', JSON.stringify(updated));
  };

  const addCliente = (name: string, contactName: string, phone: string, email: string, address: string) => {
    const newC: Cliente = {
      id: `c_${Date.now()}`,
      name,
      contactName,
      phone,
      email,
      address
    };
    const updated = [...clientes, newC];
    saveClientes(updated);
  };

  const updateCliente = (id: string, name: string, contactName: string, phone: string, email: string, address: string) => {
    const updated = clientes.map(c => c.id === id ? { id, name, contactName, phone, email, address } : c);
    saveClientes(updated);
  };

  const deleteCliente = (id: string) => {
    const hasTransactions = transactions.some(t => t.clienteId === id);
    if (hasTransactions) {
      alert("No se puede eliminar este cliente porque tiene transacciones de ingreso registradas.");
      return;
    }
    const updated = clientes.filter(c => c.id !== id);
    saveClientes(updated);
  };

  const resetFinancialData = () => {
    localStorage.removeItem('dibersa_financial_transactions');
    localStorage.removeItem('dibersa_proveedores_catalogue');
    localStorage.removeItem('dibersa_clientes_catalogue');
    saveTransactions(SEED_TRANSACTIONS);
    saveProveedores(DEFAULT_PROVEEDORES);
    saveClientes(DEFAULT_CLIENTES);
  };

  return {
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
    resetFinancialData
  };
};
