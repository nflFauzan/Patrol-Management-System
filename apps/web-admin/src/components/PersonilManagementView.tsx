'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  Building,
  DollarSign,
  Camera,
  Shield,
  Clock,
  Briefcase,
  UserCheck,
} from 'lucide-react';
import { useData, UserItem } from '../lib/DataContext';

export const PersonilManagementView: React.FC = () => {
  const {
    sites,
    users,
    addUser,
    updateUser,
    deleteUser,
    verifyAndDeleteUser,
    getPersonnelForIdCard,
    setBulkImportType,
    setPrintIdCardTarget,
  } = useData();

  // Filters & Pagination for Table
  const [filterLokasi, setFilterLokasi] = useState('');
  const [filterPosisi, setFilterPosisi] = useState('semua');
  const [filterNama, setFilterNama] = useState('');
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // Cascading Filter Cetak ID Card (Header Kanan)
  const [printArea, setPrintArea] = useState('');
  const [printPosisi, setPrintPosisi] = useState('');
  const [printPersonilId, setPrintPersonilId] = useState('');

  // Modals state
  const [isTambahModalOpen, setIsTambahModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UserItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form Tambah Personil state (2-Panel)
  const [formFullName, setFormFullName] = useState('');
  const [formWorkingHours, setFormWorkingHours] = useState(8);
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formNik, setFormNik] = useState('');
  const [formPosisi, setFormPosisi] = useState<'Security' | 'Cleaning Service' | 'Driver' | 'Staf' | 'Admin Area'>('Security');
  const [formSecurityRank, setFormSecurityRank] = useState<'Anggota' | 'Komandan' | 'Chief'>('Anggota');
  const [formSiteName, setFormSiteName] = useState('');
  const [formMultiSites, setFormMultiSites] = useState<string[]>([]);
  const [formPhotoUrl, setFormPhotoUrl] = useState('');

  // Payroll components (Panel Kanan)
  const [formGajiPokok, setFormGajiPokok] = useState(4800000);
  const [formTunjangan, setFormTunjangan] = useState(600000);
  const [formLembur, setFormLembur] = useState(25000);
  const [formPotonganBpjs, setFormPotonganBpjs] = useState(150000);
  const [formPotonganAlpa, setFormPotonganAlpa] = useState(150000);
  const [formPotonganLupaAbsen, setFormPotonganLupaAbsen] = useState(50000);

  // Form Edit state
  const [editFullName, setEditFullName] = useState('');
  const [editWorkingHours, setEditWorkingHours] = useState(8);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editNik, setEditNik] = useState('');
  const [editPosisi, setEditPosisi] = useState<'Security' | 'Cleaning Service' | 'Driver' | 'Staf' | 'Admin Area'>('Security');
  const [editSecurityRank, setEditSecurityRank] = useState<'Anggota' | 'Komandan' | 'Chief'>('Anggota');
  const [editSiteName, setEditSiteName] = useState('');
  const [editPhotoUrl, setEditPhotoUrl] = useState('');
  const [editGajiPokok, setEditGajiPokok] = useState(0);
  const [editTunjangan, setEditTunjangan] = useState(0);
  const [editLembur, setEditLembur] = useState(0);
  const [editPotonganBpjs, setEditPotonganBpjs] = useState(0);
  const [editPotonganAlpa, setEditPotonganAlpa] = useState(0);
  const [editPotonganLupaAbsen, setEditPotonganLupaAbsen] = useState(0);

  // Initialize site defaults
  useEffect(() => {
    if (sites.length > 0 && !formSiteName) {
      setFormSiteName(sites[0].name);
    }
  }, [sites, formSiteName]);

  // Reset Cascading Filter when Area changes
  const handleAreaChange = (area: string) => {
    setPrintArea(area);
    setPrintPosisi('');
    setPrintPersonilId('');
  };

  // Reset Personel Filter when Posisi changes
  const handlePosisiChange = (posisi: string) => {
    setPrintPosisi(posisi);
    setPrintPersonilId('');
  };

  // Compute available personnel for ID Card cascading dropdown
  const availablePrintPersonnel = useMemo(() => {
    if (!printArea || !printPosisi) return [];
    return getPersonnelForIdCard(printArea, printPosisi);
  }, [printArea, printPosisi, getPersonnelForIdCard]);

  // Open Edit Modal with selected user prefilled
  const handleOpenEdit = (user: UserItem) => {
    setEditTarget(user);
    setEditFullName(user.fullName || '');
    setEditUsername(user.username || '');
    setEditPassword('');
    setEditNik(user.nik || '');
    setEditPhone(user.phone || '');
    setEditWorkingHours(user.workingHoursPerDay || 8);
    setEditSiteName(user.siteName || sites[0]?.name || '');
    setEditPhotoUrl(user.photoUrl || '');

    // Map division & rank
    if (user.division === 'CLEANING') {
      setEditPosisi('Cleaning Service');
    } else if (user.division === 'DRIVER') {
      setEditPosisi('Driver');
    } else if (user.division === 'STAFF') {
      setEditPosisi('Staf');
    } else if (user.role === 'ADMIN_AREA') {
      setEditPosisi('Admin Area');
    } else {
      setEditPosisi('Security');
    }

    if (user.securityRank?.toLowerCase().includes('chief')) {
      setEditSecurityRank('Chief');
    } else if (user.securityRank?.toLowerCase().includes('komandan')) {
      setEditSecurityRank('Komandan');
    } else {
      setEditSecurityRank('Anggota');
    }

    // Payroll
    setEditGajiPokok(user.gajiPokok || 0);
    setEditTunjangan(user.tunjangan || 0);
    setEditLembur(user.lemburPerJam || 0);
    setEditPotonganBpjs(user.potonganBpjs || 0);
    setEditPotonganAlpa(user.potonganTidakMasuk ?? user.potonganAlpa ?? 0);
    setEditPotonganLupaAbsen(user.potonganLupaAbsensi ?? user.potonganLupaAbsen ?? 0);
  };

  // Submit Edit Personel
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;

    let divMapped = 'SECURITY';
    let roleMapped = 'SECURITY_OFFICER';
    if (editPosisi === 'Cleaning Service') {
      divMapped = 'CLEANING';
      roleMapped = 'CLEANER';
    } else if (editPosisi === 'Driver') {
      divMapped = 'DRIVER';
      roleMapped = 'DRIVER';
    } else if (editPosisi === 'Staf') {
      divMapped = 'STAFF';
      roleMapped = 'STAFF';
    } else if (editPosisi === 'Admin Area') {
      divMapped = 'SECURITY';
      roleMapped = 'ADMIN_AREA';
    }

    const matchedSite = sites.find((s) => s.name === editSiteName);

    const updated: UserItem = {
      ...editTarget,
      fullName: editFullName.trim(),
      phone: editPhone.trim(),
      role: roleMapped,
      division: divMapped as any,
      securityRank: editPosisi === 'Security' ? editSecurityRank : editPosisi,
      siteName: editSiteName,
      siteId: matchedSite?.id || editTarget.siteId,
      workingHoursPerDay: Number(editWorkingHours),
      photoUrl: editPhotoUrl || editTarget.photoUrl,
      gajiPokok: Number(editGajiPokok),
      tunjangan: Number(editTunjangan),
      lemburPerJam: Number(editLembur),
      potonganBpjs: Number(editPotonganBpjs),
      potonganAlpa: Number(editPotonganAlpa),
      potonganTidakMasuk: Number(editPotonganAlpa),
      potonganLupaAbsen: Number(editPotonganLupaAbsen),
      potonganLupaAbsensi: Number(editPotonganLupaAbsen),
      ...(editPassword.trim() ? { password: editPassword.trim() } : {}),
    };

    updateUser(updated);
    setEditTarget(null);
    setToastMessage(`Data personel "${updated.fullName}" berhasil diperbarui.`);
  };

  // Filtered users for table
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchLokasi = filterLokasi ? u.siteName?.toLowerCase() === filterLokasi.toLowerCase() : true;
      const matchPosisi =
        filterPosisi === 'semua'
          ? true
          : filterPosisi === 'Security'
          ? u.division === 'SECURITY'
          : filterPosisi === 'Cleaning Service'
          ? u.division === 'CLEANING'
          : filterPosisi === 'Driver'
          ? u.division === 'DRIVER'
          : true;
      const matchNama = filterNama ? u.fullName?.toLowerCase().includes(filterNama.toLowerCase()) : true;
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

  // Submit Tambah Personel (2-Panel)
  const handleSaveTambah = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFullName.trim() || !formUsername.trim()) {
      alert('Nama Lengkap dan Username login wajib diisi!');
      return;
    }

    let divMapped = 'SECURITY';
    let roleMapped = 'SECURITY_OFFICER';
    if (formPosisi === 'Cleaning Service') {
      divMapped = 'CLEANING';
      roleMapped = 'CLEANER';
    } else if (formPosisi === 'Driver') {
      divMapped = 'DRIVER';
      roleMapped = 'DRIVER';
    } else if (formPosisi === 'Staf') {
      divMapped = 'STAFF';
      roleMapped = 'STAFF';
    } else if (formPosisi === 'Admin Area') {
      divMapped = 'SECURITY';
      roleMapped = 'ADMIN_AREA';
    }

    const matchedSite = sites.find((s) => s.name === formSiteName);

    const newUser: UserItem = {
      id: `u-${Date.now()}`,
      nik: formNik.trim() || `NIK-${Date.now().toString().slice(-6)}`,
      fullName: formFullName.trim(),
      username: formUsername.trim().toLowerCase(),
      password: formPassword.trim() || 'password123',
      phone: formPhone.trim(),
      role: roleMapped,
      division: divMapped as any,
      securityRank: formPosisi === 'Security' ? formSecurityRank : formPosisi,
      siteName: formSiteName || sites[0]?.name || 'Site Proyek Demo',
      siteId: matchedSite?.id || sites[0]?.id,
      multiSiteIds: formMultiSites,
      workingHoursPerDay: Number(formWorkingHours),
      photoUrl:
        formPhotoUrl.trim() ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      gajiPokok: Number(formGajiPokok),
      tunjangan: Number(formTunjangan),
      lemburPerJam: Number(formLembur),
      potonganBpjs: Number(formPotonganBpjs),
      potonganAlpa: Number(formPotonganAlpa),
      potonganTidakMasuk: Number(formPotonganAlpa),
      potonganLupaAbsen: Number(formPotonganLupaAbsen),
      potonganLupaAbsensi: Number(formPotonganLupaAbsen),
    };

    addUser(newUser);
    setIsTambahModalOpen(false);
    setFormFullName('');
    setFormUsername('');
    setFormPassword('');
    setFormNik('');
    setFormPhone('');
    setToastMessage(`Personel "${newUser.fullName}" berhasil ditambahkan.`);
  };

  // Confirm Delete Personel (Authenticated via Admin Password)
  const handleConfirmDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword.trim()) {
      setDeleteError('Verifikasi Password Admin wajib diisi!');
      return;
    }
    if (!deleteTarget) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await verifyAndDeleteUser(deleteTarget.id, adminPassword);
      setToastMessage(res.message || `Data personel "${deleteTarget.fullName}" berhasil dihapus.`);
      setDeleteTarget(null);
      setAdminPassword('');
    } catch (err: any) {
      setDeleteError(err.message || 'Password verifikasi admin salah.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Trigger Cetak ID Card from Cascading Filter
  const handlePrintIdCard = () => {
    if (!printArea || !printPosisi || !printPersonilId) {
      alert('Silakan pilih Area, Posisi, dan Personel terlebih dahulu!');
      return;
    }

    if (printPersonilId === '__SEMUA__') {
      const allForPosition = getPersonnelForIdCard(printArea, printPosisi);
      if (allForPosition.length === 0) {
        alert('Tidak ada personil pada kriteria ini.');
        return;
      }
      setPrintIdCardTarget(allForPosition);
    } else {
      const singleUser = users.find((u) => u.id === printPersonilId);
      if (singleUser) {
        setPrintIdCardTarget(singleUser);
      }
    }
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
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
          >
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
            id="btn-tambah"
            onClick={() => setIsTambahModalOpen(true)}
            className="px-3 py-2 bg-[#212529] hover:bg-[#1a1e21] text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Users className="w-4 h-4 text-white" />
            <span className="tracking-wide uppercase">TAMBAH PERSONEL</span>
          </button>

          <button
            type="button"
            id="btn-import"
            onClick={() => setBulkImportType('PERSONIL')}
            className="px-3 py-2 bg-[#ffc107] hover:bg-[#e0a800] text-slate-900 font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-slate-900" />
            <span className="tracking-wide uppercase">IMPORT PERSONEL</span>
          </button>
        </div>

        {/* KANAN: FILTER CETAK ID CARD (CASCADING DROPDOWNS) */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Dropdown 1: Area */}
          <select
            id="cetak_area"
            value={printArea}
            onChange={(e) => handleAreaChange(e.target.value)}
            className="bg-white text-slate-800 text-xs rounded-lg px-2.5 py-2 border border-slate-300 w-40 font-medium cursor-pointer"
          >
            <option value="">-- PILIH AREA --</option>
            {sites.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name.toUpperCase()}
              </option>
            ))}
          </select>

          {/* Dropdown 2: Posisi */}
          <select
            id="cetak_posisi"
            value={printPosisi}
            onChange={(e) => handlePosisiChange(e.target.value)}
            disabled={!printArea}
            className="bg-white text-slate-800 text-xs rounded-lg px-2.5 py-2 border border-slate-300 w-36 font-medium disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            <option value="">-- PILIH POSISI --</option>
            <option value="Security">SECURITY</option>
            <option value="Cleaning Service">CLEANING SERVICE</option>
            <option value="Driver">DRIVER</option>
            <option value="Staf">STAF</option>
            <option value="Admin Area">ADMIN AREA</option>
          </select>

          {/* Dropdown 3: Nama Personel */}
          <select
            id="cetak_nama"
            value={printPersonilId}
            onChange={(e) => setPrintPersonilId(e.target.value)}
            disabled={!printPosisi}
            className="bg-white text-slate-800 text-xs rounded-lg px-2.5 py-2 border border-slate-300 w-48 font-medium disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            <option value="">-- PILIH PERSONEL --</option>
            {availablePrintPersonnel.length > 0 && (
              <option value="__SEMUA__" className="font-bold text-[#007bff]">
                -- SEMUA PERSONEL --
              </option>
            )}
            {availablePrintPersonnel.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName.toUpperCase()} ({u.securityRank || u.division})
              </option>
            ))}
          </select>

          <button
            type="button"
            id="btn-cetak"
            onClick={handlePrintIdCard}
            disabled={!printPersonilId}
            className="px-3 py-2 bg-[#28a745] hover:bg-[#218838] text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-sm transition active:scale-95 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            <Printer className="w-4 h-4" />
            <span className="tracking-wide uppercase">CETAK ID CARD</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          TABLE WRAPPER: CLASS & DESAIN ASLI DENGAN FILTER PER KOLOM
          ======================================================== */}
      <div className="bg-white border border-[#007bff]/40 rounded-b-xl shadow-xs p-4 space-y-4 -mt-4">
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
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
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
                    <option value="Driver">Driver</option>
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

                <th className="py-2 px-3 uppercase tracking-wider w-36">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                    Tidak ada data personil yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                paginatedList.map((u, idx) => (
                  <tr
                    key={u.id}
                    className={
                      idx % 2 === 0
                        ? 'bg-white hover:bg-slate-50/80'
                        : 'bg-slate-50/50 hover:bg-slate-100/80'
                    }
                  >
                    <td className="py-3 px-3 text-center">
                      <small className="font-semibold text-[#007bff] tracking-wide block">
                        {u.siteName}
                      </small>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {u.workingHoursPerDay || 8} Jam / Hari
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <p className="font-bold text-slate-900 text-xs mb-0.5">{u.securityRank}</p>
                      <p
                        className={`text-[10px] font-bold ${
                          u.division === 'CLEANING'
                            ? 'text-[#28a745]'
                            : u.division === 'SECURITY'
                            ? 'text-[#007bff]'
                            : u.division === 'DRIVER'
                            ? 'text-amber-600'
                            : 'text-purple-600'
                        }`}
                      >
                        {u.division === 'CLEANING'
                          ? 'Cleaning Service'
                          : u.division === 'SECURITY'
                          ? 'Security'
                          : u.division}
                      </p>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <small className="font-bold text-[#007bff] text-xs block">
                        {u.fullName}
                      </small>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {u.nik || `@${u.username}`}
                      </p>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="flex justify-center">
                        <img
                          src={u.photoUrl || 'https://patroli.site/img/noimage.png'}
                          alt={u.fullName}
                          className="w-14 h-14 object-cover rounded border border-slate-300 shadow-xs"
                          onError={(e) => {
                            (e.target as any).src = 'https://patroli.site/img/noimage.png';
                          }}
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
                          className="px-2.5 py-1.5 bg-[#dc3545] hover:bg-[#c82333] text-white rounded-l text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <small>Hapus</small>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(u)}
                          className="px-2.5 py-1.5 bg-[#17a2b8] hover:bg-[#138496] text-white rounded-r text-xs font-bold transition flex items-center space-x-1 border-l border-white/20 cursor-pointer"
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

        {/* BOTTOM PAGINATION CONTROLS */}
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
              className="px-3 py-1 border border-slate-300 rounded text-slate-700 disabled:opacity-40 hover:bg-slate-50 text-xs cursor-pointer disabled:cursor-not-allowed"
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
              className="px-3 py-1 border border-slate-300 rounded text-slate-700 disabled:opacity-40 hover:bg-slate-50 text-xs cursor-pointer disabled:cursor-not-allowed"
            >
              NEXT
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          MODAL TAMBAH PERSONIL (2-PANEL LAYOUT PATROLI.SITE PARITY)
          ======================================================== */}
      {isTambahModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
            {/* Modal Header */}
            <div className="bg-[#007bff] text-white px-5 py-3.5 flex items-center justify-between">
              <h5 className="font-bold text-sm tracking-wide flex items-center space-x-2 text-white">
                <Users className="w-4 h-4 text-white" />
                <span className="uppercase tracking-wider">FORM TAMBAH DATA PERSONEL</span>
              </h5>
              <button
                type="button"
                onClick={() => setIsTambahModalOpen(false)}
                className="text-white hover:text-white/80 font-bold text-2xl leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveTambah} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* ================= PANEL KIRI: DATA PERSONEL ================= */}
                <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3.5">
                  <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                    <h6 className="font-bold text-xs text-[#007bff] uppercase tracking-wider flex items-center space-x-1.5">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Data Identitas & Penugasan</span>
                    </h6>
                    <span className="text-[10px] text-slate-500 font-semibold">Panel 1</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Lengkap Petugas *
                    </label>
                    <input
                      type="text"
                      required
                      value={formFullName}
                      onChange={(e) => setFormFullName(e.target.value)}
                      placeholder="Contoh: Budi Santoso"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-800 focus:border-[#007bff] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Jam Kerja / Hari
                      </label>
                      <select
                        value={formWorkingHours}
                        onChange={(e) => setFormWorkingHours(Number(e.target.value))}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-800"
                      >
                        <option value={8}>8 Jam</option>
                        <option value={12}>12 Jam</option>
                        <option value={16}>16 Jam</option>
                        <option value={24}>24 Jam</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        NIK Petugas
                      </label>
                      <input
                        type="text"
                        value={formNik}
                        onChange={(e) => setFormNik(e.target.value)}
                        placeholder="NIK-00123"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-800 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Username Login *
                      </label>
                      <input
                        type="text"
                        required
                        value={formUsername}
                        onChange={(e) => setFormUsername(e.target.value)}
                        placeholder="username login"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Password Login *
                      </label>
                      <input
                        type="password"
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        placeholder="Default: password123"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Posisi</label>
                      <select
                        value={formPosisi}
                        onChange={(e) => setFormPosisi(e.target.value as any)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-800 font-bold"
                      >
                        <option value="Security">Security</option>
                        <option value="Cleaning Service">Cleaning Service</option>
                        <option value="Driver">Driver</option>
                        <option value="Staf">Staf</option>
                        <option value="Admin Area">Admin Area</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Jabatan / Jenjang
                      </label>
                      {formPosisi === 'Security' ? (
                        <select
                          value={formSecurityRank}
                          onChange={(e) => setFormSecurityRank(e.target.value as any)}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-800"
                        >
                          <option value="Anggota">Anggota / Personel</option>
                          <option value="Komandan">Komandan Regu</option>
                          <option value="Chief">Chief Security</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          readOnly
                          value={formPosisi}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-slate-100 text-slate-600"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Lokasi Site Utama
                    </label>
                    <select
                      value={formSiteName}
                      onChange={(e) => setFormSiteName(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-800"
                    >
                      {sites.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nomor Telepon / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="0812-xxxx-xxxx"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-800"
                    />
                  </div>
                </div>

                {/* ================= PANEL KANAN: RINCIAN GAJI & POTONGAN ================= */}
                <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3.5">
                  <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                    <h6 className="font-bold text-xs text-[#28a745] uppercase tracking-wider flex items-center space-x-1.5">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Rincian Gaji Pokok & Potongan</span>
                    </h6>
                    <span className="text-[10px] text-slate-500 font-semibold">Panel 2</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Gaji Pokok (Rp)
                    </label>
                    <input
                      type="number"
                      value={formGajiPokok}
                      onChange={(e) => setFormGajiPokok(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-800 font-mono font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tunjangan (Rp)
                      </label>
                      <input
                        type="number"
                        value={formTunjangan}
                        onChange={(e) => setFormTunjangan(Number(e.target.value))}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-800 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Lembur / Jam (Rp)
                      </label>
                      <input
                        type="number"
                        value={formLembur}
                        onChange={(e) => setFormLembur(Number(e.target.value))}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-800 font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[11px] font-bold text-red-600 uppercase tracking-wide block mb-2">
                      Komponen Potongan:
                    </span>

                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-0.5">
                          Potongan BPJS (Rp)
                        </label>
                        <input
                          type="number"
                          value={formPotonganBpjs}
                          onChange={(e) => setFormPotonganBpjs(Number(e.target.value))}
                          className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white text-slate-800 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-0.5">
                          Potongan Tidak Masuk / Alpa (Rp)
                        </label>
                        <input
                          type="number"
                          value={formPotonganAlpa}
                          onChange={(e) => setFormPotonganAlpa(Number(e.target.value))}
                          className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white text-slate-800 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-0.5">
                          Potongan Lupa Absen (Rp)
                        </label>
                        <input
                          type="number"
                          value={formPotonganLupaAbsen}
                          onChange={(e) => setFormPotonganLupaAbsen(Number(e.target.value))}
                          className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white text-slate-800 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end items-center space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsTambahModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#007bff] hover:bg-[#0069d9] text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>SIMPAN PERSONEL</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL EDIT PERSONIL (2-PANEL PREFILLED)
          ======================================================== */}
      {editTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
            <div className="bg-[#17a2b8] text-white px-5 py-3.5 flex items-center justify-between">
              <h5 className="font-bold text-sm tracking-wide flex items-center space-x-2 text-white">
                <Pencil className="w-4 h-4 text-white" />
                <span className="uppercase tracking-wider">
                  EDIT DATA PERSONEL: {editTarget.fullName}
                </span>
              </h5>
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                className="text-white hover:text-white/80 font-bold text-2xl leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* PANEL KIRI: DATA IDENTITAS */}
                <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3.5">
                  <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                    <h6 className="font-bold text-xs text-[#17a2b8] uppercase tracking-wider flex items-center space-x-1.5">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Data Identitas & Penugasan</span>
                    </h6>
                    <span className="text-[10px] text-slate-500 font-semibold">Edit Panel</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Lengkap Petugas *
                    </label>
                    <input
                      type="text"
                      required
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Jam Kerja / Hari
                      </label>
                      <select
                        value={editWorkingHours}
                        onChange={(e) => setEditWorkingHours(Number(e.target.value))}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-800"
                      >
                        <option value={8}>8 Jam</option>
                        <option value={12}>12 Jam</option>
                        <option value={16}>16 Jam</option>
                        <option value={24}>24 Jam</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nomor Telepon
                      </label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="0812-xxxx-xxxx"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Username Login
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={editUsername}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-slate-100 text-slate-500 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Ganti Password (Opsional)
                      </label>
                      <input
                        type="password"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        placeholder="Biarkan kosong jika tetap"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Posisi</label>
                      <select
                        value={editPosisi}
                        onChange={(e) => setEditPosisi(e.target.value as any)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-800 font-bold"
                      >
                        <option value="Security">Security</option>
                        <option value="Cleaning Service">Cleaning Service</option>
                        <option value="Driver">Driver</option>
                        <option value="Staf">Staf</option>
                        <option value="Admin Area">Admin Area</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Jabatan / Jenjang
                      </label>
                      {editPosisi === 'Security' ? (
                        <select
                          value={editSecurityRank}
                          onChange={(e) => setEditSecurityRank(e.target.value as any)}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-800"
                        >
                          <option value="Anggota">Anggota / Personel</option>
                          <option value="Komandan">Komandan Regu</option>
                          <option value="Chief">Chief Security</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          readOnly
                          value={editPosisi}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-slate-100 text-slate-600"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Penempatan Site
                    </label>
                    <select
                      value={editSiteName}
                      onChange={(e) => setEditSiteName(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-800"
                    >
                      {sites.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* PANEL KANAN: RINCIAN GAJI */}
                <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3.5">
                  <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                    <h6 className="font-bold text-xs text-[#28a745] uppercase tracking-wider flex items-center space-x-1.5">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Rincian Gaji & Potongan</span>
                    </h6>
                    <span className="text-[10px] text-slate-500 font-semibold">Nominal</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Gaji Pokok (Rp)
                    </label>
                    <input
                      type="number"
                      value={editGajiPokok}
                      onChange={(e) => setEditGajiPokok(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-800 font-mono font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tunjangan (Rp)
                      </label>
                      <input
                        type="number"
                        value={editTunjangan}
                        onChange={(e) => setEditTunjangan(Number(e.target.value))}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-800 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Lembur / Jam (Rp)
                      </label>
                      <input
                        type="number"
                        value={editLembur}
                        onChange={(e) => setEditLembur(Number(e.target.value))}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-800 font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[11px] font-bold text-red-600 uppercase tracking-wide block mb-2">
                      Komponen Potongan:
                    </span>

                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-0.5">
                          Potongan BPJS (Rp)
                        </label>
                        <input
                          type="number"
                          value={editPotonganBpjs}
                          onChange={(e) => setEditPotonganBpjs(Number(e.target.value))}
                          className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white text-slate-800 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-0.5">
                          Potongan Tidak Masuk / Alpa (Rp)
                        </label>
                        <input
                          type="number"
                          value={editPotonganAlpa}
                          onChange={(e) => setEditPotonganAlpa(Number(e.target.value))}
                          className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white text-slate-800 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-0.5">
                          Potongan Lupa Absen (Rp)
                        </label>
                        <input
                          type="number"
                          value={editPotonganLupaAbsen}
                          onChange={(e) => setEditPotonganLupaAbsen(Number(e.target.value))}
                          className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white text-slate-800 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Actions */}
              <div className="flex justify-end items-center space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#17a2b8] hover:bg-[#138496] text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>SIMPAN PERUBAHAN</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL HAPUS PERSONIL (100% PARITY DENGAN PATROLI.SITE modalHapus)
          ======================================================== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border-0 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Red Header */}
            <div className="bg-[#dc3545] text-white px-5 py-3.5 flex items-center justify-between">
              <h5 className="font-bold text-sm tracking-wide flex items-center space-x-2 text-white">
                <Trash2 className="w-4 h-4 text-white" />
                <span className="uppercase tracking-wider">KONFIRMASI HAPUS PERSONEL</span>
              </h5>
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget(null);
                  setAdminPassword('');
                  setDeleteError(null);
                }}
                className="text-white hover:text-white/80 font-bold text-2xl leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleConfirmDelete} className="p-5 space-y-4">
              <div className="bg-[#f8d7da] border border-[#f5c6cb] text-[#721c24] p-4 rounded-xl space-y-2 text-xs">
                <p className="font-bold">Apakah Anda yakin akan menghapus data personel ini?</p>
                <div className="p-2.5 bg-white rounded-lg border border-[#f5c6cb] text-center font-black text-[#dc3545] uppercase tracking-wider text-sm shadow-xs">
                  {deleteTarget.fullName}
                </div>
                <div className="text-[11px] text-slate-700 flex justify-between px-1">
                  <span>Divisi: <strong>{deleteTarget.division}</strong></span>
                  <span>Site: <strong>{deleteTarget.siteName}</strong></span>
                </div>
                <small className="block text-slate-600 pt-1 border-t border-[#f5c6cb]/60 leading-relaxed">
                  ⚠️ Peringatan: Seluruh riwayat presensi, rute patroli checkpoint, dan tiket insiden yang terkait dengan petugas ini tidak dapat dikembalikan.
                </small>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                  <KeyRound className="w-4 h-4 text-red-600" />
                  <span>Verifikasi Password Admin Aktif *</span>
                </label>
                <input
                  type="password"
                  required
                  id="admin_password_confirm"
                  value={adminPassword}
                  onChange={(e) => {
                    setAdminPassword(e.target.value);
                    setDeleteError(null);
                  }}
                  placeholder="Masukkan password admin Anda untuk konfirmasi"
                  className="w-full border-2 border-[#dc3545] rounded-lg px-3 py-2 text-xs text-slate-800 bg-white focus:outline-none shadow-xs"
                  autoFocus
                />
                {deleteError && (
                  <div className="p-2 bg-red-100 border border-red-300 text-red-700 text-xs rounded-lg font-semibold flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{deleteError}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end items-center space-x-2 pt-3 border-t border-slate-200">
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
                  disabled={isDeleting}
                  className="px-5 py-2 bg-[#dc3545] hover:bg-[#c82333] text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-sm transition active:scale-95 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isDeleting ? 'Memverifikasi...' : 'Ya, Hapus Permanen'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
