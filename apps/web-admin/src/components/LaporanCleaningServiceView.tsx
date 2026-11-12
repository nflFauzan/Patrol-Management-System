'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Eye, Edit3, Sparkles, Building, Clock, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { useData } from '../lib/DataContext';
import { CleaningRecordItem, CleaningRecordsResponse } from '@patrol/types';
import { CleaningDetailModal } from './CleaningDetailModal';
import { CleaningTindakLanjutModal } from './CleaningTindakLanjutModal';

export const LaporanCleaningServiceView: React.FC = () => {
  const { sites } = useData();
  const [selectedSiteName, setSelectedSiteName] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [pageLength, setPageLength] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [records, setRecords] = useState<CleaningRecordItem[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Modals state
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [selectedCleaningId, setSelectedCleaningId] = useState<string | null>(null);

  const [isTlOpen, setIsTlOpen] = useState<boolean>(false);
  const [selectedTlId, setSelectedTlId] = useState<string | number | null>(null);

  const defaultDemoRecords: CleaningRecordItem[] = [
    {
      id: '7546',
      kodePatroli: '7546',
      siteName: 'Site Proyek Demo',
      personilName: 'Akmal',
      status: 'Kondisi Bersih dan Rapi',
      taskDescription: 'Pembersihan area sanitasi & kloset lantai 1',
      timeFormatted: 'Senin, 12 Oct 2026 | 18:05:00',
      dateTimeFull: 'Senin, 12 Oct 2026 | 18:05:00',
      latitude: -6.562729,
      longitude: 106.856097,
      photoUrl: 'foto-patroli/6accbee403c32',
      tindakLanjutStatus: null,
    },
    {
      id: '7544',
      kodePatroli: '7544',
      siteName: 'Site Proyek Demo',
      personilName: 'Akmal',
      status: 'Kondisi Bersih dan Rapi',
      taskDescription: 'Pembersihan wastafel & cermin toilet lobby',
      timeFormatted: 'Senin, 12 Oct 2026 | 17:54:00',
      dateTimeFull: 'Senin, 12 Oct 2026 | 17:54:00',
      latitude: -6.562722,
      longitude: 106.856081,
      photoUrl: 'foto-patroli/6accbc6703cf8',
      tindakLanjutStatus: null,
    },
  ];

  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('patrol_auth_token') || '' : '';

    try {
      const queryParams = new URLSearchParams({
        page: String(currentPage),
        limit: String(pageLength),
      });
      if (selectedSiteName) queryParams.set('siteName', selectedSiteName);
      if (searchTerm) queryParams.set('search', searchTerm);

      const res = await fetch(`http://localhost:3000/api/v1/cleaning/records?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const json: CleaningRecordsResponse = await res.json();
        if (json.data && json.data.length > 0) {
          setRecords(json.data);
          setTotalRecords(json.recordsTotal || json.data.length);
          setIsLoading(false);
          return;
        }
      }
    } catch {
      // Fallback demo data
    }

    let filtered = [...defaultDemoRecords];
    if (selectedSiteName) {
      filtered = filtered.filter((r) =>
        r.siteName.toLowerCase().includes(selectedSiteName.toLowerCase())
      );
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.personilName.toLowerCase().includes(q) ||
          r.siteName.toLowerCase().includes(q) ||
          r.taskDescription.toLowerCase().includes(q) ||
          r.status.toLowerCase().includes(q)
      );
    }

    setRecords(filtered);
    setTotalRecords(filtered.length);
    setIsLoading(false);
  }, [currentPage, pageLength, selectedSiteName, searchTerm]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const totalPages = Math.max(1, Math.ceil(totalRecords / pageLength));

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
                placeholder="Cari petugas, zona, atau status..."
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
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
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
                <th className="py-3 px-4">Petugas Cleaning</th>
                <th className="py-3 px-4">Zona & Tugas Sanitasi</th>
                <th className="py-3 px-4">Waktu Pengerjaan</th>
                <th className="py-3 px-4 text-center rounded-r-xl">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-teal-600 mb-2" />
                    <span>Memuat log kegiatan cleaning...</span>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Tidak ada catatan kegiatan cleaning service yang sesuai filter.
                  </td>
                </tr>
              ) : (
                records.map((row) => {
                  const isClean = row.status.toLowerCase().includes('bersih');

                  return (
                    <tr key={row.id} className="hover:bg-slate-50/70 transition">
                      {/* Lokasi */}
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        <div className="flex items-center space-x-1.5">
                          <Building className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span className="capitalize">{row.siteName}</span>
                        </div>
                      </td>

                      {/* Petugas */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 capitalize">{row.personilName}</div>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">
                          Cleaning Staff
                        </span>
                      </td>

                      {/* Zona & Tugas */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                              isClean
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{row.status}</span>
                          </span>
                        </div>
                        <p className="text-slate-600 font-medium text-[11px] mt-1 line-clamp-1 capitalize">
                          {row.taskDescription}
                        </p>
                        {row.tindakLanjutStatus && (
                          <span className="inline-block mt-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Status TL: {row.tindakLanjutStatus}
                          </span>
                        )}
                      </td>

                      {/* Waktu */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        <div className="flex items-center space-x-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{row.dateTimeFull || row.timeFormatted}</span>
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCleaningId(row.id);
                              setIsDetailOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold flex items-center space-x-1 border border-teal-200/60 transition shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Detail</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTlId(row.id);
                              setIsTlOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold flex items-center space-x-1 border border-amber-200 transition shadow-xs"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>TL</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Modern Pagination Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 mt-2 border-t border-slate-100 text-xs text-slate-500">
          <div>
            Menampilkan{' '}
            <span className="font-bold text-slate-800">
              {records.length === 0 ? 0 : (currentPage - 1) * pageLength + 1}
            </span>{' '}
            hingga{' '}
            <span className="font-bold text-slate-800">
              {Math.min(currentPage * pageLength, totalRecords)}
            </span>{' '}
            dari <span className="font-bold text-slate-800">{totalRecords}</span> data
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
                className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                  pg === currentPage
                    ? 'bg-emerald-600 text-white shadow-xs'
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

      {/* Detail Modal */}
      <CleaningDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        cleaningId={selectedCleaningId}
      />

      {/* Tindak Lanjut Modal */}
      <CleaningTindakLanjutModal
        isOpen={isTlOpen}
        onClose={() => setIsTlOpen(false)}
        recordId={selectedTlId}
        onSuccess={() => fetchRecords()}
      />
    </div>
  );
};
