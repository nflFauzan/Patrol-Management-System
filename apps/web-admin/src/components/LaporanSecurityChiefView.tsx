'use client';

import React, { useState, useEffect } from 'react';
import { Search, Eye, Award, Building, Clock, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useData } from '../lib/DataContext';
import { ChiefEvaluationItem } from '@patrol/types';
import { ChiefDetailModal } from './ChiefDetailModal';
import { API_BASE_URL } from '@/lib/api';

export const LaporanSecurityChiefView: React.FC = () => {
  const { sites } = useData();
  const [selectedSiteName, setSelectedSiteName] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [pageLength, setPageLength] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Detail Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<ChiefEvaluationItem | null>(null);

  // Records state from backend with fallback
  const [records, setRecords] = useState<ChiefEvaluationItem[]>([
    {
      id: '6',
      siteId: '11111111-1111-1111-1111-111111111111',
      siteName: 'Site Proyek Demo',
      namaKomandan: 'DANDAN KOMANDAN',
      komandanPosition: 'Komandan Regu',
      komandanRole: 'Laporan Komandan',
      kedisiplinan: 'Baik',
      koordinasi: 'Baik',
      kehadiran: 'Lengkap',
      reguHadir: 'Lengkap',
      reguIzin: 'Lengkap',
      insiden: 'Tidak Ada',
      detailInsiden: 'Tidak ada kejadian menonjol atau insiden keamanan.',
      catatan: 'Evaluasi pengawasan apel dan serah terima regu berjalan tertib dan sesuai SOP. Personil sigap.',
      statusLaporan: 'Selesai',
      tanggalLapor: '2026-10-18 21:11:40',
    },
  ]);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('patrol_auth_token') || '' : '';
    fetch(`${API_BASE_URL}/reports/chief-evaluations`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then((data: ChiefEvaluationItem[]) => {
        if (data && data.length > 0) {
          setRecords(data);
        }
      })
      .catch(() => {
        // Keeps fallback demo data
      });
  }, []);

  const filtered = records.filter((r) => {
    if (selectedSiteName && !r.siteName.toLowerCase().includes(selectedSiteName.toLowerCase())) return false;
    if (searchTerm) {
      const match =
        r.namaKomandan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.kedisiplinan && r.kedisiplinan.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.insiden && r.insiden.toLowerCase().includes(searchTerm.toLowerCase()));
      if (!match) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageLength));
  const displayedRows = filtered.slice((currentPage - 1) * pageLength, currentPage * pageLength);

  return (
    <div className="space-y-4">
      {/* Modern Card Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        {/* Controls Bar: Search & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                placeholder="Cari komandan, kedisiplinan, atau catatan..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 w-64 transition"
              />
            </div>

            {/* Site Filter Dropdown */}
            <div className="relative">
              <select
                value={selectedSiteName}
                onChange={(e) => {
                  setSelectedSiteName(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs bg-slate-50 border border-slate-200 text-slate-700 font-semibold px-3 py-2 pr-7 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                <option value="">Semua Lokasi / Site</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Page Length */}
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span>Tampilkan</span>
            <select
              value={pageLength}
              onChange={(e) => {
                setPageLength(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 text-slate-700 font-bold px-2.5 py-1.5 rounded-lg focus:outline-none cursor-pointer"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <span>data per halaman</span>
          </div>
        </div>

        {/* Clean Modern Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200/80">
                <th className="py-3 px-4 rounded-l-xl">Lokasi / Site</th>
                <th className="py-3 px-4">Komandan yang Dievaluasi</th>
                <th className="py-3 px-4">Kedisiplinan & Koordinasi</th>
                <th className="py-3 px-4">Status Insiden & Catatan</th>
                <th className="py-3 px-4">Waktu Evaluasi</th>
                <th className="py-3 px-4 text-center rounded-r-xl">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada catatan evaluasi Chief yang sesuai filter.
                  </td>
                </tr>
              ) : (
                displayedRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition">
                    {/* Lokasi */}
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      <div className="flex items-center space-x-1.5">
                        <Building className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                        <span>{row.siteName}</span>
                      </div>
                    </td>

                    {/* Komandan */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{row.namaKomandan}</div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        {row.komandanPosition || 'Komandan Regu'}
                      </span>
                    </td>

                    {/* Kedisiplinan & Koordinasi */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Disiplin: {row.kedisiplinan}</span>
                        </span>
                        <span className="inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-blue-50 text-blue-700 border border-blue-200">
                          Koordinasi: {row.koordinasi}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 font-medium mt-1">
                        Regu Hadir: {row.reguHadir}
                      </div>
                    </td>

                    {/* Insiden & Catatan */}
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${row.insiden.toLowerCase().includes('tidak')
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                        >
                          Insiden: {row.insiden}
                        </span>
                      </div>
                      <p className="text-slate-800 font-medium text-[11px] line-clamp-1">
                        {row.catatan}
                      </p>
                    </td>

                    {/* Waktu */}
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{row.tanggalLapor}</span>
                      </div>
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRecord(row);
                          setIsModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold inline-flex items-center space-x-1 border border-teal-200/60 transition shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detail</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modern Pagination Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 mt-2 border-t border-slate-100 text-xs text-slate-500">
          <div>
            Menampilkan <span className="font-bold text-slate-800">{displayedRows.length}</span> dari{' '}
            <span className="font-bold text-slate-800">{filtered.length}</span> data
          </div>

          <div className="flex items-center space-x-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-semibold transition flex items-center space-x-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                type="button"
                onClick={() => setCurrentPage(pg)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition ${pg === currentPage
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
              >
                {pg}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-semibold transition flex items-center space-x-1"
            >
              <span>Berikutnya</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Chief Detail Modal */}
      <ChiefDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        chiefId={selectedRecord?.id || null}
        detailData={selectedRecord}
      />
    </div>
  );
};
