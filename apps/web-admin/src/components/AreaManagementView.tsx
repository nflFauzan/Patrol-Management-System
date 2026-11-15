'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Clock,
  CalendarCheck,
  Building,
  AlertTriangle,
  Info,
  Check,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { SurfaceCard } from './ui/SurfaceCard';
import { SkeuomorphicButton } from './ui/SkeuomorphicButton';
import { InsetInput } from './ui/InsetInput';
import { StatusBadge } from './ui/StatusBadge';

// Dynamically import Leaflet Map to avoid SSR errors
const AreaLeafletMap = dynamic(() => import('./AreaLeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[320px] bg-slate-100 flex items-center justify-center text-slate-400 text-xs rounded-xl border border-slate-200">
      <span>Memuat Peta Interaktif Leaflet...</span>
    </div>
  ),
});

export interface AreaSiteData {
  id: string;
  name: string;
  code?: string;
  address?: string;
  latitude: number;
  longitude: number;
  geofenceRadiusMeters: number;
  shiftPagiIn: string; // '07:00'
  shiftPagiOut: string; // '15:00'
  shiftSiangIn: string; // '15:00'
  shiftSiangOut: string; // '23:00'
  shiftMalamIn: string; // '23:00'
  shiftMalamOut: string; // '07:00'
  shiftStaffIn: string; // '08:00'
  shiftStaffOut: string; // '17:00'
  shiftChiefIn: string; // '08:00'
  shiftChiefOut: string; // '17:00'
}

interface AreaManagementViewProps {
  sites: AreaSiteData[];
  onAddSite: (site: AreaSiteData) => void;
  onUpdateSite: (site: AreaSiteData) => void;
  onDeleteSite: (siteId: string) => void;
  checkpointsCount?: Record<string, number>;
  personnelCount?: Record<string, number>;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

function parseTime(timeStr?: string): { jam: string; menit: string } {
  if (!timeStr) return { jam: '00', menit: '00' };
  const parts = timeStr.split(':');
  const jam = (parts[0] || '00').padStart(2, '0');
  const m = parseInt(parts[1] || '00', 10);
  const roundedM = Math.floor(m / 5) * 5;
  const menit = String(roundedM).padStart(2, '0');
  return { jam, menit };
}

function formatTime(jam: string, menit: string): string {
  return `${jam}:${menit}:00`;
}

export const AreaManagementView: React.FC<AreaManagementViewProps> = ({
  sites,
  onAddSite,
  onUpdateSite,
  onDeleteSite,
  checkpointsCount = {},
  personnelCount = {},
}) => {
  // Navigation & Modal states
  const [activeView, setActiveView] = useState<'LIST' | 'EDIT'>('LIST');
  const [isTambahModalOpen, setIsTambahModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AreaSiteData | null>(null);
  const [editingSite, setEditingSite] = useState<AreaSiteData | null>(null);

  // DataTable filtering & pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE'>('ALL');
  const [pageSize, setPageSize] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Delete modal confirmation states
  const [adminPassword, setAdminPassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form states for Tambah Area
  const [tambahName, setTambahName] = useState('');
  const [tambahLokasi, setTambahLokasi] = useState('Jakarta Pusat');
  const [tambahDeskripsi, setTambahDeskripsi] = useState('');
  const [showAdvancedMap, setShowAdvancedMap] = useState(false);
  const [tambahLat, setTambahLat] = useState<number | null>(-6.2088);
  const [tambahLng, setTambahLng] = useState<number | null>(106.8456);
  const [tambahShifts, setTambahShifts] = useState({
    pagiMasukJam: '07',
    pagiMasukMenit: '00',
    pagiPulangJam: '15',
    pagiPulangMenit: '00',
    siangMasukJam: '15',
    siangMasukMenit: '00',
    siangPulangJam: '23',
    siangPulangMenit: '00',
    malamMasukJam: '23',
    malamMasukMenit: '00',
    malamPulangJam: '07',
    malamPulangMenit: '00',
    stafMasukJam: '08',
    stafMasukMenit: '00',
    stafPulangJam: '17',
    stafPulangMenit: '00',
    chiefMasukJam: '08',
    chiefMasukMenit: '00',
    chiefPulangJam: '17',
    chiefPulangMenit: '00',
  });

  // Form states for Edit Area
  const [editName, setEditName] = useState('');
  const [editLat, setEditLat] = useState<number>(-6.2088);
  const [editLng, setEditLng] = useState<number>(106.8456);
  const [editShifts, setEditShifts] = useState({
    pagiMasukJam: '07',
    pagiMasukMenit: '00',
    pagiPulangJam: '15',
    pagiPulangMenit: '00',
    siangMasukJam: '15',
    siangMasukMenit: '00',
    siangPulangJam: '23',
    siangPulangMenit: '00',
    malamMasukJam: '23',
    malamMasukMenit: '00',
    malamPulangJam: '07',
    malamPulangMenit: '00',
    stafMasukJam: '08',
    stafMasukMenit: '00',
    stafPulangJam: '17',
    stafPulangMenit: '00',
    chiefMasukJam: '08',
    chiefMasukMenit: '00',
    chiefPulangJam: '17',
    chiefPulangMenit: '00',
  });

  // Filtered sites for DataTable
  const filteredSites = useMemo(() => {
    return sites.filter((s) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        s.name.toLowerCase().includes(q) ||
        (s.address && s.address.toLowerCase().includes(q)) ||
        String(s.latitude).includes(q) ||
        String(s.longitude).includes(q);
      return matchSearch;
    });
  }, [sites, searchTerm]);

  // Pagination calculation
  const totalEntries = filteredSites.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const paginatedSites = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSites.slice(start, start + pageSize);
  }, [filteredSites, currentPage, pageSize]);

  // Open Edit View
  const handleStartEdit = (site: AreaSiteData) => {
    setEditingSite(site);
    setEditName(site.name);
    setEditLat(site.latitude);
    setEditLng(site.longitude);

    const pIn = parseTime(site.shiftPagiIn);
    const pOut = parseTime(site.shiftPagiOut);
    const sIn = parseTime(site.shiftSiangIn);
    const sOut = parseTime(site.shiftSiangOut);
    const mIn = parseTime(site.shiftMalamIn);
    const mOut = parseTime(site.shiftMalamOut);
    const stIn = parseTime(site.shiftStaffIn);
    const stOut = parseTime(site.shiftStaffOut);
    const chIn = parseTime(site.shiftChiefIn);
    const chOut = parseTime(site.shiftChiefOut);

    setEditShifts({
      pagiMasukJam: pIn.jam,
      pagiMasukMenit: pIn.menit,
      pagiPulangJam: pOut.jam,
      pagiPulangMenit: pOut.menit,
      siangMasukJam: sIn.jam,
      siangMasukMenit: sIn.menit,
      siangPulangJam: sOut.jam,
      siangPulangMenit: sOut.menit,
      malamMasukJam: mIn.jam,
      malamMasukMenit: mIn.menit,
      malamPulangJam: mOut.jam,
      malamPulangMenit: mOut.menit,
      stafMasukJam: stIn.jam,
      stafMasukMenit: stIn.menit,
      stafPulangJam: stOut.jam,
      stafPulangMenit: stOut.menit,
      chiefMasukJam: chIn.jam,
      chiefMasukMenit: chIn.menit,
      chiefPulangJam: chOut.jam,
      chiefPulangMenit: chOut.menit,
    });

    setActiveView('EDIT');
  };

  // Submit Tambah Area
  const handleSaveTambah = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tambahName.trim()) {
      alert('Nama Area / Site wajib diisi!');
      return;
    }

    const lat = tambahLat ?? -6.2088;
    const lng = tambahLng ?? 106.8456;

    const newSite: AreaSiteData = {
      id: `site-${Date.now()}`,
      name: tambahName.trim(),
      address: tambahLokasi.trim(),
      latitude: lat,
      longitude: lng,
      geofenceRadiusMeters: 50,
      shiftPagiIn: formatTime(tambahShifts.pagiMasukJam, tambahShifts.pagiMasukMenit),
      shiftPagiOut: formatTime(tambahShifts.pagiPulangJam, tambahShifts.pagiPulangMenit),
      shiftSiangIn: formatTime(tambahShifts.siangMasukJam, tambahShifts.siangMasukMenit),
      shiftSiangOut: formatTime(tambahShifts.siangPulangJam, tambahShifts.siangPulangMenit),
      shiftMalamIn: formatTime(tambahShifts.malamMasukJam, tambahShifts.malamMasukMenit),
      shiftMalamOut: formatTime(tambahShifts.malamPulangJam, tambahShifts.malamPulangMenit),
      shiftStaffIn: formatTime(tambahShifts.stafMasukJam, tambahShifts.stafMasukMenit),
      shiftStaffOut: formatTime(tambahShifts.stafPulangJam, tambahShifts.stafPulangMenit),
      shiftChiefIn: formatTime(tambahShifts.chiefMasukJam, tambahShifts.chiefMasukMenit),
      shiftChiefOut: formatTime(tambahShifts.chiefPulangJam, tambahShifts.chiefPulangMenit),
    };

    onAddSite(newSite);
    setIsTambahModalOpen(false);
    setTambahName('');
    setTambahDeskripsi('');
    setSuccessToast(`Data Area "${newSite.name}" berhasil ditambahkan!`);
  };

  // Submit Edit Area
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSite) return;

    const updatedSite: AreaSiteData = {
      ...editingSite,
      name: editName.trim() || editingSite.name,
      latitude: editLat,
      longitude: editLng,
      shiftPagiIn: formatTime(editShifts.pagiMasukJam, editShifts.pagiMasukMenit),
      shiftPagiOut: formatTime(editShifts.pagiPulangJam, editShifts.pagiPulangMenit),
      shiftSiangIn: formatTime(editShifts.siangMasukJam, editShifts.siangMasukMenit),
      shiftSiangOut: formatTime(editShifts.siangPulangJam, editShifts.siangPulangMenit),
      shiftMalamIn: formatTime(editShifts.malamMasukJam, editShifts.malamMasukMenit),
      shiftMalamOut: formatTime(editShifts.malamPulangJam, editShifts.malamPulangMenit),
      shiftStaffIn: formatTime(editShifts.stafMasukJam, editShifts.stafMasukMenit),
      shiftStaffOut: formatTime(editShifts.stafPulangJam, editShifts.stafPulangMenit),
      shiftChiefIn: formatTime(editShifts.chiefMasukJam, editShifts.chiefMasukMenit),
      shiftChiefOut: formatTime(editShifts.chiefPulangJam, editShifts.chiefPulangMenit),
    };

    onUpdateSite(updatedSite);
    setActiveView('LIST');
    setEditingSite(null);
    setSuccessToast(`Perubahan data area "${updatedSite.name}" berhasil disimpan!`);
  };

  // Confirm Delete Area with Admin Password
  const handleConfirmDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword.trim()) {
      setDeleteError('Verifikasi Password Admin wajib diisi!');
      return;
    }

    if (!deleteTarget) return;

    onDeleteSite(deleteTarget.id);
    setSuccessToast(`Data area "${deleteTarget.name}" berhasil dihapus permanen.`);
    setDeleteTarget(null);
    setAdminPassword('');
    setDeleteError(null);
  };

  return (
    <div className="w-full space-y-4 font-sans select-none">
      {/* Toast Notification */}
      {successToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs flex justify-between items-center shadow-sm animate-in fade-in">
          <span className="font-semibold flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successToast}</span>
          </span>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* VIEW 1: DATA INDUK AREA TABLE (Matching Visual Reference Image) */}
      {activeView === 'LIST' && (
        <SurfaceCard variant="elevated" padding="md" className="space-y-4">
          {/* Header & Breadcrumb */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Data Induk
              </h1>
              <div className="text-[11px] text-slate-500 flex items-center space-x-1.5 mt-0.5">
                <span className="font-semibold text-slate-700">Area</span>
                <span>Dashboard &gt; Data Induk &gt; Area</span>
              </div>
            </div>

            {/* Filter Bar matching visual reference */}
            <div className="flex items-center flex-wrap gap-2.5">
              {/* Search well */}
              <div className="w-44 sm:w-60">
                <InsetInput
                  type="text"
                  placeholder="Cari nama area..."
                  icon={Search}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {/* Status Dropdown */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="appearance-none bg-slate-50 hover:bg-white text-slate-700 text-xs font-semibold pl-3 pr-8 py-2 rounded-xl border border-slate-200/90 shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="ACTIVE">Aktif Saja</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
              </div>

              {/* + Tambah Area Button */}
              <SkeuomorphicButton
                variant="primary"
                size="md"
                icon={Plus}
                onClick={() => setIsTambahModalOpen(true)}
              >
                Tambah Area
              </SkeuomorphicButton>
            </div>
          </div>

          {/* Modern Skeuomorphic Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200/90 shadow-2xs bg-white">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold">
                  <th className="py-3 px-4 w-12 text-center uppercase tracking-wider">No</th>
                  <th className="py-3 px-4 uppercase tracking-wider">Nama Area</th>
                  <th className="py-3 px-4 uppercase tracking-wider">Lokasi</th>
                  <th className="py-3 px-4 text-center uppercase tracking-wider w-28">Jumlah Site</th>
                  <th className="py-3 px-4 text-center uppercase tracking-wider w-28">Status</th>
                  <th className="py-3 px-4 text-center uppercase tracking-wider w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedSites.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                      Tidak ada data area yang cocok dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  paginatedSites.map((site, idx) => (
                    <tr
                      key={site.id}
                      className="hover:bg-slate-50/70 transition-colors duration-100"
                    >
                      <td className="py-3 px-4 text-center text-slate-500 font-mono">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {site.name}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {site.address || 'Jakarta Pusat'}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800">
                        {site.id.includes('site') ? '2' : '3'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <StatusBadge variant="success" label="Aktif" />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          {/* Edit Pencil Button */}
                          <button
                            type="button"
                            onClick={() => handleStartEdit(site)}
                            className="p-1.5 rounded-lg text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 shadow-2xs transition active:translate-y-0.5"
                            title="Edit Area"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Trash Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteTarget(site);
                              setAdminPassword('');
                              setDeleteError(null);
                            }}
                            className="p-1.5 rounded-lg text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 shadow-2xs transition active:translate-y-0.5"
                            title="Hapus Area"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 pt-2">
            <div>
              Menampilkan {totalEntries === 0 ? 0 : (currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, totalEntries)} dari {totalEntries} data
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
      )}

      {/* VIEW 2: EDIT AREA (Preserved Full Functionality) */}
      {activeView === 'EDIT' && editingSite && (
        <SurfaceCard variant="elevated" padding="lg" className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-sky-600" />
                <span>Edit Lokasi Area / Site: {editingSite.name}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Perbarui koordinat peta satelit GPS dan konfigurasi shift operasional
              </p>
            </div>
            <SkeuomorphicButton
              variant="secondary"
              size="sm"
              onClick={() => setActiveView('LIST')}
            >
              Kembali ke Daftar Area
            </SkeuomorphicButton>
          </div>

          <form onSubmit={handleSaveEdit} className="space-y-5">
            {/* Map Preview */}
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-3">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                <MapPin className="w-4 h-4 text-sky-600" />
                <span>Titik Koordinat & Geofence (Radius 50m)</span>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-inner bg-white">
                <AreaLeafletMap
                  latitude={editLat}
                  longitude={editLng}
                  onChangeLocation={(lat, lng) => {
                    setEditLat(lat);
                    setEditLng(lng);
                  }}
                  mode="edit"
                  areaName={editName || editingSite.name}
                  geofenceRadius={editingSite.geofenceRadiusMeters || 50}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Area / Site</label>
                  <InsetInput
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Latitude</label>
                  <InsetInput
                    type="text"
                    required
                    value={editLat}
                    onChange={(e) => setEditLat(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Longitude</label>
                  <InsetInput
                    type="text"
                    required
                    value={editLng}
                    onChange={(e) => setEditLng(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            {/* Shift configuration table */}
            <div className="rounded-xl border border-slate-200 p-4 bg-white space-y-3">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
                <Clock className="w-4 h-4 text-sky-600" />
                <span>Pengaturan Shift Operasional</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Pagi */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Shift Pagi</span>
                  <span className="font-mono text-slate-900 bg-white px-2 py-1 rounded-lg border border-slate-200">
                    {editShifts.pagiMasukJam}:{editShifts.pagiMasukMenit} - {editShifts.pagiPulangJam}:{editShifts.pagiPulangMenit}
                  </span>
                </div>
                {/* Siang */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Shift Siang</span>
                  <span className="font-mono text-slate-900 bg-white px-2 py-1 rounded-lg border border-slate-200">
                    {editShifts.siangMasukJam}:{editShifts.siangMasukMenit} - {editShifts.siangPulangJam}:{editShifts.siangPulangMenit}
                  </span>
                </div>
                {/* Malam */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Shift Malam</span>
                  <span className="font-mono text-slate-900 bg-white px-2 py-1 rounded-lg border border-slate-200">
                    {editShifts.malamMasukJam}:{editShifts.malamMasukMenit} - {editShifts.malamPulangJam}:{editShifts.malamPulangMenit}
                  </span>
                </div>
                {/* Staf */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Staff & Driver</span>
                  <span className="font-mono text-slate-900 bg-white px-2 py-1 rounded-lg border border-slate-200">
                    {editShifts.stafMasukJam}:{editShifts.stafMasukMenit} - {editShifts.stafPulangJam}:{editShifts.stafPulangMenit}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <SkeuomorphicButton
                variant="secondary"
                size="md"
                type="button"
                onClick={() => setActiveView('LIST')}
              >
                Batal
              </SkeuomorphicButton>
              <SkeuomorphicButton variant="primary" size="md" type="submit">
                Simpan Perubahan
              </SkeuomorphicButton>
            </div>
          </form>
        </SurfaceCard>
      )}

      {/* MODAL 1: TAMBAH AREA (Exact Split Modal Matching Visual Reference Image) */}
      {isTambahModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="grid grid-cols-1 md:grid-cols-5">
              {/* Left Column: 3D Isometric Map Pin Illustration matching visual reference */}
              <div className="md:col-span-2 bg-gradient-to-br from-[#E0E7FF]/40 via-[#F0F5FA] to-[#E2E8F0] p-6 flex flex-col items-center justify-center relative overflow-hidden border-b md:border-b-0 md:border-r border-slate-200">
                {/* 3D Isometric Tile Grid */}
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <svg
                    viewBox="0 0 160 140"
                    className="w-full h-full drop-shadow-md"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Isometric base slab */}
                    <path
                      d="M80 20 L140 55 L80 90 L20 55 Z"
                      fill="#FFFFFF"
                      stroke="#CBD5E1"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M20 55 L80 90 L80 102 L20 67 Z"
                      fill="#E2E8F0"
                      stroke="#CBD5E1"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M140 55 L80 90 L80 102 L140 67 Z"
                      fill="#CBD5E1"
                      stroke="#94A3B8"
                      strokeWidth="1.5"
                    />
                    {/* Roads across tile */}
                    <path
                      d="M60 31 L120 66"
                      stroke="#38BDF8"
                      strokeWidth="6"
                      strokeOpacity="0.4"
                      strokeLinecap="round"
                    />
                    <path
                      d="M100 31 L40 66"
                      stroke="#38BDF8"
                      strokeWidth="6"
                      strokeOpacity="0.4"
                      strokeLinecap="round"
                    />
                    {/* Soft Shadow under pin */}
                    <ellipse cx="80" cy="62" rx="16" ry="6" fill="#0284C7" fillOpacity="0.25" />
                  </svg>

                  {/* 3D Glossy Blue Map Pin */}
                  <div className="absolute top-8 flex flex-col items-center animate-bounce duration-1000">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#38BDF8] via-[#0284C7] to-[#0369A1] shadow-skeuo-button-primary border-2 border-white flex items-center justify-center">
                      <div className="w-3.5 h-3.5 rounded-full bg-white shadow-inner" />
                    </div>
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-[#0369A1] -mt-0.5" />
                  </div>
                </div>

                <div className="text-center mt-2">
                  <div className="text-xs font-bold text-slate-800">Geofence Presisi</div>
                  <div className="text-[10px] text-slate-500">Validasi radius koordinat GPS otomatis</div>
                </div>
              </div>

              {/* Right Column: Form matching visual reference */}
              <div className="md:col-span-3 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                    <h3 className="font-extrabold text-base text-slate-900">Tambah Area</h3>
                    <button
                      type="button"
                      onClick={() => setIsTambahModalOpen(false)}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveTambah} id="formTambahArea" className="space-y-3.5">
                    {/* Nama Area */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nama Area <span className="text-rose-500">*</span>
                      </label>
                      <InsetInput
                        type="text"
                        required
                        value={tambahName}
                        onChange={(e) => setTambahName(e.target.value)}
                        placeholder="Masukkan nama area"
                      />
                    </div>

                    {/* Lokasi */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Lokasi <span className="text-rose-500">*</span>
                      </label>
                      <InsetInput
                        type="text"
                        required
                        value={tambahLokasi}
                        onChange={(e) => setTambahLokasi(e.target.value)}
                        placeholder="Masukkan lokasi area"
                        icon={MapPin}
                      />
                    </div>

                    {/* Deskripsi (Opsional) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Deskripsi (Opsional)
                      </label>
                      <textarea
                        rows={2}
                        value={tambahDeskripsi}
                        onChange={(e) => setTambahDeskripsi(e.target.value)}
                        placeholder="Keterangan singkat mengenai area..."
                        className="w-full bg-[#F8FAFC] border border-slate-300/80 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 shadow-skeuo-inset focus:outline-none focus:ring-2 focus:ring-sky-500 transition resize-none"
                      />
                    </div>

                    {/* Advanced toggle for Leaflet map */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAdvancedMap(!showAdvancedMap)}
                        className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 inline-flex items-center space-x-1"
                      >
                        <span>{showAdvancedMap ? 'Sembunyikan Peta Koordinat' : '+ Sesuaikan Koordinat Peta & Shift'}</span>
                      </button>

                      {showAdvancedMap && (
                        <div className="mt-2.5 p-2 rounded-xl border border-slate-200 bg-slate-50 space-y-2 animate-in fade-in">
                          <div className="h-40 rounded-lg overflow-hidden border border-slate-200">
                            <AreaLeafletMap
                              latitude={tambahLat}
                              longitude={tambahLng}
                              onChangeLocation={(lat, lng) => {
                                setTambahLat(lat);
                                setTambahLng(lng);
                              }}
                              mode="create"
                              areaName={tambahName || 'Area Baru'}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-600">
                            <div>Lat: {tambahLat}</div>
                            <div>Lng: {tambahLng}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Modal Buttons matching visual reference */}
                    <div className="flex justify-end items-center space-x-2 pt-4 border-t border-slate-100">
                      <SkeuomorphicButton
                        variant="secondary"
                        size="md"
                        type="button"
                        onClick={() => setIsTambahModalOpen(false)}
                      >
                        Batal
                      </SkeuomorphicButton>
                      <SkeuomorphicButton variant="primary" size="md" type="submit">
                        Simpan
                      </SkeuomorphicButton>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRM DELETE AREA */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-rose-600 text-white px-5 py-3.5 flex items-center justify-between">
              <h5 className="font-bold text-sm flex items-center space-x-2">
                <Trash2 className="w-4 h-4" />
                <span>Konfirmasi Hapus Area</span>
              </h5>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="text-white hover:opacity-80 font-bold text-lg"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleConfirmDelete} className="p-5 space-y-4">
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs space-y-2">
                <div className="font-bold uppercase flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Peringatan Penghapusan</span>
                </div>
                <p>
                  Anda akan menghapus area <strong className="text-rose-900 font-extrabold">{deleteTarget.name}</strong> secara permanen.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Verifikasi Password Admin
                </label>
                <InsetInput
                  type="password"
                  required
                  placeholder="Masukkan password admin"
                  value={adminPassword}
                  onChange={(e) => {
                    setAdminPassword(e.target.value);
                    setDeleteError(null);
                  }}
                />
                {deleteError && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1">{deleteError}</p>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <SkeuomorphicButton
                  variant="secondary"
                  size="md"
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                >
                  Batal
                </SkeuomorphicButton>
                <SkeuomorphicButton variant="danger" size="md" type="submit">
                  Hapus Permanen
                </SkeuomorphicButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
