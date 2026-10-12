'use client';

import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Calendar, Building2, Users } from 'lucide-react';

export const ExportCenterTab: React.FC = () => {
  const [personnelAbsMonth, setPersonnelAbsMonth] = useState<string>('2026-10');
  const [areaAbsMonth, setAreaAbsMonth] = useState<string>('2026-10');
  const [personnelKegStartDate, setPersonnelKegStartDate] = useState<string>('2026-10-01');
  const [personnelKegEndDate, setPersonnelKegEndDate] = useState<string>('2026-10-31');
  const [areaKegStartDate, setAreaKegStartDate] = useState<string>('2026-10-01');
  const [areaKegEndDate, setAreaKegEndDate] = useState<string>('2026-10-31');

  const triggerDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPersonnelAttendance = () => {
    const content = `NIK,Nama Personil,Divisi,Tanggal,Jam Masuk,Jam Pulang,Status\n` +
      `SEC-005,Ahmad Fauzi,SECURITY,2026-10-12,06:55:10,15:02:40,HADIR\n` +
      `DRV-001,Budi Santoso,DRIVER,2026-10-12,07:55:00,18:45:00,HADIR\n` +
      `CLN-001,Siti Rahma,CLEANING,2026-10-12,06:14:00,14:05:00,HADIR\n`;
    triggerDownload(`export_absensi_personil_${personnelAbsMonth}.csv`, content);
  };

  const handleExportAreaAttendance = () => {
    const content = `Fasilitas,Bulan,Total Personil Hadir,Rata-rata Jam Kerja,Kepatuhan Geofence\n` +
      `Head Office Sudirman,${areaAbsMonth},42 Orang,8.2 Jam,100%\n` +
      `Warehouse Cikarang,${areaAbsMonth},24 Orang,8.5 Jam,98%\n`;
    triggerDownload(`export_absensi_area_${areaAbsMonth}.csv`, content);
  };

  const handleExportPersonnelActivity = () => {
    const content = `Nama Personil,Pos Checkpoint,Waktu Scan,Kondisi,Catatan\n` +
      `Ahmad Fauzi,Pos Utama Gerbang Masuk,08:15 WIB,Situasi Aman Terkendali,Pintu gerbang tertutup\n` +
      `Ahmad Fauzi,Ruang Server IT Lt 3,10:05 WIB,Perlu Tindak Lanjut,Suhu AC ruangan 28C\n`;
    triggerDownload(`export_kegiatan_personil_${personnelKegStartDate}_sd_${personnelKegEndDate}.csv`, content);
  };

  const handleExportAreaActivity = () => {
    const content = `Fasilitas,Area,Total Checkpoint,Frekuensi Scan Harian,Status Perimeter\n` +
      `Head Office Sudirman,Semua Lantai,6 Pos,48 Kali/Hari,STERIL\n` +
      `Warehouse Cikarang,Perimeter Gudang,14 Pos,96 Kali/Hari,STERIL\n`;
    triggerDownload(`export_kegiatan_area_${areaKegStartDate}_sd_${areaKegEndDate}.csv`, content);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Title */}
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <Download className="w-5 h-5 text-blue-600" />
          <span>Pusat Unduhan Laporan Resmi (Export Center 4 Modul)</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Generate dokumen resmi siap cetak dan olah data (Excel XLSX / CSV & PDF) untuk audit manajemen korporat
        </p>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Absensi Personil */}
        <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4 shadow-sm hover:border-blue-400/50 transition">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">1. Export Absensi Personil</h3>
              <p className="text-xs text-slate-500">Rekap riwayat kehadiran detail per individu</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <label className="font-semibold text-slate-700 block">Periode Bulan & Tahun</label>
            <input
              type="month"
              value={personnelAbsMonth}
              onChange={(e) => setPersonnelAbsMonth(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-2.5 bg-white text-xs text-slate-800"
            />
          </div>

          <button
            onClick={handleExportPersonnelAttendance}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-sm transition active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Unduh Excel / CSV Absensi Personil</span>
          </button>
        </div>

        {/* Card 2: Absensi Area */}
        <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4 shadow-sm hover:border-emerald-400/50 transition">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">2. Export Absensi Area / Site</h3>
              <p className="text-xs text-slate-500">Rekapitulasi agregat kehadiran per fasilitas</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <label className="font-semibold text-slate-700 block">Periode Bulan & Tahun</label>
            <input
              type="month"
              value={areaAbsMonth}
              onChange={(e) => setAreaAbsMonth(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-2.5 bg-white text-xs text-slate-800"
            />
          </div>

          <button
            onClick={handleExportAreaAttendance}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-sm transition active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Unduh Excel / CSV Absensi Area</span>
          </button>
        </div>

        {/* Card 3: Kegiatan Personil */}
        <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4 shadow-sm hover:border-purple-400/50 transition">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">3. Export Kegiatan Personil</h3>
              <p className="text-xs text-slate-500">Log pemindaian barcode & temuan abnormalitas petugas</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Tanggal Dari</label>
              <input
                type="date"
                value={personnelKegStartDate}
                onChange={(e) => setPersonnelKegStartDate(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-2.5 bg-white text-xs text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Tanggal Sampai</label>
              <input
                type="date"
                value={personnelKegEndDate}
                onChange={(e) => setPersonnelKegEndDate(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-2.5 bg-white text-xs text-slate-800"
              />
            </div>
          </div>

          <button
            onClick={handleExportPersonnelActivity}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-sm transition active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Unduh Excel / CSV Kegiatan Personil</span>
          </button>
        </div>

        {/* Card 4: Kegiatan Area */}
        <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4 shadow-sm hover:border-indigo-400/50 transition">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">4. Export Kegiatan Area / Pos</h3>
              <p className="text-xs text-slate-500">Volume scanning dan kepatuhan per titik aset fasilitas</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Tanggal Dari</label>
              <input
                type="date"
                value={areaKegStartDate}
                onChange={(e) => setAreaKegStartDate(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-2.5 bg-white text-xs text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Tanggal Sampai</label>
              <input
                type="date"
                value={areaKegEndDate}
                onChange={(e) => setAreaKegEndDate(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-2.5 bg-white text-xs text-slate-800"
              />
            </div>
          </div>

          <button
            onClick={handleExportAreaActivity}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-sm transition active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Unduh Excel / CSV Kegiatan Area</span>
          </button>
        </div>
      </div>
    </div>
  );
};
