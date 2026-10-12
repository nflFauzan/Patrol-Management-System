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
  Plus,
  QrCode,
  KeyRound
} from 'lucide-react';
import { useData, CheckpointItem } from '../lib/DataContext';

export const CheckpointManagementView: React.FC = () => {
  const {
    sites,
    checkpoints,
    addCheckpoint,
    deleteCheckpoint,
    setBulkImportType,
    setPrintQrTarget,
  } = useData();

  // Filters & Pagination
  const [filterLokasi, setFilterLokasi] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // Print Barcode selection state (header right)
  const [printSelectedArea, setPrintSelectedArea] = useState('');
  const [printSelectedCategory, setPrintSelectedCategory] = useState('');

  // Modals state
  const [isTambahModalOpen, setIsTambahModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CheckpointItem | null>(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form Tambah Checkpoint state
  const [formSiteName, setFormSiteName] = useState(sites[0]?.name || 'Site Proyek Demo');
  const [formCategory, setFormCategory] = useState<'Security' | 'Cleaning Service' | 'Driver'>('Security');
  const [formName, setFormName] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formTask, setFormTask] = useState('');

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
    if (!formName.trim() || !formLocation.trim()) {
      alert('Nama Aset dan Lokasi Aset wajib diisi!');
      return;
    }

    const newCp: CheckpointItem = {
      id: `cp-${Date.now()}`,
      qrCodeToken: `QR-${formSiteName.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      name: formName.trim(),
      locationDetail: formLocation.trim(),
      category: formCategory,
      taskDescription: formTask.trim() || 'Pemeriksaan rutin sesuai SOP fasilitas',
      siteName: formSiteName,
    };

    addCheckpoint(newCp);
    setIsTambahModalOpen(false);
    setFormName('');
    setFormLocation('');
    setFormTask('');
    setToastMessage(`Checkpoint "${newCp.name}" berhasil ditambahkan.`);
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
          HEADER CARD: 100% PARITY DENGAN SCREENSHOT REFERENSI
          ======================================================== */}
      <div className="bg-[#007bff] text-white p-4 rounded-t-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
        {/* KIRI: TOMBOL CHECKPOINT & IMPORT */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setIsTambahModalOpen(true)}
            className="px-3 py-2 bg-[#212529] hover:bg-[#1a1e21] text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-sm transition active:scale-95"
          >
            <Building2 className="w-4 h-4 text-white" />
            <span className="tracking-wide uppercase">TAMBAH CHECKPOINT</span>
          </button>

          <button
            type="button"
            onClick={() => setBulkImportType('CHECKPOINT')}
            className="px-3 py-2 bg-[#ffc107] hover:bg-[#e0a800] text-slate-900 font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-sm transition active:scale-95"
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
              onChange={(e) => setPrintSelectedArea(e.target.value)}
              className="bg-white text-slate-800 text-xs rounded-lg px-3 py-2 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 w-48 font-medium"
            >
              <option value="" disabled>PILIH AREA / SITE</option>
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
              onClick={() => {
                const targetCp = checkpoints.find((c) => !printSelectedArea || c.siteName === printSelectedArea) || checkpoints[0];
                setPrintQrTarget(targetCp);
              }}
              className="px-3 py-2 bg-[#28a745] hover:bg-[#218838] text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-sm transition active:scale-95"
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
          TABLE WRAPPER: EXACT STYLING FROM SCREENSHOT
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
                {/* FILTER SEMUA LOKASI */}
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

                {/* FILTER SEMUA KATEGORI */}
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
                        {/* Hapus Button (Red) */}
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteTarget(cp);
                            setAdminPassword('');
                            setDeleteError(null);
                          }}
                          className="px-2 py-1.5 bg-[#dc3545] hover:bg-[#c82333] text-white rounded-l text-xs font-bold transition"
                          title="Hapus Checkpoint"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Button (Cyan) */}
                        <button
                          type="button"
                          onClick={() => alert(`Edit Checkpoint: ${cp.name}`)}
                          className="px-2 py-1.5 bg-[#17a2b8] hover:bg-[#138496] text-white text-xs font-bold transition border-l border-white/20"
                          title="Edit Checkpoint"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* Cetak QR Barcode (Blue) */}
                        <button
                          type="button"
                          onClick={() => setPrintQrTarget(cp)}
                          className="px-2 py-1.5 bg-[#007bff] hover:bg-[#0069d9] text-white rounded-r text-xs font-bold transition border-l border-white/20"
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
              className="px-3 py-1 border border-slate-300 rounded text-slate-700 disabled:opacity-40 hover:bg-slate-50 text-xs"
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
              className="px-3 py-1 border border-slate-300 rounded text-slate-700 disabled:opacity-40 hover:bg-slate-50 text-xs"
            >
              NEXT
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          MODAL TAMBAH CHECKPOINT
          ======================================================== */}
      {isTambahModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#007bff] text-white px-5 py-4 flex items-center justify-between">
              <h5 className="font-bold text-sm tracking-wide flex items-center space-x-2 text-white">
                <Building2 className="w-4 h-4 text-white" />
                <span>Form Tambah Checkpoint / Aset</span>
              </h5>
              <button
                type="button"
                onClick={() => setIsTambahModalOpen(false)}
                className="text-white hover:text-white/80 font-bold text-xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveTambah} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Area / Site Fasilitas
                </label>
                <select
                  value={formSiteName}
                  onChange={(e) => setFormSiteName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kategori Divisi
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Security">Security (Patroli Rute Satpam)</option>
                  <option value="Cleaning Service">Cleaning Service (Checklist Kebersihan)</option>
                  <option value="Driver">Driver (Logistik Kendaraan)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Aset / Pos Checkpoint
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Toilet Lobby, Pos Gerbang Barat, Ruang Server"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Detail Lokasi Penempelan Stiker QR
                </label>
                <input
                  type="text"
                  required
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="Contoh: Lantai 1 Sayap Kanan Dinding Pintu Masuk"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Instruksi / Deskripsi Tugas Petugas Saat Scan
                </label>
                <textarea
                  rows={3}
                  value={formTask}
                  onChange={(e) => setFormTask(e.target.value)}
                  placeholder="Contoh: Bersihkan kloset, wastafel, cek suhu AC, dan pastikan pintu terkunci."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end items-center space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsTambahModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#007bff] hover:bg-[#0069d9] text-white font-bold rounded-lg text-xs shadow-sm"
                >
                  Simpan Checkpoint
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
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border-0 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
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
                className="text-white hover:text-white/80 font-bold text-lg leading-none"
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
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#dc3545] hover:bg-[#c82333] text-white font-bold rounded-lg text-xs"
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
