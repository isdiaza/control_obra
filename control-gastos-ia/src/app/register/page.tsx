'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, Mail, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

export default function Register() {
  const { signUp, loading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setErr('Por favor completa todos los campos.');
      return;
    }

    if (password.length < 6) {
      setErr('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErr('Las contraseñas no coinciden.');
      return;
    }

    try {
      await signUp(email, password, fullName);
    } catch (e: unknown) {
      console.error(e);
      setErr(e instanceof Error ? e.message : 'Ocurrió un error al registrarse.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-violet-500/30">
      {/* Decorative blurred backgrounds */}
      <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] rounded-full bg-violet-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md bg-slate-900/40 border border-slate-900/80 rounded-3xl p-8 backdrop-blur-md relative z-10 shadow-2xl">
        
        {/* Header/Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-tr from-violet-600 to-blue-500 p-2.5 rounded-xl shadow-glow mb-4">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide">Crear cuenta</h2>
          <p className="text-sm text-slate-400 mt-1">Registra tus gastos en herramientas IA</p>
        </div>

        {/* Error notification */}
        {err && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs flex items-start gap-2 mb-6 animate-shake">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{err}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">Nombre Completo</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Juan Pérez"
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-violet-500 rounded-xl py-3 pl-10 pr-4 text-sm text-white outline-none transition-colors placeholder:text-slate-600"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="juan@ejemplo.com"
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-violet-500 rounded-xl py-3 pl-10 pr-4 text-sm text-white outline-none transition-colors placeholder:text-slate-600"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-violet-500 rounded-xl py-3 pl-10 pr-4 text-sm text-white outline-none transition-colors placeholder:text-slate-600"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">Confirmar Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-violet-500 rounded-xl py-3 pl-10 pr-4 text-sm text-white outline-none transition-colors placeholder:text-slate-600"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold py-3.5 rounded-xl text-sm transition-all duration-300 shadow-md hover:shadow-violet-600/20 flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed group"
            disabled={loading}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Registrarse
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Redirection */}
        <div className="mt-8 text-center text-xs text-slate-400">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-violet-400 hover:text-violet-300 font-semibold underline-offset-4 hover:underline">
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
