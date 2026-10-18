'use client';

import React, { useState } from 'react';
import { useData } from '../lib/DataContext';

interface MonitoringRow {
  id: string;
  no: number;
  namaAset: string;
  hours: {
    [hourIndex: number]: {
      scanned: boolean;
      timeFormatted?: string;
    };
  };
}

export const LaporanMonitoringKegiatanView: React.FC = () => {
  const { sites, checkpoints, users } = useData();

  const [tanggal, setTanggal] = useState<string>('2026-10-12');
  const [selectedSite, setSelectedSite] = useState<string>('Site Proyek Demo');
  const [selectedPetugas, setSelectedPetugas] = useState<string>('Budi Satpam Test');

  // Hourly slots (24 hours)
  const hourlySlots = Array.from({ length: 24 }, (_, i) => {
    const start = String(i).padStart(2, '0') + ':00';
    const end = String((i + 1) % 24).padStart(2, '0') + ':00';
    return `${start} S/D ${end}`;
  });

  // Demo seed matching patroli_site_monitoring_kegiatan.png 100%
  const demoRows: MonitoringRow[] = [
    {
      id: 'ast-1',
      no: 1,
      namaAset: 'POS GERBANG UTAMA',
      hours: {
        18: { scanned: true, timeFormatted: '18:01' },
      },
    },
    {
      id: 'ast-2',
      no: 2,
      namaAset: 'LOBBY & RESEPSIONIS',
      hours: {
        8: { scanned: true, timeFormatted: '08:15' },
        12: { scanned: true, timeFormatted: '12:05' },
      },
    },
    {
      id: 'ast-3',
      no: 3,
      namaAset: 'RUANG SERVER IT LT 3',
      hours: {
        10: { scanned: true, timeFormatted: '10:12' },
        14: { scanned: true, timeFormatted: '14:20' },
      },
    },
  ];

  const handleReset = () => {
    setTanggal('2026-10-12');
    setSelectedSite('Site Proyek Demo');
    setSelectedPetugas('Budi Satpam Test');
  };

  const handleExportExcel = () => {
    // Generate CSV export
    const headers = ['NO', 'NAMA ASET', ...hourlySlots];
    const rows = demoRows.map((r) => [
      r.no,
      r.namaAset,
      ...Array.from({ length: 24 }, (_, i) => (r.hours[i]?.scanned ? r.hours[i]?.timeFormatted : '-')),
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `monitoring-patroli-${tanggal}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
      />

      <style jsx global>{`
        .monitoring-patroli-container {
          width: 100%;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        .monitoring-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }
        .monitoring-table thead th {
          background-color: #1a56db;
          color: #ffffff;
          padding: 8px 6px;
          border: 1px solid #2563eb;
          text-align: center;
          font-weight: 700;
          white-space: nowrap;
        }
        .monitoring-table tbody td {
          border: 1px solid #e2e8f0;
          padding: 8px 6px;
          text-align: center;
          vertical-align: middle;
          white-space: nowrap;
        }
      `}</style>

      <div className="monitoring-patroli-container space-y-5">
        {/* Centered Page Title */}
        <div className="text-center pt-2">
          <h2 className="text-xl md:text-2xl font-extrabold text-[#1a56db] tracking-wide">
            MONITORING PATROLI PERSONIL
          </h2>
        </div>

        {/* Filter Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <div className="flex flex-wrap items-end gap-4">
            {/* Tanggal */}
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                TANGGAL :
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-600 bg-white"
              />
            </div>

            {/* Pilih Lokasi */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                PILIH LOKASI :
              </label>
              <select
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-600 bg-white"
              >
                <option value="Site Proyek Demo">Site Proyek Demo</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Petugas */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                PETUGAS :
              </label>
              <select
                value={selectedPetugas}
                onChange={(e) => setSelectedPetugas(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-600 bg-white"
              >
                <option value="Budi Satpam Test">Budi Satpam Test</option>
                <option value="Dandan Komandan">Dandan Komandan</option>
                <option value="Akmal">Akmal</option>
                <option value="Supri Driver">Supri Driver</option>
                {users.map((u) => (
                  <option key={u.id} value={u.fullName}>
                    {u.fullName}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="bg-[#f59e0b] hover:bg-[#d97706] text-slate-900 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition shadow-xs"
              >
                <i className="fa fa-refresh"></i>
                <span>Reset</span>
              </button>

              <button
                type="button"
                onClick={handleExportExcel}
                className="bg-[#10b981] hover:bg-[#059669] text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition shadow-xs"
              >
                <i className="fa fa-file-excel-o"></i>
                <span>Cetak Excel</span>
              </button>
            </div>
          </div>

          {/* Meta Summary Row */}
          <div className="flex flex-wrap items-center gap-8 mt-6 pt-4 border-t border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block text-[11px]">TANGGAL</span>
              <span className="font-extrabold text-slate-800 text-sm">{tanggal}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[11px]">LOKASI</span>
              <span className="font-extrabold text-slate-800 text-sm uppercase">{selectedSite}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[11px]">PETUGAS</span>
              <span className="font-extrabold text-slate-800 text-sm uppercase">{selectedPetugas}</span>
            </div>
          </div>
        </div>

        {/* Hourly Matrix Table Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="monitoring-table">
              <thead>
                <tr>
                  <th rowSpan={2} style={{ width: '40px' }}>
                    NO
                  </th>
                  <th rowSpan={2} style={{ minWidth: '180px', textAlign: 'left', paddingLeft: '12px' }}>
                    NAMA ASET
                  </th>
                  <th colSpan={24}>WAKTU</th>
                </tr>
                <tr>
                  {hourlySlots.map((slot, idx) => (
                    <th key={idx} style={{ fontSize: '10px', padding: '6px 4px', minWidth: '70px' }}>
                      {slot}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {demoRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="font-bold text-slate-700">{row.no}</td>
                    <td className="font-bold text-slate-800 text-left pl-3">{row.namaAset}</td>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hourData = row.hours[i];
                      return (
                        <td key={i} className="h-12">
                          {hourData?.scanned ? (
                            <div className="flex flex-col items-center justify-center">
                              <span className="text-emerald-600 font-extrabold text-sm">✓</span>
                              <span className="text-[10px] font-bold text-rose-600">
                                {hourData.timeFormatted}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-200">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
