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
  const { sites, users } = useData();

  // Filters
  const [filterLokasi, setFilterLokasi] = useState<string>('');
  const [filterPosisi, setFilterPosisi] = useState<string>('');
  const [filterBulan, setFilterBulan] = useState<string>('');
  const [filterTahun, setFilterTahun] = useState<string>('');

  // DataTables controls
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [pageLength, setPageLength] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Demo seed data matching patroli_site_rekap_kegiatan.png 100%
  const initialRecords: RekapRecord[] = [
    {
      id: 'rk-1',
      namaPersonil: 'AKMAL',
      posisi: 'CLEANING SERVICE',
      lokasiSite: 'SITE PROYEK DEMO',
      bulan: 'OCTOBER',
      tahun: '2026',
      totalKegiatan: 2,
    },
    {
      id: 'rk-2',
      namaPersonil: 'BUDI SATPAM TEST',
      posisi: 'SECURITY',
      lokasiSite: 'SITE PROYEK DEMO',
      bulan: 'OCTOBER',
      tahun: '2026',
      totalKegiatan: 1,
    },
    {
      id: 'rk-3',
      namaPersonil: 'DANDAN KOMANDAN',
      posisi: 'SECURITY KOMANDAN',
      lokasiSite: 'SITE PROYEK DEMO',
      bulan: 'OCTOBER',
      tahun: '2026',
      totalKegiatan: 3,
    },
    {
      id: 'rk-4',
      namaPersonil: 'SUPRI DRIVER',
      posisi: 'DRIVER',
      lokasiSite: 'SITE PROYEK DEMO',
      bulan: 'OCTOBER',
      tahun: '2026',
      totalKegiatan: 4,
    },
  ];

  // Filter records
  const filteredRecords = useMemo(() => {
    return initialRecords.filter((r) => {
      if (filterLokasi && !r.lokasiSite.toLowerCase().includes(filterLokasi.toLowerCase())) return false;
      if (filterPosisi && !r.posisi.toLowerCase().includes(filterPosisi.toLowerCase())) return false;
      if (filterBulan && r.bulan.toUpperCase() !== filterBulan.toUpperCase()) return false;
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

  const bulanOptions = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
  ];

  const tahunOptions = ['2024', '2025', '2026', '2027'];

  return (
    <div className="w-full">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
      />

      <style jsx global>{`
        .laporan-rekap-container {
          width: 100%;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        .rekap-card-header {
          background-color: #1a4291 !important;
          color: #ffffff !important;
          padding: 14px 20px;
          border-radius: 8px 8px 0 0;
          font-size: 15px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .rekap-card-body {
          border: 1px solid #1a4291;
          border-radius: 0 0 8px 8px;
          padding: 24px;
          background-color: #ffffff;
        }
        .rekap-filter-label {
          font-size: 12px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 6px;
          display: block;
          letter-spacing: 0.5px;
        }
        .rekap-select {
          width: 100%;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 13px;
          color: #334155;
          background-color: #ffffff;
          outline: none;
          transition: border-color 0.15s ease-in-out;
        }
        .rekap-select:focus {
          border-color: #1a4291;
        }
        .rekap-btn-print {
          background-color: #1d4ed8;
          color: #ffffff;
          font-weight: 700;
          font-size: 13px;
          padding: 10px 20px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: background-color 0.15s;
        }
        .rekap-btn-print:hover {
          background-color: #1e40af;
        }
        .rekap-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }
        .rekap-table thead th {
          background-color: #233858;
          color: #ffffff;
          padding: 12px 14px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-align: left;
          border-top: none;
        }
        .rekap-table tbody td {
          padding: 14px;
          font-size: 13px;
          border-top: 1px solid #e2e8f0;
          color: #334155;
          vertical-align: middle;
        }
        .rekap-table tbody tr:hover {
          background-color: #f8fafc;
        }
      `}</style>

      <div className="laporan-rekap-container">
        <div className="row">
          <div className="col-12" style={{ marginTop: '10px' }}>
            {/* Header: REKAP KEGIATAN PERSONIL */}
            <div className="rekap-card-header shadow-xs">
              <i className="fa fa-clock-o" style={{ fontSize: '18px' }}></i>
              <span>REKAP KEGIATAN PERSONIL</span>
            </div>

            {/* Card Body */}
            <div className="rekap-card-body shadow-xs">
              {/* 4 Filters Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="rekap-filter-label">FILTER LOKASI:</label>
                  <select
                    className="rekap-select"
                    value={filterLokasi}
                    onChange={(e) => {
                      setFilterLokasi(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="">Semua Lokasi</option>
                    {sites.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                    <option value="SITE PROYEK DEMO">SITE PROYEK DEMO</option>
                  </select>
                </div>

                <div>
                  <label className="rekap-filter-label">FILTER POSISI:</label>
                  <select
                    className="rekap-select"
                    value={filterPosisi}
                    onChange={(e) => {
                      setFilterPosisi(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="">Semua Posisi</option>
                    <option value="SECURITY">SECURITY</option>
                    <option value="SECURITY KOMANDAN">SECURITY KOMANDAN</option>
                    <option value="SECURITY CHIEF">SECURITY CHIEF</option>
                    <option value="CLEANING SERVICE">CLEANING SERVICE</option>
                    <option value="DRIVER">DRIVER</option>
                    <option value="STAFF">STAFF OPERASIONAL</option>
                  </select>
                </div>

                <div>
                  <label className="rekap-filter-label">FILTER BULAN:</label>
                  <select
                    className="rekap-select"
                    value={filterBulan}
                    onChange={(e) => {
                      setFilterBulan(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="">Semua Bulan</option>
                    {bulanOptions.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="rekap-filter-label">FILTER TAHUN:</label>
                  <select
                    className="rekap-select"
                    value={filterTahun}
                    onChange={(e) => {
                      setFilterTahun(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="">Semua Tahun</option>
                    {tahunOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cetak Rekap Kegiatan Button */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rekap-btn-print"
                >
                  <i className="fa fa-print"></i>
                  <span>Cetak Rekap Kegiatan</span>
                </button>
              </div>

              {/* DataTables Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <span>SHOW</span>
                  <select
                    value={pageLength}
                    onChange={(e) => {
                      setPageLength(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-slate-300 rounded px-2 py-1 text-xs bg-white"
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                  </select>
                  <span>ENTRIES</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700">SEARCH:</span>
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Cari personil..."
                    className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-600 w-56"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="rekap-table">
                  <thead>
                    <tr>
                      <th style={{ width: '22%' }}>NAMA PERSONIL</th>
                      <th style={{ width: '20%' }}>POSISI</th>
                      <th style={{ width: '25%' }}>LOKASI SITE</th>
                      <th style={{ width: '13%' }}>BULAN</th>
                      <th style={{ width: '10%' }}>TAHUN</th>
                      <th style={{ width: '10%', textAlign: 'center' }}>TOTAL KEGIATAN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400 font-semibold">
                          Tidak ada data rekap kegiatan ditemukan.
                        </td>
                      </tr>
                    ) : (
                      currentRecords.map((r) => (
                        <tr key={r.id}>
                          <td className="font-bold text-slate-800">{r.namaPersonil}</td>
                          <td className="font-semibold text-slate-600">{r.posisi}</td>
                          <td className="text-slate-600">{r.lokasiSite}</td>
                          <td className="font-semibold text-slate-700">{r.bulan}</td>
                          <td className="text-slate-600">{r.tahun}</td>
                          <td className="text-center font-bold text-blue-700">{r.totalKegiatan}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* DataTables Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-200 text-xs text-slate-500">
                <div>
                  SHOWING {totalRecords === 0 ? 0 : startIndex + 1} TO{' '}
                  {Math.min(startIndex + pageLength, totalRecords)} OF {totalRecords} ENTRIES
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1 border border-slate-300 rounded text-slate-600 disabled:opacity-50 hover:bg-slate-50 font-semibold"
                  >
                    PREVIOUS
                  </button>
                  <span className="px-3 py-1 bg-blue-600 text-white rounded font-bold">
                    {currentPage}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1 border border-slate-300 rounded text-slate-600 disabled:opacity-50 hover:bg-slate-50 font-semibold"
                  >
                    NEXT
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
