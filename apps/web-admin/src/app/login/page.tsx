'use client';

import React, { Suspense } from 'react';
import { AdminLoginPage } from '../../components/AdminLoginPage';
import { Loader2 } from 'lucide-react';

export default function LoginRoute() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-[#070d1e] flex flex-col items-center justify-center text-white">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
          <p className="text-xs text-slate-400">Memuat Portal Command Center...</p>
        </div>
      }
    >
      <AdminLoginPage />
    </Suspense>
  );
}
