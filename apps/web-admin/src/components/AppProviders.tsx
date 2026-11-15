'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '../lib/AuthContext';
import { DataProvider } from '../lib/DataContext';
import { AppSidebar } from './layout/AppSidebar';
import { AppHeader } from './layout/AppHeader';
import { MobileNavigationDrawer } from './layout/MobileNavigationDrawer';
import { GlobalModals } from './GlobalModals';
import { Shield, Loader2 } from 'lucide-react';

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Public standalone portal routes (no sidebar / no modal chrome)
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

  // 1. Loading splash while verifying auth state
  if (isLoading && !isPublicStandaloneRoute && !isFieldRoute) {
    return (
      <div className="min-h-screen w-full bg-[#E5E9EE] flex flex-col items-center justify-center text-slate-800">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0284C7] to-[#38BDF8] text-white flex items-center justify-center shadow-lg shadow-sky-950/20 mb-4 animate-pulse">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600">
          <Loader2 className="w-4 h-4 animate-spin text-[#0284C7]" />
          <span>Memverifikasi Sesi Command Center...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated user accessing protected route: show transition screen while redirecting
  if (!isAuthenticated && !isPublicStandaloneRoute && !isFieldRoute) {
    return (
      <div className="min-h-screen w-full bg-[#E5E9EE] flex flex-col items-center justify-center text-slate-800">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0284C7] to-[#38BDF8] text-white flex items-center justify-center shadow-lg shadow-sky-950/20 mb-4">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600">
          <Loader2 className="w-4 h-4 animate-spin text-[#0284C7]" />
          <span>Mengarahkan ke Portal Masuk...</span>
        </div>
      </div>
    );
  }

  // 3. Public standalone route (Portal, Login, Register): Render full width without Sidebar
  if (isPublicStandaloneRoute) {
    return <main className="w-full min-h-screen bg-[#E5E9EE]">{children}</main>;
  }

  // 4. Authenticated & Protected View (Charcoal Sidebar + Light Gray Canvas)
  return (
    <div className="min-h-screen flex bg-[#E5E9EE] text-slate-900 font-sans">
      {!isFieldRoute && (
        <div className="hidden lg:block shrink-0">
          <AppSidebar />
        </div>
      )}

      {!isFieldRoute && (
        <MobileNavigationDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
        {!isFieldRoute && <AppHeader onMenuClick={() => setIsDrawerOpen(true)} />}
        <main
          className={
            isFieldRoute
              ? 'w-full min-h-screen'
              : 'w-full p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto'
          }
        >
          {children}
        </main>
      </div>

      {!isFieldRoute && <GlobalModals />}
    </div>
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
