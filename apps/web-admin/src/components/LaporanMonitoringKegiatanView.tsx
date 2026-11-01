'use client';

import React, { useState } from 'react';
import { useData } from '../lib/DataContext';

interface MonitoringRow {
  no: number;
  namaAset: string;
  waktu: string;
  hours: {
    [hourIndex: number]: {
      scanned: boolean;
      timeFormatted?: string;
    };
  };
}

export const LaporanMonitoringKegiatanView: React.FC = () => {
  const { sites, checkpoints, users } = useData();

  const [tanggal, setTanggal] = useState<string>('2026-10-26');
  const [selectedSite, setSelectedSite] = useState<string>('KANTOR PUSAT');
  const [selectedPetugas, setSelectedPetugas] = useState<string>('ANDI RAHMAN');

  // Hourly slots (24 hours: 00:00 S/D 01:00 ... 23:00 S/D 00:00)
  const hourlySlots = Array.from({ length: 24 }, (_, i) => {
    const start = String(i).padStart(2, '0') + ':00';
    const end = String((i + 1) % 24).padStart(2, '0') + ':00';
    return {
      index: i,
      label: `${start}\nS/D\n${end}`,
      headerText: `${start} S/D ${end}`,
    };
  });

  // Seed data matching patroli.site live capture (Andi Rahman on 26 Oct 2026) 100%
  const demoRows: MonitoringRow[] = [
    {
      no: 1,
      namaAset: 'PARKIR BASEMENT',
      waktu: '05:33:00',
      hours: {
        5: { scanned: true, timeFormatted: '05:33' },
      },
    },
    {
      no: 2,
      namaAset: 'POS BELAKANG',
      waktu: '05:33:00',
      hours: {
        5: { scanned: true, timeFormatted: '05:33' },
      },
    },
    {
      no: 3,
      namaAset: 'POS UTAMA LOBBY',
      waktu: '05:32:00',
      hours: {
        5: { scanned: true, timeFormatted: '05:32' },
      },
    },
  ];

  const handleReset = () => {
    setTanggal('');
    setSelectedSite('');
    setSelectedPetugas('');
  };

  const handleExportExcel = () => {
    if (!tanggal || !selectedSite || !selectedPetugas) {
      alert('⚠️ Silakan pilih tanggal, lokasi, dan petugas terlebih dahulu.');
      return;
    }

    const info = `
      <div class="info-bar-modern" style="margin-bottom: 15px;">
        <span style="margin-right: 20px;"><b>Tanggal:</b> ${tanggal}</span>
        <span style="margin-right: 20px;"><b>Lokasi:</b> ${selectedSite}</span>
        <span><b>Petugas:</b> ${selectedPetugas}</span>
      </div>
    `;

    const tableHeadersHtml = `
      <thead>
        <tr>
          <th>NO</th>
          <th>NAMA ASET</th>
          <th>WAKTU</th>
          ${hourlySlots.map((s) => `<th>${s.headerText}</th>`).join('')}
        </tr>
      </thead>
    `;

    const tableRowsHtml = demoRows
      .map(
        (r) => `
        <tr>
          <td>${r.no}</td>
          <td>${r.namaAset}</td>
          <td>${r.waktu}</td>
          ${hourlySlots
            .map((s) => {
              const h = r.hours[s.index];
              return h?.scanned
                ? `<td style="color: green; font-weight: bold;">✓<br/>${h.timeFormatted}</td>`
                : `<td>-</td>`;
            })
            .join('')}
        </tr>
      `
      )
      .join('');

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #000; padding: 6px; text-align: center; vertical-align: middle; font-size: 11px; }
          th { background-color: #1e3a8a; color: #fff; font-weight: bold; }
        </style>
      </head>
      <body>
        <h3 style="text-align: center;">MONITORING PATROLI PERSONIL</h3>
        ${info}
        <table border="1">
          ${tableHeadersHtml}
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + html], {
      type: 'application/vnd.ms-excel;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `laporan_patroli_${selectedPetugas.replace(/\s+/g, '_')}_${tanggal}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const isFormComplete = Boolean(tanggal && selectedSite && selectedPetugas);

  return (
    <div className="w-full">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
      />

      <style dangerouslySetInnerHTML={{ __html: `
        .monitoring-patroli-container {
          width: 100%;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        .info-bar-modern {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px 18px;
          margin-bottom: 16px;
          display: flex;
          gap: 24px;
          align-items: center;
          box-shadow: 0 4px 12px rgba(15,23,42,.04);
        }
        .info-item {
          display: flex;
          flex-direction: column;
        }
        .info-item .label {
          font-size: 10px;
          text-transform: uppercase;
          font-weight: 700;
          color: #64748b;
          letter-spacing: .5px;
        }
        .info-item .value {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
        }
        .laporan-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }
        .laporan-table thead th {
          background-color: #1e3a8a;
          color: #ffffff;
          padding: 8px 4px;
          border: 1px solid #1e40af;
          text-align: center;
          font-weight: 700;
          font-size: 10px;
          line-height: 1.3;
          white-space: pre-line;
        }
        .laporan-table tbody td {
          border: 1px solid #cbd5e1;
          padding: 8px 4px;
          text-align: center;
          vertical-align: middle;
          font-size: 11px;
        }
        .laporan-table tbody tr:nth-child(even) {
          background-color: #f8fafc;
        }
        .laporan-table tbody tr:hover {
          background-color: #f1f5f9;
        }
        .cell-check {
          color: #16a34a;
          font-weight: 800;
          font-size: 14px;
        }
        .cell-time {
          font-size: 10px;
          font-weight: 600;
          color: #1e293b;
          display: block;
        }
      `}} />

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
                <option value="">-- Semua Lokasi --</option>
                <option value="KANTOR PUSAT">Kantor Pusat</option>
                <option value="PABRIK BEKASI">Pabrik Bekasi</option>
                <option value="GUDANG CAKUNG">Gudang Cakung</option>
                <option value="POOL KENDARAAN">Pool Kendaraan</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.name.toUpperCase()}>
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
                <option value="">-- Pilih Petugas --</option>
                <option value="ANDI RAHMAN">Andi Rahman (Security)</option>
                <option value="BUDI SANTOSO">Budi Santoso (Komandan)</option>
                <option value="SITI RAHAYU">Siti Rahayu (Cleaning)</option>
                <option value="RUDI HARTONO">Rudi Hartono (Driver)</option>
                <option value="HENDRA GUNAWAN">Hendra Gunawan (Staff)</option>
                {users.map((u) => (
                  <option key={u.id} value={u.fullName.toUpperCase()}>
                    {u.fullName}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-600 text-xs font-bold transition"
              >
                ↻ Reset
              </button>
              <button
                type="button"
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold transition shadow-xs"
              >
                📊 Cetak Excel
              </button>
            </div>
          </div>
        </div>

        {/* Monitoring Result */}
        {!isFormComplete ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
            <i className="fa fa-info-circle text-3xl text-slate-300 mb-2"></i>
            <p className="text-slate-500 font-semibold text-sm">
              TIDAK ADA DATA PATROLI UNTUK FILTER YANG DIPILIH.
            </p>
            <p className="text-slate-400 text-xs">
              Silakan pilih tanggal, lokasi, dan petugas terlebih dahulu untuk menampilkan matriks patroli 24 jam.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Info Bar Modern */}
            <div className="info-bar-modern">
              <div className="info-item">
                <span className="label">Tanggal</span>
                <span className="value">{tanggal}</span>
              </div>
              <div className="info-item">
                <span className="label">Lokasi</span>
                <span className="value">{selectedSite}</span>
              </div>
              <div className="info-item">
                <span className="label">Petugas</span>
                <span className="value">{selectedPetugas}</span>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="laporan-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>NO</th>
                      <th style={{ width: '180px', textAlign: 'left', paddingLeft: '10px' }}>NAMA ASET</th>
                      <th style={{ width: '70px' }}>WAKTU</th>
                      {hourlySlots.map((slot) => (
                        <th key={slot.index} style={{ width: '55px' }}>
                          {slot.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {demoRows.map((row) => (
                      <tr key={row.no}>
                        <td>{row.no}</td>
                        <td style={{ textAlign: 'left', paddingLeft: '10px', fontWeight: 600 }}>
                          {row.namaAset}
                        </td>
                        <td style={{ color: '#0d6efd', fontWeight: 600 }}>{row.waktu}</td>
                        {hourlySlots.map((slot) => {
                          const hourData = row.hours[slot.index];
                          return (
                            <td key={slot.index}>
                              {hourData?.scanned ? (
                                <div>
                                  <span className="cell-check">✓</span>
                                  <span className="cell-time">{hourData.timeFormatted}</span>
                                </div>
                              ) : (
                                <span className="text-slate-300">-</span>
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
        )}
      </div>
    </div>
  );
};
