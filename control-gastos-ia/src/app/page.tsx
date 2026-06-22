'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, BarChart3, ShieldCheck, Coins, CreditCard, ArrowRight } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 overflow-hidden relative selection:bg-violet-500/30">
      {/* Background decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-10 relative">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-violet-600 to-blue-500 p-2 rounded-xl shadow-glow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-violet-200 to-slate-200">
            Gastos<span className="text-violet-400">.IA</span>
          </span>
        </div>
        <nav className="flex items-center gap-4">
          {loading ? (
            <div className="h-9 w-20 bg-slate-800 animate-pulse rounded-lg" />
          ) : user ? (
            <Link
              href="/dashboard"
              className="bg-violet-600 hover:bg-violet-500 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-violet-600/20 flex items-center gap-1.5"
            >
              Ir al Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-slate-300 hover:text-white text-sm font-semibold transition-colors px-3 py-2">
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-violet-500/10"
              >
                Registrarse
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto px-6 text-center z-10 relative py-12 md:py-24">
        {/* Banner Announcement */}
        <div className="inline-flex items-center gap-1.5 bg-violet-950/40 border border-violet-800/40 px-3.5 py-1.5 rounded-full text-xs font-semibold text-violet-300 mb-8 animate-fade-in backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Controla tu presupuesto SaaS en un solo lugar</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-4xl leading-[1.1] bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
          Toma el control de tus suscripciones de <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-blue-400">Software e Inteligencia Artificial</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed">
          Centraliza tus gastos en OpenAI, Midjourney, Cursor, Copilot y más. Visualiza proyecciones mensuales, aplica filtros avanzados y optimiza tu presupuesto tecnológico en segundos.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mb-20">
          <Link
            href={user ? "/dashboard" : "/register"}
            className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-violet-600/30 transition-all duration-300 flex items-center justify-center gap-2 group text-base"
          >
            Comenzar Gratis
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold px-8 py-4 rounded-2xl transition-all duration-300 flex items-center justify-center"
          >
            Ver Demostración
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {/* Feature 1 */}
          <div className="bg-slate-900/40 border border-slate-900/80 rounded-3xl p-8 hover:border-violet-500/20 hover:bg-slate-900/60 transition-all duration-300 text-left group backdrop-blur-md">
            <div className="bg-violet-950/50 border border-violet-800/30 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6 text-violet-400" />
            </div>
            <h3 className="font-bold text-lg text-white mb-2">Métricas en Tiempo Real</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Gráficas interactivas distribuidas por categoría y ciclos. Proyecta tus egresos anuales de un vistazo rápido.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-slate-900/40 border border-slate-900/80 rounded-3xl p-8 hover:border-violet-500/20 hover:bg-slate-900/60 transition-all duration-300 text-left group backdrop-blur-md">
            <div className="bg-blue-950/50 border border-blue-800/30 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="font-bold text-lg text-white mb-2">Seguridad Supabase</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Autenticación sólida y políticas RLS que aíslan tus datos de forma absoluta, manteniendo tus gastos y perfiles privados.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-slate-900/40 border border-slate-900/80 rounded-3xl p-8 hover:border-violet-500/20 hover:bg-slate-900/60 transition-all duration-300 text-left group backdrop-blur-md">
            <div className="bg-fuchsia-950/50 border border-fuchsia-800/30 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Coins className="w-6 h-6 text-fuchsia-400" />
            </div>
            <h3 className="font-bold text-lg text-white mb-2">Conversión Unificada</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Registra en dólares o pesos. El panel unifica y convierte los montos de forma automatizada para darte estadísticas coherentes.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 py-8 z-10 relative mt-12 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-violet-500" />
            <span>&copy; 2026 Gastos.IA. Todos los derechos reservados.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacidad</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Términos</a>
            <span className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-xs text-slate-400">Ready for VPS & Dokploy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
