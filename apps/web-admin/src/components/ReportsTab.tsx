'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Download
} from 'lucide-react';
import { LaporanSecurityAnggotaView } from './LaporanSecurityAnggotaView';
import { LaporanSecurityKomandanView } from './LaporanSecurityKomandanView';
import { LaporanSecurityChiefView } from './LaporanSecurityChiefView';
import { LaporanCleaningServiceView } from './LaporanCleaningServiceView';
import { LaporanDriverView } from './LaporanDriverView';
import { LaporanStaffView } from './LaporanStaffView';
import { LaporanTrackingPatroliView } from './LaporanTrackingPatroliView';
import { LaporanRekapKegiatanView } from './LaporanRekapKegiatanView';
import { LaporanMonitoringKegiatanView } from './LaporanMonitoringKegiatanView';

interface ReportsTabProps {
  selectedSiteId?: string;
  defaultType?: 'ANGGOTA' | 'KOMANDAN' | 'CHIEF' | 'CLEANING' | 'DRIVER' | 'STAFF' | 'TRACKING' | 'REKAP' | 'MONITORING';
}

export const ReportsTab: React.FC<ReportsTabProps> = ({ defaultType = 'ANGGOTA' }) => {
  const [reportType, setReportType] = useState<
    'ANGGOTA' | 'KOMANDAN' | 'CHIEF' | 'CLEANING' | 'DRIVER' | 'STAFF' | 'TRACKING' | 'REKAP' | 'MONITORING'
  >(defaultType);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Header & Sub-selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Pusat Laporan & Supervisi Operasional</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            9 Format Laporan Resmi Sesuai Hierarki Korporat (Anggota, Komandan, Chief, CS, Driver, Staf, Tracking, Rekap, Monitoring 24 Jam)
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Cetak / Export Laporan</span>
        </button>
      </div>

      {/* Report Types Ribbon */}
      <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-xs font-semibold">
        <button
          onClick={() => setReportType('ANGGOTA')}
          className={`px-3 py-1.5 rounded-xl transition ${reportType === 'ANGGOTA' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Security Anggota
        </button>
        <button
          onClick={() => setReportType('KOMANDAN')}
          className={`px-3 py-1.5 rounded-xl transition ${reportType === 'KOMANDAN' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Security Komandan
        </button>
        <button
          onClick={() => setReportType('CHIEF')}
          className={`px-3 py-1.5 rounded-xl transition ${reportType === 'CHIEF' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Security Chief
        </button>
        <button
          onClick={() => setReportType('CLEANING')}
          className={`px-3 py-1.5 rounded-xl transition ${reportType === 'CLEANING' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Cleaning Service
        </button>
        <button
          onClick={() => setReportType('DRIVER')}
          className={`px-3 py-1.5 rounded-xl transition ${reportType === 'DRIVER' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Driver Logistik
        </button>
        <button
          onClick={() => setReportType('STAFF')}
          className={`px-3 py-1.5 rounded-xl transition ${reportType === 'STAFF' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Staff Operasional
        </button>
        <button
          onClick={() => setReportType('TRACKING')}
          className={`px-3 py-1.5 rounded-xl transition ${reportType === 'TRACKING' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Tracking Patroli
        </button>
        <button
          onClick={() => setReportType('REKAP')}
          className={`px-3 py-1.5 rounded-xl transition ${reportType === 'REKAP' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Rekap Kegiatan
        </button>
        <button
          onClick={() => setReportType('MONITORING')}
          className={`px-3 py-1.5 rounded-xl transition ${reportType === 'MONITORING' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Monitoring 24 Jam
        </button>
      </div>

      {/* Content Rendering based on reportType */}
      <div className="space-y-4">
        {reportType === 'ANGGOTA' && <LaporanSecurityAnggotaView />}
        {reportType === 'KOMANDAN' && <LaporanSecurityKomandanView />}
        {reportType === 'CHIEF' && <LaporanSecurityChiefView />}
        {reportType === 'CLEANING' && <LaporanCleaningServiceView />}
        {reportType === 'DRIVER' && <LaporanDriverView />}
        {reportType === 'STAFF' && <LaporanStaffView />}
        {reportType === 'TRACKING' && <LaporanTrackingPatroliView />}
        {reportType === 'REKAP' && <LaporanRekapKegiatanView />}
        {reportType === 'MONITORING' && <LaporanMonitoringKegiatanView />}
      </div>
    </div>
  );
};
