'use client';

import React from 'react';
import { CheckpointManagementView } from '../../../components/CheckpointManagementView';

export default function CheckpointPage() {
  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-slate-900">
            Data Induk ➔ Checkpoint / Aset Fasilitas
          </h1>
          <p className="text-xs text-slate-500">
            Kelola titik QR code barcode pos keamanan, toilet sanitasi, dan armada kendaraan logistik
          </p>
        </div>
      </div>

      <CheckpointManagementView />
    </div>
  );
}
