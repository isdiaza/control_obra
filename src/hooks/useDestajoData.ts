import { useState, useEffect, useCallback } from 'react';
import type { ContratoDestajo, PagoDestajo, FinancialTransaction } from '../types';
import { getWeekId } from './useAttendanceData';

const DESTAJO_KEY = 'dibersa_destajo_contratos';

// ─── Helpers ────────────────────────────────────────────────────────────────

const loadContratos = (): ContratoDestajo[] => {
  try {
    return JSON.parse(localStorage.getItem(DESTAJO_KEY) || '[]');
  } catch {
    return [];
  }
};

const persistContratos = (list: ContratoDestajo[]) => {
  localStorage.setItem(DESTAJO_KEY, JSON.stringify(list));
};

// ─── Derived calculations (pure, no state) ──────────────────────────────────

export const calcMontoContrato = (c: ContratoDestajo) =>
  c.cantidadTotal * c.precioUnitario;

export const calcMontoGanado = (c: ContratoDestajo) =>
  c.cantidadAvance * c.precioUnitario;

export const calcTotalPagado = (c: ContratoDestajo) =>
  c.pagos.reduce((sum, p) => sum + p.monto, 0);

export const calcPendientePago = (c: ContratoDestajo) =>
  Math.max(0, calcMontoGanado(c) - calcTotalPagado(c));

export const calcAvancePct = (c: ContratoDestajo) =>
  c.cantidadTotal > 0
    ? Math.min(100, (c.cantidadAvance / c.cantidadTotal) * 100)
    : 0;

// ─── Hook ───────────────────────────────────────────────────────────────────

interface UseDestajoDataReturn {
  contratos: ContratoDestajo[];
  isLoading: boolean;
  addContrato: (data: Omit<ContratoDestajo, 'id' | 'pagos'>) => ContratoDestajo;
  updateContrato: (id: string, data: Partial<Omit<ContratoDestajo, 'id' | 'pagos'>>) => void;
  deleteContrato: (id: string) => void;
  addPago: (
    contratoId: string,
    pago: Omit<PagoDestajo, 'id' | 'contratoId'>,
    onCreateTransaction: (tx: Omit<FinancialTransaction, 'id'>) => void
  ) => void;
  deletePago: (contratoId: string, pagoId: string) => void;
}

export function useDestajoData(): UseDestajoDataReturn {
  const [contratos, setContratos] = useState<ContratoDestajo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setContratos(loadContratos());
    setIsLoading(false);
  }, []);

  const addContrato = useCallback(
    (data: Omit<ContratoDestajo, 'id' | 'pagos'>): ContratoDestajo => {
      const nuevo: ContratoDestajo = {
        ...data,
        id: `d_${Date.now()}`,
        pagos: [],
      };
      setContratos(prev => {
        const next = [...prev, nuevo];
        persistContratos(next);
        return next;
      });
      return nuevo;
    },
    []
  );

  const updateContrato = useCallback(
    (id: string, data: Partial<Omit<ContratoDestajo, 'id' | 'pagos'>>) => {
      setContratos(prev => {
        const next = prev.map(c => (c.id === id ? { ...c, ...data } : c));
        persistContratos(next);
        return next;
      });
    },
    []
  );

  const deleteContrato = useCallback((id: string) => {
    setContratos(prev => {
      const next = prev.filter(c => c.id !== id);
      persistContratos(next);
      return next;
    });
  }, []);

  const addPago = useCallback(
    (
      contratoId: string,
      pagoData: Omit<PagoDestajo, 'id' | 'contratoId'>,
      onCreateTransaction: (tx: Omit<FinancialTransaction, 'id'>) => void
    ) => {
      const pago: PagoDestajo = {
        ...pagoData,
        id: `p_${Date.now()}`,
        contratoId,
      };

      setContratos(prev => {
        const contrato = prev.find(c => c.id === contratoId);
        if (!contrato) return prev;

        const next = prev.map(c =>
          c.id === contratoId ? { ...c, pagos: [...c.pagos, pago] } : c
        );
        persistContratos(next);

        // Auto-create financial transaction so this pago appears as obra expense
        onCreateTransaction({
          date: pagoData.fecha,
          description: `Destajo: ${contrato.concepto} — ${contrato.contratista}`,
          type: 'gasto',
          category: 'Destajo',
          amount: pagoData.monto,
          obra: contrato.obra,
          weekId: getWeekId(new Date(pagoData.fecha + 'T12:00:00')),
        });

        return next;
      });
    },
    []
  );

  const deletePago = useCallback((contratoId: string, pagoId: string) => {
    setContratos(prev => {
      const next = prev.map(c =>
        c.id === contratoId
          ? { ...c, pagos: c.pagos.filter(p => p.id !== pagoId) }
          : c
      );
      persistContratos(next);
      return next;
    });
  }, []);

  return {
    contratos,
    isLoading,
    addContrato,
    updateContrato,
    deleteContrato,
    addPago,
    deletePago,
  };
}
