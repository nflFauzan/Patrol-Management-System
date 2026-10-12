'use client';

import React from 'react';
import { PayrollTab } from '../../components/PayrollTab';
import { useData } from '../../lib/DataContext';

export default function GajiPage() {
  const { sites } = useData();
  const defaultSiteId = sites[0]?.id || '11111111-1111-1111-1111-111111111111';

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-slate-900">
            Gaji ➔ Rekapitulasi Kehadiran, Lembur, dan Jam Kerja Efektif
          </h1>
          <p className="text-xs text-slate-500">
            Attendance & Working Hours Recap Engine siap ekspor ke software HRIS korporat
          </p>
        </div>
      </div>

      <PayrollTab selectedSiteId={defaultSiteId} />
    </div>
  );
}
