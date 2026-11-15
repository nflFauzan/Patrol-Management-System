'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  AttendanceRecordItem, 
  AttendanceRecordsResponse, 
  AttendancePersonilOption,
  Division
} from '@patrol/types';
import { 
  Clock, 
  MapPin, 
  Search, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  User,
  Shield,
  Sparkles,
  Car
} from 'lucide-react';
import { useData } from '../lib/DataContext';
import { AttendancePatroliDetailModal } from './AttendancePatroliDetailModal';
import { SurfaceCard } from './ui/SurfaceCard';
import { SkeuomorphicButton } from './ui/SkeuomorphicButton';
import { InsetInput } from './ui/InsetInput';
import { StatusBadge } from './ui/StatusBadge';

export const AttendanceSemuaDataView: React.FC = () => {
  const { sites } = useData();

  // Filters state
  const [selectedSiteName, setSelectedSiteName] = useState<string>('');
  const [selectedPosisi, setSelectedPosisi] = useState<string>('');
  const [selectedPersonil, setSelectedPersonil] = useState<string>('');
  const [personilOptions, setPersonilOptions] = useState<AttendancePersonilOption[]>([]);

  // Search & Pagination state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [pageLength, setPageLength] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Data & loading state
  const [records, setRecords] = useState<AttendanceRecordItem[]>([]);
  const [recordsTotal, setRecordsTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Detail Modal state
  const [selectedDetailId, setSelectedDetailId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  // Load Personil dropdown dynamically when site or posisi changes
  useEffect(() => {
    let isMounted = true;
    const token = typeof window !== 'undefined' ? localStorage.getItem('patrol_auth_token') || '' : '';

    const params = new URLSearchParams();
    if (selectedSiteName) params.append('siteName', selectedSiteName);
    if (selectedPosisi) params.append('division', selectedPosisi);

    fetch(`http://localhost:3000/api/v1/attendance/personil-options?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch personil');
        return res.json();
      })
      .then((data: AttendancePersonilOption[]) => {
        if (isMounted) setPersonilOptions(data);
      })
      .catch(() => {
        if (isMounted) {
          const fallback: AttendancePersonilOption[] = [
            { id: '1', name: 'Budi Santoso', division: 'Security', siteName: 'Area Utama' },
            { id: '2', name: 'Akmal', division: 'Cleaning Service', siteName: 'Area Utama' },
            { id: '3', name: 'Joko Driver', division: 'Driver', siteName: 'Pool Armada' },
          ];
          setPersonilOptions(
            fallback.filter((p) => {
              if (selectedPosisi && p.division.toLowerCase() !== selectedPosisi.toLowerCase()) return false;
              if (selectedSiteName && p.siteName.toLowerCase() !== selectedSiteName.toLowerCase()) return false;
              return true;
            })
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedSiteName, selectedPosisi]);

  // Fetch Attendance Records
  useEffect(() => {
    fetchRecords();
  }, [selectedSiteName, selectedPosisi, selectedPersonil, currentPage, pageLength, searchTerm]);

  const fetchRecords = async () => {
    setIsLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('patrol_auth_token') || '' : '';

    const params = new URLSearchParams({
      page: String(currentPage),
      limit: String(pageLength),
    });

    if (selectedSiteName) params.append('siteName', selectedSiteName);
    if (selectedPosisi) params.append('division', selectedPosisi);
    if (selectedPersonil) params.append('personilName', selectedPersonil);
    if (searchTerm) params.append('search', searchTerm);

    try {
      const res = await fetch(`http://localhost:3000/api/v1/attendance/records?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch attendance');
      const data: AttendanceRecordsResponse = await res.json();
      setRecords(data.data || []);
      setRecordsTotal(data.recordsTotal || 0);
    } catch {
      // Fallback sample data matching patroli.site records
      const mockList: AttendanceRecordItem[] = [
        {
          id: 'att-1',
          siteName: 'Area Utama',
          division: 'SECURITY',
          personilName: 'Budi Santoso',
          clockInDateStr: 'Senin, 10 Nov 2025',
          clockInTimeStr: '06:55:12 WIB',
          isLate: false,
          clockInWithinGeofence: true,
          clockInPhotoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          isClockedOut: true,
          clockOutDateStr: 'Senin, 10 Nov 2025',
          clockOutTimeStr: '15:02:44 WIB',
          clockOutWithinGeofence: true,
          isLupaAbsenPulang: false,
        },
        {
          id: 'att-2',
          siteName: 'Area Timur',
          division: 'CLEANING',
          personilName: 'Akmal',
          clockInDateStr: 'Senin, 10 Nov 2025',
          clockInTimeStr: '07:12:04 WIB',
          isLate: true,
          lateText: 'Terlambat 12 Menit',
          clockInWithinGeofence: true,
          clockInPhotoUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
          isClockedOut: false,
          isLupaAbsenPulang: false,
        },
        {
          id: 'att-3',
          siteName: 'Pool Armada',
          division: 'DRIVER',
          personilName: 'Joko Driver',
          clockInDateStr: 'Senin, 10 Nov 2025',
          clockInTimeStr: '06:58:30 WIB',
          isLate: false,
          clockInWithinGeofence: true,
          isClockedOut: true,
          clockOutDateStr: 'Senin, 10 Nov 2025',
          clockOutTimeStr: '17:15:10 WIB',
          clockOutWithinGeofence: true,
          isLupaAbsenPulang: false,
        },
      ];

      let filtered = mockList;
      if (selectedSiteName) {
        filtered = filtered.filter((r) => r.siteName.toLowerCase() === selectedSiteName.toLowerCase());
      }
      if (selectedPosisi) {
        filtered = filtered.filter((r) => r.division.toLowerCase() === selectedPosisi.toLowerCase());
      }
      if (selectedPersonil) {
        filtered = filtered.filter((r) => r.personilName.toLowerCase() === selectedPersonil.toLowerCase());
      }
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.personilName.toLowerCase().includes(q) ||
            r.siteName.toLowerCase().includes(q) ||
            r.division.toLowerCase().includes(q)
        );
      }

      setRecordsTotal(filtered.length);
      const start = (currentPage - 1) * pageLength;
      setRecords(filtered.slice(start, start + pageLength));
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(recordsTotal / pageLength));

  const handleOpenDetail = (id: string) => {
    setSelectedDetailId(id);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-4 font-sans select-none">
      {/* FILTER CONTROLS BAR */}
      <SurfaceCard variant="elevated" padding="md" className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Site Filter */}
          <div className="relative">
            <select
              value={selectedSiteName}
              onChange={(e) => {
                setSelectedSiteName(e.target.value);
                setSelectedPersonil('');
                setCurrentPage(1);
              }}
              className="appearance-none w-full bg-slate-50 hover:bg-white text-slate-800 font-semibold rounded-xl px-3 pr-8 py-2 border border-slate-200/90 shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">Semua Lokasi Fasilitas</option>
              {sites.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
          </div>

          {/* Posisi Filter */}
          <div className="relative">
            <select
              value={selectedPosisi}
              onChange={(e) => {
                setSelectedPosisi(e.target.value);
                setSelectedPersonil('');
                setCurrentPage(1);
              }}
              className="appearance-none w-full bg-slate-50 hover:bg-white text-slate-800 font-semibold rounded-xl px-3 pr-8 py-2 border border-slate-200/90 shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">Semua Divisi</option>
              <option value="Security">Satpam (Security)</option>
              <option value="Cleaning Service">Cleaning Service</option>
              <option value="Driver">Driver Logistik</option>
              <option value="Staff">Staff Kantor</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
          </div>

          {/* Personil Filter */}
          <div className="relative">
            <select
              value={selectedPersonil}
              onChange={(e) => {
                setSelectedPersonil(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none w-full bg-slate-50 hover:bg-white text-slate-800 font-semibold rounded-xl px-3 pr-8 py-2 border border-slate-200/90 shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">Semua Petugas</option>
              {personilOptions.map((p) => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
          </div>

          {/* Search Box */}
          <InsetInput
            type="search"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari nama petugas / lokasi..."
            icon={Search}
          />
        </div>
      </SurfaceCard>

      {/* SKEUOMORPHIC ATTENDANCE TABLE */}
      <SurfaceCard variant="elevated" padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200">
                <th className="py-3 px-4 uppercase tracking-wider">Petugas</th>
                <th className="py-3 px-4 uppercase tracking-wider">Lokasi / Site</th>
                <th className="py-3 px-4 uppercase tracking-wider">Absen Masuk</th>
                <th className="py-3 px-4 uppercase tracking-wider">Absen Pulang</th>
                <th className="py-3 px-4 text-center uppercase tracking-wider w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-sky-600 mb-2" />
                    <span>Memuat log data presensi...</span>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 italic">
                    Tidak ada data presensi yang sesuai kriteria filter.
                  </td>
                </tr>
              ) : (
                records.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition-colors duration-100">
                    {/* Petugas */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{row.personilName}</div>
                      <span
                        className={`inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                          row.division === 'SECURITY'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : row.division === 'CLEANING'
                            ? 'bg-teal-50 text-teal-700 border border-teal-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {row.division}
                      </span>
                    </td>

                    {/* Site */}
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {row.siteName}
                    </td>

                    {/* Masuk */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{row.clockInTimeStr}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{row.clockInDateStr}</div>
                      <div className="flex items-center space-x-1.5 mt-1">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                            row.isLate
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {row.isLate ? (row.lateText || 'Terlambat') : 'Tepat Waktu'}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                            row.clockInWithinGeofence
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {row.clockInWithinGeofence ? 'Dalam Radius' : 'Luar Radius'}
                        </span>
                      </div>
                    </td>

                    {/* Pulang */}
                    <td className="py-3 px-4">
                      {row.isClockedOut ? (
                        <>
                          <div className="font-bold text-slate-900">{row.clockOutTimeStr}</div>
                          <div className="text-[10px] text-slate-400 font-medium">{row.clockOutDateStr}</div>
                          <div className="mt-1">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                                row.clockOutWithinGeofence
                                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {row.clockOutWithinGeofence ? 'Dalam Radius' : 'Luar Radius'}
                            </span>
                          </div>
                        </>
                      ) : row.isLupaAbsenPulang ? (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          Lupa Absen Pulang
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                          Sedang Bertugas
                        </span>
                      )}
                    </td>

                    {/* Aksi */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(row.id)}
                        className="p-1.5 text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200 shadow-2xs transition active:translate-y-0.5"
                        title="Lihat Detail Swafoto & Koordinat Peta"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 p-4 border-t border-slate-100">
          <div>
            Menampilkan {recordsTotal === 0 ? 0 : (currentPage - 1) * pageLength + 1}-
            {Math.min(currentPage * pageLength, recordsTotal)} dari {recordsTotal} data
          </div>

          <div className="flex items-center space-x-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition shadow-2xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                type="button"
                onClick={() => setCurrentPage(pg)}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition ${
                  currentPage === pg
                    ? 'bg-sky-600 text-white shadow-skeuo-button-primary'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-2xs'
                }`}
              >
                {pg}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition shadow-2xs"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </SurfaceCard>

      {/* Detail Modal */}
      <AttendancePatroliDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        attendanceId={selectedDetailId}
      />
    </div>
  );
};
