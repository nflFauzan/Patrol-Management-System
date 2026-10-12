'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  Globe,
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
  Save,
  Ban,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

// Dynamically import Leaflet Map to avoid SSR errors
const AreaLeafletMap = dynamic(() => import('./AreaLeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[40vh] min-h-[280px] bg-slate-100 flex items-center justify-center text-slate-400 text-xs rounded-md border border-slate-200">
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

// Hours options: 00 to 23
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
// Minutes options: 00, 05, 10, ... 55
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
  const [pageSize, setPageSize] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Delete modal confirmation states
  const [adminPassword, setAdminPassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form states for Tambah Area
  const [tambahName, setTambahName] = useState('');
  const [tambahLat, setTambahLat] = useState<number | null>(-6.200000);
  const [tambahLng, setTambahLng] = useState<number | null>(106.816666);
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
  const [editLat, setEditLat] = useState<number>(-6.200000);
  const [editLng, setEditLng] = useState<number>(106.816666);
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
      return (
        s.name.toLowerCase().includes(q) ||
        String(s.latitude).includes(q) ||
        String(s.longitude).includes(q)
      );
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
    if (tambahLat === null || tambahLng === null) {
      alert('Tentukan koordinat Latitude dan Longitude pada peta!');
      return;
    }

    const newSite: AreaSiteData = {
      id: `site-${Date.now()}`,
      name: tambahName.trim(),
      latitude: tambahLat,
      longitude: tambahLng,
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
    <div className="w-full space-y-4">
      {/* SUCCESS TOAST NOTIFICATION */}
      {successToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-xl text-xs flex justify-between items-center shadow-sm animate-in fade-in">
          <span className="font-semibold flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successToast}</span>
          </span>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================
          VIEW 1: TABEL DATA AREA (100% PARITY DENGAN PATROLI.SITE)
          ======================================================== */}
      {activeView === 'LIST' && (
        <div className="space-y-4">
          {/* HEADER TABEL: EXACT BUTTON & BG */}
          <div className="bg-[#17a2b8] p-3 rounded-t-xl flex items-center justify-between shadow-sm">
            <button
              type="button"
              onClick={() => setIsTambahModalOpen(true)}
              className="btn-tambah-area"
              title="Tambah Data Area Baru"
            >
              <Globe className="w-4 h-4" />
              <small className="font-bold tracking-wider">TAMBAH DATA AREA / SITE</small>
            </button>
          </div>

          {/* TABEL WRAPPER: CLASS DAN DESAIN ASLI PATROLI.SITE */}
          <div className="bg-white border border-[#17a2b8]/40 rounded-b-xl shadow-xs p-4 space-y-4 -mt-4">
            {/* DATATABLE TOP CONTROLS: ENTRIES & SEARCH */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex items-center space-x-2">
                <span>Show</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-slate-300 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1769aa]"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={1000}>1,000</option>
                </select>
                <span>entries</span>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <span>Search:</span>
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder=""
                  className="border border-slate-300 rounded px-2.5 py-1 text-xs w-full sm:w-48 bg-white focus:outline-none focus:ring-1 focus:ring-[#1769aa]"
                />
              </div>
            </div>

            {/* TABEL DATA INDUK AREA */}
            <div className="overflow-x-auto rounded-lg border border-[#17a2b8]/30">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#17a2b8] text-white text-center font-bold">
                    <th className="py-2.5 px-4 border-r border-[#17a2b8]/40 uppercase tracking-wider">
                      DATA LOKASI AREA / SITE
                    </th>
                    <th className="py-2.5 px-4 border-r border-[#17a2b8]/40 uppercase tracking-wider w-36">
                      LATITUDE
                    </th>
                    <th className="py-2.5 px-4 border-r border-[#17a2b8]/40 uppercase tracking-wider w-36">
                      LONGITUDE
                    </th>
                    <th className="py-2.5 px-4 uppercase tracking-wider w-44">
                      AKSI
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {paginatedSites.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 italic">
                        Tidak ada data area / site yang ditemukan.
                      </td>
                    </tr>
                  ) : (
                    paginatedSites.map((site, idx) => (
                      <tr
                        key={site.id}
                        className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50/80' : 'bg-slate-50/50 hover:bg-slate-100/80'}
                      >
                        <td className="py-2.5 px-4 text-center font-medium text-slate-600">
                          <small className="text-xs text-slate-600">{site.name}</small>
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <small className="text-xs font-mono font-medium text-[#0d6efd]">
                            {site.latitude}
                          </small>
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <small className="text-xs font-mono font-medium text-[#198754]">
                            {site.longitude}
                          </small>
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            {/* EDIT BUTTON (CYAN/INFO) */}
                            <button
                              type="button"
                              onClick={() => handleStartEdit(site)}
                              className="inline-flex items-center space-x-1 px-2.5 py-1 bg-[#17a2b8] hover:bg-[#138496] text-white rounded text-[11px] font-bold shadow-xs transition"
                              title="Edit Area & Shift"
                            >
                              <Pencil className="w-3 h-3" />
                              <small className="uppercase font-semibold">EDIT</small>
                            </button>

                            {/* HAPUS BUTTON (RED/DANGER) */}
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteTarget(site);
                                setAdminPassword('');
                                setDeleteError(null);
                              }}
                              className="inline-flex items-center space-x-1 px-2.5 py-1 bg-[#dc3545] hover:bg-[#c82333] text-white rounded text-[11px] font-bold shadow-xs transition"
                              title="Hapus Area"
                            >
                              <Trash2 className="w-3 h-3" />
                              <small className="uppercase font-semibold">HAPUS</small>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* DATATABLE BOTTOM CONTROLS: PAGINATION INFO & BUTTONS */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 pt-2">
              <div>
                Showing {totalEntries === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, totalEntries)} of {totalEntries} entries
              </div>

              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 border border-slate-300 rounded text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 text-xs flex items-center space-x-0.5"
                >
                  <ChevronLeft className="w-3 h-3" />
                  <span>Previous</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => setCurrentPage(pg)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold ${
                      currentPage === pg
                        ? 'bg-[#1769aa] text-white'
                        : 'border border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {pg}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 border border-slate-300 rounded text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 text-xs flex items-center space-x-0.5"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          VIEW 2: EDIT DATA AREA (100% PARITY DENGAN area_update.php)
          ======================================================== */}
      {activeView === 'EDIT' && editingSite && (
        <div className="bg-[#f5f8fc] border border-[#d8e5f1] rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in">
          {/* Header Edit View */}
          <div className="flex items-center justify-between border-b border-[#d8e5f1] pb-4">
            <div>
              <h3 className="text-base font-bold text-[#104b7a] flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-[#1769aa]" />
                <span>Edit Lokasi Area / Site: {editingSite.name}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Perbarui koordinat peta satelit GPS dan konfigurasi shift operasional
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveView('LIST')}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs flex items-center space-x-1 transition"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Kembali ke Daftar Area</span>
            </button>
          </div>

          <form onSubmit={handleSaveEdit} className="space-y-5">
            {/* PETA SECTION */}
            <div className="bg-white border border-[#d8e5f1] rounded-xl p-4 shadow-xs">
              <div className="flex items-center space-x-2 text-[#104b7a] font-bold text-sm mb-3">
                <MapPin className="w-4 h-4 text-[#1769aa]" />
                <span>Lokasi Area / Site</span>
              </div>

              {/* Instruction Banner */}
              <div className="bg-[#fff8e6] border border-[#f1d58a] border-l-4 border-l-[#e7ad29] text-[#785516] p-3 rounded-lg text-xs leading-relaxed mb-3 flex items-start space-x-2">
                <Info className="w-4 h-4 text-[#e7ad29] shrink-0 mt-0.5" />
                <span>
                  Pastikan titik lokasi sudah tepat. Anda dapat memperbesar, memperkecil, menggeser
                  peta, atau mengeklik titik lokasi yang sesuai.
                </span>
              </div>

              {/* Map Frame with Leaflet & Red Circle Geofence */}
              <div className="border border-[#d8e5f1] p-1.5 rounded-lg bg-white overflow-hidden">
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

              {/* KOORDINAT FIELDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <div>
                  <label className="block text-xs font-bold text-[#43566b] mb-1">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-[#1769aa]" />
                      <span>Latitude</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editLat}
                    onChange={(e) => setEditLat(parseFloat(e.target.value) || 0)}
                    className="w-full border border-[#cfdeeb] rounded-lg px-3 py-2 text-xs text-slate-800 font-mono bg-white focus:outline-none focus:ring-2 focus:ring-[#1769aa]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#43566b] mb-1">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-[#1769aa]" />
                      <span>Longitude</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editLng}
                    onChange={(e) => setEditLng(parseFloat(e.target.value) || 0)}
                    className="w-full border border-[#cfdeeb] rounded-lg px-3 py-2 text-xs text-slate-800 font-mono bg-white focus:outline-none focus:ring-2 focus:ring-[#1769aa]"
                  />
                </div>
              </div>

              {/* NAMA AREA FIELD */}
              <div className="mt-3">
                <label className="block text-xs font-bold text-[#43566b] mb-1">
                  <span className="flex items-center space-x-1">
                    <Building className="w-3 h-3 text-[#1769aa]" />
                    <span>Nama Area / Site</span>
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-[#cfdeeb] rounded-lg px-3 py-2 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#1769aa]"
                />
              </div>
            </div>

            {/* SHIFT ANGGOTA DAN KOMANDAN */}
            <div className="border border-[#d4e4f3] rounded-xl overflow-hidden bg-white shadow-xs">
              <div className="bg-[#eaf4ff] text-[#174e7b] px-4 py-3 border-b border-[#d4e4f3] font-bold text-xs flex items-center space-x-2">
                <Clock className="w-4 h-4 text-[#1769aa]" />
                <span>Pengaturan Shift Anggota dan Komandan</span>
              </div>

              <div className="p-4 space-y-3">
                {/* SHIFT PAGI */}
                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 border-b border-slate-100 pb-3">
                  <label className="text-xs font-medium text-[#43566b]">Jam Masuk Shift Pagi</label>
                  <div className="flex items-center space-x-1">
                    <select
                      value={editShifts.pagiMasukJam}
                      onChange={(e) => setEditShifts({ ...editShifts, pagiMasukJam: e.target.value })}
                      className="border border-[#cfdeeb] rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-[#1769aa]"
                    >
                      {HOURS.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <span className="text-slate-400 font-bold">:</span>
                    <select
                      value={editShifts.pagiMasukMenit}
                      onChange={(e) => setEditShifts({ ...editShifts, pagiMasukMenit: e.target.value })}
                      className="border border-[#cfdeeb] rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-[#1769aa]"
                    >
                      {MINUTES.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <label className="text-xs font-medium text-[#43566b]">Jam Pulang Shift Pagi</label>
                  <div className="flex items-center space-x-1">
                    <select
                      value={editShifts.pagiPulangJam}
                      onChange={(e) => setEditShifts({ ...editShifts, pagiPulangJam: e.target.value })}
                      className="border border-[#cfdeeb] rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-[#1769aa]"
                    >
                      {HOURS.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <span className="text-slate-400 font-bold">:</span>
                    <select
                      value={editShifts.pagiPulangMenit}
                      onChange={(e) => setEditShifts({ ...editShifts, pagiPulangMenit: e.target.value })}
                      className="border border-[#cfdeeb] rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-[#1769aa]"
                    >
                      {MINUTES.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* SHIFT SIANG */}
                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 border-b border-slate-100 pb-3">
                  <label className="text-xs font-medium text-[#43566b]">Jam Masuk Shift Siang</label>
                  <div className="flex items-center space-x-1">
                    <select
                      value={editShifts.siangMasukJam}
                      onChange={(e) => setEditShifts({ ...editShifts, siangMasukJam: e.target.value })}
                      className="border border-[#cfdeeb] rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-[#1769aa]"
                    >
                      {HOURS.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <span className="text-slate-400 font-bold">:</span>
                    <select
                      value={editShifts.siangMasukMenit}
                      onChange={(e) => setEditShifts({ ...editShifts, siangMasukMenit: e.target.value })}
                      className="border border-[#cfdeeb] rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-[#1769aa]"
                    >
                      {MINUTES.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <label className="text-xs font-medium text-[#43566b]">Jam Pulang Shift Siang</label>
                  <div className="flex items-center space-x-1">
                    <select
                      value={editShifts.siangPulangJam}
                      onChange={(e) => setEditShifts({ ...editShifts, siangPulangJam: e.target.value })}
                      className="border border-[#cfdeeb] rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-[#1769aa]"
                    >
                      {HOURS.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <span className="text-slate-400 font-bold">:</span>
                    <select
                      value={editShifts.siangPulangMenit}
                      onChange={(e) => setEditShifts({ ...editShifts, siangPulangMenit: e.target.value })}
                      className="border border-[#cfdeeb] rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-[#1769aa]"
                    >
                      {MINUTES.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* SHIFT MALAM */}
                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2">
                  <label className="text-xs font-medium text-[#43566b]">Jam Masuk Shift Malam</label>
                  <div className="flex items-center space-x-1">
                    <select
                      value={editShifts.malamMasukJam}
                      onChange={(e) => setEditShifts({ ...editShifts, malamMasukJam: e.target.value })}
                      className="border border-[#cfdeeb] rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-[#1769aa]"
                    >
                      {HOURS.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <span className="text-slate-400 font-bold">:</span>
                    <select
                      value={editShifts.malamMasukMenit}
                      onChange={(e) => setEditShifts({ ...editShifts, malamMasukMenit: e.target.value })}
                      className="border border-[#cfdeeb] rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-[#1769aa]"
                    >
                      {MINUTES.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <label className="text-xs font-medium text-[#43566b]">Jam Pulang Shift Malam</label>
                  <div className="flex items-center space-x-1">
                    <select
                      value={editShifts.malamPulangJam}
                      onChange={(e) => setEditShifts({ ...editShifts, malamPulangJam: e.target.value })}
                      className="border border-[#cfdeeb] rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-[#1769aa]"
                    >
                      {HOURS.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <span className="text-slate-400 font-bold">:</span>
                    <select
                      value={editShifts.malamPulangMenit}
                      onChange={(e) => setEditShifts({ ...editShifts, malamPulangMenit: e.target.value })}
                      className="border border-[#cfdeeb] rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-[#1769aa]"
                    >
                      {MINUTES.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* JAM KERJA RUTIN */}
            <div className="border border-[#d4e4f3] rounded-xl overflow-hidden bg-white shadow-xs">
              <div className="bg-[#eaf4ff] text-[#174e7b] px-4 py-3 border-b border-[#d4e4f3] font-bold text-xs flex items-center space-x-2">
                <CalendarCheck className="w-4 h-4 text-[#1769aa]" />
                <span>Pengaturan Jam Kerja Rutin: Chief / Staf / Cleaning Service / Driver</span>
              </div>

              <div className="p-4 space-y-3">
                {/* STAF / CS / DRIVER */}
                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 border-b border-slate-100 pb-3">
                  <label className="text-xs font-medium text-[#43566b]">Jam Masuk Staf / CS / Driver</label>
                  <div className="flex items-center space-x-1">
                    <select
                      value={editShifts.stafMasukJam}
                      onChange={(e) => setEditShifts({ ...editShifts, stafMasukJam: e.target.value })}
                      className="border border-[#cfdeeb] rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-[#1769aa]"
                    >
                      {HOURS.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <span className="text-slate-400 font-bold">:</span>
                    <select
                      value={editShifts.stafMasukMenit}
                      onChange={(e) => setEditShifts({ ...editShifts, stafMasukMenit: e.target.value })}
                      className="border border-[#cfdeeb] rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-[#1769aa]"
                    >
                      {MINUTES.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <label className="text-xs font-medium text-[#43566b]">Jam Pulang Staf / CS / Driver</label>
                  <div className="flex items-center space-x-1">
                    <select
                      value={editShifts.stafPulangJam}
                      onChange={(e) => setEditShifts({ ...editShifts, stafPulangJam: e.target.value })}
                      className="border border-[#cfdeeb] rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-[#1769aa]"
                    >
                      {HOURS.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <span className="text-slate-400 font-bold">:</span>
                    <select
                      value={editShifts.stafPulangMenit}
                      onChange={(e) => setEditShifts({ ...editShifts, stafPulangMenit: e.target.value })}
                      className="border border-[#cfdeeb] rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-[#1769aa]"
                    >
                      {MINUTES.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* CHIEF */}
                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2">
                  <label className="text-xs font-medium text-[#43566b]">Jam Masuk Chief</label>
                  <div className="flex items-center space-x-1">
                    <select
                      value={editShifts.chiefMasukJam}
                      onChange={(e) => setEditShifts({ ...editShifts, chiefMasukJam: e.target.value })}
                      className="border border-[#cfdeeb] rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-[#1769aa]"
                    >
                      {HOURS.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <span className="text-slate-400 font-bold">:</span>
                    <select
                      value={editShifts.chiefMasukMenit}
                      onChange={(e) => setEditShifts({ ...editShifts, chiefMasukMenit: e.target.value })}
                      className="border border-[#cfdeeb] rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-[#1769aa]"
                    >
                      {MINUTES.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <label className="text-xs font-medium text-[#43566b]">Jam Pulang Chief</label>
                  <div className="flex items-center space-x-1">
                    <select
                      value={editShifts.chiefPulangJam}
                      onChange={(e) => setEditShifts({ ...editShifts, chiefPulangJam: e.target.value })}
                      className="border border-[#cfdeeb] rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-[#1769aa]"
                    >
                      {HOURS.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <span className="text-slate-400 font-bold">:</span>
                    <select
                      value={editShifts.chiefPulangMenit}
                      onChange={(e) => setEditShifts({ ...editShifts, chiefPulangMenit: e.target.value })}
                      className="border border-[#cfdeeb] rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-[#1769aa]"
                    >
                      {MINUTES.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS (BATAL & SIMPAN PERUBAHAN) */}
            <div className="flex justify-end items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveView('LIST')}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-xs flex items-center space-x-1 transition"
              >
                <Ban className="w-3.5 h-3.5 mr-1" />
                <span>BATAL</span>
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-[#0d6efd] hover:bg-[#0b5ed7] text-white font-bold rounded-lg text-xs flex items-center space-x-1 shadow-sm transition"
              >
                <Save className="w-3.5 h-3.5 mr-1" />
                <span>SIMPAN PERUBAHAN</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================
          MODAL 1: FORM TAMBAH DATA AREA (EXACT #exampleModalCenter)
          ======================================================== */}
      {isTambahModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header: Gradient #1769aa to #104b7a */}
            <div className="bg-gradient-to-r from-[#1769aa] to-[#104b7a] text-white px-5 py-4 flex items-center justify-between border-b-4 border-[#4da3e6]">
              <h5 className="font-bold text-sm tracking-wide flex items-center space-x-2 text-white">
                <MapPin className="w-4 h-4 text-white" />
                <span>Form Tambah Data Area / Site</span>
              </h5>
              <button
                type="button"
                onClick={() => setIsTambahModalOpen(false)}
                className="text-white/80 hover:text-white text-xl leading-none font-bold"
              >
                ×
              </button>
            </div>

            {/* Modal Body: #f5f8fc background */}
            <div className="bg-[#f5f8fc] p-5 max-h-[80vh] overflow-y-auto space-y-4">
              <form onSubmit={handleSaveTambah} id="formTambahArea" className="space-y-4">
                {/* SECTION 1: PETA */}
                <div className="bg-white border border-[#d8e5f1] rounded-xl p-4 shadow-xs">
                  <div className="flex items-center space-x-2 text-[#104b7a] font-bold text-xs mb-2">
                    <MapPin className="w-4 h-4 text-[#1769aa]" />
                    <span>Tentukan Titik Lokasi Area / Site</span>
                  </div>

                  <div className="bg-[#fff8e6] border border-[#f1d58a] border-l-4 border-l-[#e7ad29] text-[#785516] p-3 rounded-lg text-xs leading-relaxed mb-3 flex items-start space-x-2">
                    <Info className="w-4 h-4 text-[#e7ad29] shrink-0 mt-0.5" />
                    <span>
                      Klik ikon pencarian pada peta untuk mencari lokasi berdasarkan nama atau alamat.
                      Setelah itu, klik tepat pada lokasi di peta untuk mengisi latitude dan longitude.
                      Anda juga dapat menggeser penanda lokasi.
                    </span>
                  </div>

                  <div className="border border-[#d8e5f1] p-1.5 rounded-lg bg-white overflow-hidden">
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
                </div>

                {/* SECTION 2: IDENTITAS AREA */}
                <div className="bg-white border border-[#d8e5f1] rounded-xl p-4 shadow-xs">
                  <div className="flex items-center space-x-2 text-[#104b7a] font-bold text-xs mb-3">
                    <Building className="w-4 h-4 text-[#1769aa]" />
                    <span>Informasi Area / Site</span>
                  </div>

                  <div className="mb-3">
                    <label className="block text-xs font-bold text-[#43566b] mb-1">
                      Nama Area / Site
                    </label>
                    <input
                      type="text"
                      required
                      value={tambahName}
                      onChange={(e) => setTambahName(e.target.value)}
                      placeholder="Contoh: PT. Mall Jakarta atau PT. Kimia C4"
                      className="w-full border border-[#cfdeeb] rounded-lg px-3 py-2 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#1769aa]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#43566b] mb-1">
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-[#1769aa]" />
                          <span>Latitude</span>
                        </span>
                      </label>
                      <input
                        type="text"
                        required
                        value={tambahLat !== null ? String(tambahLat) : ''}
                        onChange={(e) => setTambahLat(parseFloat(e.target.value) || 0)}
                        placeholder="Latitude akan terisi dari peta"
                        className="w-full border border-[#cfdeeb] rounded-lg px-3 py-2 text-xs text-slate-800 font-mono bg-white focus:outline-none focus:ring-2 focus:ring-[#1769aa]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#43566b] mb-1">
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-[#1769aa]" />
                          <span>Longitude</span>
                        </span>
                      </label>
                      <input
                        type="text"
                        required
                        value={tambahLng !== null ? String(tambahLng) : ''}
                        onChange={(e) => setTambahLng(parseFloat(e.target.value) || 0)}
                        placeholder="Longitude akan terisi dari peta"
                        className="w-full border border-[#cfdeeb] rounded-lg px-3 py-2 text-xs text-slate-800 font-mono bg-white focus:outline-none focus:ring-2 focus:ring-[#1769aa]"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 3: PENGATURAN SHIFT ANGGOTA DAN KOMANDAN */}
                <div className="border border-[#d4e4f3] rounded-xl overflow-hidden bg-white shadow-xs">
                  <div className="bg-[#eaf4ff] text-[#174e7b] px-4 py-3 border-b border-[#d4e4f3] font-bold text-xs flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-[#1769aa]" />
                    <span>Pengaturan Jam Kerja Shift Anggota dan Komandan</span>
                  </div>

                  <div className="p-4 space-y-3">
                    {/* Shift Pagi */}
                    <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 border-b border-slate-100 pb-3">
                      <label className="text-xs font-medium text-[#43566b]">Jam Masuk Shift Pagi</label>
                      <div className="flex items-center space-x-1">
                        <select
                          value={tambahShifts.pagiMasukJam}
                          onChange={(e) => setTambahShifts({ ...tambahShifts, pagiMasukJam: e.target.value })}
                          className="border border-[#cfdeeb] rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-[#1769aa]"
                        >
                          {HOURS.map((h) => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                        <span className="text-slate-400 font-bold">:</span>
                        <select
                          value={tambahShifts.pagiMasukMenit}
                          onChange={(e) => setTambahShifts({ ...tambahShifts, pagiMasukMenit: e.target.value })}
                          className="border border-[#cfdeeb] rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-[#1769aa]"
                        >
                          {MINUTES.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>

                      <label className="text-xs font-medium text-[#43566b]">Jam Pulang Shift Pagi</label>
                      <div className="flex items-center space-x-1">
                        <select
                          value={tambahShifts.pagiPulangJam}
                          onChange={(e) => setTambahShifts({ ...tambahShifts, pagiPulangJam: e.target.value })}
                          className="border border-[#cfdeeb] rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-[#1769aa]"
                        >
                          {HOURS.map((h) => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                        <span className="text-slate-400 font-bold">:</span>
                        <select
                          value={tambahShifts.pagiPulangMenit}
                          onChange={(e) => setTambahShifts({ ...tambahShifts, pagiPulangMenit: e.target.value })}
                          className="border border-[#cfdeeb] rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-[#1769aa]"
                        >
                          {MINUTES.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Shift Siang */}
                    <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 border-b border-slate-100 pb-3">
                      <label className="text-xs font-medium text-[#43566b]">Jam Masuk Shift Siang</label>
                      <div className="flex items-center space-x-1">
                        <select
                          value={tambahShifts.siangMasukJam}
                          onChange={(e) => setTambahShifts({ ...tambahShifts, siangMasukJam: e.target.value })}
                          className="border border-[#cfdeeb] rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-[#1769aa]"
                        >
                          {HOURS.map((h) => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                        <span className="text-slate-400 font-bold">:</span>
                        <select
                          value={tambahShifts.siangMasukMenit}
                          onChange={(e) => setTambahShifts({ ...tambahShifts, siangMasukMenit: e.target.value })}
                          className="border border-[#cfdeeb] rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-[#1769aa]"
                        >
                          {MINUTES.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>

                      <label className="text-xs font-medium text-[#43566b]">Jam Pulang Shift Siang</label>
                      <div className="flex items-center space-x-1">
                        <select
                          value={tambahShifts.siangPulangJam}
                          onChange={(e) => setTambahShifts({ ...tambahShifts, siangPulangJam: e.target.value })}
                          className="border border-[#cfdeeb] rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-[#1769aa]"
                        >
                          {HOURS.map((h) => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                        <span className="text-slate-400 font-bold">:</span>
                        <select
                          value={tambahShifts.siangPulangMenit}
                          onChange={(e) => setTambahShifts({ ...tambahShifts, siangPulangMenit: e.target.value })}
                          className="border border-[#cfdeeb] rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-[#1769aa]"
                        >
                          {MINUTES.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Shift Malam */}
                    <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2">
                      <label className="text-xs font-medium text-[#43566b]">Jam Masuk Shift Malam</label>
                      <div className="flex items-center space-x-1">
                        <select
                          value={tambahShifts.malamMasukJam}
                          onChange={(e) => setTambahShifts({ ...tambahShifts, malamMasukJam: e.target.value })}
                          className="border border-[#cfdeeb] rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-[#1769aa]"
                        >
                          {HOURS.map((h) => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                        <span className="text-slate-400 font-bold">:</span>
                        <select
                          value={tambahShifts.malamMasukMenit}
                          onChange={(e) => setTambahShifts({ ...tambahShifts, malamMasukMenit: e.target.value })}
                          className="border border-[#cfdeeb] rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-[#1769aa]"
                        >
                          {MINUTES.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>

                      <label className="text-xs font-medium text-[#43566b]">Jam Pulang Shift Malam</label>
                      <div className="flex items-center space-x-1">
                        <select
                          value={tambahShifts.malamPulangJam}
                          onChange={(e) => setTambahShifts({ ...tambahShifts, malamPulangJam: e.target.value })}
                          className="border border-[#cfdeeb] rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-[#1769aa]"
                        >
                          {HOURS.map((h) => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                        <span className="text-slate-400 font-bold">:</span>
                        <select
                          value={tambahShifts.malamPulangMenit}
                          onChange={(e) => setTambahShifts({ ...tambahShifts, malamPulangMenit: e.target.value })}
                          className="border border-[#cfdeeb] rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-[#1769aa]"
                        >
                          {MINUTES.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 4: PENGATURAN JAM KERJA RUTIN */}
                <div className="border border-[#d4e4f3] rounded-xl overflow-hidden bg-white shadow-xs">
                  <div className="bg-[#eaf4ff] text-[#174e7b] px-4 py-3 border-b border-[#d4e4f3] font-bold text-xs flex items-center space-x-2">
                    <CalendarCheck className="w-4 h-4 text-[#1769aa]" />
                    <span>Pengaturan Jam Kerja Rutin: Chief / Staf / Cleaning Service / Driver</span>
                  </div>

                  <div className="p-4 space-y-3">
                    {/* Staf / CS / Driver */}
                    <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 border-b border-slate-100 pb-3">
                      <label className="text-xs font-medium text-[#43566b]">Jam Masuk Staf / CS / Driver</label>
                      <div className="flex items-center space-x-1">
                        <select
                          value={tambahShifts.stafMasukJam}
                          onChange={(e) => setTambahShifts({ ...tambahShifts, stafMasukJam: e.target.value })}
                          className="border border-[#cfdeeb] rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-[#1769aa]"
                        >
                          {HOURS.map((h) => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                        <span className="text-slate-400 font-bold">:</span>
                        <select
                          value={tambahShifts.stafMasukMenit}
                          onChange={(e) => setTambahShifts({ ...tambahShifts, stafMasukMenit: e.target.value })}
                          className="border border-[#cfdeeb] rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-[#1769aa]"
                        >
                          {MINUTES.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>

                      <label className="text-xs font-medium text-[#43566b]">Jam Pulang Staf / CS / Driver</label>
                      <div className="flex items-center space-x-1">
                        <select
                          value={tambahShifts.stafPulangJam}
                          onChange={(e) => setTambahShifts({ ...tambahShifts, stafPulangJam: e.target.value })}
                          className="border border-[#cfdeeb] rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-[#1769aa]"
                        >
                          {HOURS.map((h) => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                        <span className="text-slate-400 font-bold">:</span>
                        <select
                          value={tambahShifts.stafPulangMenit}
                          onChange={(e) => setTambahShifts({ ...tambahShifts, stafPulangMenit: e.target.value })}
                          className="border border-[#cfdeeb] rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-[#1769aa]"
                        >
                          {MINUTES.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Chief */}
                    <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2">
                      <label className="text-xs font-medium text-[#43566b]">Jam Masuk Chief</label>
                      <div className="flex items-center space-x-1">
                        <select
                          value={tambahShifts.chiefMasukJam}
                          onChange={(e) => setTambahShifts({ ...tambahShifts, chiefMasukJam: e.target.value })}
                          className="border border-[#cfdeeb] rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-[#1769aa]"
                        >
                          {HOURS.map((h) => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                        <span className="text-slate-400 font-bold">:</span>
                        <select
                          value={tambahShifts.chiefMasukMenit}
                          onChange={(e) => setTambahShifts({ ...tambahShifts, chiefMasukMenit: e.target.value })}
                          className="border border-[#cfdeeb] rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-[#1769aa]"
                        >
                          {MINUTES.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>

                      <label className="text-xs font-medium text-[#43566b]">Jam Pulang Chief</label>
                      <div className="flex items-center space-x-1">
                        <select
                          value={tambahShifts.chiefPulangJam}
                          onChange={(e) => setTambahShifts({ ...tambahShifts, chiefPulangJam: e.target.value })}
                          className="border border-[#cfdeeb] rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-[#1769aa]"
                        >
                          {HOURS.map((h) => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                        <span className="text-slate-400 font-bold">:</span>
                        <select
                          value={tambahShifts.chiefPulangMenit}
                          onChange={(e) => setTambahShifts({ ...tambahShifts, chiefPulangMenit: e.target.value })}
                          className="border border-[#cfdeeb] rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-[#1769aa]"
                        >
                          {MINUTES.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* MODAL ACTIONS: BATAL & SIMPAN DATA AREA */}
                <div className="flex justify-end items-center space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsTambahModalOpen(false)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-xs flex items-center space-x-1 transition"
                  >
                    <Ban className="w-3.5 h-3.5 mr-1" />
                    <span>BATAL</span>
                  </button>

                  <button
                    type="submit"
                    className="btn-simpan-area"
                  >
                    <Save className="w-3.5 h-3.5 mr-1" />
                    <span>SIMPAN DATA AREA</span>
                  </button>
                </div>

                {/* HELP NOTE */}
                <p className="text-[11px] text-slate-500 mt-2 flex items-center space-x-1">
                  <Info className="w-3.5 h-3.5 text-slate-400 mr-1" />
                  <span>Hubungi admin jika mengalami kesulitan menambahkan data area/site.</span>
                </p>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: KONFIRMASI HAPUS AREA (EXACT #modalHapusArea)
          ======================================================== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border-0 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header Red: bg-danger text-white */}
            <div className="bg-[#dc3545] text-white px-5 py-3.5 flex items-center justify-between">
              <h5 className="font-bold text-sm tracking-wide flex items-center space-x-2 text-white">
                <Trash2 className="w-4 h-4 text-white" />
                <span>Konfirmasi Hapus Area / Site</span>
              </h5>
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget(null);
                  setAdminPassword('');
                  setDeleteError(null);
                }}
                className="text-white hover:text-white/80 font-bold text-lg leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleConfirmDelete}>
              <div className="p-5 space-y-4">
                {/* Danger Alert Box */}
                <div className="bg-[#f8d7da] border border-[#f5c6cb] text-[#721c24] p-4 rounded-xl space-y-3">
                  <h6 className="font-bold text-xs flex items-center space-x-1.5 uppercase">
                    <AlertTriangle className="w-4 h-4 text-[#dc3545]" />
                    <span>PERINGATAN PENGHAPUSAN DATA</span>
                  </h6>

                  <p className="text-xs text-slate-800">Anda akan menghapus area/site:</p>

                  {/* Prominent White Box with Red Uppercase Name */}
                  <div className="p-2.5 bg-white rounded-lg border border-[#f5c6cb] text-center shadow-xs">
                    <strong className="text-[#dc3545] text-sm uppercase font-extrabold tracking-wide">
                      {deleteTarget.name}
                    </strong>
                  </div>

                  {/* Breakdown Impact Metrics Box */}
                  <div className="bg-white border border-[#f5c6cb] rounded-lg p-3 text-xs space-y-1.5 shadow-xs">
                    <div className="flex justify-between items-center text-slate-700">
                      <span>Total Personil</span>
                      <strong className="font-bold text-slate-900">
                        {personnelCount[deleteTarget.id] ?? 5} Petugas
                      </strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-700">
                      <span>Total Checkpoint / Aset</span>
                      <strong className="font-bold text-slate-900">
                        {checkpointsCount[deleteTarget.id] ?? 12} Titik
                      </strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-700">
                      <span>Total Data Patroli</span>
                      <strong className="font-bold text-slate-900">150 Laporan</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-700">
                      <span>Total Data Absensi</span>
                      <strong className="font-bold text-slate-900">320 Record</strong>
                    </div>
                  </div>

                  <hr className="border-[#f5c6cb]" />

                  <small className="block text-slate-700 text-[11px] leading-relaxed">
                    Seluruh data terkait area/site ini akan ikut dihapus secara permanen dan tidak dapat
                    dikembalikan.
                  </small>
                </div>

                {/* Verifikasi Password Admin */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Verifikasi Password Admin
                  </label>
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      setDeleteError(null);
                    }}
                    placeholder="Masukkan password Anda"
                    className="w-full border-2 border-[#dc3545] rounded-lg px-3 py-2 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#dc3545]/30"
                    autoFocus
                  />
                  {deleteError && (
                    <p className="text-[11px] text-[#dc3545] font-semibold">{deleteError}</p>
                  )}
                </div>
              </div>

              {/* Modal Footer: Batal & Ya, Hapus Permanen */}
              <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-end items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteTarget(null);
                    setAdminPassword('');
                    setDeleteError(null);
                  }}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-xs transition"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-[#dc3545] hover:bg-[#c82333] text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-sm transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Ya, Hapus Permanen</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
