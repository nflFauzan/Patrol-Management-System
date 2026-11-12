'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Users, Award } from 'lucide-react';
import { LaporanSecurityChiefView } from '../../../../components/LaporanSecurityChiefView';

export default function LaporanSecurityChiefPage() {
  return (
    <div className="w-full space-y-4">
      {/* Role Navigation Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 pl-1">
            Role Security:
          </span>
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <Link
              href="/laporan/security/anggota"
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Patroli Anggota</span>
            </Link>
            <Link
              href="/laporan/security/komandan"
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Serah Terima Komandan</span>
            </Link>
            <Link
              href="/laporan/security/chief"
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-xs flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Evaluasi Chief</span>
            </Link>
          </div>
        </div>
        <Link
          href="/laporan"
          className="text-xs font-semibold text-blue-600 hover:underline pr-1"
        >
          ← Kembali ke Pusat Laporan
        </Link>
      </div>

      <LaporanSecurityChiefView />
    </div>
  );
}
