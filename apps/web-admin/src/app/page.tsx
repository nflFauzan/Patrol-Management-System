'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  MapPin,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Truck,
  Building2,
  ExternalLink,
  Radio,
  Calendar,
  FileText,
  DollarSign,
  Download,
  QrCode,
  ArrowRight
} from 'lucide-react';
import { useData } from '../lib/DataContext';

interface ActivityItem {
  id: string;
  badge: string;
  badgeColor: string;
  officerName: string;
  timeStr: string;
  title: string;
  detail: string;
}

export default function DashboardPage() {
  const { sites, checkpoints, users, setActiveSosAlert } = useData();

  const [selectedSiteId, setSelectedSiteId] = useState<string>(sites[0]?.id || '11111111-1111-1111-1111-111111111111');
  const [selectedDivision, setSelectedDivision] = useState<'ALL' | 'SECURITY' | 'CLEANING' | 'DRIVER'>('ALL');

  // Live Activity Feed
  const [activities] = useState<ActivityItem[]>([
    {
      id: 'act-1',
      badge: 'SEC',
      badgeColor: 'bg-blue-100 text-blue-600',
      officerName: 'Ahmad Fauzi (Satpam Regu A)',
      timeStr: '13:20 WIB',
      title: 'Scan Checkpoint #3: Ruang Server IT Lt 3',
      detail: 'Status: Situasi Aman Terkendali • Jarak 18m dari geofence',
    },
    {
      id: 'act-2',
      badge: 'CLN',
      badgeColor: 'bg-emerald-100 text-emerald-600',
      officerName: 'Akmal (Cleaning Service)',
      timeStr: '13:15 WIB',
      title: 'Checklist Sanitasi Restroom Lt 2 Selesai',
      detail: 'Lantai dipel, kloset disikat, wastafel bersih, aroma lavender',
    },
    {
      id: 'act-3',
      badge: 'DRV',
      badgeColor: 'bg-purple-100 text-purple-600',
      officerName: 'Budi Santoso (Driver Logistik)',
      timeStr: '13:00 WIB',
      title: 'Perjalanan Logistik: Site Proyek Demo ➔ Cikarang',
      detail: 'Armada B 1234 CD • Odometer: 45.210 km • Muatan aman',
    },
  ]);

  const handleSimulateSos = () => {
    setActiveSosAlert({
      id: `sos-${Date.now()}`,
      officerName: 'Budi Satpam Test',
      officerPhone: '0812-3456-7890',
      division: 'Security',
      siteName: 'Site Proyek Demo',
      latitude: -6.566873,
      longitude: 106.857802,
      mapsUrl: 'https://www.google.com/maps?q=-6.566873,106.857802',
      triggeredAt: new Date().toLocaleTimeString('id-ID'),
      alertStatus: 'ACTIVE',
      isWhatsappDispatched: true,
      message: '🚨 PANIC SOS DIPICU! Petugas butuh bantuan darurat segera di Gerbang Utama!',
    });
  };

  return (
    <div className="space-y-6">
      {/* Subheader / Facility Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>Dashboard Pusat Komando Fasilitas & Operasional</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoring Geofence PostGIS Satpam, Checklist Sanitasi CS, dan Log Armada Driver
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Site Selector */}
          <select
            value={selectedSiteId}
            onChange={(e) => setSelectedSiteId(e.target.value)}
            className="border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sites.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          {/* Division Selector */}
          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value as any)}
            className="border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua 3 Divisi</option>
            <option value="SECURITY">🛡️ Satpam (Security)</option>
            <option value="CLEANING">✨ Cleaning Service</option>
            <option value="DRIVER">🚚 Driver Logistik</option>
          </select>

          <button
            onClick={handleSimulateSos}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl text-xs font-bold transition flex items-center space-x-1"
            title="Uji coba alert panic button SOS"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Test Alarm SOS</span>
          </button>
        </div>
      </div>

      {/* QUICK NAVIGATION SHORTCUTS KE SUB-HALAMAN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/datainduk/area"
          className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition group space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-105 transition">
              <MapPin className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Area & Shift Fasilitas</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola {sites.length} site, koordinat GPS satelit, dan jam kerja shift
            </p>
          </div>
        </Link>

        <Link
          href="/datainduk/checkpoint"
          className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition group space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-105 transition">
              <QrCode className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Checkpoint / Aset</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola {checkpoints.length} titik stiker QR Code & cetak barcode resmi
            </p>
          </div>
        </Link>

        <Link
          href="/datainduk/personil"
          className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-purple-500 hover:shadow-md transition group space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-105 transition">
              <Users className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Personel & Gaji</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola {users.length} personil 3 divisi & cetak ID Card
            </p>
          </div>
        </Link>

        <Link
          href="/absensi"
          className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-amber-500 hover:shadow-md transition group space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-105 transition">
              <Calendar className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Absensi 31-Hari</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Audit matriks kehadiran bulanan, toleransi telat, dan lembur
            </p>
          </div>
        </Link>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Petugas Hadir Dinas</p>
            <h3 className="text-xl font-bold text-slate-900">42 / 45</h3>
            <span className="text-[11px] text-emerald-600 font-semibold">93.3% Tingkat Hadir</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Patroli Satpam Shift Ini</p>
            <h3 className="text-xl font-bold text-slate-900">128 Scan</h3>
            <span className="text-[11px] text-indigo-600 font-semibold">Rute Berjalan 100%</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Sanitasi CS Selesai</p>
            <h3 className="text-xl font-bold text-slate-900">18 / 20 Zona</h3>
            <span className="text-[11px] text-emerald-600 font-semibold">90% Sesuai Jadwal</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Log Armada Driver</p>
            <h3 className="text-xl font-bold text-slate-900">6 Kendaraan</h3>
            <span className="text-[11px] text-purple-600 font-semibold">Odometer Terverifikasi</span>
          </div>
        </div>
      </div>

      {/* MONITORING GRID: FACILITY STATUS & LIVE STREAM FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Fasilitas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-slate-500" />
              <span>Status Fasilitas & Lokasi</span>
            </h2>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">PostGIS Geofence</span>
          </div>

          <div className="space-y-3">
            {sites.map((s) => (
              <div key={s.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{s.name}</h4>
                    <p className="text-[11px] text-slate-500">{s.address || 'Kawasan Fasilitas Korporat'}</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Radius {s.geofenceRadiusMeters}m
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 flex justify-between pt-1 border-t border-slate-200/60">
                  <span>GPS: {s.latitude}, {s.longitude}</span>
                  <a
                    href={`https://www.google.com/maps?q=${s.latitude},${s.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Peta ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Activity Stream Feed */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Live Feed Aktivitas Lapangan (Real-time Socket.io)</span>
            </h2>
            <span className="text-xs text-emerald-600 flex items-center space-x-1">
              <Radio className="w-3 h-3 animate-ping" />
              <span>Stream Aktif</span>
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {activities.map((act) => (
              <div key={act.id} className="py-3 flex items-start space-x-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs mt-0.5 ${act.badgeColor}`}>
                  {act.badge}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900">{act.officerName}</p>
                    <span className="text-xs text-slate-400">{act.timeStr}</span>
                  </div>
                  <p className="text-xs text-slate-600">{act.title}</p>
                  <span className="inline-block mt-1 text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    {act.detail}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* OPERATIONAL WATCHDOG & LEADERBOARD CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Watchdog 1: Security Perlu Perhatian */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b pb-2.5">
            <h3 className="font-bold text-xs text-slate-900 flex items-center space-x-1.5 uppercase">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Security Perlu Perhatian</span>
            </h3>
            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
              1 Orang
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Personil hadir dinas tetapi belum melakukan pemindaian patroli sama sekali:
          </p>
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 flex items-center justify-between">
            <div>
              <h4 className="font-extrabold text-xs text-slate-900">BUDI SATPAM TEST</h4>
              <p className="text-[10px] text-slate-500">Hadir: 07:05 WIB • Site Proyek Demo</p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-rose-500 text-white px-2 py-0.5 rounded">
              0 Scan
            </span>
          </div>
        </div>

        {/* Watchdog 2: Checkpoint Belum Dicek */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b pb-2.5">
            <h3 className="font-bold text-xs text-slate-900 flex items-center space-x-1.5 uppercase">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>Checkpoint Belum Dicek</span>
            </h3>
            <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
              1 Titik
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Titik pos / aset fasilitas yang belum tersentuh rute patroli hari ini:
          </p>
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
            <div>
              <p className="font-bold text-xs text-slate-900">Ruang Server IT Lt 3</p>
              <p className="text-[10px] text-slate-400">Site Proyek Demo</p>
            </div>
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              Terlewat
            </span>
          </div>
        </div>

        {/* Watchdog 3: Leaderboard Patroli */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b pb-2.5">
            <h3 className="font-bold text-xs text-slate-900 flex items-center space-x-1.5 uppercase">
              <span>🏆 Leaderboard Patroli</span>
            </h3>
            <span className="text-[10px] font-bold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
              Shift Aktif
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Ranking pemindaian checkpoint patroli tertinggi shift berjalan:
          </p>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between p-2 bg-yellow-50/60 rounded-xl border border-yellow-200">
              <span className="font-bold text-slate-900 flex items-center space-x-1.5 text-xs">
                <span className="text-yellow-600 font-black">🥇 1.</span>
                <span>Ahmad Fauzi</span>
              </span>
              <span className="font-extrabold text-blue-700 font-mono text-xs">12 Pos</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
              <span className="font-semibold text-slate-700 flex items-center space-x-1.5 text-xs">
                <span className="text-slate-400 font-bold">🥈 2.</span>
                <span>Akmal</span>
              </span>
              <span className="font-bold text-slate-700 font-mono text-xs">9 Pos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
