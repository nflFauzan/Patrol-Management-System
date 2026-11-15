'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldAlert, ExternalLink, Radio, Clock, ChevronRight } from 'lucide-react';
import { useData } from '../lib/DataContext';

export const TopUtilityBar: React.FC = () => {
  const pathname = usePathname();
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
    if (pathname.startsWith('/laporan')) return { domain: 'Rekap & Laporan', page: 'Laporan Operasional' };
    if (pathname.startsWith('/export-laporan')) return { domain: 'Rekap & Laporan', page: 'Pusat Ekspor' };
    if (pathname.startsWith('/gaji')) return { domain: 'Rekap & Laporan', page: 'Penggajian (Payroll)' };
    if (pathname.startsWith('/pesan-siaran')) return { domain: 'Rekap & Laporan', page: 'Pesan Siaran' };
    return { domain: 'Command Center', page: 'Navigasi' };
  };

  const breadcrumb = getBreadcrumb();

  return (
    <div className="w-full shrink-0 border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-20 px-4 sm:px-6 py-2.5 font-sans">
      {/* SOS Alert Bar if active */}
      {activeSosAlert && (
        <div className="mb-2 bg-rose-600 text-white rounded-xl p-2.5 shadow-sm border border-rose-700 flex items-center justify-between gap-2 text-xs animate-pulse">
          <div className="flex items-center space-x-2 truncate">
            <ShieldAlert className="w-4 h-4 shrink-0 text-white animate-bounce" />
            <span className="font-bold truncate">
              SOS AKTIF: {activeSosAlert.officerName.toUpperCase()} ({activeSosAlert.division}) - {activeSosAlert.siteName}
            </span>
          </div>
          <div className="flex items-center space-x-1.5 shrink-0">
            <a
              href={activeSosAlert.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-white text-rose-700 hover:bg-rose-50 font-bold px-2.5 py-1 rounded-lg text-[11px] shadow-2xs flex items-center space-x-1"
            >
              <span>GPS</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <Link
              href="/emergency"
              className="bg-rose-800 hover:bg-rose-900 text-white font-bold px-2.5 py-1 rounded-lg text-[11px]"
            >
              Buka SOS
            </Link>
          </div>
        </div>
      )}

      {/* Main Bar: Breadcrumb on left, Live Telemetry on right */}
      <div className="flex items-center justify-between">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
          <span>{breadcrumb.domain}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold">{breadcrumb.page}</span>
        </div>

        {/* Right Status Badges */}
        <div className="flex items-center space-x-2.5 text-xs">
          {/* Shift Indicator Pill */}
          <div className="hidden sm:inline-flex items-center space-x-1.5 bg-slate-100 px-2.5 py-1 rounded-full text-slate-600 font-medium text-[11px]">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>Shift Pagi (07:00 - 15:00)</span>
          </div>

          {/* Live WebSocket Indicator */}
          <div className="inline-flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full text-emerald-700 font-semibold text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sistem Siaga</span>
          </div>
        </div>
      </div>
    </div>
  );
};
