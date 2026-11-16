'use client';

import React, { useState, useMemo } from 'react';
import {
  Building2,
  Upload,
  Printer,
  Trash2,
  Pencil,
  AlertTriangle,
  Check,
  X,
  Search,
  KeyRound,
  Shield,
  Layers,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
} from 'lucide-react';
import { useData, CheckpointItem } from '../lib/DataContext';
import { SurfaceCard } from './ui/SurfaceCard';
import { SkeuomorphicButton } from './ui/SkeuomorphicButton';
import { InsetInput } from './ui/InsetInput';
import { StatusBadge } from './ui/StatusBadge';

export const CheckpointManagementView: React.FC = () => {
  const {
    sites,
    checkpoints,
    addCheckpoint,
    updateCheckpoint,
    deleteCheckpoint,
    setBulkImportType,
    setPrintQrTarget,
    setBatchPrintConfig,
  } = useData();

  // Filters & Pagination
  const [filterLokasi, setFilterLokasi] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // Header Batch Print selection state
  const [printSelectedArea, setPrintSelectedArea] = useState('');
  const [printSelectedCategory, setPrintSelectedCategory] = useState('');

  // Modals state
  const [isTambahModalOpen, setIsTambahModalOpen] = useState(false);
  const [editingCheckpoint, setEditingCheckpoint] = useState<CheckpointItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CheckpointItem | null>(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form Tambah Checkpoint state
  const [tambahKategori, setTambahKategori] = useState<'Security' | 'Cleaning Service' | ''>('');
  const [tambahNamaAset, setTambahNamaAset] = useState('');
  const [tambahDeskripsiAset, setTambahDeskripsiAset] = useState('');
  const [tambahLokasi, setTambahLokasi] = useState('');
  const [tambahJenisAset, setTambahJenisAset] = useState('');
  const [tambahLokasiArea, setTambahLokasiArea] = useState('');

  // Dynamic placeholders based on category selection
  const dynamicPlaceholders = useMemo(() => {
    if (tambahKategori === 'Security') {
      return {
        nama: 'Nama Checkpoint: Pos Security / Pos Gerbang / Lobby',
        deskripsi: 'Deskripsi Tugas: Patroli / Pemeriksaan Tamu',
        lokasi: 'Lokasi: Gerbang Utama / Lobby / Area Parkir',
        jenis: 'Jenis Checkpoint: Keamanan / Patroli / Pemeriksaan',
        disabled: false,
      };
    } else if (tambahKategori === 'Cleaning Service') {
      return {
        nama: 'Nama Checkpoint: Toilet / Lobby / Ruang Meeting',
        deskripsi: 'Deskripsi Tugas: Membersihkan / Mengisi Perlengkapan',
        lokasi: 'Lokasi: Toilet Lantai 1 / Lobby Utama',
        jenis: 'Jenis Checkpoint: Kebersihan / Toilet / Area Umum',
        disabled: false,
      };
    }
    return {
      nama: 'Pilih Kategori Terlebih Dahulu',
      deskripsi: 'Pilih Kategori Terlebih Dahulu',
      lokasi: 'Pilih Kategori Terlebih Dahulu',
      jenis: 'Pilih Kategori Terlebih Dahulu',
      disabled: true,
    };
  }, [tambahKategori]);

  // Form Edit Checkpoint state
  const [editKategori, setEditKategori] = useState<'Security' | 'Cleaning Service' | 'Driver'>('Security');
  const [editNamaAset, setEditNamaAset] = useState('');
  const [editDeskripsiAset, setEditDeskripsiAset] = useState('');
  const [editLokasi, setEditLokasi] = useState('');
  const [editJenisAset, setEditJenisAset] = useState('');
  const [editLokasiArea, setEditLokasiArea] = useState('');

  const handleOpenEdit = (cp: CheckpointItem) => {
    setEditingCheckpoint(cp);
    setEditKategori(cp.category);
    setEditNamaAset(cp.name);
    setEditDeskripsiAset(cp.taskDescription);
    setEditLokasi(cp.locationDetail);
    setEditJenisAset(cp.assetType || '');
    setEditLokasiArea(cp.siteName);
  };

  // Filtered List
  const filteredList = useMemo(() => {
    return checkpoints.filter((cp) => {
      const matchLoc = filterLokasi ? cp.siteName.toLowerCase() === filterLokasi.toLowerCase() : true;
      const matchCat = filterKategori ? cp.category.toLowerCase() === filterKategori.toLowerCase() : true;
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        cp.name.toLowerCase().includes(q) ||
        cp.locationDetail.toLowerCase().includes(q) ||
        cp.taskDescription.toLowerCase().includes(q) ||
        cp.siteName.toLowerCase().includes(q);
      return matchLoc && matchCat && matchSearch;
    });
  }, [checkpoints, filterLokasi, filterKategori, searchTerm]);

  // Pagination calculation
  const totalEntries = filteredList.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, currentPage, pageSize]);

  // Save Tambah Checkpoint
  const handleSaveTambah = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tambahKategori || !tambahNamaAset || !tambahLokasi || !tambahLokasiArea) {
      alert('Mohon lengkapi seluruh field berbintang merah!');
      return;
    }

    const targetSite = sites.find((s) => s.name === tambahLokasiArea);
    const newCp: CheckpointItem = {
      id: `cp-${Date.now()}`,
      qrCodeToken: `QR-${Date.now().toString(36).toUpperCase()}`,
      name: tambahNamaAset.trim(),
      locationDetail: tambahLokasi.trim(),
      category: tambahKategori,
      assetType: tambahJenisAset.trim() || undefined,
      taskDescription: tambahDeskripsiAset.trim() || 'Pemeriksaan Rutin',
      siteName: tambahLokasiArea,
      siteId: targetSite?.id || undefined,
    };

    addCheckpoint(newCp);
    setIsTambahModalOpen(false);
    setToastMessage(`Checkpoint "${newCp.name}" berhasil ditambahkan.`);
  };

  // Save Edit Checkpoint
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCheckpoint) return;

    const targetSite = sites.find((s) => s.name === editLokasiArea);
    const updatedCp: CheckpointItem = {
      ...editingCheckpoint,
      category: editKategori,
      name: editNamaAset.trim(),
      locationDetail: editLokasi.trim(),
      assetType: editJenisAset.trim() || undefined,
      taskDescription: editDeskripsiAset.trim() || editingCheckpoint.taskDescription,
      siteName: editLokasiArea,
      siteId: targetSite?.id || editingCheckpoint.siteId,
    };

    updateCheckpoint(updatedCp);
    setEditingCheckpoint(null);
    setToastMessage(`Checkpoint "${updatedCp.name}" berhasil diperbarui.`);
  };

  // Confirm Delete
  const handleConfirmDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword.trim()) {
      setDeleteError('Password Admin wajib diisi!');
      return;
    }
    if (!deleteTarget) return;

    deleteCheckpoint(deleteTarget.id);
    setToastMessage(`Checkpoint "${deleteTarget.name}" berhasil dihapus.`);
    setDeleteTarget(null);
    setAdminPassword('');
    setDeleteError(null);
  };

  // Trigger Batch Print
  const handleTriggerBatchPrint = () => {
    if (!printSelectedArea) {
      alert('Silakan pilih Area / Site terlebih dahulu untuk cetak QR code batch!');
      return;
    }

    const matched = checkpoints.filter((cp) => {
      const matchSite = cp.siteName.toLowerCase() === printSelectedArea.toLowerCase();
      const matchCat = printSelectedCategory ? cp.category.toLowerCase() === printSelectedCategory.toLowerCase() : true;
      return matchSite && matchCat;
    });

    setBatchPrintConfig({
      siteName: printSelectedArea,
      category: printSelectedCategory || 'Semua Kategori',
      items: matched,
    });
  };

  return (
    <div className="w-full space-y-4 font-sans select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs flex justify-between items-center shadow-sm animate-in fade-in">
          <span className="font-semibold flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-700 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP CONTROLS & BATCH ACTIONS CARD */}
      <SurfaceCard variant="elevated" padding="md" className="space-y-4">
        {/* Row 1: Actions & Batch Barcode Generator */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Data Induk Checkpoint QR
            </h1>
            <div className="text-[11px] text-slate-500 flex items-center space-x-1.5 mt-0.5">
              <span className="font-semibold text-slate-700">Checkpoint</span>
              <span>Dashboard &gt; Data Induk &gt; Checkpoint</span>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <SkeuomorphicButton
              variant="primary"
              size="md"
              icon={Plus}
              onClick={() => {
                setTambahKategori('');
                setTambahNamaAset('');
                setTambahDeskripsiAset('');
                setTambahLokasi('');
                setTambahJenisAset('');
                setTambahLokasiArea(sites[0]?.name || '');
                setIsTambahModalOpen(true);
              }}
            >
              Tambah Checkpoint
            </SkeuomorphicButton>

            <SkeuomorphicButton
              variant="secondary"
              size="md"
              icon={Upload}
              onClick={() => setBulkImportType('CHECKPOINT')}
            >
              Import Checkpoint
            </SkeuomorphicButton>

            {/* Batch QR Print Selector */}
            <div className="flex items-center space-x-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
              <div className="relative">
                <select
                  value={printSelectedArea}
                  onChange={(e) => {
                    setPrintSelectedArea(e.target.value);
                    setPrintSelectedCategory('');
                  }}
                  className="appearance-none bg-white text-slate-800 text-xs font-semibold pl-2.5 pr-7 py-1.5 rounded-lg border border-slate-200 cursor-pointer focus:outline-none"
                >
                  <option value="">Pilih Area</option>
                  {sites.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
              </div>

              <SkeuomorphicButton
                variant="secondary"
                size="sm"
                icon={Printer}
                disabled={!printSelectedArea}
                onClick={handleTriggerBatchPrint}
              >
                Cetak Barcode
              </SkeuomorphicButton>
            </div>
          </div>
        </div>

        {/* Row 2: Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="relative">
            <select
              value={filterLokasi}
              onChange={(e) => {
                setFilterLokasi(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none w-full bg-slate-50 hover:bg-white text-slate-800 font-semibold rounded-xl px-3 pr-8 py-2 border border-slate-200 focus:outline-none"
            >
              <option value="">Semua Lokasi ({sites.length} Site)</option>
              {sites.map((s) => (
                <option key={s.id} value={s.name}>📍 {s.name}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
          </div>

          <div className="relative">
            <select
              value={filterKategori}
              onChange={(e) => {
                setFilterKategori(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none w-full bg-slate-50 hover:bg-white text-slate-800 font-semibold rounded-xl px-3 pr-8 py-2 border border-slate-200 focus:outline-none"
            >
              <option value="">Semua Kategori</option>
              <option value="Security">Satpam (Security)</option>
              <option value="Cleaning Service">Cleaning Service</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
          </div>

          <InsetInput
            type="search"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari nama aset / lokasi..."
            icon={Search}
          />
        </div>
      </SurfaceCard>

      {/* SKEUOMORPHIC TABLE */}
      <SurfaceCard variant="elevated" padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200 text-center">
                <th className="py-3 px-4 uppercase tracking-wider">Lokasi / Site</th>
                <th className="py-3 px-4 uppercase tracking-wider">Kategori</th>
                <th className="py-3 px-4 text-left uppercase tracking-wider">Nama Aset</th>
                <th className="py-3 px-4 text-left uppercase tracking-wider">Lokasi Aset</th>
                <th className="py-3 px-4 text-left uppercase tracking-wider">Deskripsi Tugas</th>
                <th className="py-3 px-4 text-center uppercase tracking-wider w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                    Tidak ada data checkpoint aset yang sesuai.
                  </td>
                </tr>
              ) : (
                paginatedList.map((cp) => (
                  <tr key={cp.id} className="hover:bg-slate-50/70 transition-colors duration-100">
                    <td className="py-3 px-4 text-center font-bold text-slate-800">
                      {cp.siteName}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${cp.category === 'Cleaning Service'
                          ? 'bg-teal-50 text-teal-700 border border-teal-200'
                          : 'bg-sky-50 text-sky-700 border border-sky-200'
                          }`}
                      >
                        {cp.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-900">
                      {cp.name}
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {cp.locationDetail}
                    </td>

                    <td className="py-3 px-4 text-slate-500">
                      {cp.taskDescription}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center space-x-1.5">
                        {/* Print QR */}
                        <button
                          type="button"
                          onClick={() => setPrintQrTarget(cp)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 shadow-2xs transition active:translate-y-0.5"
                          title="Cetak Barcode QR"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(cp)}
                          className="p-1.5 text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200 shadow-2xs transition active:translate-y-0.5"
                          title="Edit Checkpoint"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteTarget(cp);
                            setAdminPassword('');
                            setDeleteError(null);
                          }}
                          className="p-1.5 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 shadow-2xs transition active:translate-y-0.5"
                          title="Hapus Checkpoint"
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 p-4 border-t border-slate-100">
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
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition ${currentPage === pg
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

      {/* MODAL TAMBAH CHECKPOINT */}
      {isTambahModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <h5 className="font-bold text-sm flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-sky-400" />
                <span>Tambah Checkpoint QR</span>
              </h5>
              <button
                type="button"
                onClick={() => setIsTambahModalOpen(false)}
                className="text-white hover:text-white/80 font-bold text-lg"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveTambah} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kategori Checkpoint <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={tambahKategori}
                  onChange={(e) => setTambahKategori(e.target.value as any)}
                  className="w-full bg-[#F8FAFC] border border-slate-300/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">Pilih Kategori</option>
                  <option value="Security">Security</option>
                  <option value="Cleaning Service">Cleaning Service</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Checkpoint <span className="text-rose-500">*</span>
                </label>
                <InsetInput
                  type="text"
                  required
                  disabled={dynamicPlaceholders.disabled}
                  value={tambahNamaAset}
                  onChange={(e) => setTambahNamaAset(e.target.value)}
                  placeholder={dynamicPlaceholders.nama}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Deskripsi Tugas <span className="text-rose-500">*</span>
                </label>
                <InsetInput
                  type="text"
                  required
                  disabled={dynamicPlaceholders.disabled}
                  value={tambahDeskripsiAset}
                  onChange={(e) => setTambahDeskripsiAset(e.target.value)}
                  placeholder={dynamicPlaceholders.deskripsi}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Lokasi Pos <span className="text-rose-500">*</span>
                </label>
                <InsetInput
                  type="text"
                  required
                  disabled={dynamicPlaceholders.disabled}
                  value={tambahLokasi}
                  onChange={(e) => setTambahLokasi(e.target.value)}
                  placeholder={dynamicPlaceholders.lokasi}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Jenis Aset <span className="text-rose-500">*</span>
                </label>
                <InsetInput
                  type="text"
                  required
                  disabled={dynamicPlaceholders.disabled}
                  value={tambahJenisAset}
                  onChange={(e) => setTambahJenisAset(e.target.value)}
                  placeholder={dynamicPlaceholders.jenis}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Pilih Area / Site <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  disabled={dynamicPlaceholders.disabled}
                  value={tambahLokasiArea}
                  onChange={(e) => setTambahLokasiArea(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-300/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">Pilih Area Terlebih Dahulu</option>
                  {sites.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end items-center space-x-2 pt-3 border-t border-slate-100">
                <SkeuomorphicButton
                  variant="secondary"
                  size="md"
                  type="button"
                  onClick={() => setIsTambahModalOpen(false)}
                >
                  Batal
                </SkeuomorphicButton>
                <SkeuomorphicButton
                  variant="primary"
                  size="md"
                  type="submit"
                  disabled={dynamicPlaceholders.disabled}
                >
                  Simpan Checkpoint
                </SkeuomorphicButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT CHECKPOINT */}
      {editingCheckpoint && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <h5 className="font-bold text-sm flex items-center space-x-2">
                <Pencil className="w-4 h-4 text-sky-400" />
                <span>Edit Checkpoint QR</span>
              </h5>
              <button
                type="button"
                onClick={() => setEditingCheckpoint(null)}
                className="text-white hover:text-white/80 font-bold text-lg"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kategori Checkpoint <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={editKategori}
                  onChange={(e) => setEditKategori(e.target.value as any)}
                  className="w-full bg-[#F8FAFC] border border-slate-300/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="Security">Security</option>
                  <option value="Cleaning Service">Cleaning Service</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Checkpoint <span className="text-rose-500">*</span>
                </label>
                <InsetInput
                  type="text"
                  required
                  value={editNamaAset}
                  onChange={(e) => setEditNamaAset(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Deskripsi Tugas <span className="text-rose-500">*</span>
                </label>
                <InsetInput
                  type="text"
                  required
                  value={editDeskripsiAset}
                  onChange={(e) => setEditDeskripsiAset(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Lokasi Pos <span className="text-rose-500">*</span>
                </label>
                <InsetInput
                  type="text"
                  required
                  value={editLokasi}
                  onChange={(e) => setEditLokasi(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Jenis Aset <span className="text-rose-500">*</span>
                </label>
                <InsetInput
                  type="text"
                  required
                  value={editJenisAset}
                  onChange={(e) => setEditJenisAset(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Pilih Area / Site <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={editLokasiArea}
                  onChange={(e) => setEditLokasiArea(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-300/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end items-center space-x-2 pt-3 border-t border-slate-100">
                <SkeuomorphicButton
                  variant="secondary"
                  size="md"
                  type="button"
                  onClick={() => setEditingCheckpoint(null)}
                >
                  Batal
                </SkeuomorphicButton>
                <SkeuomorphicButton variant="primary" size="md" type="submit">
                  Perbarui Checkpoint
                </SkeuomorphicButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL HAPUS CHECKPOINT */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-rose-600 text-white px-5 py-3.5 flex items-center justify-between">
              <h5 className="font-bold text-sm flex items-center space-x-2">
                <Trash2 className="w-4 h-4" />
                <span>Konfirmasi Hapus Checkpoint</span>
              </h5>
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget(null);
                  setAdminPassword('');
                  setDeleteError(null);
                }}
                className="text-white hover:opacity-80 font-bold text-lg"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleConfirmDelete} className="p-5 space-y-4">
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs space-y-2">
                <p className="font-bold uppercase flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Peringatan Penghapusan</span>
                </p>
                <p>
                  Anda akan menghapus checkpoint <strong className="text-rose-900 font-extrabold">{deleteTarget.name} ({deleteTarget.locationDetail})</strong> secara permanen.
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
