import { supabase, isSupabaseConfigured } from './supabase';
import type { Worker, WeekAttendance, Obra, CompanyInfo, Proveedor, Cliente, FinancialTransaction } from '../types';

// Storage keys for local fallback
const WORKERS_KEY = 'dibersa_workers_obra';
const ATTENDANCE_KEY = 'dibersa_attendance_grid';
const OBRAS_KEY = 'dibersa_obras_catalogue';
const COMPANY_KEY = 'dibersa_company_info';
const PROVEEDORES_KEY = 'dibersa_proveedores_catalogue';
const CLIENTES_KEY = 'dibersa_clientes_catalogue';
const TRANSACTIONS_KEY = 'dibersa_financial_transactions';

export const dbService = {
  // ==========================================
  // OBRAS (PROJECTS)
  // ==========================================
  async getObras(): Promise<Obra[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('obras')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []).map(o => ({
        id: o.id,
        name: o.name,
        location: o.location || '',
        supervisor: o.supervisor || '',
        budget: Number(o.budget || 0),
        startDate: o.start_date || '',
        status: o.status as 'Activa' | 'Finalizada' | 'Pausada'
      }));
    } else {
      return JSON.parse(localStorage.getItem(OBRAS_KEY) || '[]');
    }
  },

  async saveObra(o: Obra): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('obras')
        .upsert({
          id: o.id,
          name: o.name,
          location: o.location,
          supervisor: o.supervisor,
          budget: o.budget,
          start_date: o.startDate || null,
          status: o.status
        });
      if (error) throw error;
    } else {
      const list = await this.getObras();
      const idx = list.findIndex(item => item.id === o.id);
      if (idx !== -1) list[idx] = o;
      else list.push(o);
      localStorage.setItem(OBRAS_KEY, JSON.stringify(list));
    }
  },

  async deleteObra(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('obras')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } else {
      const list = await this.getObras();
      const filtered = list.filter(item => item.id !== id);
      localStorage.setItem(OBRAS_KEY, JSON.stringify(filtered));
    }
  },

  // ==========================================
  // WORKERS
  // ==========================================
  async getWorkers(): Promise<Worker[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return (data || []).map(w => ({
        id: w.id,
        name: w.name,
        role: w.role,
        obra: w.obra || '',
        sueldoDiario: Number(w.sueldo_diario || 0),
        avatarColor: w.avatar_color || '#8B5CF6',
        photo: w.photo || undefined,
        bloodType: w.blood_type || undefined,
        allergies: w.allergies || undefined,
        diseases: w.diseases || undefined
      }));
    } else {
      return JSON.parse(localStorage.getItem(WORKERS_KEY) || '[]');
    }
  },

  async saveWorker(w: Worker): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('workers')
        .upsert({
          id: w.id,
          name: w.name,
          role: w.role,
          obra: w.obra || null,
          sueldo_diario: w.sueldoDiario,
          avatar_color: w.avatarColor,
          photo: w.photo || null,
          blood_type: w.bloodType || null,
          allergies: w.allergies || null,
          diseases: w.diseases || null
        });
      if (error) throw error;
    } else {
      const list = await this.getWorkers();
      const idx = list.findIndex(item => item.id === w.id);
      if (idx !== -1) list[idx] = w;
      else list.push(w);
      localStorage.setItem(WORKERS_KEY, JSON.stringify(list));
    }
  },

  async deleteWorker(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('workers')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } else {
      const list = await this.getWorkers();
      const filtered = list.filter(item => item.id !== id);
      localStorage.setItem(WORKERS_KEY, JSON.stringify(filtered));
    }
  },

  // ==========================================
  // WEEK ATTENDANCE
  // ==========================================
  async getAttendance(): Promise<WeekAttendance[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('attendance')
        .select('*');
      if (error) throw error;
      return (data || []).map(a => ({
        workerId: a.worker_id,
        weekId: a.week_id,
        lunes: !!a.lunes,
        martes: !!a.martes,
        miercoles: !!a.miercoles,
        jueves: !!a.jueves,
        viernes: !!a.viernes,
        sabado: !!a.sabado
      }));
    } else {
      return JSON.parse(localStorage.getItem(ATTENDANCE_KEY) || '[]');
    }
  },

  async saveAttendanceRecord(a: WeekAttendance): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('attendance')
        .upsert({
          worker_id: a.workerId,
          week_id: a.weekId,
          lunes: a.lunes,
          martes: a.martes,
          miercoles: a.miercoles,
          jueves: a.jueves,
          viernes: a.viernes,
          sabado: a.sabado
        });
      if (error) throw error;
    } else {
      const list = await this.getAttendance();
      const idx = list.findIndex(item => item.workerId === a.workerId && item.weekId === a.weekId);
      if (idx !== -1) list[idx] = a;
      else list.push(a);
      localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(list));
    }
  },

  async saveAllAttendance(list: WeekAttendance[]): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      // In Supabase, upsert multiple rows at once
      const rows = list.map(a => ({
        worker_id: a.workerId,
        week_id: a.weekId,
        lunes: a.lunes,
        martes: a.martes,
        miercoles: a.miercoles,
        jueves: a.jueves,
        viernes: a.viernes,
        sabado: a.sabado
      }));
      const { error } = await supabase
        .from('attendance')
        .upsert(rows);
      if (error) throw error;
    } else {
      localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(list));
    }
  },

  // ==========================================
  // PROVEEDORES & CLIENTES
  // ==========================================
  async getProveedores(): Promise<Proveedor[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('proveedores')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return (data || []).map(p => ({
        id: p.id,
        name: p.name,
        contactName: p.contact_name || '',
        phone: p.phone || '',
        email: p.email || '',
        address: p.address || ''
      }));
    } else {
      return JSON.parse(localStorage.getItem(PROVEEDORES_KEY) || '[]');
    }
  },

  async saveProveedor(p: Proveedor): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('proveedores')
        .upsert({
          id: p.id,
          name: p.name,
          contact_name: p.contactName,
          phone: p.phone,
          email: p.email,
          address: p.address
        });
      if (error) throw error;
    } else {
      const list = await this.getProveedores();
      const idx = list.findIndex(item => item.id === p.id);
      if (idx !== -1) list[idx] = p;
      else list.push(p);
      localStorage.setItem(PROVEEDORES_KEY, JSON.stringify(list));
    }
  },

  async deleteProveedor(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('proveedores')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } else {
      const list = await this.getProveedores();
      const filtered = list.filter(item => item.id !== id);
      localStorage.setItem(PROVEEDORES_KEY, JSON.stringify(filtered));
    }
  },

  async getClientes(): Promise<Cliente[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return (data || []).map(c => ({
        id: c.id,
        name: c.name,
        contactName: c.contact_name || '',
        phone: c.phone || '',
        email: c.email || '',
        address: c.address || ''
      }));
    } else {
      return JSON.parse(localStorage.getItem(CLIENTES_KEY) || '[]');
    }
  },

  async saveCliente(c: Cliente): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('clientes')
        .upsert({
          id: c.id,
          name: c.name,
          contact_name: c.contactName,
          phone: c.phone,
          email: c.email,
          address: c.address
        });
      if (error) throw error;
    } else {
      const list = await this.getClientes();
      const idx = list.findIndex(item => item.id === c.id);
      if (idx !== -1) list[idx] = c;
      else list.push(c);
      localStorage.setItem(CLIENTES_KEY, JSON.stringify(list));
    }
  },

  async deleteCliente(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } else {
      const list = await this.getClientes();
      const filtered = list.filter(item => item.id !== id);
      localStorage.setItem(CLIENTES_KEY, JSON.stringify(filtered));
    }
  },

  // ==========================================
  // TRANSACTIONS
  // ==========================================
  async getTransactions(): Promise<FinancialTransaction[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      return (data || []).map(t => ({
        id: t.id,
        date: t.date,
        description: t.description || '',
        type: t.type as 'ingreso' | 'gasto',
        category: t.category,
        amount: Number(t.amount),
        obra: t.obra || '',
        weekId: t.week_id,
        proveedorId: t.proveedor_id || undefined,
        clienteId: t.cliente_id || undefined,
        materialName: t.material_name || undefined,
        quantity: t.quantity ? Number(t.quantity) : undefined,
        unitPrice: t.unit_price ? Number(t.unit_price) : undefined
      }));
    } else {
      return JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
    }
  },

  async saveTransaction(t: FinancialTransaction): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('transactions')
        .upsert({
          id: t.id,
          date: t.date,
          description: t.description,
          type: t.type,
          category: t.category,
          amount: t.amount,
          obra: t.obra || null,
          week_id: t.weekId,
          proveedor_id: t.proveedorId || null,
          cliente_id: t.clienteId || null,
          material_name: t.materialName || null,
          quantity: t.quantity || null,
          unit_price: t.unitPrice || null
        });
      if (error) throw error;
    } else {
      const list = await this.getTransactions();
      const idx = list.findIndex(item => item.id === t.id);
      if (idx !== -1) list[idx] = t;
      else list.push(t);
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(list));
    }
  },

  async deleteTransaction(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } else {
      const list = await this.getTransactions();
      const filtered = list.filter(item => item.id !== id);
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(filtered));
    }
  },

  async saveAllTransactions(list: FinancialTransaction[]): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const rows = list.map(t => ({
        id: t.id,
        date: t.date,
        description: t.description,
        type: t.type,
        category: t.category,
        amount: t.amount,
        obra: t.obra || null,
        week_id: t.weekId,
        proveedor_id: t.proveedorId || null,
        cliente_id: t.clienteId || null,
        material_name: t.materialName || null,
        quantity: t.quantity || null,
        unit_price: t.unitPrice || null
      }));
      const { error } = await supabase
        .from('transactions')
        .upsert(rows);
      if (error) throw error;
    } else {
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(list));
    }
  },

  // ==========================================
  // COMPANY INFO
  // ==========================================
  async getCompanyInfo(): Promise<CompanyInfo | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('company_info')
        .select('*')
        .eq('id', 1)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        name: data.name,
        subtitle: data.subtitle || ''
      };
    } else {
      const stored = localStorage.getItem(COMPANY_KEY);
      return stored ? JSON.parse(stored) : null;
    }
  },

  async saveCompanyInfo(info: CompanyInfo): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('company_info')
        .upsert({
          id: 1,
          name: info.name,
          subtitle: info.subtitle
        });
      if (error) throw error;
    } else {
      localStorage.setItem(COMPANY_KEY, JSON.stringify(info));
    }
  },

  async resetFinancialData(seedTransactions: FinancialTransaction[], defaultProveedores: Proveedor[], defaultClientes: Cliente[]): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('transactions').delete().neq('id', '');
      await supabase.from('proveedores').delete().neq('id', '');
      await supabase.from('clientes').delete().neq('id', '');
    } else {
      localStorage.removeItem(TRANSACTIONS_KEY);
      localStorage.removeItem(PROVEEDORES_KEY);
      localStorage.removeItem(CLIENTES_KEY);
    }
    
    await this.saveAllTransactions(seedTransactions);
    for (const p of defaultProveedores) {
      await this.saveProveedor(p);
    }
    for (const c of defaultClientes) {
      await this.saveCliente(c);
    }
  },

  // ==========================================
  // GENERAL RESET
  // ==========================================
  async resetAll(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      // In Supabase, delete all rows from tables
      await supabase.from('attendance').delete().neq('worker_id', '');
      await supabase.from('workers').delete().neq('id', '');
      await supabase.from('transactions').delete().neq('id', '');
      await supabase.from('obras').delete().neq('id', '');
      await supabase.from('proveedores').delete().neq('id', '');
      await supabase.from('clientes').delete().neq('id', '');
      await supabase.from('company_info').delete().eq('id', 1);
    } else {
      localStorage.removeItem(WORKERS_KEY);
      localStorage.removeItem(ATTENDANCE_KEY);
      localStorage.removeItem(OBRAS_KEY);
      localStorage.removeItem(COMPANY_KEY);
      localStorage.removeItem(PROVEEDORES_KEY);
      localStorage.removeItem(CLIENTES_KEY);
      localStorage.removeItem(TRANSACTIONS_KEY);
      localStorage.removeItem('dibersa_initialized');
    }
  }
};
