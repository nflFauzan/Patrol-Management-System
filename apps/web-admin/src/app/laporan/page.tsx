'use client';

import React from 'react';
import { ReportsTab } from '../../components/ReportsTab';
import { useData } from '../../lib/DataContext';

export default function LaporanPage() {
  const { sites } = useData();
  const defaultSiteId = sites[0]?.id || '11111111-1111-1111-1111-111111111111';

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-slate-900">
            Laporan ➔ Rekap Operasional 3 Divisi Terpadu
          </h1>
          <p className="text-xs text-slate-500">
            Laporan rute patroli Satpam, checklist sanitasi Cleaning Service, dan log perjalanan Driver
          </p>
        </div>
      </div>

      <ReportsTab selectedSiteId={defaultSiteId} />
    </div>
  );
}
