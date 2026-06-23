import { useState, useEffect } from 'react';
import type { FinancialTransaction, Proveedor, Cliente } from '../types';
import { getWeekId } from './useAttendanceData';
import { dbService } from '../utils/dbService';
import { isSupabaseConfigured } from '../utils/supabase';

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
    let active = true;
    const loadData = async () => {
      try {
        const fetchedT = await dbService.getTransactions();
        const fetchedP = await dbService.getProveedores();
        const fetchedC = await dbService.getClientes();

        const isInitialized = localStorage.getItem('dibersa_initialized') === 'true';
        // When Supabase is configured, NEVER auto-seed — the user manages their own data.
        // Only seed when using local fallback AND the DB has never been initialized.
        const shouldSeed = !isSupabaseConfigured && !isInitialized;

        let finalTransactions = fetchedT;
        let finalProveedores = fetchedP;
        let finalClientes = fetchedC;

        // Check if we need to seed
        if (shouldSeed && fetchedT.length === 0 && fetchedP.length === 0 && fetchedC.length === 0) {
          finalTransactions = [...SEED_TRANSACTIONS];
          finalProveedores = [...DEFAULT_PROVEEDORES];
          finalClientes = [...DEFAULT_CLIENTES];

          // Seed in database/local fallback
          await dbService.saveAllTransactions(finalTransactions);
          for (const p of finalProveedores) {
            await dbService.saveProveedor(p);
          }
          for (const c of finalClientes) {
            await dbService.saveCliente(c);
          }
          localStorage.setItem('dibersa_initialized', 'true');
        }

        if (active) {
          setTransactions(finalTransactions);
          setProveedores(finalProveedores);
          setClientes(finalClientes);
        }
      } catch (err) {
        console.error("Error loading financial data:", err);
      }
    };

    loadData();
    return () => {
      active = false;
    };
  }, []);

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

    setTransactions(prev => [newTx, ...prev]);
    dbService.saveTransaction(newTx).catch(console.error);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    dbService.deleteTransaction(id).catch(console.error);
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
    setProveedores(prev => [...prev, newP]);
    dbService.saveProveedor(newP).catch(console.error);
  };

  const updateProveedor = (id: string, name: string, contactName: string, phone: string, email: string, address: string) => {
    const updatedP: Proveedor = { id, name, contactName, phone, email, address };
    setProveedores(prev => prev.map(p => p.id === id ? updatedP : p));
    dbService.saveProveedor(updatedP).catch(console.error);
  };

  const deleteProveedor = (id: string) => {
    const hasTransactions = transactions.some(t => t.proveedorId === id);
    if (hasTransactions) {
      alert("No se puede eliminar este proveedor porque tiene transacciones de compra registradas.");
      return;
    }
    setProveedores(prev => prev.filter(p => p.id !== id));
    dbService.deleteProveedor(id).catch(console.error);
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
    setClientes(prev => [...prev, newC]);
    dbService.saveCliente(newC).catch(console.error);
  };

  const updateCliente = (id: string, name: string, contactName: string, phone: string, email: string, address: string) => {
    const updatedC: Cliente = { id, name, contactName, phone, email, address };
    setClientes(prev => prev.map(c => c.id === id ? updatedC : c));
    dbService.saveCliente(updatedC).catch(console.error);
  };

  const deleteCliente = (id: string) => {
    const hasTransactions = transactions.some(t => t.clienteId === id);
    if (hasTransactions) {
      alert("No se puede eliminar este cliente porque tiene transacciones de ingreso registradas.");
      return;
    }
    setClientes(prev => prev.filter(c => c.id !== id));
    dbService.deleteCliente(id).catch(console.error);
  };

  const resetFinancialData = () => {
    const resetData = async () => {
      try {
        setTransactions(SEED_TRANSACTIONS);
        setProveedores(DEFAULT_PROVEEDORES);
        setClientes(DEFAULT_CLIENTES);
        await dbService.resetFinancialData(SEED_TRANSACTIONS, DEFAULT_PROVEEDORES, DEFAULT_CLIENTES);
      } catch (err) {
        console.error("Error resetting financial data:", err);
      }
    };
    resetData();
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
