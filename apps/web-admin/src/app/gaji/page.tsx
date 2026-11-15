'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useData } from '../../lib/DataContext';
import { Loader2, DollarSign, ChevronRight } from 'lucide-react';
import { SurfaceCard } from '../../components/ui/SurfaceCard';

const PayrollTab = dynamic(
  () => import('../../components/PayrollTab').then((mod) => mod.PayrollTab),
  {
    ssr: false,
    loading: () => (
      <SurfaceCard className="p-12 text-center text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-sky-500 mb-2" />
        <span className="text-xs font-semibold">Memuat data rekapitulasi penggajian...</span>
      </SurfaceCard>
    ),
  }
);

function GajiPageContent() {
  const { sites } = useData();
  const defaultSiteId = sites[0]?.id || '11111111-1111-1111-1111-111111111111';

  return (
    <div className="space-y-6">
      <SurfaceCard className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-sky-700 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700 font-bold tracking-wide uppercase text-[10px]">
                Keuangan & HRIS
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500">Kalkulasi Penggajian</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
              Penggajian & Rekapitulasi Jam Kerja Personel
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Perhitungan gaji pokok, tunjangan kehadiran, lembur, dan potongan keterlambatan personil seluruh site operasional.
            </p>
          </div>
        </div>
      </SurfaceCard>

      <PayrollTab selectedSiteId={defaultSiteId} />
    </div>
  );
}

export default function GajiPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-sm text-slate-500">
          Memuat modul gaji...
        </div>
      }
    >
      <GajiPageContent />
    </Suspense>
  );
}
