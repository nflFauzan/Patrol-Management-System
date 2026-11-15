'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '../lib/AuthContext';
import { DataProvider } from '../lib/DataContext';
import { Navbar } from './Navbar';
import { GlobalModals } from './GlobalModals';
import { Shield, Loader2 } from 'lucide-react';

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  // Public standalone portal routes (no navbar / no modal chrome)
  const isPublicStandaloneRoute =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/login.php' ||
    pathname === '/register';

  // Field PWA standalone routes
  const isFieldRoute =
    pathname.startsWith('/validasi-patroli') ||
    pathname.startsWith('/field') ||
    pathname.endsWith('.php');

  // 1. Loading splash while verifying auth state (skip for public standalone and field routes)
  if (isLoading && !isPublicStandaloneRoute && !isFieldRoute) {
    return (
      <div className="min-h-screen w-full bg-[#08212b] flex flex-col items-center justify-center text-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-slate-950 shadow-xl shadow-teal-500/20 mb-4 animate-pulse">
          <Shield className="w-6 h-6" />
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-teal-200">
          <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
          <span>Memverifikasi Sesi Command Center...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated user accessing protected route: show transition screen while redirecting
  if (!isAuthenticated && !isPublicStandaloneRoute && !isFieldRoute) {
    return (
      <div className="min-h-screen w-full bg-[#08212b] flex flex-col items-center justify-center text-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-slate-950 shadow-xl shadow-teal-500/20 mb-4">
          <Shield className="w-6 h-6" />
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-teal-200">
          <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
          <span>Mengarahkan ke Portal Masuk...</span>
        </div>
      </div>
    );
  }

  // 3. Public standalone route (Portal, Login, Register): Render full width without Navbar
  if (isPublicStandaloneRoute) {
    return <main className="w-full min-h-screen">{children}</main>;
  }

  // 4. Authenticated & Protected View (Dashboard, Absensi, Laporan, etc.)
  return (
    <>
      {!isFieldRoute && <Navbar />}
      <main className={isFieldRoute ? 'w-full min-h-screen' : 'max-w-[1440px] mx-auto p-4 lg:p-6'}>
        {children}
      </main>
      {!isFieldRoute && <GlobalModals />}
    </>
  );
};

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <DataProvider>
        <ProtectedLayout>{children}</ProtectedLayout>
      </DataProvider>
    </AuthProvider>
  );
};
