export interface Worker {
  id: string;
  name: string;
  role: string;
  obra: string; // construction site, e.g., 'Torre Alfa', 'Plaza Central'
  sueldoDiario: number; // Daily rate in MXN
  avatarColor: string;
  photo?: string;
  bloodType?: string;
  allergies?: string;
  diseases?: string;
}

export interface WeekAttendance {
  workerId: string;
  weekId: string; // e.g. "2026-W25"
  lunes: boolean;
  martes: boolean;
  miercoles: boolean;
  jueves: boolean;
  viernes: boolean;
  sabado: boolean;
}

export interface ObraFilters {
  search: string;
  obra: 'Todas' | string;
  weekId: string;
}

export interface FinancialTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  type: 'ingreso' | 'gasto';
  category: string; // "Estimación Cliente", "Materiales", etc.
  amount: number;
  obra: string; // e.g. "Torre Alfa"
  weekId: string; // e.g. "2026-W25"
  proveedorId?: string;
  clienteId?: string;
  materialName?: string;
  quantity?: number;
  unitPrice?: number;
}

export interface CompanyInfo {
  name: string;
  subtitle: string;
}

export interface Obra {
  id: string;
  name: string;
  location: string;
  supervisor: string;
  budget: number;
  startDate: string;
  status: 'Activa' | 'Finalizada' | 'Pausada';
}

export interface Proveedor {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
}


export interface Cliente {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
}

export interface PagoDestajo {
  id: string;
  contratoId: string;
  fecha: string;       // YYYY-MM-DD
  monto: number;
  descripcion?: string;
}

export interface ContratoDestajo {
  id: string;
  obra: string;            // nombre de la obra
  concepto: string;        // descripcion del trabajo (ej: "Yeso en muros")
  contratista: string;     // quien ejecuta
  unidad: string;          // m2, ml, pieza, global, m3
  cantidadTotal: number;   // unidades totales contratadas
  precioUnitario: number;  // precio por unidad
  cantidadAvance: number;  // unidades completadas
  fechaInicio: string;     // YYYY-MM-DD
  status: 'Activo' | 'Completado' | 'Pausado';
  pagos: PagoDestajo[];    // historial de abonos
}
