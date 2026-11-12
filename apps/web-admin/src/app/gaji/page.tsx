'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useData } from '../../lib/DataContext';
import { Loader2 } from 'lucide-react';

const PayrollTab = dynamic(
  () => import('../../components/PayrollTab').then((mod) => mod.PayrollTab),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-500 shadow-xs">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-teal-600 mb-2" />
        <span className="text-xs font-semibold">Memuat data rekapitulasi penggajian...</span>
      </div>
    ),
  }
);

function GajiPageContent() {
  const { sites } = useData();
  const defaultSiteId = sites[0]?.id || '11111111-1111-1111-1111-111111111111';

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
            Penggajian & Rekapitulasi Jam Kerja Operasional
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Perhitungan gaji pokok, tunjangan kehadiran, lembur, dan potongan keterlambatan personil seluruh site korporat.
          </p>
        </div>
      </div>

      <PayrollTab selectedSiteId={defaultSiteId} />
    </div>
  );
}

export default function GajiPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-slate-500">
          Memuat modul gaji...
        </div>
      }
    >
      <GajiPageContent />
    </Suspense>
  );
}
