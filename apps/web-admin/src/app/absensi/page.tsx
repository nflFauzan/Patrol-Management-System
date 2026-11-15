'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { List, CalendarCheck, Clock, Filter } from 'lucide-react';
import { AttendanceSemuaDataView } from '../../components/AttendanceSemuaDataView';
import { AttendanceMonitoringView } from '../../components/AttendanceMonitoringView';
import { useData } from '../../lib/DataContext';
import { SurfaceCard } from '../../components/ui/SurfaceCard';

function AbsensiPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { sites } = useData();

  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'semua-data' | 'monitoring'>(
    tabParam === 'monitoring' ? 'monitoring' : 'semua-data'
  );

  useEffect(() => {
    if (tabParam === 'monitoring') {
      setActiveTab('monitoring');
    } else if (tabParam === 'semua-data') {
      setActiveTab('semua-data');
    }
  }, [tabParam]);

  const handleTabChange = (tab: 'semua-data' | 'monitoring') => {
    setActiveTab(tab);
    router.push(`/absensi?tab=${tab}`);
  };

  return (
    <div className="space-y-5 font-sans select-none">
      {/* Sub-Header Tab Switcher with SurfaceCard */}
      <SurfaceCard variant="elevated" padding="md" className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-2">
              <Clock className="w-5 h-5 text-sky-600" />
              <span>Presensi &amp; Kehadiran Operasional</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeTab === 'semua-data'
                ? 'Data presensi seluruh divisi dengan verifikasi GPS geofence dan swafoto petugas'
                : 'Audit matriks kehadiran 31-hari, toleransi keterlambatan, dan akumulasi lembur'}
            </p>
          </div>

          {/* Skeuomorphic Tab Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => handleTabChange('semua-data')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTab === 'semua-data'
                  ? 'bg-white text-slate-900 shadow-skeuo-button-secondary'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Log Presensi Harian</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('monitoring')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTab === 'monitoring'
                  ? 'bg-white text-slate-900 shadow-skeuo-button-secondary'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Matriks 31-Hari</span>
            </button>
          </div>
        </div>
      </SurfaceCard>

      {/* View Content */}
      {activeTab === 'semua-data' ? (
        <AttendanceSemuaDataView />
      ) : (
        <AttendanceMonitoringView />
      )}
    </div>
  );
}

export default function AbsensiPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-500">
          Memuat modul presensi...
        </div>
      }
    >
      <AbsensiPageContent />
    </Suspense>
  );
}
