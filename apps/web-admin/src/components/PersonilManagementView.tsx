'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  Upload,
  Printer,
  Trash2,
  Pencil,
  AlertTriangle,
  Check,
  X,
  Search,
  KeyRound,
  Building
} from 'lucide-react';
import { useData, UserItem } from '../lib/DataContext';

export const PersonilManagementView: React.FC = () => {
  const {
    sites,
    users,
    addUser,
    deleteUser,
    setBulkImportType,
    setPrintIdCardTarget,
  } = useData();

  // Filters & Pagination
  const [filterLokasi, setFilterLokasi] = useState('');
  const [filterPosisi, setFilterPosisi] = useState('semua');
  const [filterNama, setFilterNama] = useState('');
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // Print ID Card filter state (header right)
  const [printArea, setPrintArea] = useState('');
  const [printPosisi, setPrintPosisi] = useState('');
  const [printPersonilId, setPrintPersonilId] = useState('');

  // Modals state
  const [isTambahModalOpen, setIsTambahModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form Tambah Personil state
  const [formSiteName, setFormSiteName] = useState(sites[0]?.name || 'Site Proyek Demo');
  const [formDivision, setFormDivision] = useState<'SECURITY' | 'CLEANING' | 'DRIVER'>('SECURITY');
  const [formRank, setFormRank] = useState('Anggota');
  const [formNik, setFormNik] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formGajiPokok, setFormGajiPokok] = useState(5200000);
  const [formTunjangan, setFormTunjangan] = useState(800000);
  const [formLembur, setFormLembur] = useState(30000);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchLokasi = filterLokasi ? u.siteName.toLowerCase() === filterLokasi.toLowerCase() : true;
      const matchPosisi =
        filterPosisi === 'semua'
          ? true
          : filterPosisi === 'Security'
          ? u.division === 'SECURITY'
          : filterPosisi === 'Cleaning Service'
          ? u.division === 'CLEANING'
          : true;
      const matchNama = filterNama ? u.fullName.toLowerCase().includes(filterNama.toLowerCase()) : true;
      return matchLokasi && matchPosisi && matchNama;
    });
  }, [users, filterLokasi, filterPosisi, filterNama]);

  // Pagination
  const totalEntries = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Submit Tambah Personel
  const handleSaveTambah = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFullName.trim() || !formUsername.trim()) {
      alert('Nama Lengkap dan Username wajib diisi!');
      return;
    }

    const newUser: UserItem = {
      id: `u-${Date.now()}`,
      nik: formNik.trim() || `NIK-${Date.now().toString().slice(-6)}`,
      fullName: formFullName.trim(),
      username: formUsername.trim(),
      role: formDivision === 'SECURITY' ? 'SECURITY_OFFICER' : formDivision === 'CLEANING' ? 'CLEANING_STAFF' : 'DRIVER',
      division: formDivision,
      securityRank: formRank,
      siteName: formSiteName,
      photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      gajiPokok: formGajiPokok,
      tunjangan: formTunjangan,
      lemburPerJam: formLembur,
    };

    addUser(newUser);
    setIsTambahModalOpen(false);
    setFormFullName('');
    setFormUsername('');
    setFormNik('');
    setToastMessage(`Personel "${newUser.fullName}" berhasil ditambahkan.`);
  };

  // Confirm Delete Personel
  const handleConfirmDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword.trim()) {
      setDeleteError('Verifikasi Password Admin wajib diisi!');
      return;
    }
    if (!deleteTarget) return;

    deleteUser(deleteTarget.id);
    setToastMessage(`Data personel "${deleteTarget.fullName}" berhasil dihapus.`);
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
          HEADER CARD: 100% PARITY DENGAN PATROLI.SITE PERSONIL
          ======================================================== */}
      <div className="bg-[#007bff] text-white p-4 rounded-t-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
        {/* KIRI: TAMBAH & IMPORT */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setIsTambahModalOpen(true)}
            className="px-3 py-2 bg-[#212529] hover:bg-[#1a1e21] text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-sm transition active:scale-95"
          >
            <Users className="w-4 h-4 text-white" />
            <span className="tracking-wide uppercase">TAMBAH PERSONEL</span>
          </button>

          <button
            type="button"
            onClick={() => setBulkImportType('PERSONIL')}
            className="px-3 py-2 bg-[#ffc107] hover:bg-[#e0a800] text-slate-900 font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-sm transition active:scale-95"
          >
            <Upload className="w-4 h-4 text-slate-900" />
            <span className="tracking-wide uppercase">IMPORT PERSONEL</span>
          </button>
        </div>

        {/* KANAN: FILTER CETAK ID CARD */}
        <div className="flex items-center flex-wrap gap-2">
          <select
            value={printArea}
            onChange={(e) => setPrintArea(e.target.value)}
            className="bg-white text-slate-800 text-xs rounded-lg px-2.5 py-2 border border-slate-300 w-40 font-medium"
          >
            <option value="" disabled>-- PILIH AREA --</option>
            {sites.map((s) => (
              <option key={s.id} value={s.name}>{s.name.toUpperCase()}</option>
            ))}
          </select>

          <select
            value={printPosisi}
            onChange={(e) => setPrintPosisi(e.target.value)}
            disabled={!printArea}
            className="bg-white text-slate-800 text-xs rounded-lg px-2.5 py-2 border border-slate-300 w-36 font-medium disabled:opacity-60"
          >
            <option value="" disabled>-- PILIH POSISI --</option>
            <option value="Security">SECURITY</option>
            <option value="Cleaning Service">CLEANING SERVICE</option>
          </select>

          <select
            value={printPersonilId}
            onChange={(e) => setPrintPersonilId(e.target.value)}
            disabled={!printPosisi}
            className="bg-white text-slate-800 text-xs rounded-lg px-2.5 py-2 border border-slate-300 w-44 font-medium disabled:opacity-60"
          >
            <option value="" disabled>-- PILIH PERSONEL --</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.fullName.toUpperCase()}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              const targetUser = users.find((u) => u.id === printPersonilId) || users[0];
              setPrintIdCardTarget(targetUser);
            }}
            className="px-3 py-2 bg-[#28a745] hover:bg-[#218838] text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-sm transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span className="tracking-wide uppercase">CETAK ID CARD</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          TABLE WRAPPER: CLASS & DESAIN ASLI
          ======================================================== */}
      <div className="bg-white border border-[#007bff]/40 rounded-b-xl shadow-xs p-4 space-y-4 -mt-4">
        {/* TABEL DATA PERSONIL */}
        <div className="overflow-x-auto rounded-lg border border-[#007bff]/30">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#007bff] text-white text-center font-bold">
                {/* FILTER SEMUA LOKASI */}
                <th className="py-2 px-3 border-r border-[#007bff]/50 w-52">
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

                {/* FILTER POSISI */}
                <th className="py-2 px-3 border-r border-[#007bff]/50 w-56">
                  <select
                    value={filterPosisi}
                    onChange={(e) => {
                      setFilterPosisi(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-white text-slate-800 text-xs rounded px-2 py-1 border-2 border-[#dc3545] font-bold uppercase focus:outline-none"
                  >
                    <option value="semua">Semua Personel</option>
                    <option value="Security">Security</option>
                    <option value="Cleaning Service">Cleaning Service</option>
                  </select>
                </th>

                {/* FILTER NAMA */}
                <th className="py-2 px-3 border-r border-[#007bff]/50 w-48">
                  <input
                    type="text"
                    value={filterNama}
                    onChange={(e) => {
                      setFilterNama(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="SEMUA NAMA"
                    className="w-full bg-white text-slate-800 text-xs rounded px-2 py-1 border-2 border-[#dc3545] font-bold uppercase focus:outline-none placeholder:text-slate-500 text-center"
                  />
                </th>

                <th className="py-2 px-3 border-r border-[#007bff]/50 uppercase tracking-wider w-24">
                  FOTO
                </th>

                <th className="py-2 px-3 uppercase tracking-wider w-36">
                  AKSI
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                    Tidak ada data personil yang sesuai.
                  </td>
                </tr>
              ) : (
                paginatedList.map((u, idx) => (
                  <tr
                    key={u.id}
                    className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50/80' : 'bg-slate-50/50 hover:bg-slate-100/80'}
                  >
                    <td className="py-3 px-3 text-center">
                      <small className="font-semibold text-[#007bff] tracking-wide">
                        {u.siteName}
                      </small>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <p className="font-bold text-slate-900 text-xs mb-0.5">{u.securityRank}</p>
                      <p
                        className={`text-[10px] font-bold ${
                          u.division === 'CLEANING'
                            ? 'text-[#28a745]'
                            : u.division === 'SECURITY'
                            ? 'text-[#007bff]'
                            : 'text-purple-600'
                        }`}
                      >
                        {u.division === 'CLEANING' ? 'Cleaning Service' : u.division}
                      </p>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <small className="font-bold text-[#007bff] text-xs">
                        {u.fullName.toLowerCase()}
                      </small>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{u.nik}</p>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="flex justify-center">
                        <img
                          src={u.photoUrl || 'https://patroli.site/img/noimage.png'}
                          alt={u.fullName}
                          className="w-14 h-14 object-cover rounded border border-slate-800 shadow-xs"
                        />
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center rounded-md shadow-xs" role="group">
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteTarget(u);
                            setAdminPassword('');
                            setDeleteError(null);
                          }}
                          className="px-2.5 py-1.5 bg-[#dc3545] hover:bg-[#c82333] text-white rounded-l text-xs font-bold transition flex items-center space-x-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <small>Hapus</small>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPrintIdCardTarget(u)}
                          className="px-2.5 py-1.5 bg-[#17a2b8] hover:bg-[#138496] text-white rounded-r text-xs font-bold transition flex items-center space-x-1 border-l border-white/20"
                        >
                          <Pencil className="w-3 h-3" />
                          <small>Edit</small>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* BOTTOM CONTROLS */}
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
          MODAL TAMBAH PERSONIL
          ======================================================== */}
      {isTambahModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#007bff] text-white px-5 py-4 flex items-center justify-between">
              <h5 className="font-bold text-sm tracking-wide flex items-center space-x-2 text-white">
                <Users className="w-4 h-4 text-white" />
                <span>Form Tambah Data Personel</span>
              </h5>
              <button
                type="button"
                onClick={() => setIsTambahModalOpen(false)}
                className="text-white hover:text-white/80 font-bold text-xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveTambah} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Penempatan Area / Site
                </label>
                <select
                  value={formSiteName}
                  onChange={(e) => setFormSiteName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-800"
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Divisi</label>
                  <select
                    value={formDivision}
                    onChange={(e) => setFormDivision(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-800"
                  >
                    <option value="SECURITY">Security</option>
                    <option value="CLEANING">Cleaning Service</option>
                    <option value="DRIVER">Driver Logistik</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jabatan / Jenjang</label>
                  <select
                    value={formRank}
                    onChange={(e) => setFormRank(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-800"
                  >
                    <option value="Anggota">Anggota</option>
                    <option value="Komandan Regu">Komandan Regu</option>
                    <option value="Chief Security">Chief Manager</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">NIK Petugas</label>
                <input
                  type="text"
                  value={formNik}
                  onChange={(e) => setFormNik(e.target.value)}
                  placeholder="NIK-SEC-012"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  placeholder="Nama Lengkap Petugas"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Username Login PWA</label>
                <input
                  type="text"
                  required
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  placeholder="username petugas untuk login"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs"
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
                  className="px-4 py-2 bg-[#007bff] hover:bg-[#0069d9] text-white font-bold rounded-lg text-xs"
                >
                  Simpan Personel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL HAPUS PERSONIL (DENGAN PASSWORD ADMIN)
          ======================================================== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border-0 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#dc3545] text-white px-5 py-3.5 flex items-center justify-between">
              <h5 className="font-bold text-sm tracking-wide flex items-center space-x-2 text-white">
                <Trash2 className="w-4 h-4 text-white" />
                <span>Konfirmasi Hapus Personel</span>
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
                <p className="font-bold">Apakah Anda yakin akan menghapus data personel ini?</p>
                <div className="p-2 bg-white rounded border border-[#f5c6cb] text-center font-bold text-[#dc3545] uppercase">
                  {deleteTarget.fullName} ({deleteTarget.division} - {deleteTarget.siteName})
                </div>
                <small className="block text-slate-600">
                  Data absensi, rute patroli, dan riwayat tugas personil tidak dapat dipulihkan.
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
