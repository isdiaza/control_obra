import React, { useState } from 'react';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import { Subscription } from '@/types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Subscription, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  subscription?: Subscription | null;
  categories: string[];
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  subscription,
  categories,
}) => {
  const [name, setName] = useState(subscription?.name || '');
  const [category, setCategory] = useState(
    subscription
      ? (categories.includes(subscription.category) ? subscription.category : 'custom')
      : 'Generación de Texto'
  );
  const [customCategory, setCustomCategory] = useState(
    subscription && !categories.includes(subscription.category) ? subscription.category : ''
  );
  const [showCustomCategory, setShowCustomCategory] = useState(
    subscription ? !categories.includes(subscription.category) : false
  );
  const [cost, setCost] = useState<string | number>(
    subscription?.cost !== undefined ? subscription.cost : ''
  );
  const [currency, setCurrency] = useState(subscription?.currency || 'USD');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly' | 'weekly' | 'one-time'>(
    subscription?.billingCycle || 'monthly'
  );
  const [status, setStatus] = useState<'active' | 'paused' | 'cancelled'>(
    subscription?.status || 'active'
  );
  const [startedAt, setStartedAt] = useState(
    subscription?.startedAt || new Date().toISOString().split('T')[0]
  );
  const [nextBillingDate, setNextBillingDate] = useState(subscription?.nextBillingDate || '');
  const [description, setDescription] = useState(subscription?.description || '');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    if (val === 'custom') {
      setShowCustomCategory(true);
    } else {
      setShowCustomCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    const finalName = name.trim();
    const finalCategory = showCustomCategory ? customCategory.trim() : category;
    const finalCost = parseFloat(cost.toString());

    if (!finalName) {
      setErr('El nombre de la herramienta es requerido.');
      return;
    }
    if (!finalCategory) {
      setErr('La categoría es requerida.');
      return;
    }
    if (isNaN(finalCost) || finalCost < 0) {
      setErr('El costo debe ser un número mayor o igual a 0.');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        name: finalName,
        category: finalCategory,
        cost: finalCost,
        currency,
        billingCycle,
        status,
        startedAt: startedAt || undefined,
        nextBillingDate: nextBillingDate || undefined,
        description: description.trim() || undefined,
      });
      onClose();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Error al guardar los datos.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in no-print">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="bg-violet-950 border border-violet-800/40 p-2 rounded-xl">
              <Sparkles className="w-4 h-4 text-violet-400" />
            </div>
            <h3 className="font-bold text-base text-white tracking-wide">
              {subscription ? 'Editar Herramienta' : 'Agregar Nueva Herramienta'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification */}
        {err && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{err}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-300">Nombre de la Herramienta</label>
            <input
              type="text"
              placeholder="Ej: ChatGPT Plus, GitHub Copilot"
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-violet-500 rounded-xl py-3 px-4 text-slate-100 outline-none transition-colors"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-300">Categoría</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-violet-500 rounded-xl py-3 px-4 text-slate-100 outline-none cursor-pointer"
                value={category}
                onChange={e => handleCategoryChange(e.target.value)}
                disabled={loading}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="custom">+ Categoría personalizada</option>
              </select>

              {showCustomCategory && (
                <input
                  type="text"
                  placeholder="Ej: Análisis de Datos"
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-violet-500 rounded-xl py-3 px-4 text-slate-100 outline-none transition-colors"
                  value={customCategory}
                  onChange={e => setCustomCategory(e.target.value)}
                  disabled={loading}
                />
              )}
            </div>
          </div>

          {/* Cost & Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-300">Costo</label>
              <input
                type="number"
                step="0.01"
                placeholder="20.00"
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-violet-500 rounded-xl py-3 px-4 text-slate-100 outline-none transition-colors"
                value={cost}
                onChange={e => setCost(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-300">Divisa</label>
              <select
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-violet-500 rounded-xl py-3 px-4 text-slate-100 outline-none cursor-pointer"
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                disabled={loading}
              >
                <option value="USD">USD ($)</option>
                <option value="MXN">MXN ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>

          {/* Billing Cycle & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-300">Ciclo de Facturación</label>
              <select
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-violet-500 rounded-xl py-3 px-4 text-slate-100 outline-none cursor-pointer"
                value={billingCycle}
                onChange={e => setBillingCycle(e.target.value as 'monthly' | 'yearly' | 'weekly' | 'one-time')}
                disabled={loading}
              >
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
                <option value="yearly">Anual</option>
                <option value="one-time">Pago único</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-300">Estado</label>
              <select
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-violet-500 rounded-xl py-3 px-4 text-slate-100 outline-none cursor-pointer"
                value={status}
                onChange={e => setStatus(e.target.value as 'active' | 'paused' | 'cancelled')}
                disabled={loading}
              >
                <option value="active">Activa</option>
                <option value="paused">Pausada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>
          </div>

          {/* Started At & Next Billing Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-300">Fecha de Inicio</label>
              <input
                type="date"
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-violet-500 rounded-xl py-3 px-4 text-slate-100 outline-none transition-colors"
                value={startedAt}
                onChange={e => setStartedAt(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-300">Siguiente Pago (Opcional)</label>
              <input
                type="date"
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-violet-500 rounded-xl py-3 px-4 text-slate-100 outline-none transition-colors"
                value={nextBillingDate}
                onChange={e => setNextBillingDate(e.target.value)}
                disabled={loading || billingCycle === 'one-time' || status !== 'active'}
              />
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-300">Descripción / Notas</label>
            <textarea
              placeholder="Detalles sobre el uso de la herramienta o términos de licencia."
              rows={3}
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-violet-500 rounded-xl py-3 px-4 text-slate-100 outline-none transition-colors resize-none"
              value={description}
              onChange={e => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 border-t border-slate-800 pt-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-xl font-semibold text-slate-400 hover:text-white transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-md hover:shadow-violet-600/10 transition-all duration-300"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
