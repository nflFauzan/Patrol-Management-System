'use client';

import React from 'react';
import { AttendanceMatrixTab } from '../../components/AttendanceMatrixTab';
import { useData } from '../../lib/DataContext';

export default function AbsensiPage() {
  const { sites } = useData();
  const defaultSiteId = sites[0]?.id || '11111111-1111-1111-1111-111111111111';

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-slate-900">
            Absensi ➔ Rekap Kehadiran 31-Hari (HRIS Ready)
          </h1>
          <p className="text-xs text-slate-500">
            Audit kehadiran harian, keterlambatan, lembur, dan verifikasi geofence PostGIS
          </p>
        </div>
      </div>

      <AttendanceMatrixTab selectedSiteId={defaultSiteId} />
    </div>
  );
}
