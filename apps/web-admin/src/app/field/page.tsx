'use client';

import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function FieldHomeRedirectRoute() {
  useEffect(() => {
    window.location.href = '/pwa';
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
      <Loader2 className="w-8 h-8 animate-spin text-sky-400 mb-2" />
      <p className="text-xs text-slate-400">Mengarahkan ke modul lapangan PWA...</p>
    </div>
  );
}
