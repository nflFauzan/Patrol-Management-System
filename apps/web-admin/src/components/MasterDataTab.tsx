'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Users, 
  Upload, 
  Printer, 
  Plus, 
  Clock, 
  Shield, 
  QrCode,
  DollarSign,
  RefreshCw,
  Search,
  Trash2,
  KeyRound,
  AlertTriangle,
  X,
  Check
} from 'lucide-react';
import { Division, SecurityRank, UserRole } from '@patrol/types';
import { AreaManagementView, AreaSiteData } from './AreaManagementView';

interface MasterDataTabProps {
  onOpenBulkImport: (type: 'CHECKPOINT' | 'PERSONIL') => void;
  onOpenPrintQr: (checkpoint: any) => void;
  onOpenPrintIdCard: (user: any) => void;
}

export const MasterDataTab: React.FC<MasterDataTabProps> = ({
  onOpenBulkImport,
  onOpenPrintQr,
  onOpenPrintIdCard,
}) => {
  const [subTab, setSubTab] = useState<'AREA' | 'CHECKPOINT' | 'PERSONIL'>('AREA');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Delete protection modal state (Verifikasi Password Admin matching patroli.site)
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'AREA' | 'CHECKPOINT' | 'PERSONIL';
    id: string;
    name: string;
  } | null>(null);
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const handleConfirmDelete = () => {
    if (!adminPasswordInput.trim()) {
      setDeleteError('Verifikasi Password Admin wajib diisi!');
      return;
    }

    if (!deleteTarget) return;

    if (deleteTarget.type === 'AREA') {
      setSites((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    } else if (deleteTarget.type === 'CHECKPOINT') {
      setCheckpoints((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    } else if (deleteTarget.type === 'PERSONIL') {
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    }

    setActionSuccessMsg(`Data "${deleteTarget.name}" berhasil dihapus permanen.`);
    setDeleteTarget(null);
    setAdminPasswordInput('');
    setDeleteError(null);
  };

  // Sample sites data matching DB
  const [sites, setSites] = useState<any[]>([
    {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Head Office Sudirman',
      code: 'HQ-SDR',
      address: 'Kav. 52-53 SCBD, Jakarta Selatan',
      latitude: -6.2255,
      longitude: 106.8090,
      geofenceRadiusMeters: 100,
      shiftPagiIn: '07:00:00',
      shiftPagiOut: '15:00:00',
      shiftSiangIn: '15:00:00',
      shiftSiangOut: '23:00:00',
      shiftMalamIn: '23:00:00',
      shiftMalamOut: '07:00:00',
      shiftStaffIn: '08:00:00',
      shiftStaffOut: '17:00:00',
      shiftChiefIn: '08:00:00',
      shiftChiefOut: '17:00:00',
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Warehouse & Factory Cikarang',
      code: 'WH-CKR',
      address: 'Kawasan Industri GIIC Delta Silicon, Cikarang',
      latitude: -6.3712,
      longitude: 107.1654,
      geofenceRadiusMeters: 250,
      shiftPagiIn: '06:00:00',
      shiftPagiOut: '14:00:00',
      shiftSiangIn: '14:00:00',
      shiftSiangOut: '22:00:00',
      shiftMalamIn: '22:00:00',
      shiftMalamOut: '06:00:00',
      shiftStaffIn: '08:00:00',
      shiftStaffOut: '17:00:00',
      shiftChiefIn: '08:00:00',
      shiftChiefOut: '17:00:00',
    },
  ]);

  // Sample checkpoints matching DB
  const [checkpoints, setCheckpoints] = useState<any[]>([
    {
      id: 'c1',
      qrCodeToken: 'QR-HQ-GATE-01',
      name: 'Pos Utama Gerbang Masuk',
      locationDetail: 'Gate A Pintu Barat',
      category: 'Security',
      assetType: 'Gerbang & Pos Satpam',
      taskDescription: 'Periksa ID Card pengunjung dan kendaraan masuk',
      siteName: 'Head Office Sudirman',
    },
    {
      id: 'c2',
      qrCodeToken: 'QR-HQ-LOBBY-02',
      name: 'Lobby & Resepsionis Lt 1',
      locationDetail: 'Main Hall Ground Floor',
      category: 'Security',
      assetType: 'Aset Elektronik & Pintu Kaca',
      taskDescription: 'Pastikan area steril dan pintu akses terkunci',
      siteName: 'Head Office Sudirman',
    },
    {
      id: 'c3',
      qrCodeToken: 'QR-HQ-SERVER-03',
      name: 'Ruang Server IT Lt 3',
      locationDetail: 'Lt 3 Ruang 304',
      category: 'Security',
      assetType: 'Server & Rack IT',
      taskDescription: 'Cek suhu AC ruangan dan lampu indikator UPS',
      siteName: 'Head Office Sudirman',
    },
    {
      id: 'c4',
      qrCodeToken: 'QR-HQ-REST-04',
      name: 'Restroom Eksekutif Lt 2',
      locationDetail: 'Lt 2 Sayap Barat',
      category: 'Cleaning',
      assetType: 'Fasilitas Sanitasi',
      taskDescription: 'Pembersihan lantai, wastafel, dan pengisian tisu',
      siteName: 'Head Office Sudirman',
    },
  ]);

  // Sample users matching DB
  const [users, setUsers] = useState<any[]>([
    {
      id: 'u1',
      nik: 'NIK-SEC-005',
      fullName: 'Ahmad Fauzi',
      username: 'satpamtest',
      role: 'SECURITY_OFFICER',
      division: 'SECURITY',
      securityRank: 'ANGGOTA',
      siteName: 'Head Office Sudirman',
      gajiPokok: 5200000,
      tunjangan: 800000,
      lemburPerJam: 30000,
    },
    {
      id: 'u2',
      nik: 'NIK-SEC-001',
      fullName: 'Bambang Supriyanto',
      username: 'komandantest',
      role: 'SUPERVISOR',
      division: 'SECURITY',
      securityRank: 'KOMANDAN_REGU',
      siteName: 'Head Office Sudirman',
      gajiPokok: 6500000,
      tunjangan: 1200000,
      lemburPerJam: 40000,
    },
    {
      id: 'u3',
      nik: 'NIK-SEC-002',
      fullName: 'Hendra Gunawan',
      username: 'chieftest',
      role: 'FIELD_MANAGER',
      division: 'SECURITY',
      securityRank: 'CHIEF_SECURITY',
      siteName: 'Head Office Sudirman',
      gajiPokok: 8500000,
      tunjangan: 2000000,
      lemburPerJam: 50000,
    },
    {
      id: 'u4',
      nik: 'NIK-CLN-001',
      fullName: 'Siti Rahma',
      username: 'cleaningtest',
      role: 'CLEANING_STAFF',
      division: 'CLEANING',
      securityRank: 'STAFF',
      siteName: 'Head Office Sudirman',
      gajiPokok: 4800000,
      tunjangan: 500000,
      lemburPerJam: 25000,
    },
    {
      id: 'u5',
      nik: 'NIK-DRV-001',
      fullName: 'Budi Santoso',
      username: 'drivertest',
      role: 'DRIVER',
      division: 'DRIVER',
      securityRank: 'STAFF',
      siteName: 'Head Office Sudirman',
      gajiPokok: 5000000,
      tunjangan: 750000,
      lemburPerJam: 30000,
    },
  ]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Header and Subtabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>Data Induk Fasilitas & Personil (Master Data)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen Lokasi Fasilitas, Konfigurasi Shift, Checkpoint Barcode QR, dan Data Personil
          </p>
        </div>

        {/* Subtabs Selector */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setSubTab('AREA')}
            className={`px-3 py-1.5 rounded-lg transition ${
              subTab === 'AREA' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Area & Shift Fasilitas
          </button>
          <button
            onClick={() => setSubTab('CHECKPOINT')}
            className={`px-3 py-1.5 rounded-lg transition ${
              subTab === 'CHECKPOINT' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Checkpoint / Aset
          </button>
          <button
            onClick={() => setSubTab('PERSONIL')}
            className={`px-3 py-1.5 rounded-lg transition ${
              subTab === 'PERSONIL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Personil & Finansial
          </button>
        </div>
      </div>

      {/* SUBTAB 1: AREA / SITE (100% PARITY DENGAN PATROLI.SITE DATA INDUK AREA) */}
      {subTab === 'AREA' && (
        <AreaManagementView
          sites={sites}
          onAddSite={(newSite) => setSites((prev) => [newSite, ...prev])}
          onUpdateSite={(updatedSite) =>
            setSites((prev) => prev.map((s) => (s.id === updatedSite.id ? updatedSite : s)))
          }
          onDeleteSite={(siteId) => setSites((prev) => prev.filter((s) => s.id !== siteId))}
          checkpointsCount={{
            '11111111-1111-1111-1111-111111111111': 3,
            '22222222-2222-2222-2222-222222222222': 1,
          }}
          personnelCount={{
            '11111111-1111-1111-1111-111111111111': 4,
            '22222222-2222-2222-2222-222222222222': 1,
          }}
        />
      )}

      {/* SUBTAB 2: CHECKPOINT / ASET */}
      {subTab === 'CHECKPOINT' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-500">Total Checkpoint: {checkpoints.length} Pos</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onOpenBulkImport('CHECKPOINT')}
                className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition active:scale-95"
              >
                <Upload className="w-4 h-4" />
                <span>Import XLSX / CSV Checkpoint</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-2.5 px-3">Kode QR</th>
                  <th className="py-2.5 px-3">Nama Checkpoint</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3">Jenis Aset</th>
                  <th className="py-2.5 px-3">Lokasi / Detail Tugas</th>
                  <th className="py-2.5 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {checkpoints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-600">{c.qrCodeToken}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{c.name}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.category === 'Security' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {c.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{c.assetType}</td>
                    <td className="py-2.5 px-3 text-slate-500">
                      <div>{c.locationDetail}</div>
                      <div className="text-[10px] text-slate-400 italic">{c.taskDescription}</div>
                    </td>
                    <td className="py-2.5 px-3 text-center flex items-center justify-center space-x-1.5">
                      <button
                        onClick={() => onOpenPrintQr(c)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                        title="Cetak Label Kartu QR Code Checkpoint"
                      >
                        <Printer className="w-4 h-4 text-indigo-600" />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteTarget({ type: 'CHECKPOINT', id: c.id, name: c.name });
                          setAdminPasswordInput('');
                          setDeleteError(null);
                        }}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                        title="Hapus Checkpoint (Perlu Password Admin)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 3: PERSONIL & FINANSIAL */}
      {subTab === 'PERSONIL' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-500">Total Personil Terdaftar: {users.length} Orang</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onOpenBulkImport('PERSONIL')}
                className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition active:scale-95"
              >
                <Upload className="w-4 h-4" />
                <span>Import XLSX / CSV Personil</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-2.5 px-3">NIK</th>
                  <th className="py-2.5 px-3">Nama Lengkap</th>
                  <th className="py-2.5 px-3">Username</th>
                  <th className="py-2.5 px-3">Jabatan & Divisi</th>
                  <th className="py-2.5 px-3">Gaji Pokok</th>
                  <th className="py-2.5 px-3">Tunjangan</th>
                  <th className="py-2.5 px-3">Rate Lembur/Jam</th>
                  <th className="py-2.5 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-500">{u.nik}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{u.fullName}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{u.username}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.division === 'SECURITY' ? 'bg-blue-100 text-blue-700' :
                        u.division === 'CLEANING' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {u.division} • {u.securityRank}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold">Rp {u.gajiPokok?.toLocaleString('id-ID')}</td>
                    <td className="py-2.5 px-3">Rp {u.tunjangan?.toLocaleString('id-ID')}</td>
                    <td className="py-2.5 px-3 text-emerald-700 font-medium">Rp {u.lemburPerJam?.toLocaleString('id-ID')}</td>
                    <td className="py-2.5 px-3 text-center flex items-center justify-center space-x-1.5">
                      <button
                        onClick={() => onOpenPrintIdCard(u)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                        title="Cetak ID Card Resmi Petugas"
                      >
                        <Printer className="w-4 h-4 text-emerald-600" />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteTarget({ type: 'PERSONIL', id: u.id, name: u.fullName });
                          setAdminPasswordInput('');
                          setDeleteError(null);
                        }}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                        title="Hapus Personil (Perlu Password Admin)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action Toast Feedback */}
      {actionSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-xl text-xs flex justify-between items-center shadow-sm">
          <span className="font-semibold flex items-center space-x-1.5">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccessMsg}</span>
          </span>
          <button onClick={() => setActionSuccessMsg(null)} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modal Verifikasi Password Admin (Matching patroli.site) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Konfirmasi Hapus Data Permanen</span>
              </h3>
              <button
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteError(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 space-y-1">
              <p className="font-bold">
                Apakah Anda yakin akan menghapus data {deleteTarget.type.toLowerCase()} ini?
              </p>
              <p className="font-mono text-slate-700">
                Target: <strong>{deleteTarget.name}</strong>
              </p>
              <p className="text-[11px] text-rose-600 mt-1">
                Tindakan ini tidak dapat dibatalkan. Masukkan Password Admin untuk memverifikasi otorisasi Anda.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                <span>Verifikasi Password Admin</span>
              </label>
              <input
                type="password"
                value={adminPasswordInput}
                onChange={(e) => {
                  setAdminPasswordInput(e.target.value);
                  setDeleteError(null);
                }}
                placeholder="Masukkan password admin Anda..."
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50"
                autoFocus
              />
              {deleteError && (
                <p className="text-[11px] text-rose-600 font-semibold">{deleteError}</p>
              )}
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={handleConfirmDelete}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-sm transition active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus Data</span>
              </button>
              <button
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteError(null);
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
