'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ValidasiPatroliRedirectRoute() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const perms = user?.permissions || [];
    const role = (user?.role as string) || '';
    const isAdmin =
      role === 'ADMIN_SUPER' ||
      role === 'OPS_MANAGER' ||
      role === 'SITE_SUPERVISOR' ||
      role === 'HRD_PAYROLL' ||
      perms.includes('ADMIN:DASHBOARD_ACCESS');

    if (isAdmin) {
      router.replace('/monitoring-patroli');
    } else {
      window.location.href = '/pwa';
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
      <Loader2 className="w-8 h-8 animate-spin text-sky-400 mb-2" />
      <p className="text-xs text-slate-400">Mengarahkan ke modul yang sesuai...</p>
    </div>
  );
}
