'use client';

import React from 'react';
import { PersonilManagementView } from '../../../components/PersonilManagementView';

export default function PersonilPage() {
  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-slate-900">
            Data Induk ➔ Personel & Finansial
          </h1>
          <p className="text-xs text-slate-500">
            Kelola data petugas Security, Cleaning Service, dan Driver serta cetak ID Card resmi
          </p>
        </div>
      </div>

      <PersonilManagementView />
    </div>
  );
}
