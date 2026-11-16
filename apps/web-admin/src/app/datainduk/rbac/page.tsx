'use client';

import React from 'react';
import { ApprovalQueueView } from '../../../components/ApprovalQueueView';

export default function RbacPage() {
  return (
    <div className="space-y-4">
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-white flex items-center gap-2">
            <span>Data Induk ➔ Manajemen Role & Dynamic RBAC</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
              Enterprise Dynamic Permissions
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Kelola definisi peran (roles) dan pemetaan izin akses granular pada sistem operasional.
          </p>
        </div>
      </div>

      <ApprovalQueueView defaultTab="rbac" />
    </div>
  );
}
