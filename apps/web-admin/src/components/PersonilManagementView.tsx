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
  LayoutGrid,
  List,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
} from 'lucide-react';
import { useData, UserItem } from '../lib/DataContext';
import { SurfaceCard } from './ui/SurfaceCard';
import { SkeuomorphicButton } from './ui/SkeuomorphicButton';
import { InsetInput } from './ui/InsetInput';
import { StatusBadge } from './ui/StatusBadge';

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
  const [pageSize, setPageSize] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'TABLE' | 'CARD'>('TABLE'); // Default TABLE matching visual reference

  // Cascading Filter Cetak ID Card
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

  // Helper for Rupiah formatting
  const formatRupiah = (val: number | string): string => {
    const clean = String(val).replace(/\D/g, '');
    if (!clean) return '';
    return new Intl.NumberFormat('id-ID').format(Number(clean));
  };

  const parseRupiah = (val: string): number => {
    return Number(val.replace(/\D/g, '')) || 0;
  };

  // Form Tambah Personil state
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
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
            audio: false,
          });
        } catch {
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

  // Snap photo
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
      setCapturedPhoto('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=320&auto=format&fit=crop&q=80');
    }
  };

  const handleRetakePhoto = () => {
    setCapturedPhoto(null);
    if (videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      videoRef.current.play().catch(() => {});
    }
  };

  // Form Edit Personil state
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

  const handleOpenEdit = (user: UserItem) => {
    setEditTarget(user);
    setEditNamaAnggota(user.fullName);
    setEditUsername(user.username);
    setEditPasswordBaru('');
    setEditFotoLama(user.photoUrl || 'https://patroli.site/img/noimage.png');
    setEditFotoBaru(null);
    setEditJamKerja(user.workingHoursPerDay || 8);
    setEditLokasiSiteBaru(user.siteName || sites[0]?.name || '');

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

    setEditGapok(formatRupiah(user.gajiPokok || 4500000));
    setEditTunjangan(formatRupiah(user.tunjangan || 500000));
    setEditLembur(formatRupiah(user.lemburPerJam || 25000));
    setEditPotBpjs(formatRupiah(user.potonganBpjs || 50000));
    setEditPotIzin(formatRupiah(user.potonganTidakMasuk ?? user.potonganAlpa ?? 100000));
    setEditPotLupa(formatRupiah(user.potonganLupaAbsensi ?? user.potonganLupaAbsen ?? 25000));
  };

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

    const updatedUser: UserItem = {
      ...editTarget,
      fullName: editNamaAnggota.trim(),
      username: editUsername.trim(),
      password: editPasswordBaru.trim() ? editPasswordBaru.trim() : editTarget.password,
      siteName: editLokasiSiteBaru,
      division: divMapped,
      role: roleMapped,
      securityRank: editJabatan.toUpperCase(),
      workingHoursPerDay: Number(editJamKerja) || 8,
      photoUrl: editFotoBaru || editFotoLama,
      gajiPokok: parseRupiah(editGapok),
      tunjangan: parseRupiah(editTunjangan),
      lemburPerJam: parseRupiah(editLembur),
      potonganBpjs: parseRupiah(editPotBpjs),
      potonganTidakMasuk: parseRupiah(editPotIzin),
      potonganLupaAbsensi: parseRupiah(editPotLupa),
    };

    updateUser(updatedUser);
    setEditTarget(null);
    setToastMessage(`Perubahan data personel "${updatedUser.fullName}" berhasil disimpan.`);
  };

  const handleSubmitTambah = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNamaAnggota || !formUsername || !formPassword || !formPosisi) {
      alert('Mohon isi nama, username, password, dan posisi personel!');
      return;
    }

    const targetSiteName = formLokasiAnggota || sites[0]?.name || 'Site Utama';
    const targetSite = sites.find((s) => s.name === targetSiteName);

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

    const newNik = `P-${String(users.length + 1).padStart(3, '0')}`;

    const newUser: UserItem = {
      id: `user-${Date.now()}`,
      nik: newNik,
      fullName: formNamaAnggota.trim(),
      username: formUsername.trim(),
      password: formPassword.trim(),
      role: roleMapped,
      division: divMapped,
      securityRank: formJabatanSelect ? formJabatanSelect.toUpperCase() : 'ANGGOTA',
      siteName: targetSiteName,
      siteId: targetSite?.id,
      photoUrl: capturedPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      workingHoursPerDay: Number(formJamKerja) || 8,
      gajiPokok: parseRupiah(formGajiPokok) || 4800000,
      tunjangan: parseRupiah(formTunjangan) || 600000,
      lemburPerJam: parseRupiah(formLembur) || 25000,
      potonganBpjs: parseRupiah(formPotonganBpjs) || 150000,
      potonganTidakMasuk: parseRupiah(formPotonganTidakMasuk) || 150000,
      potonganLupaAbsensi: parseRupiah(formPotonganLupaAbsensi) || 50000,
    };

    addUser(newUser);
    setIsTambahModalOpen(false);

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
    if (!printArea || !printPosisi || !printPersonilId) {
      alert('Silakan lengkapi pilihan Area, Posisi, dan Personel terlebih dahulu.');
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

  // Table filter
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
      const matchNama = filterNama
        ? u.fullName?.toLowerCase().includes(filterNama.toLowerCase()) ||
          u.nik?.toLowerCase().includes(filterNama.toLowerCase())
        : true;
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
    <div className="w-full space-y-4 font-sans select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs flex justify-between items-center shadow-sm animate-in fade-in">
          <span className="font-semibold flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP CONTROLS & FILTER BAR (Matching Visual Reference Image) */}
      <SurfaceCard variant="elevated" padding="md" className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Personel
            </h1>
            <div className="text-[11px] text-slate-500 flex items-center space-x-1.5 mt-0.5">
              <span className="font-semibold text-slate-700">Dashboard</span>
              <span>&gt; Personel</span>
            </div>
          </div>

          {/* Action buttons & View mode */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Search well matching reference */}
            <div className="w-44 sm:w-56">
              <InsetInput
                type="text"
                placeholder="Cari nama personel..."
                icon={Search}
                value={filterNama}
                onChange={(e) => {
                  setFilterNama(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Area filter */}
            <div className="relative">
              <select
                value={filterLokasi}
                onChange={(e) => {
                  setFilterLokasi(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-slate-50 hover:bg-white text-slate-700 text-xs font-semibold pl-3 pr-8 py-2 rounded-xl border border-slate-200/90 shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">Semua Area</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
            </div>

            {/* + Tambah Personel */}
            <SkeuomorphicButton
              variant="primary"
              size="md"
              icon={Plus}
              onClick={() => setIsTambahModalOpen(true)}
            >
              Tambah Personel
            </SkeuomorphicButton>

            {/* View Mode Toggle */}
            <div className="bg-slate-100 p-0.5 rounded-xl flex items-center text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('TABLE')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'TABLE' ? 'bg-white text-slate-900 shadow-skeuo-button-secondary font-bold' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Tampilan Tabel"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('CARD')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'CARD' ? 'bg-white text-slate-900 shadow-skeuo-button-secondary font-bold' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Tampilan Kartu"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Utility Strip: ID Card Batch Generator & Division Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium">Filter Divisi:</span>
            <div className="bg-slate-100 p-0.5 rounded-xl flex items-center text-xs font-semibold">
              {(['semua', 'Security', 'Cleaning Service', 'Driver'] as const).map((div) => (
                <button
                  key={div}
                  type="button"
                  onClick={() => {
                    setFilterPosisi(div);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    filterPosisi === div
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {div === 'semua' ? 'Semua Divisi' : div}
                </button>
              ))}
            </div>
          </div>

          {/* Quick ID Card print selector */}
          <div className="flex items-center space-x-2">
            <SkeuomorphicButton
              variant="secondary"
              size="sm"
              icon={Upload}
              onClick={() => setBulkImportType('PERSONIL')}
            >
              Import Excel
            </SkeuomorphicButton>
          </div>
        </div>
      </SurfaceCard>

      {/* VIEW MODE 1: SKEUOMORPHIC TABLE (Matching Visual Reference Image) */}
      {viewMode === 'TABLE' ? (
        <SurfaceCard variant="elevated" padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200">
                  <th className="py-3 px-4 text-center uppercase tracking-wider w-16">Foto</th>
                  <th className="py-3 px-4 uppercase tracking-wider">Nama</th>
                  <th className="py-3 px-4 uppercase tracking-wider w-28">NIK</th>
                  <th className="py-3 px-4 uppercase tracking-wider">Area</th>
                  <th className="py-3 px-4 text-center uppercase tracking-wider w-28">Status</th>
                  <th className="py-3 px-4 text-center uppercase tracking-wider w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                      Tidak ada data personel yang cocok dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  paginatedList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors duration-100">
                      {/* Foto */}
                      <td className="py-3 px-4 text-center">
                        <img
                          src={u.photoUrl || 'https://patroli.site/img/noimage.png'}
                          alt={u.fullName}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-2xs mx-auto"
                          onError={(e) => {
                            (e.target as any).src = 'https://patroli.site/img/noimage.png';
                          }}
                        />
                      </td>

                      {/* Nama */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{u.fullName}</div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {u.securityRank || u.division}
                        </div>
                      </td>

                      {/* NIK */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        {u.nik || 'P-001'}
                      </td>

                      {/* Area */}
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {u.siteName || 'Area Utama'}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <StatusBadge variant="success" label="Aktif" />
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center space-x-1.5">
                          {/* Print ID Card */}
                          <button
                            type="button"
                            onClick={() => setPrintIdCardTarget(u)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 shadow-2xs transition active:translate-y-0.5"
                            title="Cetak ID Card"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Pencil */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200 shadow-2xs transition active:translate-y-0.5"
                            title="Edit Personel"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Trash */}
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteTarget(u);
                              setAdminPassword('');
                              setDeleteError(null);
                            }}
                            className="p-1.5 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 shadow-2xs transition active:translate-y-0.5"
                            title="Hapus Personel"
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
      ) : (
        /* VIEW MODE 2: CARD GRID (PINTEREST / SKEUOMORPHIC CARD TILES) */
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {paginatedList.map((u) => (
              <SurfaceCard
                key={u.id}
                variant="elevated"
                padding="md"
                className="flex flex-col justify-between hover:translate-y-[-2px] transition-transform duration-150"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <img
                      src={u.photoUrl || 'https://patroli.site/img/noimage.png'}
                      alt={u.fullName}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200/80 shadow-2xs"
                      onError={(e) => {
                        (e.target as any).src = 'https://patroli.site/img/noimage.png';
                      }}
                    />
                    <StatusBadge variant="success" label="Aktif" />
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm truncate">{u.fullName}</h3>
                  <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                    {u.securityRank || u.division}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                    <div className="flex items-center space-x-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{u.siteName}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 font-mono text-[11px] text-slate-400">
                      <span>NIK: {u.nik || '-'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setPrintIdCardTarget(u)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
                    title="Cetak ID Card"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(u)}
                      className="p-1.5 text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200 transition"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteTarget(u);
                        setAdminPassword('');
                        setDeleteError(null);
                      }}
                      className="p-1.5 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </SurfaceCard>
            ))}
          </div>
        </div>
      )}

      {/* MODAL TAMBAH PERSONEL (With Webcam Capture & Full Parity) */}
      {isTambahModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <h5 className="font-extrabold text-base flex items-center space-x-2">
                <Users className="w-5 h-5 text-sky-400" />
                <span>Form Pendaftaran Personel Baru</span>
              </h5>
              <button
                type="button"
                onClick={() => setIsTambahModalOpen(false)}
                className="text-white hover:text-white/80 font-bold text-xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitTambah} className="p-6 overflow-y-auto space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Left: Webcam Snapshot Column */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700">
                    Foto Profil Wajah
                  </label>
                  <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden border border-slate-300 bg-slate-100 shadow-inner flex items-center justify-center">
                    {capturedPhoto ? (
                      <img src={capturedPhoto} alt="Snapshot" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                        <canvas ref={canvasRef} className="hidden" />
                      </>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {capturedPhoto ? (
                      <SkeuomorphicButton
                        variant="secondary"
                        size="sm"
                        icon={RotateCcw}
                        type="button"
                        onClick={handleRetakePhoto}
                        className="w-full"
                      >
                        Foto Ulang
                      </SkeuomorphicButton>
                    ) : (
                      <SkeuomorphicButton
                        variant="primary"
                        size="sm"
                        icon={Camera}
                        type="button"
                        onClick={handleSnapPhoto}
                        className="w-full"
                      >
                        Ambil Foto
                      </SkeuomorphicButton>
                    )}
                  </div>
                </div>

                {/* Right: Personal & Login Credentials */}
                <div className="md:col-span-2 space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                      <InsetInput
                        type="text"
                        required
                        value={formNamaAnggota}
                        onChange={(e) => setFormNamaAnggota(e.target.value)}
                        placeholder="Contoh: Ahmad Rizki"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Jam Kerja/Hari</label>
                      <InsetInput
                        type="number"
                        min={8}
                        max={24}
                        value={formJamKerja}
                        onChange={(e) => setFormJamKerja(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Username Login *</label>
                      <InsetInput
                        type="text"
                        required
                        value={formUsername}
                        onChange={(e) => setFormUsername(e.target.value)}
                        placeholder="username.petugas"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Password Login *</label>
                      <InsetInput
                        type="password"
                        required
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Divisi / Posisi *</label>
                      <select
                        required
                        value={formPosisi}
                        onChange={(e) => setFormPosisi(e.target.value)}
                        className="w-full bg-[#F8FAFC] border border-slate-300/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="">Pilih Posisi</option>
                        <option value="Security">Satpam (Security)</option>
                        <option value="Cleaning Service">Cleaning Service</option>
                        <option value="Driver">Driver Logistik</option>
                        <option value="Staf">Staf Kantor</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Penugasan Area *</label>
                      <select
                        required
                        value={formLokasiAnggota}
                        onChange={(e) => setFormLokasiAnggota(e.target.value)}
                        className="w-full bg-[#F8FAFC] border border-slate-300/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="">Pilih Area Fasilitas</option>
                        {sites.map((s) => (
                          <option key={s.id} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Financial Fields */}
                  <div className="pt-2 border-t border-slate-100">
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Konfigurasi Gaji & Tunjangan (Rp)
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Gaji Pokok</label>
                        <InsetInput
                          type="text"
                          value={formGajiPokok}
                          onChange={(e) => setFormGajiPokok(formatRupiah(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Tunjangan</label>
                        <InsetInput
                          type="text"
                          value={formTunjangan}
                          onChange={(e) => setFormTunjangan(formatRupiah(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Lembur/Jam</label>
                        <InsetInput
                          type="text"
                          value={formLembur}
                          onChange={(e) => setFormLembur(formatRupiah(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <SkeuomorphicButton
                  variant="secondary"
                  size="md"
                  type="button"
                  onClick={() => setIsTambahModalOpen(false)}
                >
                  Batal
                </SkeuomorphicButton>
                <SkeuomorphicButton variant="primary" size="md" type="submit">
                  Simpan Personel
                </SkeuomorphicButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT PERSONEL */}
      {editTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h5 className="font-extrabold text-base flex items-center space-x-2">
                <Pencil className="w-4 h-4 text-sky-400" />
                <span>Edit Data Personel: {editTarget.fullName}</span>
              </h5>
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                className="text-white hover:text-white/80 font-bold text-xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Lengkap</label>
                  <InsetInput
                    type="text"
                    required
                    value={editNamaAnggota}
                    onChange={(e) => setEditNamaAnggota(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Username</label>
                  <InsetInput
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Password Baru (Opsional)</label>
                  <InsetInput
                    type="password"
                    placeholder="Kosongkan jika tidak diubah"
                    value={editPasswordBaru}
                    onChange={(e) => setEditPasswordBaru(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Area / Site</label>
                  <select
                    value={editLokasiSiteBaru}
                    onChange={(e) => setEditLokasiSiteBaru(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-300/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {sites.map((s) => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <SkeuomorphicButton
                  variant="secondary"
                  size="md"
                  type="button"
                  onClick={() => setEditTarget(null)}
                >
                  Batal
                </SkeuomorphicButton>
                <SkeuomorphicButton variant="primary" size="md" type="submit">
                  Perbarui Personel
                </SkeuomorphicButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS PERSONEL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-rose-600 text-white px-5 py-3.5 flex items-center justify-between">
              <h5 className="font-bold text-sm flex items-center space-x-2">
                <Trash2 className="w-4 h-4" />
                <span>Konfirmasi Hapus Personel</span>
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

            <form onSubmit={handleConfirmHapus} className="p-5 space-y-4">
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs space-y-2">
                <p className="font-bold uppercase flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Peringatan Penghapusan</span>
                </p>
                <p>
                  Anda akan menghapus data petugas <strong className="text-rose-900 font-extrabold">{deleteTarget.fullName} (NIK: {deleteTarget.nik})</strong> secara permanen.
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
                <SkeuomorphicButton
                  variant="danger"
                  size="md"
                  type="submit"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Menghapus...' : 'Ya, Hapus Permanen'}
                </SkeuomorphicButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
