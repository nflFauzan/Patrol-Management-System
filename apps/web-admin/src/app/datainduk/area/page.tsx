'use client';

import React from 'react';
import { AreaManagementView } from '../../../components/AreaManagementView';
import { useData } from '../../../lib/DataContext';

export default function AreaPage() {
  const { sites, addSite, updateSite, deleteSite, checkpoints, users } = useData();

  // Calculate checkpoints count per site
  const checkpointsCount: Record<string, number> = {};
  checkpoints.forEach((c) => {
    const sId = c.siteId || '11111111-1111-1111-1111-111111111111';
    checkpointsCount[sId] = (checkpointsCount[sId] || 0) + 1;
  });

  // Calculate personnel count per site
  const personnelCount: Record<string, number> = {};
  users.forEach((u) => {
    const sId = u.siteId || '11111111-1111-1111-1111-111111111111';
    personnelCount[sId] = (personnelCount[sId] || 0) + 1;
  });

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-slate-900">
            Data Induk ➔ Area / Site & Konfigurasi Shift
          </h1>
          <p className="text-xs text-slate-500">
            Kelola titik satelit geofence fasilitas dan jam masuk/pulang shift operasional korporat
          </p>
        </div>
      </div>

      <AreaManagementView
        sites={sites}
        onAddSite={addSite}
        onUpdateSite={updateSite}
        onDeleteSite={deleteSite}
        checkpointsCount={checkpointsCount}
        personnelCount={personnelCount}
      />
    </div>
  );
}
