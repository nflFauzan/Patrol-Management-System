'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { List, Monitor } from 'lucide-react';
import { AttendanceSemuaDataView } from '../../components/AttendanceSemuaDataView';
import { AttendanceMonitoringView } from '../../components/AttendanceMonitoringView';
import { useData } from '../../lib/DataContext';

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

  const defaultSiteId = sites[0]?.id || '11111111-1111-1111-1111-111111111111';

  return (
    <div className="space-y-4">
      {/* Sub-Header Tab Switcher */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Presensi & Kehadiran Operasional</span>
            <span className="text-xs font-normal text-slate-400">|</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              {activeTab === 'semua-data' ? 'Log Presensi Harian' : 'Matriks Kehadiran 31-Hari'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeTab === 'semua-data'
              ? 'Data presensi seluruh divisi dengan verifikasi koordinat lokasi dan swafoto petugas'
              : 'Audit matriks kehadiran 31-hari, toleransi keterlambatan, dan akumulasi lembur'}
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => handleTabChange('semua-data')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              activeTab === 'semua-data'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Semua Data</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('monitoring')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              activeTab === 'monitoring'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Monitoring</span>
          </button>
        </div>
      </div>

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
        <div className="p-8 text-center text-sm text-slate-500">
          Memuat modul absensi...
        </div>
      }
    >
      <AbsensiPageContent />
    </Suspense>
  );
}
