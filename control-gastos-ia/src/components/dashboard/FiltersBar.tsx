import React from 'react';
import { Search, Filter, Plus, RotateCcw } from 'lucide-react';

interface FiltersBarProps {
  search: string;
  setSearch: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
  billingCycle: string;
  setBillingCycle: (val: string) => void;
  onAddClick: () => void;
  categories: string[];
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  search,
  setSearch,
  category,
  setCategory,
  status,
  setStatus,
  billingCycle,
  setBillingCycle,
  onAddClick,
  categories,
}) => {
  const isFiltered = search !== '' || category !== 'all' || status !== 'all' || billingCycle !== 'all';

  const resetFilters = () => {
    setSearch('');
    setCategory('all');
    setStatus('all');
    setBillingCycle('all');
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/30 border border-slate-900/60 p-4 rounded-2xl backdrop-blur-md w-full">
      {/* Filters Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full md:w-auto md:flex-1 max-w-4xl">
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar herramienta..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950/60 border border-slate-800 focus:border-violet-500 rounded-xl text-xs text-white outline-none placeholder:text-slate-600 transition-colors"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Category */}
        <div className="relative">
          <select
            className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 focus:border-violet-500 rounded-xl text-xs text-slate-300 outline-none appearance-none cursor-pointer"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option value="all">Todas las Categorías</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
        </div>

        {/* Status */}
        <div className="relative">
          <select
            className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 focus:border-violet-500 rounded-xl text-xs text-slate-300 outline-none appearance-none cursor-pointer"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            <option value="all">Todos los Estados</option>
            <option value="active">Activa</option>
            <option value="paused">Pausada</option>
            <option value="cancelled">Cancelada</option>
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
        </div>

        {/* Billing Cycle */}
        <div className="relative">
          <select
            className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 focus:border-violet-500 rounded-xl text-xs text-slate-300 outline-none appearance-none cursor-pointer"
            value={billingCycle}
            onChange={e => setBillingCycle(e.target.value)}
          >
            <option value="all">Todos los Ciclos</option>
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensual</option>
            <option value="yearly">Anual</option>
            <option value="one-time">Un solo pago</option>
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
        </div>

      </div>

      {/* Buttons */}
      <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-end">
        {isFiltered && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs text-slate-300 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpiar
          </button>
        )}
        <button
          onClick={onAddClick}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold rounded-xl text-xs shadow-md hover:shadow-violet-600/10 transition-all duration-300 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Agregar Herramienta
        </button>
      </div>
    </div>
  );
};
