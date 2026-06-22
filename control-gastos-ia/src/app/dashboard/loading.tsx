import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-500 gap-3">
      <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      <span className="text-xs font-semibold">Cargando herramienta...</span>
    </div>
  );
}
