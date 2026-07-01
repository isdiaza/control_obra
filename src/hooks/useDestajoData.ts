import { useState, useEffect, useCallback } from 'react';
import type { ContratoDestajo, PagoDestajo } from '../types';
import { dbService } from '../utils/dbService';

// ─── Derived calculations (pure, exported for use in UI) ─────────────────────

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

// ─── Hook ────────────────────────────────────────────────────────────────────

interface UseDestajoDataReturn {
  contratos: ContratoDestajo[];
  isLoading: boolean;
  addContrato: (data: Omit<ContratoDestajo, 'id' | 'pagos'>) => Promise<ContratoDestajo>;
  updateContrato: (id: string, data: Partial<Omit<ContratoDestajo, 'id' | 'pagos'>>) => Promise<void>;
  deleteContrato: (id: string) => Promise<void>;
  addPago: (
    contratoId: string,
    pago: Omit<PagoDestajo, 'id' | 'contratoId'>,
    onCreateTransaction: (
      description: string,
      type: 'ingreso' | 'gasto',
      category: string,
      amount: number,
      obra: string,
      dateString: string
    ) => void
  ) => Promise<void>;
  deletePago: (contratoId: string, pagoId: string) => Promise<void>;
}

export function useDestajoData(): UseDestajoDataReturn {
  const [contratos, setContratos] = useState<ContratoDestajo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    dbService.getDestajoContratos()
      .then(setContratos)
      .catch(() => setContratos([]))
      .finally(() => setIsLoading(false));
  }, []);

  const addContrato = useCallback(
    async (data: Omit<ContratoDestajo, 'id' | 'pagos'>): Promise<ContratoDestajo> => {
      const nuevo: ContratoDestajo = { ...data, id: `d_${Date.now()}`, pagos: [] };
      await dbService.saveDestajoContrato(nuevo);
      setContratos(prev => [...prev, nuevo]);
      return nuevo;
    },
    []
  );

  const updateContrato = useCallback(
    async (id: string, data: Partial<Omit<ContratoDestajo, 'id' | 'pagos'>>) => {
      setContratos(prev => {
        const next = prev.map(c => (c.id === id ? { ...c, ...data } : c));
        const updated = next.find(c => c.id === id);
        if (updated) dbService.saveDestajoContrato(updated).catch(console.error);
        return next;
      });
    },
    []
  );

  const deleteContrato = useCallback(async (id: string) => {
    await dbService.deleteDestajoContrato(id);
    setContratos(prev => prev.filter(c => c.id !== id));
  }, []);

  const addPago = useCallback(
    async (
      contratoId: string,
      pagoData: Omit<PagoDestajo, 'id' | 'contratoId'>,
      onCreateTransaction: (
        description: string,
        type: 'ingreso' | 'gasto',
        category: string,
        amount: number,
        obra: string,
        dateString: string
      ) => void
    ) => {
      const pago: PagoDestajo = { ...pagoData, id: `p_${Date.now()}`, contratoId };

      setContratos(prev => {
        const contrato = prev.find(c => c.id === contratoId);
        if (!contrato) return prev;

        const updated = { ...contrato, pagos: [...contrato.pagos, pago] };
        const next = prev.map(c => (c.id === contratoId ? updated : c));

        dbService.saveDestajoPago(pago).catch(console.error);
        dbService.saveDestajoContrato(updated).catch(console.error);

        onCreateTransaction(
          `Destajo: ${contrato.concepto} — ${contrato.contratista}`,
          'gasto',
          'Destajo',
          pagoData.monto,
          contrato.obra,
          pagoData.fecha
        );

        return next;
      });
    },
    []
  );

  const deletePago = useCallback(async (contratoId: string, pagoId: string) => {
    await dbService.deleteDestajoPago(pagoId);
    setContratos(prev => {
      const next = prev.map(c =>
        c.id === contratoId
          ? { ...c, pagos: c.pagos.filter(p => p.id !== pagoId) }
          : c
      );
      const updated = next.find(c => c.id === contratoId);
      if (updated) dbService.saveDestajoContrato(updated).catch(console.error);
      return next;
    });
  }, []);

  return { contratos, isLoading, addContrato, updateContrato, deleteContrato, addPago, deletePago };
}
