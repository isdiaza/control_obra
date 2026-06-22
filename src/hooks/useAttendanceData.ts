import { useState, useEffect, useMemo } from 'react';
import type { Worker, WeekAttendance, ObraFilters, CompanyInfo, Obra } from '../types';

const DEFAULT_WORKERS: Worker[] = [
  { id: 'w_1', name: 'Israel Flores', role: 'Maestro de Obra', obra: 'Torre Alfa', sueldoDiario: 650, avatarColor: '#8B5CF6' },
  { id: 'w_2', name: 'Sofía Gómez', role: 'Albañil Oficial', obra: 'Torre Alfa', sueldoDiario: 500, avatarColor: '#EC4899' },
  { id: 'w_3', name: 'Carlos Pérez', role: 'Ayudante General', obra: 'Torre Alfa', sueldoDiario: 350, avatarColor: '#3B82F6' },
  { id: 'w_4', name: 'Ana Martínez', role: 'Albañil Oficial', obra: 'Residencial Campestre', sueldoDiario: 500, avatarColor: '#10B981' },
  { id: 'w_5', name: 'Luis Rodríguez', role: 'Ayudante General', obra: 'Residencial Campestre', sueldoDiario: 350, avatarColor: '#F59E0B' },
  { id: 'w_6', name: 'Elena Sánchez', role: 'Fierrero Oficial', obra: 'Plaza Central', sueldoDiario: 520, avatarColor: '#14B8A6' },
  { id: 'w_7', name: 'Roberto Gómez', role: 'Ayudante General', obra: 'Plaza Central', sueldoDiario: 350, avatarColor: '#EF4444' },
];

const COLORS = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#14B8A6', '#EF4444', '#6366F1'];

const DEFAULT_COMPANY_INFO: CompanyInfo = {
  name: 'DIBERSA',
  subtitle: 'Construcción y Urbanización'
};

const DEFAULT_OBRAS: Obra[] = [
  { id: 'o_1', name: 'Torre Alfa', location: 'Av. Reforma 405', supervisor: 'Ing. Israel Flores', budget: 150000, startDate: '2026-01-15', status: 'Activa' },
  { id: 'o_2', name: 'Residencial Campestre', location: 'Valle Alto Sector 3', supervisor: 'Ing. Luis Rodríguez', budget: 220000, startDate: '2026-03-10', status: 'Activa' },
  { id: 'o_3', name: 'Plaza Central', location: 'Centro Histórico Lote 12', supervisor: 'Arq. Elena Sánchez', budget: 350000, startDate: '2026-05-01', status: 'Activa' },
];

// Helper to get week number and year from a Date object
export const getWeekId = (date: Date): string => {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7; // Monday is 0, Sunday is 6
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  const weekNum = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return `${target.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
};

// Get start and end date for a given week ID (format YYYY-Www), Monday to Saturday
export const getWeekDatesRange = (weekId: string): { start: Date; end: Date } => {
  try {
    const [yearPart, weekPart] = weekId.split('-W');
    const year = parseInt(yearPart);
    const week = parseInt(weekPart);

    // Get Jan 4th of that year
    const jan4 = new Date(year, 0, 4);
    // Find the Monday of that week
    const dayOffset = jan4.getDay() === 0 ? 6 : jan4.getDay() - 1;
    const monday = new Date(jan4.getTime() - dayOffset * 24 * 3600 * 1000);
    // Add weeks
    monday.setTime(monday.getTime() + (week - 1) * 7 * 24 * 3600 * 1000);
    
    // Saturday is Monday + 5 days
    const saturday = new Date(monday);
    saturday.setDate(monday.getDate() + 5);

    return { start: monday, end: saturday };
  } catch {
    // Fallback to current week
    const now = new Date();
    const day = now.getDay() || 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - day + 1);
    const saturday = new Date(monday);
    saturday.setDate(monday.getDate() + 5);
    return { start: monday, end: saturday };
  }
};

// Formats dates to "15 Jun - 20 Jun 2026"
export const formatWeekDatesText = (weekId: string): string => {
  const { start, end } = getWeekDatesRange(weekId);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  
  const startDay = start.getDate();
  const startMonth = months[start.getMonth()];
  
  const endDay = end.getDate();
  const endMonth = months[end.getMonth()];
  const year = end.getFullYear();

  if (start.getMonth() === end.getMonth()) {
    return `${startDay} - ${endDay} ${startMonth}, ${year}`;
  } else {
    return `${startDay} ${startMonth} - ${endDay} ${endMonth}, ${year}`;
  }
};

/**
 * Returns all unique weekIds whose Monday-to-Saturday range overlaps
 * with the given calendar month (0-indexed month of a given year).
 */
export const getWeeksInMonth = (year: number, month: number): string[] => {
  const weeks: Set<string> = new Set();
  // Iterate day by day through the month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day, 12, 0, 0);
    weeks.add(getWeekId(d));
  }
  return Array.from(weeks).sort();
};

/**
 * Returns all unique weekIds whose Monday-to-Saturday range overlaps
 * with the given calendar year.
 */
export const getWeeksInYear = (year: number): string[] => {
  const weeks: Set<string> = new Set();
  for (let month = 0; month < 12; month++) {
    getWeeksInMonth(year, month).forEach(w => weeks.add(w));
  }
  return Array.from(weeks).sort();
};

export const useAttendanceData = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [attendance, setAttendance] = useState<WeekAttendance[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(DEFAULT_COMPANY_INFO);
  const [obras, setObras] = useState<Obra[]>([]);
  
  // Start filter on current week
  const currentWeek = useMemo(() => getWeekId(new Date('2026-06-17T12:00:00')), []);

  const [filters, setFilters] = useState<ObraFilters>({
    search: '',
    obra: 'Todas',
    weekId: currentWeek,
  });

  // Load / Initialize database
  useEffect(() => {
    const isInitialized = localStorage.getItem('dibersa_initialized') === 'true';

    let finalWorkers: Worker[] = [];
    let finalAttendance: WeekAttendance[] = [];
    let finalObras: Obra[] = [];

    if (!isInitialized) {
      finalWorkers = [...DEFAULT_WORKERS];
      finalObras = [...DEFAULT_OBRAS];
      const mockGrid: WeekAttendance[] = [];
      const weeks = ['2026-W24', '2026-W25'];

      weeks.forEach((wkId) => {
        finalWorkers.forEach((w) => {
          if (wkId === '2026-W24') {
            mockGrid.push({
              workerId: w.id,
              weekId: wkId,
              lunes: Math.random() > 0.05,
              martes: Math.random() > 0.05,
              miercoles: Math.random() > 0.05,
              jueves: Math.random() > 0.05,
              viernes: Math.random() > 0.05,
              sabado: Math.random() > 0.1,
            });
          } else {
            mockGrid.push({
              workerId: w.id,
              weekId: wkId,
              lunes: Math.random() > 0.05,
              martes: Math.random() > 0.05,
              miercoles: Math.random() > 0.1,
              jueves: false,
              viernes: false,
              sabado: false,
            });
          }
        });
      });

      finalAttendance = mockGrid;
      localStorage.setItem('dibersa_workers_obra', JSON.stringify(finalWorkers));
      localStorage.setItem('dibersa_attendance_grid', JSON.stringify(finalAttendance));
      localStorage.setItem('dibersa_obras_catalogue', JSON.stringify(finalObras));
      localStorage.setItem('dibersa_company_info', JSON.stringify(DEFAULT_COMPANY_INFO));
      localStorage.setItem('dibersa_initialized', 'true');
      setCompanyInfo(DEFAULT_COMPANY_INFO);
    } else {
      const storedWorkers = localStorage.getItem('dibersa_workers_obra');
      const storedAttendance = localStorage.getItem('dibersa_attendance_grid');
      const storedObras = localStorage.getItem('dibersa_obras_catalogue');
      const storedCompany = localStorage.getItem('dibersa_company_info');
      
      finalWorkers = storedWorkers ? JSON.parse(storedWorkers) : [];
      finalAttendance = storedAttendance ? JSON.parse(storedAttendance) : [];
      finalObras = storedObras ? JSON.parse(storedObras) : [];
      
      if (storedCompany) {
        setCompanyInfo(JSON.parse(storedCompany));
      } else {
        localStorage.setItem('dibersa_company_info', JSON.stringify(DEFAULT_COMPANY_INFO));
        setCompanyInfo(DEFAULT_COMPANY_INFO);
      }
    }

    // Auto-sync/migration: Register any Obra name referenced in workers or transactions that is missing from the catalogue
    const referencedObraNames = new Set<string>();
    finalWorkers.forEach(w => {
      if (w.obra) referencedObraNames.add(w.obra);
    });

    const storedTxs = localStorage.getItem('dibersa_financial_transactions');
    if (storedTxs) {
      try {
        const txs = JSON.parse(storedTxs);
        if (Array.isArray(txs)) {
          txs.forEach((t: any) => {
            if (t.obra) referencedObraNames.add(t.obra);
          });
        }
      } catch (e) {
        console.error("Error parsing transactions for migration", e);
      }
    }

    let modifiedObras = false;
    referencedObraNames.forEach(name => {
      const exists = finalObras.some(o => o.name === name);
      if (!exists) {
        // If it's a default obra, populate with default info, otherwise placeholder
        const defaultMatch = DEFAULT_OBRAS.find(def => def.name === name);
        if (defaultMatch) {
          finalObras.push({ ...defaultMatch });
        } else {
          finalObras.push({
            id: `o_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            name: name,
            location: 'Dirección por definir',
            supervisor: 'Por asignar',
            budget: 0,
            startDate: new Date().toISOString().split('T')[0],
            status: 'Activa'
          });
        }
        modifiedObras = true;
      }
    });

    if (modifiedObras) {
      localStorage.setItem('dibersa_obras_catalogue', JSON.stringify(finalObras));
    }

    setWorkers(finalWorkers);
    setAttendance(finalAttendance);
    setObras(finalObras);
  }, []);

  const saveState = (updatedWorkers: Worker[], updatedAttendance: WeekAttendance[]) => {
    setWorkers(updatedWorkers);
    setAttendance(updatedAttendance);
    localStorage.setItem('dibersa_workers_obra', JSON.stringify(updatedWorkers));
    localStorage.setItem('dibersa_attendance_grid', JSON.stringify(updatedAttendance));
  };

  // Toggle single attendance day
  const toggleAttendance = (workerId: string, weekId: string, day: 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado') => {
    const updated = [...attendance];
    const idx = updated.findIndex(a => a.workerId === workerId && a.weekId === weekId);

    if (idx !== -1) {
      updated[idx] = {
        ...updated[idx],
        [day]: !updated[idx][day]
      };
    } else {
      // Create new attendance record for this worker/week if it didn't exist
      const newRecord: WeekAttendance = {
        workerId,
        weekId,
        lunes: false,
        martes: false,
        miercoles: false,
        jueves: false,
        viernes: false,
        sabado: false,
        [day]: true
      };
      updated.push(newRecord);
    }
    saveState(workers, updated);
  };

  // Toggle all days for a worker (present/absent)
  const toggleAllDays = (workerId: string, weekId: string, present: boolean) => {
    const updated = [...attendance];
    const idx = updated.findIndex(a => a.workerId === workerId && a.weekId === weekId);

    if (idx !== -1) {
      updated[idx] = {
        workerId,
        weekId,
        lunes: present,
        martes: present,
        miercoles: present,
        jueves: present,
        viernes: present,
        sabado: present,
      };
    } else {
      updated.push({
        workerId,
        weekId,
        lunes: present,
        martes: present,
        miercoles: present,
        jueves: present,
        viernes: present,
        sabado: present,
      });
    }
    saveState(workers, updated);
  };

  // Add Worker
  const addWorker = (name: string, role: string, obra: string, sueldoDiario: number) => {
    const id = `w_${Date.now()}`;
    const avatarColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const newWorker: Worker = {
      id,
      name,
      role,
      obra,
      sueldoDiario,
      avatarColor,
    };

    const updatedWorkers = [...workers, newWorker];

    // Initialize attendance entries for existing weeks
    const uniqueWeeks = Array.from(new Set(attendance.map(a => a.weekId)));
    if (uniqueWeeks.length === 0) uniqueWeeks.push(filters.weekId);

    const updatedAttendance = [...attendance];
    uniqueWeeks.forEach(wk => {
      updatedAttendance.push({
        workerId: id,
        weekId: wk,
        lunes: false,
        martes: false,
        miercoles: false,
        jueves: false,
        viernes: false,
        sabado: false,
      });
    });

    saveState(updatedWorkers, updatedAttendance);
  };

  // Delete Worker
  const deleteWorker = (id: string) => {
    const updatedWorkers = workers.filter(w => w.id !== id);
    const updatedAttendance = attendance.filter(a => a.workerId !== id);
    saveState(updatedWorkers, updatedAttendance);
  };

  // Update Worker details
  const updateWorker = (
    id: string,
    name: string,
    role: string,
    obra: string,
    sueldoDiario: number,
    photo?: string,
    bloodType?: string,
    allergies?: string,
    diseases?: string
  ) => {
    const updatedWorkers = workers.map(w => {
      if (w.id === id) {
        return {
          ...w,
          name,
          role,
          obra,
          sueldoDiario,
          ...(photo !== undefined ? { photo } : {}),
          ...(bloodType !== undefined ? { bloodType } : {}),
          ...(allergies !== undefined ? { allergies } : {}),
          ...(diseases !== undefined ? { diseases } : {})
        };
      }
      return w;
    });
    saveState(updatedWorkers, attendance);
  };

  const updateCompanyInfo = (newInfo: CompanyInfo) => {
    setCompanyInfo(newInfo);
    localStorage.setItem('dibersa_company_info', JSON.stringify(newInfo));
  };

  const saveObrasState = (updatedObras: Obra[]) => {
    setObras(updatedObras);
    localStorage.setItem('dibersa_obras_catalogue', JSON.stringify(updatedObras));
  };

  const addObra = (name: string, location: string, supervisor: string, budget: number, startDate: string, status: 'Activa' | 'Finalizada' | 'Pausada') => {
    const id = `o_${Date.now()}`;
    const newObra: Obra = { id, name, location, supervisor, budget, startDate, status };
    const updated = [...obras, newObra];
    saveObrasState(updated);
  };

  const updateObra = (id: string, name: string, location: string, supervisor: string, budget: number, startDate: string, status: 'Activa' | 'Finalizada' | 'Pausada') => {
    const updated = obras.map(o => o.id === id ? { id, name, location, supervisor, budget, startDate, status } : o);
    
    // Cascading update of Obra Name
    const oldObra = obras.find(o => o.id === id);
    if (oldObra && oldObra.name !== name) {
      const updatedWorkers = workers.map(w => w.obra === oldObra.name ? { ...w, obra: name } : w);
      saveState(updatedWorkers, attendance);
      
      const storedTxs = localStorage.getItem('dibersa_financial_transactions');
      if (storedTxs) {
        const txs = JSON.parse(storedTxs);
        const updatedTxs = txs.map((t: any) => t.obra === oldObra.name ? { ...t, obra: name } : t);
        localStorage.setItem('dibersa_financial_transactions', JSON.stringify(updatedTxs));
      }
    }
    
    saveObrasState(updated);
  };

  const deleteObra = (id: string) => {
    const obra = obras.find(o => o.id === id);
    if (!obra) return;
    
    const hasWorkers = workers.some(w => w.obra === obra.name);
    if (hasWorkers) {
      alert(`No se puede eliminar la obra "${obra.name}" porque tiene colaboradores asignados. Transfiérelos a otra obra primero.`);
      return;
    }
    
    const storedTxs = localStorage.getItem('dibersa_financial_transactions');
    if (storedTxs) {
      const txs = JSON.parse(storedTxs);
      const hasTxs = txs.some((t: any) => t.obra === obra.name);
      if (hasTxs) {
        alert(`No se puede eliminar la obra "${obra.name}" porque tiene movimientos financieros registrados en el Control Financiero.`);
        return;
      }
    }
    
    const updated = obras.filter(o => o.id !== id);
    saveObrasState(updated);
  };

  // Reset Simulation Data (restore mock seed data)
  const resetAllData = () => {
    localStorage.removeItem('dibersa_workers_obra');
    localStorage.removeItem('dibersa_attendance_grid');
    localStorage.removeItem('dibersa_financial_transactions');
    localStorage.removeItem('dibersa_obras_catalogue');
    localStorage.removeItem('dibersa_proveedores_catalogue');
    localStorage.removeItem('dibersa_company_info');
    localStorage.removeItem('dibersa_initialized');
    window.location.reload();
  };

  // Clear all data to leave database completely empty
  const clearAllData = () => {
    localStorage.setItem('dibersa_workers_obra', '[]');
    localStorage.setItem('dibersa_attendance_grid', '[]');
    localStorage.setItem('dibersa_financial_transactions', '[]');
    localStorage.setItem('dibersa_obras_catalogue', '[]');
    localStorage.setItem('dibersa_proveedores_catalogue', '[]');
    localStorage.setItem('dibersa_company_info', JSON.stringify(DEFAULT_COMPANY_INFO));
    localStorage.setItem('dibersa_initialized', 'true');
    window.location.reload();
  };

  // Unique Obras list extracted from the official catalogue
  const uniqueObras = useMemo(() => {
    return obras.map(o => o.name).sort();
  }, [obras]);

  // Navigate between weeks
  const navigateWeek = (offset: number) => {
    const { start } = getWeekDatesRange(filters.weekId);
    // Add or subtract days
    const targetDate = new Date(start);
    targetDate.setDate(start.getDate() + (offset * 7) + 2); // target mid-week
    const newWeekId = getWeekId(targetDate);
    setFilters(prev => ({ ...prev, weekId: newWeekId }));
  };

  // Process payroll worksheet data with calculations
  const worksheetData = useMemo(() => {
    return workers
      .filter(w => {
        // Filter by construction site
        if (filters.obra !== 'Todas' && w.obra !== filters.obra) return false;
        // Search by name
        if (filters.search && !w.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
        return true;
      })
      .map(w => {
        // Find attendance record for active week
        let att = attendance.find(a => a.workerId === w.id && a.weekId === filters.weekId);
        
        if (!att) {
          // Fallback empty record
          att = {
            workerId: w.id,
            weekId: filters.weekId,
            lunes: false,
            martes: false,
            miercoles: false,
            jueves: false,
            viernes: false,
            sabado: false,
          };
        }

        // Count days present
        let daysAttended = 0;
        if (att.lunes) daysAttended++;
        if (att.martes) daysAttended++;
        if (att.miercoles) daysAttended++;
        if (att.jueves) daysAttended++;
        if (att.viernes) daysAttended++;
        if (att.sabado) daysAttended++;

        const pagoSemanal = daysAttended * w.sueldoDiario;

        return {
          worker: w,
          attendance: att,
          daysAttended,
          pagoSemanal,
        };
      });
  }, [workers, attendance, filters]);

  // Overall active week statistics (based on active obra filter)
  const activeStats = useMemo(() => {
    const activeRows = worksheetData;
    const totalWorkers = activeRows.length;
    
    // Total payroll
    const totalPayroll = activeRows.reduce((sum, r) => sum + r.pagoSemanal, 0);

    // General attendance rate for the week
    let totalPossibleDays = totalWorkers * 6; // 6 days a week
    let totalAttendedDays = activeRows.reduce((sum, r) => sum + r.daysAttended, 0);

    const attendanceRate = totalPossibleDays > 0 
      ? Math.round((totalAttendedDays / totalPossibleDays) * 100) 
      : 100;

    // Daily attendance rates for the active week
    const dailyCounts = { lunes: 0, martes: 0, miercoles: 0, jueves: 0, viernes: 0, sabado: 0 };
    activeRows.forEach(r => {
      if (r.attendance.lunes) dailyCounts.lunes++;
      if (r.attendance.martes) dailyCounts.martes++;
      if (r.attendance.miercoles) dailyCounts.miercoles++;
      if (r.attendance.jueves) dailyCounts.jueves++;
      if (r.attendance.viernes) dailyCounts.viernes++;
      if (r.attendance.sabado) dailyCounts.sabado++;
    });

    return {
      totalWorkers,
      totalPayroll,
      attendanceRate,
      dailyCounts,
    };
  }, [worksheetData]);

  // Historical Payroll summary (for Recharts)
  const historicalPayrollData = useMemo(() => {
    const weeks = Array.from(new Set(attendance.map(a => a.weekId))).sort();
    
    return weeks.map(wk => {
      let payrollTotal = 0;
      let presentCount = 0;
      let totalDaysPossible = 0;

      workers.forEach(w => {
        const att = attendance.find(a => a.workerId === w.id && a.weekId === wk);
        if (att) {
          let days = 0;
          if (att.lunes) days++;
          if (att.martes) days++;
          if (att.miercoles) days++;
          if (att.jueves) days++;
          if (att.viernes) days++;
          if (att.sabado) days++;

          payrollTotal += days * w.sueldoDiario;
          presentCount += days;
          totalDaysPossible += 6;
        }
      });

      const attendanceRate = totalDaysPossible > 0 ? Math.round((presentCount / totalDaysPossible) * 100) : 100;

      return {
        weekId: wk,
        weekLabel: wk.replace('2026-W', 'Semana '),
        'Nómina Total': payrollTotal,
        'Asistencia %': attendanceRate,
      };
    });
  }, [workers, attendance]);

  return {
    workers,
    attendance,
    companyInfo,
    obras,
    filters,
    setFilters,
    uniqueObras,
    worksheetData,
    stats: activeStats,
    historicalData: historicalPayrollData,
    toggleAttendance,
    toggleAllDays,
    addWorker,
    deleteWorker,
    updateWorker,
    updateCompanyInfo,
    addObra,
    updateObra,
    deleteObra,
    resetAllData,
    clearAllData,
    navigateWeek,
  };
};
