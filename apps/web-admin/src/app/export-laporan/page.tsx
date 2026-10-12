'use client';

import React from 'react';
import { ExportCenterTab } from '../../components/ExportCenterTab';

export default function ExportLaporanPage() {
  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-slate-900">
            Export Laporan ➔ Pusat Unduh Dokumen Korporat
          </h1>
          <p className="text-xs text-slate-500">
            Ekspor rekapitulasi operasional ke format XLSX / CSV siap impor HRIS perusahaan
          </p>
        </div>
      </div>

      <ExportCenterTab />
    </div>
  );
}
