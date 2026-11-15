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
  ChevronDown,
} from 'lucide-react';
import { useData } from '../../lib/DataContext';
import { PanicAlertModal } from '../../components/PanicAlertModal';
import { SurfaceCard } from '../../components/ui/SurfaceCard';
import { SkeuomorphicButton } from '../../components/ui/SkeuomorphicButton';
import { InsetInput } from '../../components/ui/InsetInput';
import { StatusBadge } from '../../components/ui/StatusBadge';
import axios from 'axios';

// Dynamically import Leaflet map with SSR disabled
const EmergencyLeafletMap = dynamic(
  () => import('../../components/EmergencyLeafletMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[350px] bg-slate-100 flex flex-col items-center justify-center text-xs text-slate-500 rounded-xl border border-slate-200">
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

const INITIAL_EMERGENCY_LOGS: EmergencyLogEntry[] = [
  {
    id: 'sos-231',
    siteName: 'Area Utama',
    officerName: 'Budi Santoso',
    officerPhone: '0812-9988-7766',
    division: 'Security',
    photoUrl: null,
    latitude: -6.2088,
    longitude: 106.8456,
    mapsUrl: 'https://www.google.com/maps?q=-6.208800,106.845600',
    triggeredAt: '2026-11-10T09:12:00Z',
    dayName: 'Senin, 10 Nov 2025',
    timeOnly: '09:12:00',
    formattedTime: 'Senin, 10 Nov 2025 | 09:12 WIB',
    alertStatus: 'ACTIVE',
    isWhatsappDispatched: true,
  },
  {
    id: 'sos-230',
    siteName: 'Pool Kendaraan',
    officerName: 'Rudi Hartono',
    officerPhone: '0813-8877-6655',
    division: 'Driver',
    photoUrl: null,
    latitude: -6.20045,
    longitude: 106.81692,
    mapsUrl: 'https://www.google.com/maps?q=-6.200450,106.816920',
    triggeredAt: '2026-11-09T14:40:00Z',
    dayName: 'Minggu, 09 Nov 2025',
    timeOnly: '14:40:00',
    formattedTime: 'Minggu, 09 Nov 2025 | 14:40 WIB',
    alertStatus: 'RESOLVED',
    isWhatsappDispatched: true,
    resolutionNotes: 'Kendaraan logistik selesai penanganan kendala ban kempes.',
  },
  {
    id: 'sos-228',
    siteName: 'Area Gudang',
    officerName: 'Andi Rahman',
    officerPhone: '0812-3456-7890',
    division: 'Security',
    photoUrl: null,
    latitude: -6.208763,
    longitude: 106.845599,
    mapsUrl: 'https://www.google.com/maps?q=-6.208763,106.845599',
    triggeredAt: '2026-11-08T05:33:00Z',
    dayName: 'Sabtu, 08 Nov 2025',
    timeOnly: '05:33:00',
    formattedTime: 'Sabtu, 08 Nov 2025 | 05:33 WIB',
    alertStatus: 'RESOLVED',
    isWhatsappDispatched: true,
    resolutionNotes: 'Patroli respon pos selesai. Situasi aman terkendali.',
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

  // Dedicated 3D Siren Panic Alert Modal state
  const [isPanicModalOpen, setIsPanicModalOpen] = useState<boolean>(false);

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
      // Offline fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [siteFilter]);

  // When an active alert arrives, open Panic Modal
  useEffect(() => {
    if (activeSosAlert) {
      setIsPanicModalOpen(true);
      const now = new Date();
      const timeStr = now.toLocaleTimeString('id-ID', { hour12: false });
      const dayFormatted = now.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

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
        formattedTime: `${dayFormatted} | ${timeStr} WIB`,
        alertStatus: 'ACTIVE',
        isWhatsappDispatched: activeSosAlert.isWhatsappDispatched ?? true,
      };

      setLogs((prev) => {
        const exists = prev.some((l) => l.id === newEntry.id);
        return exists ? prev : [newEntry, ...prev];
      });
    }
  }, [activeSosAlert]);

  // Client-side filtering
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

  const totalEntries = filteredLogs.length;
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalEntries);
  const currentEntries = filteredLogs.slice(startIndex, endIndex);

  return (
    <div className="space-y-6 font-sans select-none">
      {/* Top Header Card */}
      <SurfaceCard variant="elevated" padding="md" className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-rose-700 flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <span>Emergency SOS Command Center</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Monitoring darurat panik Satpam, CS, dan Driver dengan integrasi WhatsApp Gateway &amp; Peta Satelit Presisi
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-600" />
              <span>Live WebSocket</span>
            </div>

            <button
              type="button"
              onClick={() => setIsSirenMuted(!isSirenMuted)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                isSirenMuted
                  ? 'bg-slate-100 text-slate-600 border-slate-300'
                  : 'bg-rose-50 text-rose-700 border-rose-300 shadow-2xs'
              }`}
            >
              {isSirenMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-pulse" />}
              <span>{isSirenMuted ? 'Sirine Muted' : 'Sirine Audio Aktif'}</span>
            </button>

            {/* Test Panic Modal trigger button */}
            <SkeuomorphicButton
              variant="danger"
              size="sm"
              icon={AlertTriangle}
              onClick={() => setIsPanicModalOpen(true)}
            >
              Simulasi Panic Alert
            </SkeuomorphicButton>
          </div>
        </div>
      </SurfaceCard>

      {/* Active Emergency Alert Card (Banner) */}
      {activeSosAlert && (
        <SurfaceCard
          variant="elevated"
          padding="md"
          className="border-2 border-rose-500 bg-rose-50/40 space-y-4 animate-pulse"
        >
          <div className="flex items-center justify-between border-b border-rose-200 pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-rose-600 text-white rounded-2xl shadow-md">
                <ShieldAlert className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <span className="bg-rose-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wide">
                  ALARM AKTIF DARURAT
                </span>
                <h2 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                  {activeSosAlert.officerName} ({activeSosAlert.division})
                </h2>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-500 font-bold">{activeSosAlert.triggeredAt}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border border-rose-200 shadow-2xs">
              <span className="text-slate-500 block mb-0.5 font-medium">Lokasi Fasilitas:</span>
              <strong className="text-slate-900 text-sm font-bold">{activeSosAlert.siteName}</strong>
            </div>
            <div className="p-3 bg-white rounded-xl border border-rose-200 shadow-2xs">
              <span className="text-slate-500 block mb-0.5 font-medium">Kontak WhatsApp Petugas:</span>
              <strong className="text-slate-900 text-sm flex items-center space-x-1 font-bold">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>{activeSosAlert.officerPhone || '0812-3456-7890'}</span>
              </strong>
            </div>
            <div className="p-3 bg-white rounded-xl border border-rose-200 shadow-2xs">
              <span className="text-slate-500 block mb-0.5 font-medium">Koordinat Satelit GPS:</span>
              <strong className="text-slate-900 text-sm font-mono font-bold">
                {activeSosAlert.latitude.toFixed(6)}, {activeSosAlert.longitude.toFixed(6)}
              </strong>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
            <SkeuomorphicButton
              variant="secondary"
              size="sm"
              icon={Eye}
              onClick={() => {
                const found = logs.find((l) => l.id === activeSosAlert.id);
                if (found) setSelectedLog(found);
              }}
            >
              Buka Peta Leaflet
            </SkeuomorphicButton>
            <a href={activeSosAlert.mapsUrl} target="_blank" rel="noreferrer">
              <SkeuomorphicButton variant="primary" size="sm" icon={ExternalLink}>
                Google Maps
              </SkeuomorphicButton>
            </a>
            <SkeuomorphicButton
              variant="primary"
              size="sm"
              icon={CheckCircle2}
              onClick={() => setActiveSosAlert(null)}
            >
              Tandai Teratasi
            </SkeuomorphicButton>
          </div>
        </SurfaceCard>
      )}

      {/* Main Table Container: Recreating Log Data Emergency */}
      <SurfaceCard variant="elevated" padding="none" className="overflow-hidden">
        {/* Table Title Bar */}
        <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-rose-100 text-rose-700 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-bold text-slate-800">Log Kejadian Kedaruratan SOS</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Total {totalEntries} Catatan
          </span>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 bg-white">
          <div className="flex items-center space-x-3 text-xs">
            <div className="relative">
              <select
                value={siteFilter}
                onChange={(e) => {
                  setSiteFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-slate-50 hover:bg-white text-slate-800 font-semibold rounded-xl px-3 pr-8 py-2 border border-slate-200/90 shadow-2xs cursor-pointer focus:outline-none"
              >
                <option value="__ALL__">Semua Lokasi Fasilitas</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
            </div>
          </div>

          <div className="w-full sm:w-64">
            <InsetInput
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nama, waktu, pos..."
              icon={Search}
            />
          </div>
        </div>

        {/* DataTable Table Element */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <th className="py-3 px-4">Nama Personil</th>
                <th className="py-3 px-4 text-center">Waktu Kejadian</th>
                <th className="py-3 px-4">Lokasi Area / Site</th>
                <th className="py-3 px-4 text-center">Status Alarm</th>
                <th className="py-3 px-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {currentEntries.length > 0 ? (
                currentEntries.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition-colors duration-100">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{row.officerName}</div>
                      <div className="text-[10px] text-slate-500">{row.division}</div>
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-medium text-slate-700">
                      {row.formattedTime}
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {row.siteName}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          row.alertStatus === 'ACTIVE'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {row.alertStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedLog(row)}
                          className="p-1.5 text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200 shadow-2xs transition active:translate-y-0.5"
                          title="Lihat Peta Leaflet"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={row.mapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 shadow-2xs transition active:translate-y-0.5"
                          title="Buka Google Maps"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 italic">
                    Tidak ada catatan kedaruratan yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 p-4 border-t border-slate-100">
          <div>
            Menampilkan {totalEntries === 0 ? 0 : startIndex + 1}-{endIndex} dari {totalEntries} data
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

      {/* DEDICATED 3D SIREN PANIC ALERT MODAL (Matching Visual Reference Image) */}
      <PanicAlertModal
        isOpen={isPanicModalOpen}
        onClose={() => setIsPanicModalOpen(false)}
        onAcknowledge={() => {
          if (activeSosAlert) {
            setActiveSosAlert(null);
          }
        }}
        areaName={activeSosAlert?.siteName || 'Area Gudang'}
        timeString="09:12 WIB"
        reporterName={activeSosAlert?.officerName || 'Budi Santoso'}
      />

      {/* DETAIL MODAL WITH LEAFLET MAP */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <h3 className="font-extrabold text-base flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-rose-500" />
                <span>Peta Spasial Kejadian: {selectedLog.officerName}</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="text-white hover:text-white/80 font-bold text-xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="h-[280px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                <EmergencyLeafletMap
                  latitude={selectedLog.latitude}
                  longitude={selectedLog.longitude}
                  officerName={selectedLog.officerName}
                  division={selectedLog.division}
                  siteName={selectedLog.siteName}
                  radius={100}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">Waktu Kejadian</span>
                  <strong className="text-slate-900">{selectedLog.formattedTime}</strong>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">Status Alarm</span>
                  <strong className="text-rose-600">{selectedLog.alertStatus}</strong>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <a href={selectedLog.mapsUrl} target="_blank" rel="noreferrer">
                  <SkeuomorphicButton variant="secondary" size="md" icon={ExternalLink}>
                    Google Maps
                  </SkeuomorphicButton>
                </a>
                <SkeuomorphicButton
                  variant="primary"
                  size="md"
                  onClick={() => setSelectedLog(null)}
                >
                  Tutup
                </SkeuomorphicButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
