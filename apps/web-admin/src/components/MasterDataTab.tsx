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
  Search
} from 'lucide-react';
import { Division, SecurityRank, UserRole } from '@patrol/types';

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

      {/* SUBTAB 1: AREA / SITE */}
      {subTab === 'AREA' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sites.map((s) => (
              <div key={s.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                <div className="flex justify-between items-start border-b border-slate-200 pb-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{s.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center mt-0.5">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-blue-600" />
                      {s.address}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    Radius {s.geofenceRadiusMeters}m
                  </span>
                </div>

                {/* Shift Hours Matrix for Site */}
                <div className="space-y-1.5 text-xs bg-white p-3 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-700 block text-[11px] mb-1">
                    Konfigurasi Jam & Menit Shift Fasilitas:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex justify-between border-b border-slate-100 py-0.5">
                      <span className="text-slate-500">Shift Pagi:</span>
                      <span className="font-semibold text-slate-900">{s.shiftPagiIn} - {s.shiftPagiOut}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 py-0.5">
                      <span className="text-slate-500">Shift Siang:</span>
                      <span className="font-semibold text-slate-900">{s.shiftSiangIn} - {s.shiftSiangOut}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 py-0.5">
                      <span className="text-slate-500">Shift Malam:</span>
                      <span className="font-semibold text-slate-900">{s.shiftMalamIn} - {s.shiftMalamOut}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 py-0.5">
                      <span className="text-slate-500">Shift Staf:</span>
                      <span className="font-semibold text-slate-900">{s.shiftStaffIn} - {s.shiftStaffOut}</span>
                    </div>
                    <div className="flex justify-between py-0.5 col-span-2">
                      <span className="text-slate-500">Shift Chief Manager:</span>
                      <span className="font-semibold text-slate-900">{s.shiftChiefIn} - {s.shiftChiefOut}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                  <span>GPS: {s.latitude}, {s.longitude}</span>
                  <a
                    href={`https://www.google.com/maps?q=${s.latitude},${s.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Buka Peta Satelit ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
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
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => onOpenPrintQr(c)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                        title="Cetak Label Kartu QR Code Checkpoint"
                      >
                        <Printer className="w-4 h-4 text-indigo-600" />
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
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => onOpenPrintIdCard(u)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                        title="Cetak ID Card Resmi Petugas"
                      >
                        <Printer className="w-4 h-4 text-emerald-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
