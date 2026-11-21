'use client';

import React, { useState, useEffect } from 'react';
import { Search, Eye, Edit3, ShieldCheck, AlertCircle, Clock, Building, ChevronLeft, ChevronRight, Loader2, Shield } from 'lucide-react';
import { PatrolRecordItem, PatrolRecordsResponse } from '@patrol/types';
import { useData } from '../lib/DataContext';
import { PatroliDetailModal } from './PatroliDetailModal';
import { PatroliTindakLanjutModal } from './PatroliTindakLanjutModal';
import { SurfaceCard } from './ui/SurfaceCard';
import { InsetInput } from './ui/InsetInput';
import { SkeuomorphicButton } from './ui/SkeuomorphicButton';
import { StatusBadge } from './ui/StatusBadge';
import { API_BASE_URL } from '@/lib/api';

export const LaporanSecurityAnggotaView: React.FC = () => {
  const { sites } = useData();

  // Filters state
  const [selectedSiteName, setSelectedSiteName] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [pageLength, setPageLength] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Data & loading state
  const [records, setRecords] = useState<PatrolRecordItem[]>([]);
  const [recordsTotal, setRecordsTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Detail & TL Modal state
  const [selectedDetailId, setSelectedDetailId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [selectedTlId, setSelectedTlId] = useState<string | null>(null);
  const [isTlOpen, setIsTlOpen] = useState<boolean>(false);

  // Fetch Patrol Records
  useEffect(() => {
    fetchRecords();
  }, [selectedSiteName, searchTerm, pageLength, currentPage]);

  const fetchRecords = async () => {
    setIsLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('patrol_auth_token') || '' : '';

    const params = new URLSearchParams({
      page: String(currentPage),
      limit: String(pageLength),
    });
    if (selectedSiteName) params.append('siteName', selectedSiteName);
    if (searchTerm) params.append('search', searchTerm);

    try {
      const res = await fetch(`${API_BASE_URL}/patrol/records?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('API offline');
      const data: PatrolRecordsResponse = await res.json();
      setRecords(data.data);
      setRecordsTotal(data.recordsTotal);
    } catch {
      // Demo fallback records
      const demoRecords: PatrolRecordItem[] = [
        {
          id: '7545',
          siteName: 'Site Proyek Demo',
          officerName: 'Budi Satpam Test',
          position: 'Anggota Security',
          assetName: 'Pos Gerbang Utama',
          assetType: 'Keamanan',
          assetLocation: 'Gerbang Utama Depan',
          taskDescription: 'Pemeriksaan akses masuk tamu',
          statusResult: 'Situasi Aman Terkendali',
          notes: 'Pemeriksaan akses keluar-masuk tamu dan kendaraan operasional lancar terkendali.',
          scannedAt: '2026-10-12T11:01:00.000Z',
          dateFormatted: 'Senin, 12 Oct 2026',
          timeFormatted: '18:01:00',
          dateTimeFull: 'Senin, 12 Oct 2026 | 18:01:00',
          latitude: -6.562732,
          longitude: 106.856083,
          photoUrl: 'foto-patroli/6accbe1ba279e',
          tindakLanjutStatus: null,
        },
      ];

      const filtered = demoRecords.filter((r) => {
        if (selectedSiteName && !r.siteName.toLowerCase().includes(selectedSiteName.toLowerCase())) return false;
        if (searchTerm) {
          const match =
            r.officerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.statusResult.toLowerCase().includes(searchTerm.toLowerCase());
          if (!match) return false;
        }
        return true;
      });

      setRecords(filtered);
      setRecordsTotal(filtered.length);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(recordsTotal / pageLength));

  return (
    <div className="space-y-4">
      <SurfaceCard className="p-6">
        {/* Controls Bar: Search & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="w-full sm:w-72">
              <InsetInput
                icon={Search}
                placeholder="Cari personil, pos, atau temuan..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Site Filter Dropdown */}
            <div>
              <select
                value={selectedSiteName}
                onChange={(e) => {
                  setSelectedSiteName(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2 text-xs text-slate-700 font-semibold shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition cursor-pointer"
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

          {/* Page Length Selector */}
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span>Tampilkan</span>
            <select
              value={pageLength}
              onChange={(e) => {
                setPageLength(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="5">5 baris</option>
              <option value="10">10 baris</option>
              <option value="20">20 baris</option>
              <option value="50">50 baris</option>
            </select>
          </div>
        </div>

        {/* Clean Modern Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white mt-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200/80 text-slate-600 font-semibold text-[11px] tracking-wider uppercase">
                <th className="py-3 px-4">Lokasi / Site</th>
                <th className="py-3 px-4">Nama Personil</th>
                <th className="py-3 px-4">Titik Pos & Temuan</th>
                <th className="py-3 px-4">Waktu Pemindaian</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-sky-500 mb-2" />
                    <span>Memuat log kegiatan security...</span>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Shield className="w-6 h-6 mx-auto text-slate-300 mb-2" />
                    Tidak ada catatan kegiatan patroli yang sesuai filter.
                  </td>
                </tr>
              ) : (
                records.map((row) => {
                  const isAnomaly =
                    row.statusResult.toLowerCase().includes('tindak') ||
                    row.statusResult.toLowerCase().includes('perlu') ||
                    row.statusResult.toLowerCase().includes('bahaya');

                  return (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Lokasi */}
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        <div className="flex items-center space-x-1.5">
                          <Building className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
                          <span className="capitalize">{row.siteName}</span>
                        </div>
                      </td>

                      {/* Personil */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 capitalize">{row.officerName}</div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          {row.position || 'Anggota'}
                        </span>
                      </td>

                      {/* Pos & Temuan */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${isAnomaly
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                          >
                            {isAnomaly ? (
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                            ) : (
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            )}
                            <span>{row.statusResult}</span>
                          </span>
                          <span className="font-semibold text-slate-700 capitalize text-[11px]">
                            {row.assetName}
                          </span>
                        </div>
                        <p className="text-slate-500 text-[11px] mt-1 line-clamp-1">
                          {row.notes || row.taskDescription || 'Pemeriksaan situasi patroli rutin'}
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
                          <span>{row.dateTimeFull || `${row.dateFormatted} | ${row.timeFormatted}`}</span>
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center space-x-1.5">
                          <SkeuomorphicButton
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedDetailId(row.id);
                              setIsDetailOpen(true);
                            }}
                            icon={Eye}
                          >
                            Detail
                          </SkeuomorphicButton>

                          {isAnomaly && (
                            <SkeuomorphicButton
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                setSelectedTlId(row.id);
                                setIsTlOpen(true);
                              }}
                              icon={Edit3}
                            >
                              TL
                            </SkeuomorphicButton>
                          )}
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 text-xs text-slate-500">
          <div>
            Menampilkan{' '}
            <span className="font-bold text-slate-800">
              {records.length === 0 ? 0 : (currentPage - 1) * pageLength + 1}
            </span>{' '}
            hingga{' '}
            <span className="font-bold text-slate-800">
              {Math.min(currentPage * pageLength, recordsTotal)}
            </span>{' '}
            dari <span className="font-bold text-slate-800">{recordsTotal}</span> data
          </div>

          <div className="inline-flex items-center space-x-1 rounded-lg border border-slate-200/80 bg-white p-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 text-xs rounded hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition text-slate-600 flex items-center space-x-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                type="button"
                onClick={() => setCurrentPage(pg)}
                className={`w-7 h-7 text-xs rounded font-medium transition ${pg === currentPage
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'hover:bg-slate-100 text-slate-700'
                  }`}
              >
                {pg}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 text-xs rounded hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition text-slate-600 flex items-center space-x-1"
            >
              <span>Berikutnya</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </SurfaceCard>

      {/* Modal Detail Patroli */}
      <PatroliDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        patrolId={selectedDetailId}
      />

      {/* Modal Tindak Lanjut */}
      <PatroliTindakLanjutModal
        isOpen={isTlOpen}
        onClose={() => setIsTlOpen(false)}
        patrolId={selectedTlId}
        onSuccess={() => fetchRecords()}
      />
    </div>
  );
};
