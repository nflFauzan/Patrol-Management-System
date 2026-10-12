'use client';

import React from 'react';
import { BroadcastTab } from '../../components/BroadcastTab';
import { useData } from '../../lib/DataContext';

export default function BroadcastPage() {
  const { sites } = useData();
  const defaultSiteId = sites[0]?.id || '11111111-1111-1111-1111-111111111111';

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-slate-900">
            Pesan Siaran ➔ Pengumuman & Instruksi Operasional
          </h1>
          <p className="text-xs text-slate-500">
            Broadcast instruksi komando real-time ke PWA Satpam, Cleaning Service, dan Driver
          </p>
        </div>
      </div>

      <BroadcastTab selectedSiteId={defaultSiteId} />
    </div>
  );
}
