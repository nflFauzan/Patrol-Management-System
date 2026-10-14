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
  Layers
} from 'lucide-react';
import { useData, CheckpointItem } from '../lib/DataContext';

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

  // Header Batch Print selection state (matching patroli.site updateKategoriCetak & updatePrintLink)
  const [printSelectedArea, setPrintSelectedArea] = useState('');
  const [printSelectedCategory, setPrintSelectedCategory] = useState('');

  // Modals state
  const [isTambahModalOpen, setIsTambahModalOpen] = useState(false);
  const [editingCheckpoint, setEditingCheckpoint] = useState<CheckpointItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CheckpointItem | null>(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ==========================================================
  // Form Tambah Checkpoint state (matching insert-aset.php & updateCheckpointForm)
  // ==========================================================
  const [tambahKategori, setTambahKategori] = useState<'Security' | 'Cleaning Service' | ''>('');
  const [tambahNamaAset, setTambahNamaAset] = useState('');
  const [tambahDeskripsiAset, setTambahDeskripsiAset] = useState('');
  const [tambahLokasi, setTambahLokasi] = useState('');
  const [tambahJenisAset, setTambahJenisAset] = useState('');
  const [tambahLokasiArea, setTambahLokasiArea] = useState('');

  // Dynamic placeholders based on category selection (100% exact parity with patroli.site JS)
  const dynamicPlaceholders = useMemo(() => {
    if (tambahKategori === 'Security') {
      return {
        nama: 'Nama Checkpoint: Pos Security / Pos Gerbang / Lobby',
        deskripsi: 'Deskripsi Tugas: Patroli / Pemeriksaan Tamu / Pemeriksaan Area',
        lokasi: 'Lokasi: Gerbang Utama / Lobby / Area Parkir',
        jenis: 'Jenis Checkpoint: Keamanan / Patroli / Pemeriksaan',
        disabled: false,
      };
    } else if (tambahKategori === 'Cleaning Service') {
      return {
        nama: 'Nama Checkpoint: Toilet / Lobby / Ruang Meeting',
        deskripsi: 'Deskripsi Tugas: Membersihkan / Memeriksa Kebersihan / Mengisi Perlengkapan',
        lokasi: 'Lokasi: Toilet Lantai 1 / Lobby / Ruang Meeting',
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

  // ==========================================================
  // Form Edit Checkpoint state (matching aset_edit.php & aset_update.php)
  // ==========================================================
  const [editKategori, setEditKategori] = useState<'Security' | 'Cleaning Service' | 'Driver'>('Security');
  const [editNamaAset, setEditNamaAset] = useState('');
  const [editDeskripsiAset, setEditDeskripsiAset] = useState('');
  const [editLokasi, setEditLokasi] = useState('');
  const [editJenisAset, setEditJenisAset] = useState('');
  const [editLokasiArea, setEditLokasiArea] = useState('');

  // Open Edit Modal & preload existing data
  const handleOpenEdit = (cp: CheckpointItem) => {
    setEditingCheckpoint(cp);
    setEditKategori(cp.category);
    setEditNamaAset(cp.name);
    setEditDeskripsiAset(cp.taskDescription);
    setEditLokasi(cp.locationDetail);
    setEditJenisAset(cp.assetType || (cp.category === 'Security' ? 'Keamanan' : 'Kebersihan'));
    setEditLokasiArea(cp.siteName);
  };

  // Filtered checkpoints
  const filteredCheckpoints = useMemo(() => {
    return checkpoints.filter((cp) => {
      const matchLokasi = filterLokasi ? cp.siteName.toLowerCase() === filterLokasi.toLowerCase() : true;
      const matchKategori = filterKategori ? cp.category.toLowerCase() === filterKategori.toLowerCase() : true;
      const q = searchTerm.toLowerCase();
      const matchSearch =
        cp.name.toLowerCase().includes(q) ||
        cp.locationDetail.toLowerCase().includes(q) ||
        cp.taskDescription.toLowerCase().includes(q) ||
        cp.siteName.toLowerCase().includes(q);
      return matchLokasi && matchKategori && matchSearch;
    });
  }, [checkpoints, filterLokasi, filterKategori, searchTerm]);

  // Pagination
  const totalEntries = filteredCheckpoints.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCheckpoints.slice(start, start + pageSize);
  }, [filteredCheckpoints, currentPage, pageSize]);

  // Submit Tambah Checkpoint
  const handleSaveTambah = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tambahKategori) {
      alert('Silakan pilih Kategori Checkpoint terlebih dahulu!');
      return;
    }
    if (!tambahNamaAset.trim() || !tambahLokasi.trim()) {
      alert('Nama Checkpoint dan Lokasi wajib diisi!');
      return;
    }

    const selectedSite = sites.find((s) => s.name === tambahLokasiArea) || sites[0];
    const newCp: CheckpointItem = {
      id: `cp-${Date.now()}`,
      qrCodeToken: `${Date.now().toString().slice(-4)}`,
      name: tambahNamaAset.trim(),
      locationDetail: tambahLokasi.trim(),
      category: tambahKategori,
      assetType: tambahJenisAset.trim() || (tambahKategori === 'Security' ? 'Keamanan' : 'Kebersihan'),
      taskDescription: tambahDeskripsiAset.trim() || 'Pemeriksaan rutin sesuai SOP',
      siteName: selectedSite?.name || 'Site Proyek Demo',
      siteId: selectedSite?.id,
    };

    addCheckpoint(newCp);
    setIsTambahModalOpen(false);
    // Reset form
    setTambahKategori('');
    setTambahNamaAset('');
    setTambahDeskripsiAset('');
    setTambahLokasi('');
    setTambahJenisAset('');
    setTambahLokasiArea('');
    setToastMessage(`Checkpoint "${newCp.name}" berhasil ditambahkan.`);
  };

  // Submit Update Checkpoint
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCheckpoint) return;
    if (!editNamaAset.trim() || !editLokasi.trim()) {
      alert('Nama Checkpoint dan Lokasi wajib diisi!');
      return;
    }

    const updated: CheckpointItem = {
      ...editingCheckpoint,
      category: editKategori,
      name: editNamaAset.trim(),
      taskDescription: editDeskripsiAset.trim(),
      locationDetail: editLokasi.trim(),
      assetType: editJenisAset.trim(),
      siteName: editLokasiArea || editingCheckpoint.siteName,
    };

    updateCheckpoint(updated);
    setEditingCheckpoint(null);
    setToastMessage(`Checkpoint "${updated.name}" berhasil diperbarui.`);
  };

  // Confirm Delete Checkpoint
  const handleConfirmDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword.trim()) {
      setDeleteError('Verifikasi Password Admin wajib diisi!');
      return;
    }
    if (!deleteTarget) return;

    deleteCheckpoint(deleteTarget.id);
    setToastMessage(`Checkpoint "${deleteTarget.name}" berhasil dihapus.`);
    setDeleteTarget(null);
    setAdminPassword('');
    setDeleteError(null);
  };

  // Trigger Batch Print Modal matching cetak_qrcode.php
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
    <div className="w-full space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-xl text-xs flex justify-between items-center shadow-sm animate-in fade-in">
          <span className="font-semibold flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================
          HEADER CARD: 100% EXACT PARITY DENGAN patroli.site
          ======================================================== */}
      <div className="bg-[#007bff] text-white p-4 rounded-t-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
        {/* KIRI: TOMBOL CHECKPOINT & IMPORT */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setTambahKategori('');
              setTambahNamaAset('');
              setTambahDeskripsiAset('');
              setTambahLokasi('');
              setTambahJenisAset('');
              setTambahLokasiArea(sites[0]?.name || '');
              setIsTambahModalOpen(true);
            }}
            className="px-3 py-2 bg-[#212529] hover:bg-[#1a1e21] text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-white" />
            <span className="tracking-wide uppercase">TAMBAH CHECKPOINT</span>
          </button>

          <button
            type="button"
            onClick={() => setBulkImportType('CHECKPOINT')}
            className="px-3 py-2 bg-[#ffc107] hover:bg-[#e0a800] text-slate-900 font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-slate-900" />
            <span className="tracking-wide uppercase">IMPORT CHECKPOINT</span>
          </button>
        </div>

        {/* KANAN: CETAK BARCODE CHECKPOINT & WARNING CHIP */}
        <div className="flex flex-col items-center lg:items-end text-center space-y-2">
          <div className="flex items-center flex-wrap justify-center gap-2">
            <select
              value={printSelectedArea}
              onChange={(e) => {
                setPrintSelectedArea(e.target.value);
                setPrintSelectedCategory('');
              }}
              className="bg-white text-slate-800 text-xs rounded-lg px-3 py-2 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 w-48 font-medium"
            >
              <option value="">PILIH AREA / SITE</option>
              {sites.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>

            <select
              value={printSelectedCategory}
              onChange={(e) => setPrintSelectedCategory(e.target.value)}
              disabled={!printSelectedArea}
              className="bg-white text-slate-800 text-xs rounded-lg px-3 py-2 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 w-44 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">{printSelectedArea ? 'SEMUA KATEGORI' : 'Pilih Area dahulu'}</option>
              <option value="Security">Security</option>
              <option value="Cleaning Service">Cleaning Service</option>
            </select>

            <button
              type="button"
              onClick={handleTriggerBatchPrint}
              disabled={!printSelectedArea}
              className="px-3 py-2 bg-[#28a745] hover:bg-[#218838] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span className="tracking-wide uppercase">CETAK CHECKPOINT</span>
            </button>
          </div>

          <div className="bg-[#dc3545] text-white px-3 py-1 rounded-full text-[11px] font-bold shadow-xs flex items-center space-x-1">
            <AlertTriangle className="w-3.5 h-3.5 text-yellow-300 mr-1" />
            <span>⚠ QR CODE DICETAK DAN DITEMPEL DI LOKASI ASET / CHECKPOINT..!</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          TABLE WRAPPER: EXACT STYLING & PARITY FROM patroli.site
          ======================================================== */}
      <div className="bg-white border border-[#007bff]/40 rounded-b-xl shadow-xs p-4 space-y-4 -mt-4">
        {/* TOP CONTROLS: SHOW ENTRIES & SEARCH */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 font-semibold uppercase">
          <div className="flex items-center space-x-2">
            <span>SHOW</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-slate-300 rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>ENTRIES</span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span>SEARCH:</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder=""
              className="border border-slate-300 rounded px-2.5 py-1 text-xs w-full sm:w-56 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* TABEL DATA CHECKPOINT */}
        <div className="overflow-x-auto rounded-lg border border-[#007bff]/30">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#007bff] text-white text-center font-bold">
                {/* FILTER SEMUA LOKASI (RED BORDER SELECT) */}
                <th className="py-2 px-3 border-r border-[#007bff]/50 w-56">
                  <select
                    value={filterLokasi}
                    onChange={(e) => {
                      setFilterLokasi(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-white text-slate-800 text-xs rounded px-2 py-1 border-2 border-[#dc3545] font-bold uppercase focus:outline-none"
                  >
                    <option value="">SEMUA LOKASI</option>
                    {sites.map((s) => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </th>

                {/* FILTER SEMUA KATEGORI (BLUE BORDER SELECT) */}
                <th className="py-2 px-3 border-r border-[#007bff]/50 w-44">
                  <select
                    value={filterKategori}
                    onChange={(e) => {
                      setFilterKategori(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-white text-slate-800 text-xs rounded px-2 py-1 border-2 border-[#007bff] font-bold uppercase focus:outline-none"
                  >
                    <option value="">SEMUA KATEGORI</option>
                    <option value="Cleaning Service">Cleaning Service</option>
                    <option value="Security">Security</option>
                  </select>
                </th>

                <th className="py-2 px-3 border-r border-[#007bff]/50 uppercase tracking-wider">
                  NAMA ASET
                </th>
                <th className="py-2 px-3 border-r border-[#007bff]/50 uppercase tracking-wider">
                  LOKASI ASET
                </th>
                <th className="py-2 px-3 border-r border-[#007bff]/50 uppercase tracking-wider">
                  DESKRIPSI TUGAS
                </th>
                <th className="py-2 px-3 uppercase tracking-wider w-36">
                  AKSI
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                    Tidak ada data checkpoint aset yang sesuai.
                  </td>
                </tr>
              ) : (
                paginatedList.map((cp, idx) => (
                  <tr
                    key={cp.id}
                    className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50/80' : 'bg-slate-50/50 hover:bg-slate-100/80'}
                  >
                    <td className="py-3 px-3 text-center">
                      <small className="font-bold text-[#28a745] uppercase tracking-wide">
                        {cp.siteName}
                      </small>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          cp.category === 'Cleaning Service'
                            ? 'bg-[#ffc107] text-slate-900'
                            : 'bg-[#dc3545] text-white'
                        }`}
                      >
                        {cp.category}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center font-bold text-slate-800">
                      {cp.name}
                    </td>

                    <td className="py-3 px-3 text-center text-[#007bff] font-medium">
                      {cp.locationDetail}
                    </td>

                    <td className="py-3 px-3 text-center text-slate-500">
                      {cp.taskDescription}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center rounded-md shadow-xs" role="group">
                        {/* Hapus Button (Red #dc3545) */}
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteTarget(cp);
                            setAdminPassword('');
                            setDeleteError(null);
                          }}
                          className="px-2 py-1.5 bg-[#dc3545] hover:bg-[#c82333] text-white rounded-l text-xs font-bold transition cursor-pointer"
                          title="Hapus Checkpoint"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Button (Cyan #17a2b8) */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(cp)}
                          className="px-2 py-1.5 bg-[#17a2b8] hover:bg-[#138496] text-white text-xs font-bold transition border-l border-white/20 cursor-pointer"
                          title="Edit Checkpoint"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* Cetak QR Barcode (Blue #007bff) */}
                        <button
                          type="button"
                          onClick={() => setPrintQrTarget(cp)}
                          className="px-2 py-1.5 bg-[#007bff] hover:bg-[#0069d9] text-white rounded-r text-xs font-bold transition border-l border-white/20 cursor-pointer"
                          title="Cetak Barcode QR Checkpoint"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* BOTTOM CONTROLS: SHOWING ENTRIES & PAGINATION */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 pt-2 font-semibold uppercase">
          <div>
            SHOWING {totalEntries === 0 ? 0 : (currentPage - 1) * pageSize + 1} TO{' '}
            {Math.min(currentPage * pageSize, totalEntries)} OF {totalEntries} ENTRIES
          </div>

          <div className="flex items-center space-x-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 border border-slate-300 rounded text-slate-700 disabled:opacity-40 hover:bg-slate-50 text-xs cursor-pointer"
            >
              PREVIOUS
            </button>
            <span className="px-3 py-1 bg-[#007bff] text-white rounded text-xs font-bold">
              {currentPage}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 border border-slate-300 rounded text-slate-700 disabled:opacity-40 hover:bg-slate-50 text-xs cursor-pointer"
            >
              NEXT
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          MODAL TAMBAH CHECKPOINT (100% PARITY #exampleModalCenter)
          ======================================================== */}
      {isTambahModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header: Green bg-success text-light */}
            <div className="bg-[#28a745] text-white px-5 py-3.5 flex items-center justify-between">
              <h5 className="font-bold text-sm tracking-wide flex items-center space-x-2 text-white">
                <Building2 className="w-4 h-4 text-white" />
                <span>Tambah Checkpoint</span>
              </h5>
              <button
                type="button"
                onClick={() => setIsTambahModalOpen(false)}
                className="text-white hover:text-white/80 font-bold text-xl leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveTambah} className="p-5 space-y-3.5 text-xs">
              {/* Kategori Checkpoint */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kategori Checkpoint <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={tambahKategori}
                  onChange={(e) => setTambahKategori(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
                >
                  <option value="">Pilih Kategori</option>
                  <option value="Security">Security</option>
                  <option value="Cleaning Service">Cleaning Service</option>
                </select>
              </div>

              {/* Nama Checkpoint */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Checkpoint <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  disabled={dynamicPlaceholders.disabled}
                  value={tambahNamaAset}
                  onChange={(e) => setTambahNamaAset(e.target.value)}
                  placeholder={dynamicPlaceholders.nama}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800 disabled:bg-slate-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Deskripsi Tugas */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Deskripsi Tugas <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  disabled={dynamicPlaceholders.disabled}
                  value={tambahDeskripsiAset}
                  onChange={(e) => setTambahDeskripsiAset(e.target.value)}
                  placeholder={dynamicPlaceholders.deskripsi}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800 disabled:bg-slate-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Lokasi */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Lokasi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  disabled={dynamicPlaceholders.disabled}
                  value={tambahLokasi}
                  onChange={(e) => setTambahLokasi(e.target.value)}
                  placeholder={dynamicPlaceholders.lokasi}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800 disabled:bg-slate-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Jenis Aset */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Jenis Aset <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  disabled={dynamicPlaceholders.disabled}
                  value={tambahJenisAset}
                  onChange={(e) => setTambahJenisAset(e.target.value)}
                  placeholder={dynamicPlaceholders.jenis}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800 disabled:bg-slate-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Pilih Lokasi Area */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Pilih Lokasi Area <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  disabled={dynamicPlaceholders.disabled}
                  value={tambahLokasiArea}
                  onChange={(e) => setTambahLokasiArea(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-xs bg-white text-slate-800 disabled:bg-slate-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
                >
                  <option value="">Pilih Area Terlebih Dahulu</option>
                  {sites.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end items-center space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsTambahModalOpen(false)}
                  className="px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white font-bold rounded-md text-xs cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={dynamicPlaceholders.disabled}
                  className="px-4 py-2 bg-[#28a745] hover:bg-[#218838] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-md text-xs shadow-sm cursor-pointer"
                >
                  Simpan Checkpoint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL EDIT CHECKPOINT (100% PARITY aset_edit.php)
          ======================================================== */}
      {editingCheckpoint && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header: Cyan bg-[#17a2b8] text-white */}
            <div className="bg-[#17a2b8] text-white px-5 py-3.5 flex items-center justify-between">
              <h5 className="font-bold text-sm tracking-wide flex items-center space-x-2 text-white">
                <Pencil className="w-4 h-4 text-white" />
                <span>Edit Checkpoint</span>
              </h5>
              <button
                type="button"
                onClick={() => setEditingCheckpoint(null)}
                className="text-white hover:text-white/80 font-bold text-xl leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kategori Checkpoint <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={editKategori}
                  onChange={(e) => setEditKategori(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                >
                  <option value="Security">Security</option>
                  <option value="Cleaning Service">Cleaning Service</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Checkpoint <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={editNamaAset}
                  onChange={(e) => setEditNamaAset(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Deskripsi Tugas <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={editDeskripsiAset}
                  onChange={(e) => setEditDeskripsiAset(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Lokasi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={editLokasi}
                  onChange={(e) => setEditLokasi(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Jenis Aset <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={editJenisAset}
                  onChange={(e) => setEditJenisAset(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Pilih Lokasi Area <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={editLokasiArea}
                  onChange={(e) => setEditLokasiArea(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end items-center space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingCheckpoint(null)}
                  className="px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white font-bold rounded-md text-xs cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#17a2b8] hover:bg-[#138496] text-white font-bold rounded-md text-xs shadow-sm cursor-pointer"
                >
                  Update Checkpoint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL HAPUS CHECKPOINT (DENGAN PASSWORD ADMIN)
          ======================================================== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl border-0 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#dc3545] text-white px-5 py-3.5 flex items-center justify-between">
              <h5 className="font-bold text-sm tracking-wide flex items-center space-x-2 text-white">
                <Trash2 className="w-4 h-4 text-white" />
                <span>Konfirmasi Hapus Checkpoint</span>
              </h5>
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget(null);
                  setAdminPassword('');
                  setDeleteError(null);
                }}
                className="text-white hover:text-white/80 font-bold text-lg leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleConfirmDelete} className="p-5 space-y-4">
              <div className="bg-[#f8d7da] border border-[#f5c6cb] text-[#721c24] p-4 rounded-xl space-y-2 text-xs">
                <p className="font-bold">Apakah Anda yakin akan menghapus titik checkpoint ini?</p>
                <div className="p-2 bg-white rounded border border-[#f5c6cb] text-center font-bold text-[#dc3545] uppercase">
                  {deleteTarget.name} ({deleteTarget.locationDetail})
                </div>
                <small className="block text-slate-600">
                  Data scan barcode dan log temuan terkait tidak dapat dipulihkan.
                </small>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 flex items-center space-x-1">
                  <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                  <span>Verifikasi Password Admin</span>
                </label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => {
                    setAdminPassword(e.target.value);
                    setDeleteError(null);
                  }}
                  placeholder="Masukkan password admin Anda"
                  className="w-full border-2 border-[#dc3545] rounded-lg px-3 py-2 text-xs text-slate-800 bg-white focus:outline-none"
                  autoFocus
                />
                {deleteError && (
                  <p className="text-[11px] text-[#dc3545] font-semibold">{deleteError}</p>
                )}
              </div>

              <div className="flex justify-end items-center space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteTarget(null);
                    setAdminPassword('');
                    setDeleteError(null);
                  }}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#dc3545] hover:bg-[#c82333] text-white font-bold rounded-lg text-xs cursor-pointer"
                >
                  Ya, Hapus Permanen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
