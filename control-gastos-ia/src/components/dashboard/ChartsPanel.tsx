import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Subscription } from '@/types';

interface ChartsPanelProps {
  subscriptions: Subscription[];
  categorySpend: Record<string, number>;
}

interface CustomTooltipPayload {
  name: string;
  value: number;
  payload: {
    cost: number;
    name?: string;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: CustomTooltipPayload[];
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(val);
};

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-xl text-xs">
        <p className="font-semibold text-slate-200">{data.name}</p>
        <p className="font-bold text-violet-400 mt-1">
          {formatCurrency(data.value || data.payload.cost)} / mes
        </p>
      </div>
    );
  }
  return null;
};

export const ChartsPanel: React.FC<ChartsPanelProps> = ({ subscriptions, categorySpend }) => {
  const activeSubs = subscriptions.filter(s => s.status === 'active');

  // 1. Data for Category Pie Chart
  const pieData = Object.entries(categorySpend)
    .map(([name, value]) => ({
      name,
      value: Math.round(value),
    }))
    .filter(d => d.value > 0);

  // 2. Data for Top Spending Bar Chart (Convert all to MXN for comparison)
  const conversionRate = 18;
  const barData = activeSubs
    .map(sub => {
      const monthlyCost = sub.billingCycle === 'yearly'
        ? sub.cost / 12
        : sub.billingCycle === 'weekly'
        ? sub.cost * 4.33
        : sub.billingCycle === 'one-time'
        ? 0
        : sub.cost;

      const monthlyCostMXN = sub.currency === 'USD' ? monthlyCost * conversionRate : monthlyCost;

      return {
        name: sub.name,
        cost: Math.round(monthlyCostMXN),
      };
    })
    .filter(d => d.cost > 0)
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 5); // top 5 most expensive tools

  // Color Palette
  const COLORS = ['#8b5cf6', '#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#14b8a6', '#f43f5e'];

  if (activeSubs.length === 0) {
    return (
      <div className="bg-slate-900/40 border border-slate-900/80 rounded-3xl p-8 text-center text-slate-500 py-16 backdrop-blur-md">
        No hay suscripciones activas registradas para mostrar estadísticas de gastos.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
      {/* Chart 1: Pie Chart for Categories */}
      <div className="bg-slate-900/40 border border-slate-900/80 rounded-3xl p-6 backdrop-blur-md flex flex-col gap-4">
        <h3 className="font-bold text-sm text-slate-200 tracking-wide border-b border-slate-800 pb-3">
          Distribución por Categoría (Mensual MXN)
        </h3>
        <div className="w-full h-[280px] flex items-center justify-center">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle" 
                  iconSize={8}
                  wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <span className="text-xs text-slate-500">Sin datos de categorías</span>
          )}
        </div>
      </div>

      {/* Chart 2: Bar Chart for Top 5 Tools */}
      <div className="bg-slate-900/40 border border-slate-900/80 rounded-3xl p-6 backdrop-blur-md flex flex-col gap-4">
        <h3 className="font-bold text-sm text-slate-200 tracking-wide border-b border-slate-800 pb-3">
          Top 5 Herramientas más Costosas (Mensual MXN)
        </h3>
        <div className="w-full h-[280px]">
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
              >
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="cost" radius={[8, 8, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-xs text-slate-500">Sin datos recurrentes</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
