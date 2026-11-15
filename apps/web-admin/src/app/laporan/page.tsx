'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Shield,
  Sparkles,
  Car,
  Briefcase,
  MapPin,
  Users,
  Award,
  Download,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { LaporanSecurityAnggotaView } from '../../components/LaporanSecurityAnggotaView';
import { LaporanSecurityKomandanView } from '../../components/LaporanSecurityKomandanView';
import { LaporanSecurityChiefView } from '../../components/LaporanSecurityChiefView';
import { LaporanCleaningServiceView } from '../../components/LaporanCleaningServiceView';
import { LaporanDriverView } from '../../components/LaporanDriverView';
import { LaporanStaffView } from '../../components/LaporanStaffView';
import { LaporanTrackingPatroliView } from '../../components/LaporanTrackingPatroliView';
import { SurfaceCard } from '../../components/ui/SurfaceCard';
import { SkeuomorphicButton } from '../../components/ui/SkeuomorphicButton';
import { StatusBadge } from '../../components/ui/StatusBadge';

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

  const tabItems = [
    { id: 'security', label: 'Keamanan (Security)', icon: Shield, count: '3 Roles' },
    { id: 'cleaning', label: 'Kebersihan (Cleaning)', icon: Sparkles, count: 'Sanitasi' },
    { id: 'driver', label: 'Logistik (Driver)', icon: Car, count: 'Armada' },
    { id: 'staff', label: 'Fasilitas (Staff)', icon: Briefcase, count: 'Gedung' },
    { id: 'tracking', label: 'Live Tracking & Rute', icon: MapPin, count: 'GPS Live' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header Pusat Laporan */}
      <SurfaceCard className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-sky-700 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700 font-bold tracking-wide uppercase text-[10px]">
                Monitoring Terpadu
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500">Pusat Laporan Lapangan</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
              Audit & Log Aktivitas Operasional
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Audit kepatuhan tugas keamanan (3 role), checklist sanitasi zona kebersihan, log odometer armada, dan riwayat patroli rute.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <a href="/export-laporan">
              <SkeuomorphicButton
                variant="secondary"
                icon={Download}
              >
                Export Rekap Dokumen
              </SkeuomorphicButton>
            </a>
          </div>
        </div>

        {/* Primary Division Segmented Tab Bar */}
        <div className="mt-6 pt-6 border-t border-slate-200/80">
          <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 overflow-x-auto">
            {tabItems.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id as TabType)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-sky-700 shadow-soft-sm border border-sky-300/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                      isActive
                        ? 'bg-sky-50 text-sky-700 border border-sky-200'
                        : 'bg-slate-200/70 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </SurfaceCard>

      {/* SECURITY SUB-ROLE SWITCHER */}
      {activeTab === 'security' && (
        <SurfaceCard className="p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600 shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Tingkatan Tanggung Jawab Keamanan (3-Tier RBAC)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Pilih hierarki pelaporan untuk memeriksa rincian log sesuai tupoksi divisi security
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => handleRoleChange('anggota')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                  securityRole === 'anggota'
                    ? 'bg-white text-sky-700 shadow-soft-xs border border-sky-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-sky-600" />
                <span>Patroli Anggota Lapangan</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('komandan')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                  securityRole === 'komandan'
                    ? 'bg-white text-sky-700 shadow-soft-xs border border-sky-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-sky-600" />
                <span>Serah Terima Komandan Regu</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('chief')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                  securityRole === 'chief'
                    ? 'bg-white text-sky-700 shadow-soft-xs border border-sky-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-sky-600" />
                <span>Supervisi & Evaluasi Chief</span>
              </button>
            </div>
          </div>
        </SurfaceCard>
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
        <div className="p-12 text-center text-sm text-slate-500">
          Memuat pusat laporan operasional...
        </div>
      }
    >
      <LaporanContent />
    </Suspense>
  );
}
