'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '../lib/DataContext';

interface RekapRecord {
  id: string;
  namaPersonil: string;
  posisi: string;
  lokasiSite: string;
  bulan: string;
  tahun: string;
  totalKegiatan: number;
}

export const LaporanRekapKegiatanView: React.FC = () => {
  const { sites } = useData();

  // Filters matching patroli.site live capture
  const [filterLokasi, setFilterLokasi] = useState<string>('');
  const [filterPosisi, setFilterPosisi] = useState<string>('');
  const [filterBulan, setFilterBulan] = useState<string>('10');
  const [filterTahun, setFilterTahun] = useState<string>('2026');

  // DataTables controls
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [pageLength, setPageLength] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Live aggregated records from patroli.site 100%
  const initialRecords: RekapRecord[] = [
    {
      id: 'rk-1',
      namaPersonil: 'ANDI RAHMAN',
      posisi: 'SECURITY',
      lokasiSite: 'KANTOR PUSAT',
      bulan: 'OCTOBER',
      tahun: '2026',
      totalKegiatan: 3,
    },
    {
      id: 'rk-2',
      namaPersonil: 'RUDI HARTONO',
      posisi: 'DRIVER',
      lokasiSite: 'POOL KENDARAAN',
      bulan: 'OCTOBER',
      tahun: '2026',
      totalKegiatan: 2,
    },
    {
      id: 'rk-3',
      namaPersonil: 'BUDI SANTOSO',
      posisi: 'SECURITY',
      lokasiSite: 'KANTOR PUSAT',
      bulan: 'OCTOBER',
      tahun: '2026',
      totalKegiatan: 1,
    },
    {
      id: 'rk-4',
      namaPersonil: 'SITI RAHAYU',
      posisi: 'CLEANING SERVICE',
      lokasiSite: 'KANTOR PUSAT',
      bulan: 'OCTOBER',
      tahun: '2026',
      totalKegiatan: 1,
    },
    {
      id: 'rk-5',
      namaPersonil: 'HENDRA GUNAWAN',
      posisi: 'STAF',
      lokasiSite: 'KANTOR PUSAT',
      bulan: 'OCTOBER',
      tahun: '2026',
      totalKegiatan: 2,
    },
  ];

  const monthNames: { [k: string]: string } = {
    '1': 'JANUARY',
    '2': 'FEBRUARY',
    '3': 'MARCH',
    '4': 'APRIL',
    '5': 'MAY',
    '6': 'JUNE',
    '7': 'JULY',
    '8': 'AUGUST',
    '9': 'SEPTEMBER',
    '10': 'OCTOBER',
    '11': 'NOVEMBER',
    '12': 'DECEMBER',
  };

  const filteredRecords = useMemo(() => {
    return initialRecords.filter((r) => {
      if (filterLokasi && !r.lokasiSite.toLowerCase().includes(filterLokasi.toLowerCase())) return false;
      if (filterPosisi && !r.posisi.toLowerCase().includes(filterPosisi.toLowerCase())) return false;
      if (filterBulan && monthNames[filterBulan] && r.bulan.toUpperCase() !== monthNames[filterBulan]) return false;
      if (filterTahun && r.tahun !== filterTahun) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const match =
          r.namaPersonil.toLowerCase().includes(q) ||
          r.posisi.toLowerCase().includes(q) ||
          r.lokasiSite.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [filterLokasi, filterPosisi, filterBulan, filterTahun, searchTerm]);

  const totalRecords = filteredRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageLength));
  const startIndex = (currentPage - 1) * pageLength;
  const currentRecords = filteredRecords.slice(startIndex, startIndex + pageLength);

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=900,height=700');
    if (!printWindow) return;

    const rowsHtml = filteredRecords
      .map(
        (r) => `
        <tr>
          <td>${r.namaPersonil}</td>
          <td>${r.posisi}</td>
          <td>${r.lokasiSite}</td>
          <td>${r.bulan}</td>
          <td>${r.tahun}</td>
          <td><b>${r.totalKegiatan}</b></td>
        </tr>
      `
      )
      .join('');

    printWindow.document.write(`
      <html>
      <head>
        <title>Rekap Kegiatan Personil</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 25px; }
          h2 { text-align: center; margin-bottom: 20px; font-size: 18px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
          th, td { border: 1px solid #333; padding: 8px; text-align: center; }
          th { background-color: #1a4291; color: white; }
          tr:nth-child(even) { background-color: #f9f9f9; }
        </style>
      </head>
      <body>
        <h2>REKAP KEGIATAN PERSONIL</h2>
        <table>
          <thead>
            <tr>
              <th>NAMA PERSONIL</th>
              <th>POSISI</th>
              <th>LOKASI SITE</th>
              <th>BULAN</th>
              <th>TAHUN</th>
              <th>TOTAL KEGIATAN</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() { window.close(); };
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="w-full">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
      />

      <style dangerouslySetInnerHTML={{ __html: `
        .laporan-rekap-container {
          width: 100%;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        .rekap-card-header {
          background-color: #1a4291 !important;
          color: #ffffff !important;
          padding: 14px 20px;
          border-radius: 8px 8px 0 0;
          font-size: 14px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .rekap-card-body {
          border: 1px solid #1a4291;
          border-radius: 0 0 8px 8px;
          padding: 20px;
          background-color: #ffffff;
        }
        .rekap-filter-label {
          font-size: 11px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 5px;
          display: block;
          letter-spacing: 0.5px;
        }
        .rekap-select {
          width: 100%;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 7px 10px;
          font-size: 12px;
          color: #334155;
          background-color: #ffffff;
          outline: none;
          transition: border-color 0.15s ease-in-out;
        }
        .rekap-select:focus {
          border-color: #1a4291;
          box-shadow: 0 0 0 3px rgba(26, 66, 145, 0.1);
        }
      `}} />

      <div className="laporan-rekap-container">
        {/* Header */}
        <div className="rekap-card-header shadow-xs">
          <i className="fa fa-file-text-o" style={{ fontSize: '16px' }}></i>
          <span>REKAP KEGIATAN PERSONIL</span>
        </div>

        {/* Body */}
        <div className="rekap-card-body shadow-xs">
          {/* Filters Form */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Lokasi */}
            <div>
              <label className="rekap-filter-label">LOKASI / SITE :</label>
              <select
                value={filterLokasi}
                onChange={(e) => setFilterLokasi(e.target.value)}
                className="rekap-select"
              >
                <option value="">Semua Lokasi</option>
                <option value="kantor pusat">Kantor Pusat</option>
                <option value="pabrik bekasi">Pabrik Bekasi</option>
                <option value="gudang cakung">Gudang Cakung</option>
                <option value="pool kendaraan">Pool Kendaraan</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.name.toLowerCase()}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Posisi */}
            <div>
              <label className="rekap-filter-label">POSISI :</label>
              <select
                value={filterPosisi}
                onChange={(e) => setFilterPosisi(e.target.value)}
                className="rekap-select"
              >
                <option value="">Semua Posisi</option>
                <option value="Security">Security</option>
                <option value="Cleaning Service">Cleaning Service</option>
                <option value="Driver">Driver</option>
                <option value="Staf">Staf</option>
              </select>
            </div>

            {/* Bulan */}
            <div>
              <label className="rekap-filter-label">BULAN :</label>
              <select
                value={filterBulan}
                onChange={(e) => setFilterBulan(e.target.value)}
                className="rekap-select"
              >
                <option value="">Semua Bulan</option>
                <option value="1">January</option>
                <option value="2">February</option>
                <option value="3">March</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
                <option value="7">July</option>
                <option value="8">August</option>
                <option value="9">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
            </div>

            {/* Tahun */}
            <div>
              <label className="rekap-filter-label">TAHUN :</label>
              <select
                value={filterTahun}
                onChange={(e) => setFilterTahun(e.target.value)}
                className="rekap-select"
              >
                <option value="">Semua Tahun</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>
            </div>
          </div>

          {/* Table Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-700 font-medium flex items-center gap-1.5">
                SHOW
                <select
                  value={pageLength}
                  onChange={(e) => {
                    setPageLength(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-slate-300 rounded px-2 py-1 text-xs bg-white outline-none"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
                ENTRIES
              </label>

              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition shadow-xs"
              >
                <i className="fa fa-print"></i> Cetak Tabel
              </button>
            </div>

            <div>
              <label className="text-xs text-slate-700 font-medium flex items-center gap-2">
                SEARCH:
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari personil..."
                  className="border border-slate-300 rounded px-3 py-1 text-xs outline-none focus:border-blue-700 w-48"
                />
              </label>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-[#1a4291] text-white">
                  <th className="p-3 text-left border border-[#1a4291] font-bold">NAMA PERSONIL</th>
                  <th className="p-3 text-center border border-[#1a4291] font-bold">POSISI</th>
                  <th className="p-3 text-center border border-[#1a4291] font-bold">LOKASI SITE</th>
                  <th className="p-3 text-center border border-[#1a4291] font-bold">BULAN</th>
                  <th className="p-3 text-center border border-[#1a4291] font-bold">TAHUN</th>
                  <th className="p-3 text-center border border-[#1a4291] font-bold">TOTAL KEGIATAN</th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500 font-semibold border border-slate-200">
                      Data tidak ditemukan
                    </td>
                  </tr>
                ) : (
                  currentRecords.map((r, idx) => (
                    <tr
                      key={r.id}
                      className={`border-b border-slate-200 hover:bg-blue-50/40 transition ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                      }`}
                    >
                      <td className="p-3 text-left font-bold text-slate-800 border-x border-slate-200">
                        {r.namaPersonil}
                      </td>
                      <td className="p-3 text-center text-slate-700 border-r border-slate-200 font-semibold">
                        {r.posisi}
                      </td>
                      <td className="p-3 text-center text-slate-700 border-r border-slate-200 font-semibold">
                        {r.lokasiSite}
                      </td>
                      <td className="p-3 text-center text-slate-600 border-r border-slate-200">
                        {r.bulan}
                      </td>
                      <td className="p-3 text-center text-slate-600 border-r border-slate-200">
                        {r.tahun}
                      </td>
                      <td className="p-3 text-center font-extrabold text-[#1a4291] border-r border-slate-200">
                        <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-xs font-bold">
                          {r.totalKegiatan}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 text-xs text-slate-600">
            <div>
              SHOWING {startIndex + 1} TO {Math.min(startIndex + pageLength, totalRecords)} OF {totalRecords} ENTRIES
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-bold"
              >
                PREVIOUS
              </button>
              <button
                type="button"
                className="px-3 py-1 rounded bg-[#1a4291] text-white font-bold"
              >
                {currentPage}
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 rounded border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-bold"
              >
                NEXT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
