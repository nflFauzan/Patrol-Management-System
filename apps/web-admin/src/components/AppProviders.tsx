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

  const isLoginRoute = pathname === '/login' || pathname === '/login.php';
  const isFieldRoute =
    pathname.startsWith('/validasi-patroli') ||
    pathname.startsWith('/field') ||
    isLoginRoute ||
    pathname.endsWith('.php');

  // 1. Loading splash while verifying auth state
  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#070d1e] flex flex-col items-center justify-center text-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/20 mb-4 animate-pulse">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
          <span>Memverifikasi Sesi Command Center...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated user accessing protected route: show transition screen while redirecting
  if (!isAuthenticated && !isLoginRoute) {
    return (
      <div className="min-h-screen w-full bg-[#070d1e] flex flex-col items-center justify-center text-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/20 mb-4">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
          <span>Mengarahkan ke Halaman Login...</span>
        </div>
      </div>
    );
  }

  // 3. Login Route: Render standalone without Navbar
  if (isLoginRoute) {
    return <main className="w-full min-h-screen">{children}</main>;
  }

  // 4. Authenticated & Protected View
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
