'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { StatsRow } from '@/components/dashboard/StatsRow';
import { ChartsPanel } from '@/components/dashboard/ChartsPanel';
import { FiltersBar } from '@/components/dashboard/FiltersBar';
import { SubscriptionTable } from '@/components/dashboard/SubscriptionTable';
import { SubscriptionModal } from '@/components/dashboard/SubscriptionModal';
import { Sparkles, LogOut, Loader2, RefreshCw } from 'lucide-react';
import { Subscription } from '@/types';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const {
    subscriptions,
    loading,
    error,
    stats,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    refresh,
  } = useSubscriptions();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedBillingCycle, setSelectedBillingCycle] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

  // List of standard categories
  const categories = [
    'Generación de Texto',
    'Generación de Imágenes',
    'Asistente de Código',
    'Desarrollo / Hosting',
    'Productividad',
    'Diseño',
    'APIs / Créditos',
    'Otros',
  ];

  const handleEditClick = (sub: Subscription) => {
    setEditingSubscription(sub);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingSubscription(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este registro de gasto?')) {
      try {
        await deleteSubscription(id);
      } catch (err) {
        console.error('Error deleting subscription:', err);
        alert('No se pudo eliminar la herramienta.');
      }
    }
  };

  const handleSaveSubscription = async (
    formData: Omit<Subscription, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (editingSubscription) {
      await updateSubscription(editingSubscription.id, formData);
    } else {
      await addSubscription(formData);
    }
  };

  // Filter Logic
  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(search.toLowerCase()) || 
      (sub.description || '').toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || sub.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || sub.status === selectedStatus;
    const matchesBillingCycle = selectedBillingCycle === 'all' || sub.billingCycle === selectedBillingCycle;

    return matchesSearch && matchesCategory && matchesStatus && matchesBillingCycle;
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-30%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/5 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/5 blur-[140px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="w-full border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 no-print">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-violet-600 to-blue-500 p-1.5 rounded-lg shadow-glow">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-violet-200 to-slate-200">
              Gastos<span className="text-violet-400">.IA</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-xs font-bold text-slate-200">{user?.fullName}</span>
              <span className="text-[10px] text-slate-500">{user?.email}</span>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-red-500/10 border border-slate-850 hover:border-red-500/25 rounded-xl text-[10px] font-bold text-slate-400 hover:text-red-400 transition-all duration-200"
              title="Cerrar Sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8 z-10 relative">
        
        {/* Title row */}
        <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-900 pb-5 no-print">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-wide">
              Panel de Suscripciones
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Monitorea y organiza los egresos mensuales en software e inteligencia artificial.
            </p>
          </div>
          <button
            onClick={refresh}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-xl text-2xs font-semibold text-slate-400 hover:text-white transition-colors"
            title="Recargar datos"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Actualizar
          </button>
        </div>

        {/* Global Loading screen */}
        {loading && subscriptions.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 gap-3 text-slate-500">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
            <span className="text-xs font-semibold">Cargando tus herramientas...</span>
          </div>
        ) : (
          <>
            {/* KPI Cards Row */}
            <StatsRow stats={stats} />

            {/* Charts Row */}
            <div className="no-print">
              <ChartsPanel subscriptions={subscriptions} categorySpend={stats.categorySpend} />
            </div>

            {/* Filters Row */}
            <FiltersBar
              search={search}
              setSearch={setSearch}
              category={selectedCategory}
              setCategory={setSelectedCategory}
              status={selectedStatus}
              setStatus={setSelectedStatus}
              billingCycle={selectedBillingCycle}
              setBillingCycle={setSelectedBillingCycle}
              onAddClick={handleAddClick}
              categories={categories}
            />

            {/* Table / Grid view */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-2xl text-xs flex items-center gap-2">
                <span>{error}</span>
              </div>
            )}
            
            <SubscriptionTable
              subscriptions={filteredSubscriptions}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteClick}
              onAddClick={handleAddClick}
            />
          </>
        )}
      </main>

      {/* Subscription Edit/Create Modal */}
      {isModalOpen && (
        <SubscriptionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveSubscription}
          subscription={editingSubscription}
          categories={categories}
        />
      )}
    </div>
  );
}
