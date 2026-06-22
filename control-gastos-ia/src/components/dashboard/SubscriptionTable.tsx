import React from 'react';
import { Pencil, Trash2, Calendar, CircleDollarSign, Plus } from 'lucide-react';
import { Subscription } from '@/types';

interface SubscriptionTableProps {
  subscriptions: Subscription[];
  onEditClick: (sub: Subscription) => void;
  onDeleteClick: (id: string) => void;
  onAddClick: () => void;
}

export const SubscriptionTable: React.FC<SubscriptionTableProps> = ({
  subscriptions,
  onEditClick,
  onDeleteClick,
  onAddClick,
}) => {
  const formatCost = (cost: number, currency: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency,
    }).format(cost);
  };

  const getStatusBadge = (status: Subscription['status']) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase tracking-wider">
            Activa
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400 uppercase tracking-wider">
            Pausada
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold bg-red-500/10 border border-red-500/20 text-red-400 uppercase tracking-wider">
            Cancelada
          </span>
        );
    }
  };

  const getCycleLabel = (cycle: Subscription['billingCycle']) => {
    switch (cycle) {
      case 'weekly':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            Semanal
          </span>
        );
      case 'monthly':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400">
            Mensual
          </span>
        );
      case 'yearly':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400">
            Anual
          </span>
        );
      case 'one-time':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold bg-slate-500/10 border border-slate-500/20 text-slate-400">
            Pago Único
          </span>
        );
    }
  };

  if (subscriptions.length === 0) {
    return (
      <div className="bg-slate-900/40 border border-slate-900/80 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4 py-20 backdrop-blur-md">
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-full text-slate-600">
          <CircleDollarSign className="w-8 h-8" />
        </div>
        <p className="font-semibold text-slate-400 text-sm">No se encontraron herramientas de IA o SaaS</p>
        <p className="text-xs text-slate-500 max-w-sm -mt-2">
          Intenta cambiar los filtros de búsqueda o agrega una nueva herramienta pulsando el botón de abajo.
        </p>
        <button
          onClick={onAddClick}
          className="mt-2 flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold rounded-xl text-xs shadow-md hover:shadow-violet-600/10 transition-all duration-300"
        >
          <Plus className="w-3.5 h-3.5" />
          Registrar Primera Suscripción
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/40 border border-slate-900/80 rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl">
      {/* Desktop Table View */}
      <div className="hidden md:block w-full overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800/85">
              <th className="p-4 pl-6 text-slate-400 font-semibold tracking-wider uppercase">Herramienta</th>
              <th className="p-4 text-slate-400 font-semibold tracking-wider uppercase">Categoría</th>
              <th className="p-4 text-slate-400 font-semibold tracking-wider uppercase">Costo</th>
              <th className="p-4 text-slate-400 font-semibold tracking-wider uppercase">Ciclo</th>
              <th className="p-4 text-slate-400 font-semibold tracking-wider uppercase">Estado</th>
              <th className="p-4 text-slate-400 font-semibold tracking-wider uppercase">Próximo Pago</th>
              <th className="p-4 pr-6 text-center text-slate-400 font-semibold tracking-wider uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {subscriptions.map(sub => (
              <tr key={sub.id} className="hover:bg-slate-900/20 transition-colors">
                {/* Tool Name */}
                <td className="p-4 pl-6">
                  <div className="flex flex-col gap-0.5 max-w-[200px]">
                    <span className="font-bold text-slate-200 text-sm">{sub.name}</span>
                    {sub.description && (
                      <span className="text-slate-500 text-3xs truncate" title={sub.description}>
                        {sub.description}
                      </span>
                    )}
                  </div>
                </td>
                {/* Category */}
                <td className="p-4">
                  <span className="font-semibold text-slate-300">{sub.category}</span>
                </td>
                {/* Cost */}
                <td className="p-4 font-mono font-bold text-slate-200 text-sm">
                  {formatCost(sub.cost, sub.currency)}
                </td>
                {/* Billing Cycle */}
                <td className="p-4">{getCycleLabel(sub.billingCycle)}</td>
                {/* Status */}
                <td className="p-4">{getStatusBadge(sub.status)}</td>
                {/* Next Payment */}
                <td className="p-4 text-slate-400 font-medium">
                  {sub.status === 'active' && sub.nextBillingDate ? (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{sub.nextBillingDate}</span>
                    </div>
                  ) : (
                    <span className="text-slate-600">-</span>
                  )}
                </td>
                {/* Actions */}
                <td className="p-4 pr-6">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => onEditClick(sub)}
                      className="p-1.5 hover:bg-slate-800 border border-transparent hover:border-slate-700 text-slate-400 hover:text-white rounded-lg transition-all"
                      title="Editar"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteClick(sub.id)}
                      className="p-1.5 hover:bg-red-500/10 border border-transparent hover:border-red-500/25 text-slate-400 hover:text-red-400 rounded-lg transition-all"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden grid grid-cols-1 divide-y divide-slate-800/80">
        {subscriptions.map(sub => (
          <div key={sub.id} className="p-5 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1 max-w-[70%]">
                <span className="font-bold text-slate-200 text-base">{sub.name}</span>
                <span className="text-slate-400 text-[10px] font-semibold">{sub.category}</span>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className="font-mono font-bold text-slate-100 text-base">
                  {formatCost(sub.cost, sub.currency)}
                </span>
                <div className="flex gap-1.5">
                  {getCycleLabel(sub.billingCycle)}
                  {getStatusBadge(sub.status)}
                </div>
              </div>
            </div>

            {sub.description && (
              <p className="text-slate-500 text-2xs leading-relaxed border-l-2 border-slate-800 pl-2">
                {sub.description}
              </p>
            )}

            <div className="flex items-center justify-between border-t border-slate-800/40 pt-3 mt-1 text-[10px] text-slate-400">
              <div>
                {sub.status === 'active' && sub.nextBillingDate ? (
                  <span>Próximo pago: <strong>{sub.nextBillingDate}</strong></span>
                ) : (
                  <span>Fecha de inicio: <strong>{sub.startedAt || '-'}</strong></span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => onEditClick(sub)}
                  className="flex items-center gap-1 py-1 px-2.5 bg-slate-800/60 hover:bg-slate-850 rounded-lg text-slate-300 font-semibold"
                >
                  <Pencil className="w-3 h-3" />
                  Editar
                </button>
                <button
                  onClick={() => onDeleteClick(sub.id)}
                  className="flex items-center gap-1 py-1 px-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 rounded-lg text-red-400 font-semibold"
                >
                  <Trash2 className="w-3 h-3" />
                  Borrar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
