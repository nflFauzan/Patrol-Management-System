'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Sparkles, 
  Truck, 
  UserCheck, 
  MapPin, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Download,
  Filter
} from 'lucide-react';
import { LaporanSecurityAnggotaView } from './LaporanSecurityAnggotaView';

interface ReportsTabProps {
  selectedSiteId: string;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({ selectedSiteId }) => {
  const [reportType, setReportType] = useState<
    'ANGGOTA' | 'KOMANDAN' | 'CHIEF' | 'CLEANING' | 'DRIVER' | 'STAFF' | 'TRACKING' | 'REKAP'
  >('ANGGOTA');

  // Sample data for 8 report types
  const sampleAnggota = [
    {
      id: 'rep-1',
      officerName: 'Ahmad Fauzi',
      checkpoint: 'Pos Utama Gerbang Masuk',
      time: '08:15 WIB',
      status: 'Situasi Aman Terkendali',
      notes: 'Pintu gerbang tertutup, ID card pengunjung diperiksa',
      isAbnormal: false,
    },
    {
      id: 'rep-2',
      officerName: 'Ahmad Fauzi',
      checkpoint: 'Ruang Server IT Lt 3',
      time: '10:05 WIB',
      status: 'Perlu Tindak Lanjut',
      notes: 'Suhu AC ruangan 28C, perlu penanganan tim teknis',
      isAbnormal: true,
    },
  ];

  const sampleKomandan = [
    {
      id: 'kom-1',
      komandanName: 'Bambang Supriyanto',
      shiftName: 'Shift Pagi (07:00 - 15:00)',
      personnelPresent: 6,
      notes: 'Apel serah terima tugas shift malam ke pagi selesai, seragam lengkap & senpi tersimpan aman di loker.',
      time: '07:00 WIB',
    },
  ];

  const sampleChief = [
    {
      id: 'chf-1',
      chiefName: 'Hendra Gunawan',
      komandanEvaluated: 'Bambang Supriyanto (Regu A)',
      disciplineScore: 92,
      incidentNotes: 'Zero incident shift ini. Pengawasan pos perimeter terlaksana sesuai SOP korporat.',
      time: '12:00 WIB',
    },
  ];

  const sampleCleaning = [
    {
      id: 'cln-1',
      cleanerName: 'Siti Rahma',
      zone: 'Restroom Lt 2 Eksekutif',
      floorCleaned: true,
      trashEmptied: true,
      suppliesRestocked: true,
      odorNormal: true,
      time: '09:30 WIB',
    },
  ];

  const sampleDriver = [
    {
      id: 'drv-1',
      driverName: 'Budi Santoso',
      plate: 'B 1234 CD',
      route: 'HQ SCBD ➔ Warehouse Cikarang',
      odometerStart: 45210,
      odometerEnd: 45265,
      distanceKm: 55,
      status: 'Tiba di Tujuan',
      time: '11:45 WIB',
    },
  ];

  const sampleStaff = [
    {
      id: 'stf-1',
      staffName: 'Rina Wijaya',
      activityType: 'Audit Administrasi Pos Satpam',
      description: 'Pemeriksaan buku mutasi tamu dan verifikasi stiker parkir bulanan.',
      status: 'SELESAI',
      time: '13:00 WIB',
    },
  ];

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
            9 Format Laporan Resmi Sesuai Hierarki Korporat (Anggota, Komandan, Chief, CS, Driver, Staf, Tracking, Rekap)
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
          Tracking Peta Patroli
        </button>
        <button
          onClick={() => setReportType('REKAP')}
          className={`px-3 py-1.5 rounded-xl transition ${reportType === 'REKAP' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Rekap Kegiatan Bulanan
        </button>
      </div>

      {/* Content Rendering based on reportType */}
      <div className="space-y-4">
        {reportType === 'ANGGOTA' && (
          <LaporanSecurityAnggotaView />
        )}

        {reportType === 'KOMANDAN' && (
          <div className="space-y-3">
            {sampleKomandan.map((k) => (
              <div key={k.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2 text-xs">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-bold text-slate-900 text-sm">Komandan Regu: {k.komandanName}</span>
                  <span className="font-mono text-slate-500">{k.time}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div><strong>Shift:</strong> {k.shiftName}</div>
                  <div><strong>Kekuatan Personil:</strong> {k.personnelPresent} Orang Hadir Lengkap</div>
                </div>
                <p className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-700 mt-2">
                  <strong>Catatan Mutasi & Serah Terima:</strong> {k.notes}
                </p>
              </div>
            ))}
          </div>
        )}

        {reportType === 'CHIEF' && (
          <div className="space-y-3">
            {sampleChief.map((c) => (
              <div key={c.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2 text-xs">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-bold text-slate-900 text-sm">Chief Security: {c.chiefName}</span>
                  <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[10px]">
                    Nilai Kedisiplinan: {c.disciplineScore}/100
                  </span>
                </div>
                <p className="text-slate-600"><strong>Regu Disupervisi:</strong> {c.komandanEvaluated}</p>
                <p className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-700 mt-2">
                  <strong>Evaluasi & Resolusi Insiden:</strong> {c.incidentNotes}
                </p>
              </div>
            ))}
          </div>
        )}

        {reportType === 'CLEANING' && (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold uppercase border-b">
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3">Petugas</th>
                  <th className="py-2.5 px-3">Zona Sanitasi</th>
                  <th className="py-2.5 px-3 text-center">Lantai Dipel</th>
                  <th className="py-2.5 px-3 text-center">Sampah Kosong</th>
                  <th className="py-2.5 px-3 text-center">Tisu/Sabun Cukup</th>
                  <th className="py-2.5 px-3 text-center">Aroma Wangi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sampleCleaning.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono">{c.time}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{c.cleanerName}</td>
                    <td className="py-2.5 px-3">{c.zone}</td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ Ya</td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ Ya</td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ Ya</td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ Ya</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'DRIVER' && (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold uppercase border-b">
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3">Driver</th>
                  <th className="py-2.5 px-3">Plat Armada</th>
                  <th className="py-2.5 px-3">Rute Distribusi</th>
                  <th className="py-2.5 px-3 text-right">Odometer Awal</th>
                  <th className="py-2.5 px-3 text-right">Odometer Akhir</th>
                  <th className="py-2.5 px-3 text-center">Jarak Tempuh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sampleDriver.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono">{d.time}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{d.driverName}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-purple-700">{d.plate}</td>
                    <td className="py-2.5 px-3">{d.route}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{d.odometerStart.toLocaleString()} km</td>
                    <td className="py-2.5 px-3 text-right font-mono">{d.odometerEnd.toLocaleString()} km</td>
                    <td className="py-2.5 px-3 text-center font-bold text-emerald-700">{d.distanceKm} km</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'STAFF' && (
          <div className="space-y-3">
            {sampleStaff.map((s) => (
              <div key={s.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-1 text-xs">
                <div className="flex justify-between items-center border-b pb-1">
                  <span className="font-bold text-slate-900 text-sm">{s.staffName} • {s.activityType}</span>
                  <span className="font-mono text-slate-500">{s.time}</span>
                </div>
                <p className="text-slate-700 mt-1">{s.description}</p>
                <span className="inline-block mt-2 text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded">
                  Status: {s.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {reportType === 'TRACKING' && (
          <div className="border border-slate-200 rounded-xl p-6 bg-slate-50 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <MapPin className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Tracking Peta Patroli Checkpoint (Leaflet PostGIS)</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Memetakan jejak lintasan koordinat GPS petugas saat melakukan pemindaian checkpoint di perimeter fasilitas.
              </p>
            </div>
            <div className="bg-white border rounded-xl p-4 max-w-lg mx-auto text-left text-xs space-y-2">
              <div className="flex justify-between border-b pb-1">
                <span className="text-slate-500">Site Fasilitas:</span>
                <span className="font-bold text-slate-900">Head Office Sudirman</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-slate-500">Pusat Geofence:</span>
                <span className="font-mono text-slate-800">-6.2255, 106.8090 (Radius 100m)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jumlah Pin Terverifikasi:</span>
                <span className="font-bold text-emerald-600">6 Pos Steril</span>
              </div>
            </div>
          </div>
        )}

        {reportType === 'REKAP' && (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold uppercase border-b">
                  <th className="py-2.5 px-3">Nama Petugas</th>
                  <th className="py-2.5 px-3">Divisi</th>
                  <th className="py-2.5 px-2 text-center">Jan</th>
                  <th className="py-2.5 px-2 text-center">Feb</th>
                  <th className="py-2.5 px-2 text-center">Mar</th>
                  <th className="py-2.5 px-2 text-center">Apr</th>
                  <th className="py-2.5 px-2 text-center">Mei</th>
                  <th className="py-2.5 px-2 text-center">Jun</th>
                  <th className="py-2.5 px-2 text-center">Jul</th>
                  <th className="py-2.5 px-2 text-center">Agu</th>
                  <th className="py-2.5 px-2 text-center">Sep</th>
                  <th className="py-2.5 px-2 text-center bg-blue-50 text-blue-900">Okt (Aktif)</th>
                  <th className="py-2.5 px-3 text-center font-bold">Total Tahun 2026</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">Ahmad Fauzi</td>
                  <td className="py-2.5 px-3">Security</td>
                  <td className="py-2.5 px-2 text-center text-slate-400">120</td>
                  <td className="py-2.5 px-2 text-center text-slate-400">118</td>
                  <td className="py-2.5 px-2 text-center text-slate-400">125</td>
                  <td className="py-2.5 px-2 text-center text-slate-400">122</td>
                  <td className="py-2.5 px-2 text-center text-slate-400">130</td>
                  <td className="py-2.5 px-2 text-center text-slate-400">128</td>
                  <td className="py-2.5 px-2 text-center text-slate-400">135</td>
                  <td className="py-2.5 px-2 text-center text-slate-400">132</td>
                  <td className="py-2.5 px-2 text-center text-slate-400">129</td>
                  <td className="py-2.5 px-2 text-center font-bold text-blue-700 bg-blue-50/40">58</td>
                  <td className="py-2.5 px-3 text-center font-extrabold text-slate-900">1,197 Scan</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">Siti Rahma</td>
                  <td className="py-2.5 px-3">Cleaning</td>
                  <td className="py-2.5 px-2 text-center text-slate-400">95</td>
                  <td className="py-2.5 px-2 text-center text-slate-400">90</td>
                  <td className="py-2.5 px-2 text-center text-slate-400">98</td>
                  <td className="py-2.5 px-2 text-center text-slate-400">94</td>
                  <td className="py-2.5 px-2 text-center text-slate-400">102</td>
                  <td className="py-2.5 px-2 text-center text-slate-400">100</td>
                  <td className="py-2.5 px-2 text-center text-slate-400">105</td>
                  <td className="py-2.5 px-2 text-center text-slate-400">104</td>
                  <td className="py-2.5 px-2 text-center text-slate-400">101</td>
                  <td className="py-2.5 px-2 text-center font-bold text-blue-700 bg-blue-50/40">45</td>
                  <td className="py-2.5 px-3 text-center font-extrabold text-slate-900">934 Cek</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
