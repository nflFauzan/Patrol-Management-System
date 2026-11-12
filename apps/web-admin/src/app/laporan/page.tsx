'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Shield,
  Leaf,
  Car,
  Briefcase,
  MapPin,
  Users,
  Award,
  Calendar,
  Layers,
  Sparkles,
  Download
} from 'lucide-react';
import { LaporanSecurityAnggotaView } from '../../components/LaporanSecurityAnggotaView';
import { LaporanSecurityKomandanView } from '../../components/LaporanSecurityKomandanView';
import { LaporanSecurityChiefView } from '../../components/LaporanSecurityChiefView';
import { LaporanCleaningServiceView } from '../../components/LaporanCleaningServiceView';
import { LaporanDriverView } from '../../components/LaporanDriverView';
import { LaporanStaffView } from '../../components/LaporanStaffView';
import { LaporanTrackingPatroliView } from '../../components/LaporanTrackingPatroliView';

type TabType = 'security' | 'cleaning' | 'driver' | 'staff' | 'tracking';
type SecurityRoleType = 'anggota' | 'komandan' | 'chief';

function LaporanContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = (searchParams.get('tab') as TabType) || 'security';
  const roleParam = (searchParams.get('role') as SecurityRoleType) || 'anggota';

  const [activeTab, setActiveTab] = useState<TabType>(tabParam);
  const [securityRole, setSecurityRole] = useState<SecurityRoleType>(roleParam);

  useEffect(() => {
    if (searchParams.get('tab')) {
      setActiveTab(searchParams.get('tab') as TabType);
    }
    if (searchParams.get('role')) {
      setSecurityRole(searchParams.get('role') as SecurityRoleType);
    }
  }, [searchParams]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('tab', tab);
    if (tab === 'security') {
      newParams.set('role', securityRole);
    } else {
      newParams.delete('role');
    }
    router.push(`/laporan?${newParams.toString()}`);
  };

  const handleRoleChange = (role: SecurityRoleType) => {
    setSecurityRole(role);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('tab', 'security');
    newParams.set('role', role);
    router.push(`/laporan?${newParams.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Header Pusat Laporan */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse" />
            <span>Pusat Laporan & Aktivitas Operasional</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Monitoring & Log Lapangan Terpadu
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit kepatuhan tugas keamanan (3 role), checklist kebersihan zona, log armada logistik, dan riwayat patroli.
          </p>
        </div>

        {/* Global Export Shortcut */}
        <div className="flex items-center space-x-2">
          <a
            href="/export-laporan"
            className="text-xs font-bold px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 transition flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export Rekap Arsip</span>
          </a>
        </div>
      </div>

      {/* Primary Division Segmented Tab Bar */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/60 rounded-2xl border border-slate-200/80 overflow-x-auto">
        <button
          type="button"
          onClick={() => handleTabChange('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-700 hover:text-slate-950 hover:bg-white/60'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Keamanan (Security)</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('cleaning')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'cleaning'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-700 hover:text-slate-950 hover:bg-white/60'
          }`}
        >
          <Leaf className="w-4 h-4" />
          <span>Kebersihan (Cleaning Service)</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('driver')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'driver'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-700 hover:text-slate-950 hover:bg-white/60'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Logistik (Driver Armada)</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('staff')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'staff'
              ? 'bg-slate-700 text-white shadow-md'
              : 'text-slate-700 hover:text-slate-950 hover:bg-white/60'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Fasilitas (Staff Operasional)</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('tracking')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'tracking'
              ? 'bg-cyan-700 text-white shadow-md'
              : 'text-slate-700 hover:text-slate-950 hover:bg-white/60'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Live Tracking & Rute</span>
        </button>
      </div>

      {/* SECURITY SUB-ROLE SWITCHER (SOLUSI INTERAKTIF 3 ROLE SECURITY) */}
      {activeTab === 'security' && (
        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 pl-1">
              Role Security:
            </span>
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => handleRoleChange('anggota')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  securityRole === 'anggota'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Patroli Anggota Lapangan</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('komandan')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  securityRole === 'komandan'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Serah Terima Komandan Regu</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('chief')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  securityRole === 'chief'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Supervisi & Evaluasi Chief</span>
              </button>
            </div>
          </div>

          <div className="text-[11px] font-semibold text-slate-500 pr-1">
            {securityRole === 'anggota' && 'Menampilkan log pemindaian QR checkpoint dan laporan insiden anggota.'}
            {securityRole === 'komandan' && 'Menampilkan catatan mutasi shift, apel kehadiran regu, dan cek fisik inventaris.'}
            {securityRole === 'chief' && 'Menampilkan evaluasi kedisiplinan dan supervisi harian oleh Chief Security.'}
          </div>
        </div>
      )}

      {/* Main Tab Content Display */}
      <div className="w-full">
        {activeTab === 'security' && (
          <>
            {securityRole === 'anggota' && <LaporanSecurityAnggotaView />}
            {securityRole === 'komandan' && <LaporanSecurityKomandanView />}
            {securityRole === 'chief' && <LaporanSecurityChiefView />}
          </>
        )}

        {activeTab === 'cleaning' && <LaporanCleaningServiceView />}
        {activeTab === 'driver' && <LaporanDriverView />}
        {activeTab === 'staff' && <LaporanStaffView />}
        {activeTab === 'tracking' && <LaporanTrackingPatroliView />}
      </div>
    </div>
  );
}

export default function LaporanPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-slate-500">
          Memuat pusat laporan operasional...
        </div>
      }
    >
      <LaporanContent />
    </Suspense>
  );
}
