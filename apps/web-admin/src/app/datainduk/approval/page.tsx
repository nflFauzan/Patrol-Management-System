'use client';

import React from 'react';
import { ApprovalQueueView } from '../../../components/ApprovalQueueView';

export default function ApprovalPage() {
  return (
    <div className="space-y-4">
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-white flex items-center gap-2">
            <span>Data Induk ➔ Antrean Approval Registrasi & RBAC</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
              In-House Enterprise
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Tinjau pendaftaran calon personil mandiri, tetapkan hak akses/role, divisi operasional, dan lokasi penempatan fasilitas (site).
          </p>
        </div>
      </div>

      <ApprovalQueueView defaultTab="queue" />
    </div>
  );
}
