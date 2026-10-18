'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Users,
  Upload,
  Printer,
  Trash2,
  Pencil,
  AlertTriangle,
  Check,
  X,
  Camera,
  RotateCcw,
  Banknote,
  Info,
  CheckCircle2,
  Lock,
  Save,
  MapPin,
  Clock,
  User,
  Contact,
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

  // Helper for Rupiah formatting matching patroli.site formatRupiah()
  const formatRupiah = (val: number | string): string => {
    const clean = String(val).replace(/\D/g, '');
    if (!clean) return '';
    return new Intl.NumberFormat('id-ID').format(Number(clean));
  };

  const parseRupiah = (val: string): number => {
    return Number(val.replace(/\D/g, '')) || 0;
  };

  // =========================================================================
  // FORM TAMBAH PERSONIL STATE (100% PARITY DENGAN patroli.site #exampleModalCenter)
  // =========================================================================
  const [formNamaAnggota, setFormNamaAnggota] = useState('');
  const [formJamKerja, setFormJamKerja] = useState<number | string>(8);
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formPosisi, setFormPosisi] = useState('');
  const [formJabatanSelect, setFormJabatanSelect] = useState('');
  const [formLokasiMember, setFormLokasiMember] = useState<string[]>([]);
  const [formLokasiAnggota, setFormLokasiAnggota] = useState('');

  // Finansial (Rp formatted)
  const [formGajiPokok, setFormGajiPokok] = useState(formatRupiah(4800000));
  const [formTunjangan, setFormTunjangan] = useState(formatRupiah(600000));
  const [formLembur, setFormLembur] = useState(formatRupiah(25000));
  const [formPotonganBpjs, setFormPotonganBpjs] = useState(formatRupiah(150000));
  const [formPotonganTidakMasuk, setFormPotonganTidakMasuk] = useState(formatRupiah(150000));
  const [formPotonganLupaAbsensi, setFormPotonganLupaAbsensi] = useState(formatRupiah(50000));

  // Webcam State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  // Start webcam when Tambah modal opens
  useEffect(() => {
    if (!isTambahModalOpen) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setIsCameraActive(false);
      setCameraLoading(false);
      setCameraError(null);
      return;
    }

    setCapturedPhoto(null);
    setCameraLoading(true);
    setCameraError(null);
    let active = true;

    const startWebcam = async () => {
      try {
        let stream: MediaStream;
        try {
          // Tier 1: Ideal 640x480 user-facing
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
            audio: false,
          });
        } catch {
          // Tier 2: Generic video fallback for older webcams
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        setIsCameraActive(true);
        setCameraLoading(false);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      } catch (err: any) {
        if (!active) return;
        console.warn('Webcam not accessible:', err?.message);
        setIsCameraActive(false);
        setCameraLoading(false);
        setCameraError(err?.message || 'Kamera tidak terdeteksi atau izin belum diberikan');
      }
    };

    startWebcam();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setIsCameraActive(false);
    };
  }, [isTambahModalOpen]);

  // Handle snap photo
  const handleSnapPhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const w = video.videoWidth || 320;
      const h = video.videoHeight || 240;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedPhoto(dataUrl);
      }
    } else {
      // Fallback demo photo
      setCapturedPhoto('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=320&auto=format&fit=crop&q=80');
    }
  };

  // Handle retake photo
  const handleRetakePhoto = () => {
    setCapturedPhoto(null);
    if (videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      videoRef.current.play().catch(() => {});
    }
  };

  // =========================================================================
  // FORM EDIT PERSONIL STATE (100% PARITY DENGAN personil_edit.php)
  // =========================================================================
  const [editNamaAnggota, setEditNamaAnggota] = useState('');
  const [editPosisi, setEditPosisi] = useState('');
  const [editJabatan, setEditJabatan] = useState('anggota');
  const [editUsername, setEditUsername] = useState('');
  const [editPasswordBaru, setEditPasswordBaru] = useState('');
  const [editLokasiSiteBaru, setEditLokasiSiteBaru] = useState('');
  const [editJamKerja, setEditJamKerja] = useState<number | string>(8);
  const [editFotoLama, setEditFotoLama] = useState('');
  const [editFotoBaru, setEditFotoBaru] = useState<string | null>(null);

  // Edit Finansial
  const [editGapok, setEditGapok] = useState('');
  const [editTunjangan, setEditTunjangan] = useState('');
  const [editLembur, setEditLembur] = useState('');
  const [editPotBpjs, setEditPotBpjs] = useState('');
  const [editPotIzin, setEditPotIzin] = useState('');
  const [editPotLupa, setEditPotLupa] = useState('');

  // Open Edit Modal with pre-populated values
  const handleOpenEdit = (user: UserItem) => {
    setEditTarget(user);
    setEditNamaAnggota(user.fullName);
    setEditUsername(user.username);
    setEditPasswordBaru('');
    setEditFotoLama(user.photoUrl || 'https://patroli.site/img/noimage.png');
    setEditFotoBaru(null);
    setEditJamKerja(user.workingHoursPerDay || 8);
    setEditLokasiSiteBaru(user.siteName || sites[0]?.name || '');

    // Map Posisi & Jabatan
    if (user.division === 'CLEANING') {
      setEditPosisi('Cleaning Service');
      setEditJabatan('anggota');
    } else if (user.division === 'DRIVER') {
      setEditPosisi('Driver');
      setEditJabatan('anggota');
    } else if (user.division === 'STAFF') {
      setEditPosisi('Staf');
      setEditJabatan('anggota');
    } else if (user.role === 'ADMIN_AREA') {
      setEditPosisi('Admin Area');
      setEditJabatan('member');
    } else {
      setEditPosisi('Security');
      const rank = user.securityRank?.toLowerCase() || '';
      if (rank.includes('chief')) setEditJabatan('chief');
      else if (rank.includes('komandan')) setEditJabatan('komandan');
      else setEditJabatan('anggota');
    }

    // Finansial
    setEditGapok(formatRupiah(user.gajiPokok || 4500000));
    setEditTunjangan(formatRupiah(user.tunjangan || 500000));
    setEditLembur(formatRupiah(user.lemburPerJam || 25000));
    setEditPotBpjs(formatRupiah(user.potonganBpjs || 50000));
    setEditPotIzin(formatRupiah(user.potonganTidakMasuk ?? user.potonganAlpa ?? 100000));
    setEditPotLupa(formatRupiah(user.potonganLupaAbsensi ?? user.potonganLupaAbsen ?? 25000));
  };

  // Submit Edit
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

    const matchedSite = sites.find((s) => s.name === editLokasiSiteBaru);

    const updatedUser: UserItem = {
      ...editTarget,
      fullName: editNamaAnggota.trim().toUpperCase(),
      role: roleMapped,
      division: divMapped,
      securityRank: editPosisi === 'Security' ? editJabatan.toUpperCase() : editPosisi,
      siteName: editLokasiSiteBaru,
      siteId: matchedSite?.id || editTarget.siteId,
      workingHoursPerDay: Number(editJamKerja),
      photoUrl: editFotoBaru || editTarget.photoUrl,
      gajiPokok: parseRupiah(editGapok),
      tunjangan: parseRupiah(editTunjangan),
      lemburPerJam: parseRupiah(editLembur),
      potonganBpjs: parseRupiah(editPotBpjs),
      potonganTidakMasuk: parseRupiah(editPotIzin),
      potonganAlpa: parseRupiah(editPotIzin),
      potonganLupaAbsensi: parseRupiah(editPotLupa),
      potonganLupaAbsen: parseRupiah(editPotLupa),
      ...(editPasswordBaru.trim() ? { password: editPasswordBaru.trim() } : {}),
    };

    updateUser(updatedUser);
    setEditTarget(null);
    setToastMessage(`Data personel "${updatedUser.fullName}" berhasil diperbarui.`);
  };

  // =========================================================================
  // SUBMIT TAMBAH PERSONIL (Validation & unmasking matching cleanFormat())
  // =========================================================================
  const handleSubmitTambah = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formNamaAnggota.trim()) {
      alert('Nama Personel wajib diisi!');
      return;
    }
    if (!formUsername.trim()) {
      alert('Username Login wajib diisi!');
      return;
    }
    if (!formPassword.trim()) {
      alert('Password Login wajib diisi!');
      return;
    }
    if (!formPosisi) {
      alert('Silakan pilih posisi personel terlebih dahulu.');
      return;
    }
    if (formPosisi === 'Security' && !formJabatanSelect) {
      alert('Silakan pilih jabatan Security terlebih dahulu.');
      return;
    }
    if (formPosisi === 'Admin Area' && formLokasiMember.length === 0) {
      alert('Silakan pilih minimal satu Area / Site yang dikelola.');
      return;
    }
    if (formPosisi !== 'Admin Area' && !formLokasiAnggota) {
      alert('Silakan pilih Area / Site penempatan personel.');
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

    const assignedSite =
      formPosisi === 'Admin Area'
        ? formLokasiMember[0] || sites[0]?.name
        : formLokasiAnggota || sites[0]?.name;

    const matchedSite = sites.find((s) => s.name === assignedSite);

    const newUser: UserItem = {
      id: `u-${Date.now()}`,
      nik: `NIK-${Date.now().toString().slice(-6)}`,
      fullName: formNamaAnggota.trim().toUpperCase(),
      username: formUsername.trim().toLowerCase(),
      password: formPassword.trim(),
      role: roleMapped,
      division: divMapped,
      securityRank: formPosisi === 'Security' ? formJabatanSelect.toUpperCase() : formPosisi,
      siteName: assignedSite,
      siteId: matchedSite?.id || sites[0]?.id,
      multiSiteIds: formPosisi === 'Admin Area' ? formLokasiMember : [assignedSite],
      workingHoursPerDay: Number(formJamKerja) || 8,
      photoUrl:
        capturedPhoto ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=320&auto=format&fit=crop&q=80',
      gajiPokok: parseRupiah(formGajiPokok),
      tunjangan: parseRupiah(formTunjangan),
      lemburPerJam: parseRupiah(formLembur),
      potonganBpjs: parseRupiah(formPotonganBpjs),
      potonganTidakMasuk: parseRupiah(formPotonganTidakMasuk),
      potonganAlpa: parseRupiah(formPotonganTidakMasuk),
      potonganLupaAbsensi: parseRupiah(formPotonganLupaAbsensi),
      potonganLupaAbsen: parseRupiah(formPotonganLupaAbsensi),
    };

    addUser(newUser);
    setIsTambahModalOpen(false);

    // Reset Form
    setFormNamaAnggota('');
    setFormUsername('');
    setFormPassword('');
    setFormPosisi('');
    setFormJabatanSelect('');
    setFormLokasiAnggota('');
    setFormLokasiMember([]);
    setCapturedPhoto(null);

    setToastMessage(`Data personel "${newUser.fullName}" berhasil disimpan.`);
  };

  // =========================================================================
  // SUBMIT HAPUS DATA (100% PARITY DENGAN patroli.site #modalHapus)
  // =========================================================================
  const handleConfirmHapus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword.trim()) {
      setDeleteError('Password Admin wajib diisi!');
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

  // =========================================================================
  // CASCADING ID CARD FILTER HANDLERS
  // =========================================================================
  const handleAreaChange = (area: string) => {
    setPrintArea(area);
    setPrintPosisi('');
    setPrintPersonilId('');
  };

  const handlePosisiChange = (posisi: string) => {
    setPrintPosisi(posisi);
    setPrintPersonilId('');
  };

  const availablePrintPersonnel = useMemo(() => {
    if (!printArea || !printPosisi) return [];
    return getPersonnelForIdCard(printArea, printPosisi);
  }, [printArea, printPosisi, getPersonnelForIdCard]);

  const handlePrintIdCard = () => {
    if (!printArea) {
      alert('Silakan pilih Area / Site terlebih dahulu.');
      return;
    }
    if (!printPosisi) {
      alert('Silakan pilih Posisi terlebih dahulu.');
      return;
    }
    if (!printPersonilId) {
      alert('Silakan pilih nama personel atau Semua Personel.');
      return;
    }

    if (printPersonilId === '__SEMUA__') {
      const allCards = getPersonnelForIdCard(printArea, printPosisi);
      if (allCards.length === 0) {
        alert('Tidak ada personil pada kriteria ini.');
        return;
      }
      setPrintIdCardTarget(allCards);
    } else {
      const target = users.find((u) => u.id === printPersonilId);
      if (target) setPrintIdCardTarget(target);
    }
  };

  // =========================================================================
  // TABLE FILTER & PAGINATION
  // =========================================================================
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

  const totalEntries = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  return (
    <div className="w-full space-y-4 font-sans text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-lg text-xs flex justify-between items-center shadow-sm animate-in fade-in">
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

      {/* =====================================================================
          HEADER BAR (100% PARITY DENGAN patroli.site NAVBAR & ACTIONS)
          ===================================================================== */}
      <div className="bg-[#007bff] text-white p-3.5 rounded-t-lg flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-xs">
        {/* KIRI: BUTTON TAMBAH & IMPORT */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            id="btn-tambah"
            onClick={() => setIsTambahModalOpen(true)}
            className="px-3 py-2 bg-[#212529] hover:bg-[#1a1e21] text-white font-bold rounded text-xs flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
          >
            <Users className="w-4 h-4 text-white" />
            <span className="tracking-wide uppercase">TAMBAH PERSONEL</span>
          </button>

          <button
            type="button"
            id="btn-import"
            onClick={() => setBulkImportType('PERSONIL')}
            className="px-3 py-2 bg-[#ffc107] hover:bg-[#e0a800] text-slate-900 font-bold rounded text-xs flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
          >
            <Upload className="w-4 h-4 text-slate-900" />
            <span className="tracking-wide uppercase">IMPORT PERSONEL</span>
          </button>
        </div>

        {/* KANAN: CASCADING DROPDOWNS UNTUK CETAK ID CARD */}
        <div className="flex items-center flex-wrap gap-2">
          <select
            id="cetak_area"
            value={printArea}
            onChange={(e) => handleAreaChange(e.target.value)}
            className="bg-white text-slate-800 text-xs rounded px-2.5 py-1.5 border border-slate-300 w-40 font-medium cursor-pointer"
          >
            <option value="">-- PILIH AREA --</option>
            {sites.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name.toUpperCase()}
              </option>
            ))}
          </select>

          <select
            id="cetak_posisi"
            value={printPosisi}
            onChange={(e) => handlePosisiChange(e.target.value)}
            disabled={!printArea}
            className="bg-white text-slate-800 text-xs rounded px-2.5 py-1.5 border border-slate-300 w-36 font-medium disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            <option value="">-- PILIH POSISI --</option>
            <option value="Security">SECURITY</option>
            <option value="Cleaning Service">CLEANING SERVICE</option>
            <option value="Driver">DRIVER</option>
            <option value="Staf">STAF</option>
            <option value="Admin Area">ADMIN AREA</option>
          </select>

          <select
            id="cetak_nama"
            value={printPersonilId}
            onChange={(e) => setPrintPersonilId(e.target.value)}
            disabled={!printPosisi}
            className="bg-white text-slate-800 text-xs rounded px-2.5 py-1.5 border border-slate-300 w-48 font-medium disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            <option value="">-- PILIH PERSONEL --</option>
            {availablePrintPersonnel.length > 0 && (
              <option value="__SEMUA__" className="font-bold text-[#007bff]">
                SEMUA PERSONEL
              </option>
            )}
            {availablePrintPersonnel.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName.toUpperCase()}
              </option>
            ))}
          </select>

          <button
            type="button"
            id="btn-cetak"
            onClick={handlePrintIdCard}
            disabled={!printPersonilId}
            className="px-3 py-1.5 bg-[#28a745] hover:bg-[#218838] text-white font-bold rounded text-xs flex items-center space-x-1.5 shadow-xs transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            <Printer className="w-4 h-4" />
            <span className="tracking-wide uppercase">CETAK ID CARD</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          TABEL DATA PERSONIL DENGAN HEADER FILTER (100% PARITY PATROLI.SITE)
          ===================================================================== */}
      <div className="bg-white border border-[#007bff]/40 rounded-b-lg shadow-xs p-4 space-y-4 -mt-4">
        <div className="overflow-x-auto rounded border border-[#007bff]/30">
          <table id="personil" className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#007bff] text-white text-center font-bold">
                {/* FILTER SEMUA LOKASI */}
                <th className="py-2 px-3 border-r border-[#007bff]/50 w-52">
                  <select
                    id="filter_lokasi"
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
                    id="filter_posisi"
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
                    id="filter_nama"
                    value={filterNama}
                    onChange={(e) => {
                      setFilterNama(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="SEMUA NAMA"
                    className="w-full bg-white text-slate-800 text-xs rounded px-2 py-1 border-2 border-[#dc3545] font-bold uppercase focus:outline-none placeholder:text-slate-500 text-center"
                  />
                </th>

                <th className="py-2 px-3 border-r border-[#007bff]/50 uppercase tracking-wider w-24 text-center">
                  FOTO
                </th>

                <th className="py-2 px-3 uppercase tracking-wider w-36 text-center">
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
                    className={
                      idx % 2 === 0
                        ? 'bg-white hover:bg-slate-50/80'
                        : 'bg-slate-50/50 hover:bg-slate-100/80'
                    }
                  >
                    <td className="py-3 px-3 text-center">
                      <small className="font-semibold text-[#007bff] tracking-wide block uppercase">
                        {u.siteName}
                      </small>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <p className="font-bold text-slate-900 text-xs mb-0.5 uppercase">
                        {u.securityRank}
                      </p>
                      <p
                        className={`text-[10px] font-bold uppercase ${
                          u.division === 'CLEANING'
                            ? 'text-[#28a745]'
                            : u.division === 'SECURITY'
                            ? 'text-[#007bff]'
                            : 'text-amber-600'
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
                      <small className="font-bold text-[#007bff] text-xs block uppercase">
                        {u.fullName}
                      </small>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{u.nik}</p>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="flex justify-center">
                        <img
                          src={u.photoUrl || 'https://patroli.site/img/noimage.png'}
                          alt={u.fullName}
                          className="w-14 h-14 object-cover rounded border border-slate-700 shadow-xs"
                          onError={(e) => {
                            (e.target as any).src = 'https://patroli.site/img/noimage.png';
                          }}
                        />
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center rounded shadow-xs" role="group">
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteTarget(u);
                            setAdminPassword('');
                            setDeleteError(null);
                          }}
                          className="btn-hapus px-2.5 py-1.5 bg-[#dc3545] hover:bg-[#c82333] text-white rounded-l text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <small>Hapus</small>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(u)}
                          className="edit-record px-2.5 py-1.5 bg-[#17a2b8] hover:bg-[#138496] text-white rounded-r text-xs font-bold transition flex items-center space-x-1 border-l border-white/20 cursor-pointer"
                        >
                          <Pencil className="w-3 h-3" />
                          <small className="uppercase">EDIT</small>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* BOTTOM PAGINATION */}
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

      {/* =====================================================================
          MODAL TAMBAH PERSONEL (100% PARITY DENGAN patroli.site #exampleModalCenter)
          ===================================================================== */}
      {isTambahModalOpen && (
        <div
          id="exampleModalCenter"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto"
        >
          <div className="bg-[#f5f7fb] rounded-xl max-w-5xl w-full shadow-2xl border-0 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="modal-header bg-[#0d6efd] text-white px-5 py-3.5 flex items-center justify-between shrink-0">
              <h5 className="modal-title font-semibold text-sm tracking-wide flex items-center space-x-2 text-white uppercase">
                <Users className="w-4 h-4 text-white" />
                <span>FORM TAMBAH PERSONEL</span>
              </h5>
              <button
                type="button"
                onClick={() => setIsTambahModalOpen(false)}
                className="close text-white hover:opacity-80 font-bold text-2xl leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <form
              id="formTambahPersonil"
              onSubmit={handleSubmitTambah}
              className="flex-1 flex flex-col overflow-hidden m-0"
            >
              <div className="modal-body flex-1 overflow-y-auto p-5 bg-[#f5f7fb]">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* ================= KIRI: DATA PERSONEL & GAJI (col-md-8) ================= */}
                  <div className="lg:col-span-8 space-y-4">
                    {/* PANEL DATA PERSONEL */}
                    <div className="panel-personil bg-white p-4.5 rounded-[10px] border border-[#e5eaf1] shadow-xs space-y-3.5">
                      <div className="judul-panel border-b border-[#e9edf3] pb-2.5 font-bold text-xs text-[#344054] uppercase tracking-wider flex items-center space-x-1.5">
                        <Contact className="w-4 h-4 text-[#0d6efd]" />
                        <span>DATA PERSONEL</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        <div className="form-group">
                          <label htmlFor="nama_anggota" className="block text-xs font-medium text-[#475467] mb-1">
                            Nama Personel
                          </label>
                          <input
                            type="text"
                            id="nama_anggota"
                            name="nama_anggota"
                            maxLength={100}
                            required
                            value={formNamaAnggota}
                            onChange={(e) => setFormNamaAnggota(e.target.value)}
                            placeholder="Nama lengkap personel"
                            className="form-control w-full min-h-[38px] px-3 py-1.5 text-xs bg-white text-[#344054] border border-[#d8dee8] rounded-[6px] focus:border-[#80bdff] focus:outline-none"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="jam_kerja" className="block text-xs font-medium text-[#475467] mb-1">
                            Jam Kerja Per Hari
                          </label>
                          <input
                            type="number"
                            id="jam_kerja"
                            name="jam_kerja"
                            min={8}
                            max={24}
                            step={1}
                            required
                            value={formJamKerja}
                            onChange={(e) => {
                              const v = e.target.value;
                              if (v !== '' && Number(v) > 24) setFormJamKerja(24);
                              else setFormJamKerja(v);
                            }}
                            onBlur={() => {
                              if (formJamKerja !== '' && Number(formJamKerja) < 8) setFormJamKerja(8);
                            }}
                            placeholder="Masukkan jam kerja (8–24 jam)"
                            className="form-control w-full min-h-[38px] px-3 py-1.5 text-xs bg-white text-[#344054] border border-[#d8dee8] rounded-[6px] focus:border-[#80bdff] focus:outline-none"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="username" className="block text-xs font-medium text-[#475467] mb-1">
                            Username Login
                          </label>
                          <input
                            type="text"
                            id="username"
                            name="username"
                            maxLength={15}
                            required
                            value={formUsername}
                            onChange={(e) => setFormUsername(e.target.value)}
                            placeholder="Buat username"
                            className="form-control w-full min-h-[38px] px-3 py-1.5 text-xs bg-white text-[#344054] border border-[#d8dee8] rounded-[6px] focus:border-[#80bdff] focus:outline-none"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="password" className="block text-xs font-medium text-[#475467] mb-1">
                            Password Login
                          </label>
                          <input
                            type="text"
                            id="password"
                            name="password"
                            maxLength={15}
                            required
                            value={formPassword}
                            onChange={(e) => setFormPassword(e.target.value)}
                            placeholder="Buat password"
                            className="form-control w-full min-h-[38px] px-3 py-1.5 text-xs bg-white text-[#344054] border border-[#d8dee8] rounded-[6px] focus:border-[#80bdff] focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* POSISI DROPDOWN */}
                      <div className="form-group">
                        <label htmlFor="posisi" className="block text-xs font-medium text-[#475467] mb-1">
                          Posisi
                        </label>
                        <select
                          id="posisi"
                          name="posisi"
                          required
                          value={formPosisi}
                          onChange={(e) => {
                            const newPosisi = e.target.value;
                            setFormPosisi(newPosisi);
                            setFormJabatanSelect('');
                            if (newPosisi === 'Admin Area') {
                              setFormLokasiAnggota('');
                            }
                          }}
                          className="custom-select w-full min-h-[38px] px-3 py-1.5 text-xs bg-white text-[#344054] border border-[#d8dee8] rounded-[6px] focus:border-[#80bdff] focus:outline-none cursor-pointer"
                        >
                          <option value="">Pilih Posisi</option>
                          <optgroup label="ADMIN AREA / SITE">
                            <option value="Admin Area">Admin Area / Pengelola Area (Klien)</option>
                          </optgroup>
                          <optgroup label="OPERASIONAL">
                            <option value="Security">Security</option>
                            <option value="Cleaning Service">Cleaning Service</option>
                            <option value="Driver">Driver</option>
                            <option value="Staf">Staf</option>
                          </optgroup>
                        </select>
                      </div>

                      {/* KONDISIONAL 1: JABATAN SECURITY */}
                      {formPosisi === 'Security' && (
                        <div id="wrap-jabatan" className="form-group animate-in fade-in">
                          <label htmlFor="jabatan_select" className="block text-xs font-medium text-[#475467] mb-1">
                            Jabatan Security <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="jabatan_select"
                            required
                            value={formJabatanSelect}
                            onChange={(e) => setFormJabatanSelect(e.target.value)}
                            className="custom-select w-full min-h-[38px] px-3 py-1.5 text-xs bg-white text-[#344054] border border-[#d8dee8] rounded-[6px] focus:border-[#80bdff] focus:outline-none cursor-pointer"
                          >
                            <option value="">-- Pilih Jabatan Security --</option>
                            <optgroup label="JABATAN PERSONEL">
                              <option value="anggota">Anggota / Personel</option>
                              <option value="komandan">Komandan</option>
                              <option value="chief">Chief</option>
                            </optgroup>
                          </select>
                        </div>
                      )}

                      {/* KONDISIONAL 2: AREA ADMIN AREA (MULTIPLE SITES) */}
                      {formPosisi === 'Admin Area' && (
                        <div id="wrap-lokasi-multiple" className="form-group animate-in fade-in">
                          <label htmlFor="lokasi_site_member" className="block text-xs font-medium text-[#475467] mb-1">
                            Area / Site yang Dikelola
                          </label>
                          <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 border border-[#d8dee8] rounded-[6px]">
                            {sites.map((s) => (
                              <label
                                key={s.id}
                                className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={formLokasiMember.includes(s.name)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFormLokasiMember((prev) => [...prev, s.name]);
                                    } else {
                                      setFormLokasiMember((prev) => prev.filter((name) => name !== s.name));
                                    }
                                  }}
                                  className="rounded text-blue-600 focus:ring-0"
                                />
                                <span className="uppercase text-[11px] font-semibold">{s.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* KONDISIONAL 3: AREA PENEMPATAN SINGLE SITE */}
                      {formPosisi &&
                        formPosisi !== 'Admin Area' &&
                        (formPosisi !== 'Security' || formJabatanSelect !== '') && (
                          <div id="wrap-lokasi-single" className="form-group animate-in fade-in">
                            <label htmlFor="lokasi_site_anggota" className="block text-xs font-medium text-[#475467] mb-1">
                              Area / Site Penempatan
                            </label>
                            <select
                              id="lokasi_site_anggota"
                              name="lokasi_site_anggota"
                              required
                              value={formLokasiAnggota}
                              onChange={(e) => setFormLokasiAnggota(e.target.value)}
                              className="custom-select w-full min-h-[38px] px-3 py-1.5 text-xs bg-white text-[#344054] border border-[#d8dee8] rounded-[6px] focus:border-[#80bdff] focus:outline-none uppercase cursor-pointer"
                            >
                              <option value="">Pilih Area / Site Penempatan</option>
                              {sites.map((s) => (
                                <option key={s.id} value={s.name}>
                                  {s.name.toUpperCase()}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                    </div>

                    {/* PANEL GAJI, TUNJANGAN & POTONGAN */}
                    <div className="panel-personil bg-white p-4.5 rounded-[10px] border border-[#e5eaf1] shadow-xs space-y-3.5">
                      <div className="judul-panel border-b border-[#e9edf3] pb-2.5 font-bold text-xs text-[#344054] uppercase tracking-wider flex items-center space-x-1.5">
                        <Banknote className="w-4 h-4 text-[#28a745]" />
                        <span>GAJI, TUNJANGAN &amp; POTONGAN</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        <div className="form-group">
                          <label htmlFor="gaji_pokok" className="block text-xs font-medium text-[#475467] mb-1">
                            Gaji Bulanan
                          </label>
                          <div className="flex rounded-[6px] overflow-hidden border border-[#d8dee8] focus-within:border-[#80bdff]">
                            <span className="bg-[#f1f4f8] text-[#475467] px-3 py-2 text-xs font-semibold border-r border-[#d8dee8] flex items-center">
                              Rp
                            </span>
                            <input
                              type="text"
                              id="gaji_pokok"
                              name="gaji_pokok"
                              inputMode="numeric"
                              value={formGajiPokok}
                              onChange={(e) => setFormGajiPokok(formatRupiah(e.target.value))}
                              className="format-uang w-full px-3 py-1.5 text-xs bg-white text-[#344054] focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label htmlFor="tunjangan" className="block text-xs font-medium text-[#475467] mb-1">
                            Tunjangan Bulanan
                          </label>
                          <div className="flex rounded-[6px] overflow-hidden border border-[#d8dee8] focus-within:border-[#80bdff]">
                            <span className="bg-[#f1f4f8] text-[#475467] px-3 py-2 text-xs font-semibold border-r border-[#d8dee8] flex items-center">
                              Rp
                            </span>
                            <input
                              type="text"
                              id="tunjangan"
                              name="tunjangan"
                              inputMode="numeric"
                              value={formTunjangan}
                              onChange={(e) => setFormTunjangan(formatRupiah(e.target.value))}
                              className="format-uang w-full px-3 py-1.5 text-xs bg-white text-[#344054] focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label htmlFor="lembur" className="block text-xs font-medium text-[#475467] mb-1">
                            Biaya Per Lembur
                          </label>
                          <div className="flex rounded-[6px] overflow-hidden border border-[#d8dee8] focus-within:border-[#80bdff]">
                            <span className="bg-[#f1f4f8] text-[#475467] px-3 py-2 text-xs font-semibold border-r border-[#d8dee8] flex items-center">
                              Rp
                            </span>
                            <input
                              type="text"
                              id="lembur"
                              name="lembur"
                              inputMode="numeric"
                              value={formLembur}
                              onChange={(e) => setFormLembur(formatRupiah(e.target.value))}
                              className="format-uang w-full px-3 py-1.5 text-xs bg-white text-[#344054] focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label htmlFor="potongan_bpjs" className="block text-xs font-medium text-[#475467] mb-1">
                            Potongan BPJS
                          </label>
                          <div className="flex rounded-[6px] overflow-hidden border border-[#d8dee8] focus-within:border-[#80bdff]">
                            <span className="bg-[#f1f4f8] text-[#475467] px-3 py-2 text-xs font-semibold border-r border-[#d8dee8] flex items-center">
                              Rp
                            </span>
                            <input
                              type="text"
                              id="potongan_bpjs"
                              name="potongan_bpjs"
                              inputMode="numeric"
                              value={formPotonganBpjs}
                              onChange={(e) => setFormPotonganBpjs(formatRupiah(e.target.value))}
                              className="format-uang w-full px-3 py-1.5 text-xs bg-white text-[#344054] focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label htmlFor="potongan_tidak_masuk" className="block text-xs font-medium text-[#475467] mb-1">
                            Potongan Ketidakhadiran
                          </label>
                          <div className="flex rounded-[6px] overflow-hidden border border-[#d8dee8] focus-within:border-[#80bdff]">
                            <span className="bg-[#f1f4f8] text-[#475467] px-3 py-2 text-xs font-semibold border-r border-[#d8dee8] flex items-center">
                              Rp
                            </span>
                            <input
                              type="text"
                              id="potongan_tidak_masuk"
                              name="potongan_tidak_masuk"
                              inputMode="numeric"
                              value={formPotonganTidakMasuk}
                              onChange={(e) => setFormPotonganTidakMasuk(formatRupiah(e.target.value))}
                              className="format-uang w-full px-3 py-1.5 text-xs bg-white text-[#344054] focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label htmlFor="potongan_lupa_absensi" className="block text-xs font-medium text-[#475467] mb-1">
                            Potongan Lupa Absensi Pulang
                          </label>
                          <div className="flex rounded-[6px] overflow-hidden border border-[#d8dee8] focus-within:border-[#80bdff]">
                            <span className="bg-[#f1f4f8] text-[#475467] px-3 py-2 text-xs font-semibold border-r border-[#d8dee8] flex items-center">
                              Rp
                            </span>
                            <input
                              type="text"
                              id="potongan_lupa_absensi"
                              name="potongan_lupa_absensi"
                              inputMode="numeric"
                              value={formPotonganLupaAbsensi}
                              onChange={(e) => setFormPotonganLupaAbsensi(formatRupiah(e.target.value))}
                              className="format-uang w-full px-3 py-1.5 text-xs bg-white text-[#344054] focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ================= KANAN: PANEL FOTO & LIVE WEBCAM (col-md-4) ================= */}
                  <div className="lg:col-span-4">
                    <div className="panel-kamera bg-white p-4.5 rounded-[10px] border border-[#e5eaf1] shadow-xs text-center space-y-3">
                      <div className="judul-panel text-left border-b border-[#e9edf3] pb-2 font-bold text-xs text-[#344054] uppercase tracking-wider flex items-center space-x-1.5">
                        <Camera className="w-4 h-4 text-[#ffc107]" />
                        <span>FOTO PERSONEL</span>
                      </div>

                      {/* Camera View Box (320x240 Aspect Ratio 4:3) */}
                      <div className="camera-box relative w-full max-w-[320px] aspect-[4/3] mx-auto overflow-hidden rounded-xl border-2 border-[#e2e8f0] bg-[#172033] flex items-center justify-center">
                        {/* 1. Captured Photo Preview */}
                        {capturedPhoto && (
                          <img
                            id="preview-foto"
                            src={capturedPhoto}
                            alt="Preview foto personel"
                            className="absolute inset-0 w-full h-full object-cover z-20"
                          />
                        )}

                        {/* 2. Video Stream Element: ALWAYS MOUNTED to guarantee instant ref binding */}
                        <video
                          ref={(el) => {
                            videoRef.current = el;
                            if (el && streamRef.current && el.srcObject !== streamRef.current) {
                              el.srcObject = streamRef.current;
                              el.play().catch(() => {});
                            }
                          }}
                          autoPlay
                          playsInline
                          muted
                          className={`w-full h-full object-cover transition-opacity duration-200 ${
                            capturedPhoto ? 'hidden' : 'block'
                          }`}
                        />

                        {/* 3. Loading Overlay */}
                        {cameraLoading && !isCameraActive && !capturedPhoto && (
                          <div className="absolute inset-0 bg-[#172033]/90 flex flex-col items-center justify-center text-slate-300 space-y-2 z-10">
                            <Camera className="w-8 h-8 animate-pulse text-[#ffc107]" />
                            <p className="text-[11px] font-medium">Mengaktifkan kamera...</p>
                          </div>
                        )}

                        {/* 4. Error / Permissions Overlay */}
                        {cameraError && !isCameraActive && !capturedPhoto && (
                          <div className="absolute inset-0 bg-[#172033] flex flex-col items-center justify-center p-4 text-slate-400 space-y-2 z-10 text-center">
                            <Camera className="w-10 h-10 mx-auto opacity-50" />
                            <p className="text-[11px] leading-tight text-amber-200">
                              Kamera belum aktif atau izin browser belum diberikan.
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setCameraLoading(true);
                                setCameraError(null);
                                navigator.mediaDevices
                                  ?.getUserMedia({ video: true, audio: false })
                                  .then((stream) => {
                                    streamRef.current = stream;
                                    setIsCameraActive(true);
                                    setCameraLoading(false);
                                    if (videoRef.current) {
                                      videoRef.current.srcObject = stream;
                                      videoRef.current.play().catch(() => {});
                                    }
                                  })
                                  .catch((err) => {
                                    setCameraLoading(false);
                                    setCameraError(err?.message || 'Gagal mengakses kamera');
                                  });
                              }}
                              className="text-[10px] text-[#ffc107] font-semibold underline hover:text-amber-300 pt-1 cursor-pointer"
                            >
                              Hubungkan Ulang Kamera
                            </button>
                          </div>
                        )}

                        <canvas ref={canvasRef} className="hidden" />
                      </div>

                      {/* Camera Action Buttons */}
                      <div className="tombol-kamera space-y-1.5 pt-1">
                        {!capturedPhoto ? (
                          <button
                            type="button"
                            id="btn-capture"
                            onClick={handleSnapPhoto}
                            className="btn btn-warning w-full py-2 px-3 bg-[#ffc107] hover:bg-[#e0a800] text-slate-900 font-bold rounded-[7px] text-xs flex items-center justify-center space-x-1.5 shadow-xs transition cursor-pointer"
                          >
                            <Camera className="w-4 h-4" />
                            <span>Ambil Foto</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            id="btn-retake"
                            onClick={handleRetakePhoto}
                            className="btn btn-info w-full py-2 px-3 bg-[#17a2b8] hover:bg-[#138496] text-white font-bold rounded-[7px] text-xs flex items-center justify-center space-x-1.5 shadow-xs transition cursor-pointer"
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span>Ambil Ulang Foto</span>
                          </button>
                        )}
                      </div>

                      {/* Info Login Card */}
                      <div className="info-login bg-[#fff4e5] text-[#8a4b08] p-2.5 rounded-[7px] text-[11px] leading-relaxed text-left flex items-start space-x-1.5">
                        <Info className="w-4 h-4 shrink-0 text-[#8a4b08] mt-0.5" />
                        <span>
                          Username dan password digunakan untuk login masing-masing personel.
                        </span>
                      </div>

                      {/* Red Warning Text */}
                      <div className="text-center text-[#dc3545] text-[11px] font-medium leading-normal pt-1 flex items-center justify-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#dc3545]" />
                        <span>Ambil foto sebelum menyimpan data personel.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FOOTER DI LUAR AREA SCROLL (100% PARITY PATROLI.SITE) */}
              <div className="modal-footer bg-white border-t border-[#e5e7eb] px-5 py-3 flex justify-end space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsTambahModalOpen(false)}
                  className="btn btn-secondary px-4 py-2 bg-[#6c757d] hover:bg-[#5a6268] text-white font-bold rounded-[7px] text-xs flex items-center space-x-1 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>Batal</span>
                </button>

                <button
                  type="submit"
                  className="btn btn-success px-4 py-2 bg-[#28a745] hover:bg-[#218838] text-white font-bold rounded-[7px] text-xs flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Personel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL EDIT PERSONEL (100% PARITY DENGAN patroli.site personil_edit.php)
          ===================================================================== */}
      {editTarget && (
        <div
          id="myModal"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto"
        >
          <div className="bg-[#f5f7fb] rounded-xl max-w-5xl w-full shadow-2xl border-0 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto flex flex-col max-h-[92vh]">
            {/* Header bg-info */}
            <div className="modal-header bg-[#17a2b8] text-white px-5 py-3 flex items-center justify-between shrink-0">
              <h4 className="modal-title font-semibold text-sm tracking-wide flex items-center space-x-2">
                <Pencil className="w-4 h-4 text-white" />
                <span>Form Edit Personel</span>
              </h4>
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                className="close text-white hover:opacity-80 font-bold text-2xl leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <form
              className="edit-personil-form flex-1 flex flex-col overflow-hidden m-0"
              onSubmit={handleSaveEdit}
            >
              <div className="card-body flex-1 overflow-y-auto p-4 bg-[#f5f7fb] space-y-3.5">
                {/* 3 KOLOM UTAMA */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {/* KOLOM 1: INFORMASI PERSONIL */}
                  <div className="edit-section bg-white p-3.5 rounded-[9px] border border-[#e5e7eb] space-y-2.5">
                    <div className="section-title border-b border-[#e5e7eb] pb-2 font-semibold text-xs text-[#344054] flex items-center space-x-1.5">
                      <User className="w-4 h-4 text-[#0d6efd]" />
                      <span>Informasi Personil</span>
                    </div>

                    <div className="form-group">
                      <label className="form-label block text-[11px] font-medium text-[#667085] mb-1">
                        Nama Personil
                      </label>
                      <input
                        type="text"
                        required
                        value={editNamaAnggota}
                        onChange={(e) => setEditNamaAnggota(e.target.value)}
                        className="form-control text-uppercase w-full min-h-[35px] px-2.5 py-1 text-xs bg-white text-[#344054] border border-[#d8dee8] rounded-[6px]"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label block text-[11px] font-medium text-[#667085] mb-1">
                        Posisi Personil
                      </label>
                      <p className="current-position text-[10px] text-[#667085] mb-1">
                        Posisi saat ini: <strong className="text-[#0d6efd]">{editPosisi}</strong>
                      </p>
                      <select
                        value={editPosisi}
                        onChange={(e) => setEditPosisi(e.target.value)}
                        className="custom-select text-uppercase w-full min-h-[35px] px-2.5 py-1 text-xs bg-white text-[#344054] border border-[#d8dee8] rounded-[6px]"
                      >
                        <option value="Security">Security</option>
                        <option value="Cleaning Service">Cleaning Service</option>
                        <option value="Driver">Driver</option>
                        <option value="Staf">Staf</option>
                      </select>
                    </div>

                    {editPosisi === 'Security' && (
                      <div className="form-group" id="jabatan-wrapper">
                        <label className="form-label block text-[11px] font-medium text-[#667085] mb-1">
                          Jabatan
                        </label>
                        <select
                          value={editJabatan}
                          onChange={(e) => setEditJabatan(e.target.value)}
                          className="custom-select text-uppercase w-full min-h-[35px] px-2.5 py-1 text-xs bg-white text-[#344054] border border-[#d8dee8] rounded-[6px]"
                        >
                          <option value="anggota">Anggota</option>
                          <option value="komandan">Komandan</option>
                          <option value="chief">Chief</option>
                        </select>
                      </div>
                    )}

                    <div className="form-group">
                      <label className="form-label block text-[11px] font-medium text-[#667085] mb-1">
                        Username
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={editUsername}
                        className="form-control w-full min-h-[35px] px-2.5 py-1 text-xs bg-[#f3f4f6] text-[#344054] border border-[#d8dee8] rounded-[6px] cursor-not-allowed"
                      />
                      <small className="form-text text-[#667085] text-[10px] block mt-0.5">
                        Username tidak dapat diubah dari halaman ini.
                      </small>
                    </div>

                    <div className="form-group">
                      <label className="form-label block text-[11px] font-medium text-[#667085] mb-1">
                        Password Baru
                      </label>
                      <input
                        type="password"
                        value={editPasswordBaru}
                        onChange={(e) => setEditPasswordBaru(e.target.value)}
                        placeholder="Kosongkan jika tidak diganti"
                        className="form-control w-full min-h-[35px] px-2.5 py-1 text-xs bg-white text-[#344054] border border-[#d8dee8] rounded-[6px]"
                      />
                      <small className="form-text text-[#667085] text-[10px] block mt-0.5">
                        Isi hanya jika ingin mengganti password.
                      </small>
                    </div>
                  </div>

                  {/* KOLOM 2: AREA DAN JAM KERJA */}
                  <div className="edit-section bg-white p-3.5 rounded-[9px] border border-[#e5e7eb] space-y-2.5">
                    <div className="section-title border-b border-[#e5e7eb] pb-2 font-semibold text-xs text-[#344054] flex items-center space-x-1.5">
                      <MapPin className="w-4 h-4 text-[#0d6efd]" />
                      <span>Area dan Jam Kerja</span>
                    </div>

                    <div className="form-group">
                      <label className="form-label block text-[11px] font-medium text-[#667085] mb-1">
                        Area Penempatan
                      </label>
                      <select
                        value={editLokasiSiteBaru}
                        onChange={(e) => setEditLokasiSiteBaru(e.target.value)}
                        className="custom-select text-uppercase w-full min-h-[35px] px-2.5 py-1 text-xs bg-white text-[#344054] border border-[#d8dee8] rounded-[6px]"
                      >
                        {sites.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      <small className="form-text text-[#667085] text-[10px] block mt-0.5">
                        Pilih area penempatan personil.
                      </small>
                    </div>

                    <div className="form-group">
                      <label className="form-label block text-[11px] font-medium text-[#667085] mb-1">
                        Jumlah Jam Kerja per Hari
                      </label>
                      <div className="flex rounded-[6px] overflow-hidden border border-[#d8dee8]">
                        <input
                          type="number"
                          min={8}
                          max={24}
                          step={1}
                          required
                          value={editJamKerja}
                          onChange={(e) => setEditJamKerja(e.target.value)}
                          placeholder="8–24"
                          className="form-control w-full min-h-[35px] px-2.5 py-1 text-xs bg-white text-[#344054] focus:outline-none"
                        />
                        <span className="bg-[#f1f4f8] text-[#667085] px-3 py-1 text-xs font-semibold border-l border-[#d8dee8] flex items-center">
                          Jam
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* KOLOM 3: FOTO PERSONIL */}
                  <div className="edit-section bg-white p-3.5 rounded-[9px] border border-[#e5e7eb] space-y-2.5">
                    <div className="section-title border-b border-[#e5e7eb] pb-2 font-semibold text-xs text-[#344054] flex items-center space-x-1.5">
                      <Camera className="w-4 h-4 text-[#0d6efd]" />
                      <span>Foto Personil</span>
                    </div>

                    <div className="form-group">
                      <label className="form-label block text-[11px] font-medium text-[#667085] mb-1">
                        Foto Saat Ini
                      </label>
                      <div className="photo-preview flex items-center gap-2.5 p-2.5 border border-dashed border-[#d8dee8] rounded-[7px] bg-[#f8fafc]">
                        <img
                          src={editFotoBaru || editFotoLama}
                          alt="Foto personil"
                          className="w-[65px] h-[82px] object-cover rounded border border-[#d8dee8] bg-white"
                          onError={(e) => {
                            (e.target as any).src = 'https://patroli.site/img/noimage.png';
                          }}
                        />
                        <div className="photo-caption text-[10px] text-[#667085] leading-relaxed">
                          <div className="text-emerald-600 font-bold mb-1 flex items-center space-x-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Foto tersimpan</span>
                          </div>
                          Foto lama tetap digunakan jika tidak mengganti foto.
                        </div>
                      </div>
                    </div>

                    <div className="form-group mb-0">
                      <label className="form-label block text-[11px] font-medium text-[#667085] mb-1">
                        Ganti Foto
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => setEditFotoBaru(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="form-control text-xs w-full py-1 px-2 border border-[#d8dee8] rounded-[6px]"
                      />
                      <small className="form-text text-[#667085] text-[10px] block mt-0.5">
                        Kosongkan jika foto tidak ingin diganti.
                      </small>
                    </div>
                  </div>
                </div>

                {/* BARIS PENGATURAN GAJI DAN POTONGAN (6 KOLOM) */}
                <div className="salary-section bg-white p-3.5 rounded-[9px] border border-[#e5e7eb] space-y-2.5">
                  <div className="section-title border-b border-[#e5e7eb] pb-2 font-semibold text-xs text-[#344054] flex items-center space-x-1.5">
                    <Banknote className="w-4 h-4 text-[#28a745]" />
                    <span>Pengaturan Gaji dan Potongan</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
                    <div className="form-group">
                      <label className="form-label block text-[11px] font-medium text-[#667085] mb-1">
                        Gaji Bulanan
                      </label>
                      <div className="flex rounded-[6px] overflow-hidden border border-[#d8dee8]">
                        <span className="bg-[#f1f4f8] text-[#667085] px-2 py-1 text-xs font-semibold border-r border-[#d8dee8] flex items-center">
                          Rp
                        </span>
                        <input
                          type="text"
                          value={editGapok}
                          onChange={(e) => setEditGapok(formatRupiah(e.target.value))}
                          className="format-uang w-full px-2 py-1 text-xs bg-white text-[#344054] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label block text-[11px] font-medium text-[#667085] mb-1">
                        Tunjangan Bulanan
                      </label>
                      <div className="flex rounded-[6px] overflow-hidden border border-[#d8dee8]">
                        <span className="bg-[#f1f4f8] text-[#667085] px-2 py-1 text-xs font-semibold border-r border-[#d8dee8] flex items-center">
                          Rp
                        </span>
                        <input
                          type="text"
                          value={editTunjangan}
                          onChange={(e) => setEditTunjangan(formatRupiah(e.target.value))}
                          className="format-uang w-full px-2 py-1 text-xs bg-white text-[#344054] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label block text-[11px] font-medium text-[#667085] mb-1">
                        Biaya per Lembur
                      </label>
                      <div className="flex rounded-[6px] overflow-hidden border border-[#d8dee8]">
                        <span className="bg-[#f1f4f8] text-[#667085] px-2 py-1 text-xs font-semibold border-r border-[#d8dee8] flex items-center">
                          Rp
                        </span>
                        <input
                          type="text"
                          value={editLembur}
                          onChange={(e) => setEditLembur(formatRupiah(e.target.value))}
                          className="format-uang w-full px-2 py-1 text-xs bg-white text-[#344054] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label block text-[11px] font-medium text-[#667085] mb-1">
                        Potongan BPJS
                      </label>
                      <div className="flex rounded-[6px] overflow-hidden border border-[#d8dee8]">
                        <span className="bg-[#f1f4f8] text-[#667085] px-2 py-1 text-xs font-semibold border-r border-[#d8dee8] flex items-center">
                          Rp
                        </span>
                        <input
                          type="text"
                          value={editPotBpjs}
                          onChange={(e) => setEditPotBpjs(formatRupiah(e.target.value))}
                          className="format-uang w-full px-2 py-1 text-xs bg-white text-[#344054] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label block text-[11px] font-medium text-[#667085] mb-1">
                        Potongan Ketidakhadiran
                      </label>
                      <div className="flex rounded-[6px] overflow-hidden border border-[#d8dee8]">
                        <span className="bg-[#f1f4f8] text-[#667085] px-2 py-1 text-xs font-semibold border-r border-[#d8dee8] flex items-center">
                          Rp
                        </span>
                        <input
                          type="text"
                          value={editPotIzin}
                          onChange={(e) => setEditPotIzin(formatRupiah(e.target.value))}
                          className="format-uang w-full px-2 py-1 text-xs bg-white text-[#344054] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label block text-[11px] font-medium text-[#667085] mb-1">
                        Potongan Lupa Absensi
                      </label>
                      <div className="flex rounded-[6px] overflow-hidden border border-[#d8dee8]">
                        <span className="bg-[#f1f4f8] text-[#667085] px-2 py-1 text-xs font-semibold border-r border-[#d8dee8] flex items-center">
                          Rp
                        </span>
                        <input
                          type="text"
                          value={editPotLupa}
                          onChange={(e) => setEditPotLupa(formatRupiah(e.target.value))}
                          className="format-uang w-full px-2 py-1 text-xs bg-white text-[#344054] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="modal-footer bg-white border-t border-[#e5e7eb] px-4 py-2.5 flex justify-end space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="btn btn-secondary px-4 py-2 bg-[#6c757d] hover:bg-[#5a6268] text-white font-bold rounded-[6px] text-xs flex items-center space-x-1 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>Batal</span>
                </button>

                <button
                  type="submit"
                  className="btn btn-primary px-4 py-2 bg-[#0d6efd] hover:bg-[#0b5ed7] text-white font-bold rounded-[6px] text-xs flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL HAPUS DATA (100% PARITY DENGAN patroli.site #modalHapus)
          ===================================================================== */}
      {deleteTarget && (
        <div
          id="modalHapus"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3"
        >
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl border-0 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header bg-danger */}
            <div className="modal-header bg-[#dc3545] text-white px-5 py-3 flex items-center justify-between">
              <h5 className="modal-title font-semibold text-sm tracking-wide flex items-center space-x-2 text-white">
                <AlertTriangle className="w-4 h-4 text-white" />
                <span>Konfirmasi Hapus Data</span>
              </h5>
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget(null);
                  setAdminPassword('');
                  setDeleteError(null);
                }}
                className="close text-white hover:opacity-80 font-bold text-2xl leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <form id="formHapus" onSubmit={handleConfirmHapus} className="p-5 space-y-4">
              <div className="alert alert-danger bg-[#f8d7da] border border-[#f5c6cb] text-[#721c24] p-3.5 rounded text-xs space-y-2">
                <h6 className="font-bold text-xs uppercase flex items-center space-x-1.5 text-[#721c24]">
                  <AlertTriangle className="w-4 h-4 text-[#dc3545]" />
                  <span>PERINGATAN PENGHAPUSAN DATA</span>
                </h6>

                <p>Anda akan menghapus data personel:</p>
                <div className="p-2 bg-white rounded border border-[#f5c6cb] text-center">
                  <strong id="hapus_nama" className="font-bold text-sm text-[#dc3545] uppercase">
                    {deleteTarget.fullName}
                  </strong>
                </div>

                <hr className="border-[#f5c6cb] my-2" />

                <small className="block text-slate-700 leading-relaxed text-[11px]">
                  Tindakan ini akan menghapus seluruh data terkait seperti:
                  <br />• Data absensi
                  <br />• Data patroli
                  <br />• Riwayat aktivitas personel
                  <br />
                  <br />
                  Data yang sudah dihapus tidak dapat dikembalikan. Pastikan tindakan ini sudah benar.
                </small>
              </div>

              <div className="form-group space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Password Admin</label>
                <input
                  type="password"
                  id="admin_password_confirm"
                  name="password"
                  required
                  value={adminPassword}
                  onChange={(e) => {
                    setAdminPassword(e.target.value);
                    setDeleteError(null);
                  }}
                  placeholder="Masukkan password Anda"
                  className="form-control w-full min-h-[38px] px-3 py-1.5 text-xs bg-white text-[#344054] border border-[#d8dee8] rounded-[6px] focus:border-[#dc3545] focus:outline-none"
                  autoFocus
                />
                {deleteError && (
                  <p className="text-[11px] text-[#dc3545] font-semibold mt-1">{deleteError}</p>
                )}
              </div>

              <div className="modal-footer flex justify-end space-x-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteTarget(null);
                    setAdminPassword('');
                    setDeleteError(null);
                  }}
                  className="btn btn-secondary px-4 py-2 bg-[#6c757d] hover:bg-[#5a6268] text-white font-bold rounded-[6px] text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isDeleting}
                  className="btn btn-danger px-4 py-2 bg-[#dc3545] hover:bg-[#c82333] text-white font-bold rounded-[6px] text-xs cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? 'Memverifikasi...' : 'Ya, Hapus Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
