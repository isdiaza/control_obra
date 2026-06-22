import React from 'react';
import { CreditCard, Calendar, TrendingUp, Sparkles } from 'lucide-react';

interface StatsRowProps {
  stats: {
    activeCount: number;
    totalMonthlyMXN: number;
    totalYearlyMXN: number;
    highestCategory: string;
    highestCategorySpendMXN: number;
  };
}

export const StatsRow: React.FC<StatsRowProps> = ({ stats }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      {/* Metric 1 */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-violet-500/30 transition-all duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-violet-600/5 blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
        <div className="flex flex-col gap-1 z-10">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gasto Mensual</span>
          <span className="text-2xl font-bold text-white tracking-wide mt-1">
            {formatCurrency(stats.totalMonthlyMXN)}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5">Unificado en MXN</span>
        </div>
        <div className="bg-violet-950/60 border border-violet-800/40 p-3 rounded-xl z-10 shrink-0">
          <CreditCard className="w-5 h-5 text-violet-400" />
        </div>
      </div>

      {/* Metric 2 */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-blue-600/5 blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
        <div className="flex flex-col gap-1 z-10">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Proyección Anual</span>
          <span className="text-2xl font-bold text-white tracking-wide mt-1">
            {formatCurrency(stats.totalYearlyMXN)}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5">Gasto estimado x12 meses</span>
        </div>
        <div className="bg-blue-950/60 border border-blue-800/40 p-3 rounded-xl z-10 shrink-0">
          <Calendar className="w-5 h-5 text-blue-400" />
        </div>
      </div>

      {/* Metric 3 */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-emerald-600/5 blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
        <div className="flex flex-col gap-1 z-10">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Suscripciones Activas</span>
          <span className="text-2xl font-bold text-white tracking-wide mt-1">
            {stats.activeCount}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5">Herramientas en uso actualmente</span>
        </div>
        <div className="bg-emerald-950/60 border border-emerald-800/40 p-3 rounded-xl z-10 shrink-0">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
        </div>
      </div>

      {/* Metric 4 */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-fuchsia-500/30 transition-all duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-fuchsia-600/5 blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
        <div className="flex flex-col gap-1 z-10 max-w-[65%]">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mayor Categoría</span>
          <span className="text-lg font-bold text-white truncate tracking-wide mt-1">
            {stats.highestCategory}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 truncate">
            {stats.highestCategorySpendMXN > 0 ? `${formatCurrency(stats.highestCategorySpendMXN)} / mes` : 'Sin datos'}
          </span>
        </div>
        <div className="bg-fuchsia-950/60 border border-fuchsia-800/40 p-3 rounded-xl z-10 shrink-0">
          <Sparkles className="w-5 h-5 text-fuchsia-400" />
        </div>
      </div>
    </div>
  );
};
