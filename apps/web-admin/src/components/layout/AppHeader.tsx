'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldAlert,
  ExternalLink,
  Clock,
  ChevronRight,
  Menu,
  Bell,
  Search,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { useData } from '../../lib/DataContext';
import { StatusBadge } from '../ui/StatusBadge';

interface AppHeaderProps {
  onMenuClick: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onMenuClick }) => {
  const pathname = usePathname();
  const { user } = useAuth();
  const { activeSosAlert } = useData();

  // Generate breadcrumb text
  const getBreadcrumb = () => {
    if (pathname === '/dashboard') return { domain: 'Operasional', page: 'Komando Utama' };
    if (pathname.startsWith('/validasi-patroli')) return { domain: 'Operasional', page: 'Monitoring Patroli' };
    if (pathname.startsWith('/absensi')) return { domain: 'Operasional', page: 'Pemantauan Absensi' };
    if (pathname.startsWith('/emergency')) return { domain: 'Operasional', page: 'Pusat Darurat SOS' };
    if (pathname.startsWith('/datainduk/personil')) return { domain: 'Master Data', page: 'Data Personil' };
    if (pathname.startsWith('/datainduk/approval')) return { domain: 'Master Data', page: 'Persetujuan Akun' };
    if (pathname.startsWith('/datainduk/checkpoint')) return { domain: 'Master Data', page: 'Titik Checkpoint QR' };
    if (pathname.startsWith('/datainduk/area')) return { domain: 'Master Data', page: 'Fasilitas & Area' };
    if (pathname.startsWith('/datainduk/rbac')) return { domain: 'Master Data', page: 'Hak Akses & Role' };
    if (pathname.startsWith('/laporan')) return { domain: 'Rekap & Laporan', page: 'Laporan Operasional' };
    if (pathname.startsWith('/export-laporan')) return { domain: 'Rekap & Laporan', page: 'Pusat Ekspor' };
    if (pathname.startsWith('/gaji')) return { domain: 'Rekap & Laporan', page: 'Penggajian (Payroll)' };
    if (pathname.startsWith('/pesan-siaran')) return { domain: 'Rekap & Laporan', page: 'Pesan Siaran' };
    return { domain: 'Command Center', page: 'Navigasi' };
  };

  const breadcrumb = getBreadcrumb();

  const getInitials = (name?: string) => {
    if (!name) return 'AD';
    return name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header className="w-full shrink-0 border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-20 px-3 sm:px-6 py-2.5 font-sans select-none">
      {/* SOS Alert Bar if active */}
      {activeSosAlert && (
        <div className="mb-2 bg-gradient-to-r from-rose-600 to-rose-700 text-white rounded-xl p-2.5 shadow-md border border-rose-800 flex items-center justify-between gap-2 text-xs animate-pulse">
          <div className="flex items-center space-x-2 truncate">
            <ShieldAlert className="w-4 h-4 shrink-0 text-white animate-bounce" />
            <span className="font-bold truncate">
              SOS DARURAT AKTIF: {activeSosAlert.officerName.toUpperCase()} ({activeSosAlert.division}) - {activeSosAlert.siteName}
            </span>
          </div>
          <div className="flex items-center space-x-1.5 shrink-0">
            <a
              href={activeSosAlert.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-white text-rose-700 hover:bg-rose-50 font-bold px-2.5 py-1 rounded-lg text-[11px] shadow-sm flex items-center space-x-1"
            >
              <span>GPS</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <Link
              href="/emergency"
              className="bg-rose-900 hover:bg-rose-950 text-white font-bold px-2.5 py-1 rounded-lg text-[11px]"
            >
              Buka SOS
            </Link>
          </div>
        </div>
      )}

      {/* Main Bar */}
      <div className="flex items-center justify-between gap-3">
        {/* Left: Hamburger (Mobile) + Breadcrumb */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            aria-label="Buka menu navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
            <span>{breadcrumb.domain}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-semibold">{breadcrumb.page}</span>
          </div>
        </div>

        {/* Center: Recessed Inset Search Well (as in reference image) */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama, site, atau laporan..."
              className="w-full bg-[#F8FAFC] border border-slate-300 rounded-full pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 shadow-[inset_0_2px_4px_rgba(15,23,42,0.06)] focus:bg-white focus:border-[#38BDF8] focus:ring-2 focus:ring-[#38BDF8]/20 focus:outline-none transition-all duration-150"
            />
          </div>
        </div>

        {/* Right Status Badges & User Profile */}
        <div className="flex items-center space-x-3 text-xs">
          {/* Shift Indicator Pill */}
          <div className="hidden lg:inline-flex items-center space-x-1.5 bg-slate-100 px-3 py-1.5 rounded-full text-slate-600 font-medium text-[11px] border border-slate-200/60 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Shift Pagi (07:00 - 15:00)</span>
          </div>

          {/* Live System Pill */}
          <StatusBadge label="Sistem Siaga" variant="live" size="sm" pulse />

          {/* Notification Bell with Badge */}
          <Link
            href="/emergency"
            className="relative p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
            title="Pemberitahuan & Alarm"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center shadow-sm">
              3
            </span>
          </Link>

          {/* User Profile Pill */}
          <div className="flex items-center space-x-2 pl-1 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0284C7] to-[#38BDF8] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs border border-white">
              {getInitials(user?.fullName)}
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                {user?.fullName || 'Muhamad Naufal'}
              </span>
              <span className="text-[10px] text-slate-500 font-medium capitalize truncate">
                {user?.role?.replace('_', ' ').toLowerCase() || 'Administrator'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:block" />
          </div>
        </div>
      </div>
    </header>
  );
};
