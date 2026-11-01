'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  ShieldAlert,
  ExternalLink,
  MapPin,
  CheckCircle2,
  Phone,
  Volume2,
  VolumeX,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Radio,
  Eye,
  AlertTriangle,
  Building2,
  Clock,
  UserCheck,
} from 'lucide-react';
import { useData } from '../../lib/DataContext';
import axios from 'axios';

// Dynamically import Leaflet map with SSR disabled (standard Next.js practice)
const EmergencyLeafletMap = dynamic(
  () => import('../../components/EmergencyLeafletMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[350px] bg-slate-100 flex flex-col items-center justify-center text-xs text-slate-500 rounded-lg border border-slate-300">
        <div className="w-6 h-6 border-2 border-rose-600 border-t-transparent rounded-full animate-spin mb-2" />
        <span>Memuat Peta Spasial Leaflet...</span>
      </div>
    ),
  }
);

export interface EmergencyLogEntry {
  id: string;
  siteId?: string;
  siteName: string;
  userId?: string;
  officerName: string;
  officerPhone?: string;
  division: string;
  photoUrl?: string | null;
  latitude: number;
  longitude: number;
  mapsUrl: string;
  triggeredAt: string;
  formattedTime: string;
  dayName: string;
  timeOnly: string;
  alertStatus: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | string;
  isWhatsappDispatched: boolean;
  resolutionNotes?: string | null;
}

// Initial fallback sample data perfectly replicating patroli.site Log Data Emergency
const INITIAL_EMERGENCY_LOGS: EmergencyLogEntry[] = [
  {
    id: 'sos-231',
    siteName: 'kantor pusat',
    officerName: 'budi santoso',
    officerPhone: '0812-9988-7766',
    division: 'Security',
    photoUrl: null,
    latitude: -6.20912,
    longitude: 106.84621,
    mapsUrl: 'https://www.google.com/maps?q=-6.209120,106.846210',
    triggeredAt: '2026-11-02T00:11:00Z',
    dayName: 'Senin, 02 Nov 2026',
    timeOnly: '00:11:00',
    formattedTime: 'Senin, 02 Nov 2026 | 00:11:00',
    alertStatus: 'ACTIVE',
    isWhatsappDispatched: true,
  },
  {
    id: 'sos-230',
    siteName: 'pool kendaraan',
    officerName: 'rudi hartono',
    officerPhone: '0813-8877-6655',
    division: 'Driver',
    photoUrl: null,
    latitude: -6.20045,
    longitude: 106.81692,
    mapsUrl: 'https://www.google.com/maps?q=-6.200450,106.816920',
    triggeredAt: '2026-11-02T00:11:00Z',
    dayName: 'Senin, 02 Nov 2026',
    timeOnly: '00:11:00',
    formattedTime: 'Senin, 02 Nov 2026 | 00:11:00',
    alertStatus: 'ACTIVE',
    isWhatsappDispatched: true,
  },
  {
    id: 'sos-228',
    siteName: 'kantor pusat',
    officerName: 'andi rahman',
    officerPhone: '0812-3456-7890',
    division: 'Security',
    photoUrl: null,
    latitude: -6.208763,
    longitude: 106.845599,
    mapsUrl: 'https://www.google.com/maps?q=-6.208763,106.845599',
    triggeredAt: '2026-10-26T05:33:00Z',
    dayName: 'Senin, 26 Oct 2026',
    timeOnly: '05:33:00',
    formattedTime: 'Senin, 26 Oct 2026 | 05:33:00',
    alertStatus: 'RESOLVED',
    isWhatsappDispatched: true,
    resolutionNotes: 'Patroli respon pos selesai. Situasi aman.',
  },
  {
    id: 'sos-225',
    siteName: 'kantor pusat',
    officerName: 'Ahmad Fauzi',
    officerPhone: '0811-2233-4455',
    division: 'Security',
    photoUrl: null,
    latitude: -6.2255,
    longitude: 106.809,
    mapsUrl: 'https://www.google.com/maps?q=-6.225500,106.809000',
    triggeredAt: '2026-10-18T14:20:00Z',
    dayName: 'Minggu, 18 Oct 2026',
    timeOnly: '14:20:00',
    formattedTime: 'Minggu, 18 Oct 2026 | 14:20:00',
    alertStatus: 'RESOLVED',
    isWhatsappDispatched: true,
    resolutionNotes: 'Insiden tombol uji coba alarm.',
  },
];

export default function EmergencyPage() {
  const { activeSosAlert, setActiveSosAlert, isSirenMuted, setIsSirenMuted, sites } = useData();

  const [logs, setLogs] = useState<EmergencyLogEntry[]>(INITIAL_EMERGENCY_LOGS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [siteFilter, setSiteFilter] = useState<string>('__ALL__');
  const [pageSize, setPageSize] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedLog, setSelectedLog] = useState<EmergencyLogEntry | null>(null);

  // Fetch live logs from NestJS Backend if available
  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('http://localhost:3000/api/v1/sos/logs', {
        params: {
          page: 1,
          limit: 100,
          search: searchQuery || undefined,
          siteId: siteFilter !== '__ALL__' ? siteFilter : undefined,
        },
        timeout: 2500,
      });
      if (res.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setLogs(res.data.data);
      }
    } catch {
      // Standalone / offline mode fallback to local state
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [siteFilter]);

  // If a real-time active alert arrives via Socket.io, prepend to logs
  useEffect(() => {
    if (activeSosAlert) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('id-ID', { hour12: false });
      const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const dayFormatted = `${dayNames[now.getDay()]}, ${String(now.getDate()).padStart(2, '0')} ${monthNames[now.getMonth()]} ${now.getFullYear()}`;
      
      const newEntry: EmergencyLogEntry = {
        id: activeSosAlert.id,
        siteName: activeSosAlert.siteName || 'Area Fasilitas',
        officerName: activeSosAlert.officerName || 'Petugas Lapangan',
        officerPhone: activeSosAlert.officerPhone,
        division: activeSosAlert.division || 'Security',
        latitude: activeSosAlert.latitude,
        longitude: activeSosAlert.longitude,
        mapsUrl: activeSosAlert.mapsUrl || `https://www.google.com/maps?q=${activeSosAlert.latitude},${activeSosAlert.longitude}`,
        triggeredAt: activeSosAlert.triggeredAt || now.toISOString(),
        dayName: dayFormatted,
        timeOnly: timeStr,
        formattedTime: `${dayFormatted} | ${timeStr}`,
        alertStatus: 'ACTIVE',
        isWhatsappDispatched: activeSosAlert.isWhatsappDispatched ?? true,
      };

      setLogs((prev) => {
        const exists = prev.some((l) => l.id === newEntry.id);
        return exists ? prev : [newEntry, ...prev];
      });
    }
  }, [activeSosAlert]);

  // Client-side filtering matching patroli.site DataTable behavior
  const filteredLogs = useMemo(() => {
    return logs.filter((item) => {
      const matchSearch =
        searchQuery === '' ||
        item.officerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.division.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.formattedTime.toLowerCase().includes(searchQuery.toLowerCase());

      const matchSite =
        siteFilter === '__ALL__' ||
        item.siteName.toLowerCase() === siteFilter.toLowerCase() ||
        item.siteId === siteFilter;

      return matchSearch && matchSite;
    });
  }, [logs, searchQuery, siteFilter]);

  // Pagination calculation
  const totalEntries = filteredLogs.length;
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalEntries);
  const currentEntries = filteredLogs.slice(startIndex, endIndex);

  // Status badge styling helper
  const renderDivisionBadge = (division: string) => {
    switch (division?.toUpperCase()) {
      case 'SECURITY':
        return <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">Security</span>;
      case 'DRIVER':
        return <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">Driver</span>;
      case 'CLEANING SERVICE':
      case 'CLEANING':
        return <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Cleaning Service</span>;
      default:
        return <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">{division}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card matching patroli.site branding */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-rose-700 flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <span>Emergency SOS Command Center (Panic Button)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoring darurat panik Satpam, CS, dan Driver dengan integrasi WhatsApp Gateway & Peta Satelit Presisi
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-600" />
            <span>Live WebSocket Sinkron</span>
          </div>

          <button
            onClick={() => setIsSirenMuted(!isSirenMuted)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              isSirenMuted
                ? 'bg-slate-100 text-slate-600 border-slate-300'
                : 'bg-rose-50 text-rose-700 border-rose-300'
            }`}
          >
            {isSirenMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-pulse" />}
            <span>{isSirenMuted ? 'Sirine Dinonaktifkan' : 'Sirine Audio Aktif'}</span>
          </button>
        </div>
      </div>

      {/* Active Emergency Alert Card (Appears on incoming SOS) */}
      {activeSosAlert && (
        <div className="bg-white border-2 border-rose-500 rounded-2xl p-5 shadow-xl space-y-4 animate-pulse">
          <div className="flex items-center justify-between border-b border-rose-200 pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-rose-600 text-white rounded-xl shadow-md">
                <ShieldAlert className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <span className="bg-rose-100 text-rose-800 text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wide">
                  ALARM AKTIF DARURAT
                </span>
                <h2 className="text-lg font-black text-slate-900 mt-0.5">
                  {activeSosAlert.officerName} ({activeSosAlert.division})
                </h2>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-500">{activeSosAlert.triggeredAt}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block mb-0.5 font-medium">Lokasi Fasilitas:</span>
              <strong className="text-slate-900 text-sm">{activeSosAlert.siteName}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block mb-0.5 font-medium">Kontak WhatsApp Petugas:</span>
              <strong className="text-slate-900 text-sm flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>{activeSosAlert.officerPhone || '0812-3456-7890'}</span>
              </strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block mb-0.5 font-medium">Koordinat Satelit PostGIS:</span>
              <strong className="text-slate-900 text-sm font-mono">
                {activeSosAlert.latitude.toFixed(6)}, {activeSosAlert.longitude.toFixed(6)}
              </strong>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
            <button
              onClick={() => {
                const found = logs.find((l) => l.id === activeSosAlert.id);
                if (found) setSelectedLog(found);
              }}
              className="px-3.5 py-1.5 bg-[#17a2b8] hover:bg-[#138496] text-white text-xs font-bold rounded-lg flex items-center space-x-1 shadow-xs transition"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Buka Peta Leaflet</span>
            </button>
            <a
              href={activeSosAlert.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center space-x-1 shadow-xs transition"
            >
              <span>Buka Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => setActiveSosAlert(null)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center space-x-1 shadow-xs transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Tandai Selesai / Teratasi</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Table Container: Recreating patroli.site "Log Data Emergency" */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Title Bar */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-rose-100 text-rose-700 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-bold text-slate-800">Log Data Emergency</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Total {totalEntries} Kejadian Kedaruratan
          </span>
        </div>

        {/* Filter Controls Bar (DataTable length & search controls) */}
        <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 bg-white">
          {/* Show entries dropdown */}
          <div className="flex items-center space-x-2 text-xs text-slate-600">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs bg-white font-medium shadow-xs"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries</span>

            {/* Site selector filter */}
            <div className="ml-4 flex items-center space-x-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={siteFilter}
                onChange={(e) => {
                  setSiteFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs bg-white font-medium shadow-xs"
              >
                <option value="__ALL__">Semua Lokasi Fasilitas</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search box matching patroli.site */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-600 font-medium">Search:</span>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari nama, waktu, pos..."
                className="w-48 md:w-64 pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white shadow-xs"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            </div>
          </div>
        </div>

        {/* DataTable Table Element */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-700 text-white font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 text-center w-20">FOTO</th>
                <th className="py-3 px-4">NAMA PERSONIL</th>
                <th className="py-3 px-4 text-center">WAKTU</th>
                <th className="py-3 px-4 text-center">LOKASI AREA/SITE</th>
                <th className="py-3 px-4 text-center w-28">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {currentEntries.length > 0 ? (
                currentEntries.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition">
                    {/* 1. Foto Column */}
                    <td className="py-3 px-4 text-center align-middle">
                      <div className="w-12 h-12 mx-auto rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 flex items-center justify-center shadow-2xs">
                        {row.photoUrl ? (
                          <img
                            src={row.photoUrl}
                            alt={row.officerName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 font-bold text-xs uppercase">
                            {row.officerName.slice(0, 2)}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* 2. Nama Personil Column */}
                    <td className="py-3 px-4 align-middle">
                      <div className="font-bold text-slate-900 text-xs">{row.officerName}</div>
                      <div className="mt-1">{renderDivisionBadge(row.division)}</div>
                    </td>

                    {/* 3. Waktu Column */}
                    <td className="py-3 px-4 text-center align-middle font-medium text-slate-600">
                      <div className="text-blue-700 font-medium">{row.formattedTime}</div>
                    </td>

                    {/* 4. Lokasi Area/Site Column */}
                    <td className="py-3 px-4 text-center align-middle font-medium text-blue-700">
                      {row.siteName}
                    </td>

                    {/* 5. Aksi Column */}
                    <td className="py-3 px-4 text-center align-middle">
                      <button
                        onClick={() => setSelectedLog(row)}
                        className="px-3 py-1.5 bg-[#17a2b8] hover:bg-[#138496] text-white text-[11px] font-bold rounded shadow-xs flex items-center justify-center space-x-1 mx-auto transition"
                      >
                        <Search className="w-3 h-3" />
                        <span>Cek Lokasi</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                    Tidak ada data emergency yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* DataTable Footer / Pagination Info */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Showing {totalEntries > 0 ? startIndex + 1 : 0} to {endIndex} of {totalEntries} entries
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-slate-300 rounded-md hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1 transition font-medium"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="px-3 py-1.5 bg-white border border-slate-300 rounded-md font-bold text-rose-700 shadow-2xs">
              {currentPage}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-slate-300 rounded-md hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1 transition font-medium"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* DETAIL LOG EMERGENCY Modal (Exact replica of patroli.site #myModalpan) */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-300 animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-700 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold tracking-wide uppercase flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>DETAIL LOG EMERGENCY</span>
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-300 hover:text-white p-1 rounded-md transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Profile Card Center */}
              <div className="flex flex-col items-center text-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-28 h-28 rounded-full overflow-hidden border-3 border-rose-500 shadow-md bg-white mb-3">
                  {selectedLog.photoUrl ? (
                    <img
                      src={selectedLog.photoUrl}
                      alt={selectedLog.officerName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xl uppercase">
                      {selectedLog.officerName.slice(0, 2)}
                    </div>
                  )}
                </div>
                <h4 className="text-lg font-extrabold text-slate-900">{selectedLog.officerName}</h4>
                <p className="text-xs font-semibold text-slate-600 mt-0.5">{selectedLog.division}</p>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">{selectedLog.siteName}</p>
              </div>

              {/* Time Metadata */}
              <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 text-xs">
                <div className="px-4 py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Hari</span>
                  <strong className="text-slate-800">{selectedLog.dayName}</strong>
                </div>
                <div className="px-4 py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Waktu</span>
                  <strong className="text-slate-800 font-mono">{selectedLog.timeOnly}</strong>
                </div>
                <div className="px-4 py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Status Alarm</span>
                  <span
                    className={`font-extrabold text-[10px] px-2 py-0.5 rounded uppercase ${
                      selectedLog.alertStatus === 'ACTIVE'
                        ? 'bg-rose-100 text-rose-700 animate-pulse'
                        : selectedLog.alertStatus === 'ACKNOWLEDGED'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {selectedLog.alertStatus}
                  </span>
                </div>
              </div>

              {/* Red Banner: PETA LOKASI PETUGAS */}
              <div className="bg-rose-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-lg flex items-center justify-between shadow-xs">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-white" />
                  <span>PETA LOKASI PETUGAS (RADIUS 100 METER)</span>
                </div>
                <span className="font-mono text-[11px] text-rose-100">
                  {selectedLog.latitude.toFixed(6)}, {selectedLog.longitude.toFixed(6)}
                </span>
              </div>

              {/* Interactive Leaflet Map Component */}
              <div className="w-full h-[350px] rounded-lg overflow-hidden border border-slate-300 shadow-inner">
                <EmergencyLeafletMap
                  latitude={selectedLog.latitude}
                  longitude={selectedLog.longitude}
                  officerName={selectedLog.officerName}
                  division={selectedLog.division}
                  siteName={selectedLog.siteName}
                  radius={100}
                />
              </div>

              {/* Google Maps link & Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <a
                  href={selectedLog.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-xs transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka di Google Maps</span>
                </a>

                <div className="flex items-center space-x-2">
                  {selectedLog.alertStatus === 'ACTIVE' && (
                    <button
                      onClick={() => {
                        setLogs((prev) =>
                          prev.map((l) =>
                            l.id === selectedLog.id ? { ...l, alertStatus: 'RESOLVED' } : l
                          )
                        );
                        setSelectedLog((prev) => (prev ? { ...prev, alertStatus: 'RESOLVED' } : null));
                        if (activeSosAlert?.id === selectedLog.id) {
                          setActiveSosAlert(null);
                        }
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-xs transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Tandai Selesai / Teratasi</span>
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
