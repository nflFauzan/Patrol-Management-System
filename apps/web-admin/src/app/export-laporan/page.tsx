'use client';

import React from 'react';
import { ExportCenterTab } from '../../components/ExportCenterTab';
import { SurfaceCard } from '../../components/ui/SurfaceCard';
import { FileSpreadsheet, ChevronRight } from 'lucide-react';

export default function ExportLaporanPage() {
  return (
    <div className="space-y-6">
      <SurfaceCard className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-sky-700 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700 font-bold tracking-wide uppercase text-[10px]">
                Dokumentasi & Arsip
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500">Pusat Ekspor</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
              Pusat Unduh Dokumen & Rekapitulasi Korporat
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Ekspor rekapitulasi absensi personil, checklist kebersihan, dan log operasional armada ke format XLSX / CSV siap impor HRIS perusahaan.
            </p>
          </div>
        </div>
      </SurfaceCard>

      <ExportCenterTab />
    </div>
  );
}
