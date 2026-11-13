'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Shield,
  Leaf,
  Car,
  Briefcase,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Clock,
  ArrowRight,
  TrendingUp,
  Download,
  ShieldAlert,
  ChevronDown,
  Building,
  Activity,
  Layers,
  Sparkles,
  Check,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Radio,
  FileText,
  Send,
  Navigation,
  Eye,
  X,
  AlertCircle
} from 'lucide-react';
import { useData } from '../lib/DataContext';

export default function DashboardPage() {
  const { sites, checkpoints, users, activeSosAlert } = useData();

  // Active filter state
  const [selectedSiteId, setSelectedSiteId] = useState<string>('ALL');
  const [activeShiftFilter, setActiveShiftFilter] = useState<'ALL' | 'PAGI' | 'SIANG' | 'MALAM'>('PAGI');
  const [barChartMetric, setBarChartMetric] = useState<'VOLUME' | 'ATTENDANCE'>('VOLUME');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(3); // Default highlight index 3 (Kamis/Today)

  // Quick activity preview modal
  const [selectedActivity, setSelectedActivity] = useState<any | null>(null);

  // Filtered data based on site selection
  const filteredCheckpoints = useMemo(() => {
    if (selectedSiteId === 'ALL') return checkpoints;
    return checkpoints.filter((cp) => cp.siteId === selectedSiteId || cp.siteName.toLowerCase().includes(selectedSiteId.toLowerCase()));
  }, [checkpoints, selectedSiteId]);

  const filteredUsers = useMemo(() => {
    if (selectedSiteId === 'ALL') return users;
    return users.filter((u) => u.siteId === selectedSiteId || u.siteName.toLowerCase().includes(selectedSiteId.toLowerCase()));
  }, [users, selectedSiteId]);

  // Aggregate Metrics
  const totalPersonil = filteredUsers.length;
  const securityPersonil = filteredUsers.filter((u) => u.division === 'SECURITY').length;
  const cleaningPersonil = filteredUsers.filter((u) => u.division === 'CLEANING').length;
  const driverPersonil = filteredUsers.filter((u) => u.division === 'DRIVER').length;
  const staffPersonil = filteredUsers.filter((u) => u.division === 'STAFF').length;

  const totalCheckpoints = filteredCheckpoints.length;
  const securityCheckpoints = filteredCheckpoints.filter((c) => c.category === 'Security').length;
  const cleaningCheckpoints = filteredCheckpoints.filter((c) => c.category === 'Cleaning Service').length;
  const driverCheckpoints = filteredCheckpoints.filter((c) => c.category === 'Driver').length;

  // Dynamic Shift Compliance Calculations
  const shiftComplianceData = useMemo(() => {
    switch (activeShiftFilter) {
      case 'PAGI':
        return {
          shiftName: 'Shift Pagi (07:00 - 15:00)',
          completed: 24,
          total: 28,
          percent: 86,
          pendingPos: [
            { name: 'Pos Genset & Pompa Hydrant', lastScan: '3 jam lalu', pic: 'Budi (Satpam)' },
            { name: 'Pintu Darurat Timur Lt 2', lastScan: '2 jam lalu', pic: 'Ahmad Fauzi' }
          ],
          statusText: 'Patroli putaran ke-3 sedang berjalan sesuai jadwal.'
        };
      case 'SIANG':
        return {
          shiftName: 'Shift Siang (15:00 - 23:00)',
          completed: 9,
          total: 28,
          percent: 32,
          pendingPos: [
            { name: 'Loading Dock Bawah', lastScan: 'Standby Shift', pic: 'Regu Siang' },
            { name: 'Perimeter Pagar Belakang', lastScan: 'Standby Shift', pic: 'Regu Siang' }
          ],
          statusText: 'Persiapan serah terima regu siang dimulai.'
        };
      case 'MALAM':
        return {
          shiftName: 'Shift Malam (23:00 - 07:00)',
          completed: 0,
          total: 28,
          percent: 0,
          pendingPos: [
            { name: 'Seluruh Pos Perimeter (28 Titik)', lastScan: 'Jadwal 23:00', pic: 'Regu Malam' }
          ],
          statusText: 'Shift malam belum dimulai. Standby persiapan apel malam.'
        };
      case 'ALL':
      default:
        return {
          shiftName: 'Akumulasi Semua Shift Hari Ini',
          completed: 33,
          total: 56,
          percent: 59,
          pendingPos: [
            { name: 'Pos Genset & Pompa Hydrant', lastScan: '3 jam lalu', pic: 'Budi (Satpam)' },
            { name: 'Pintu Darurat Timur Lt 2', lastScan: '2 jam lalu', pic: 'Ahmad Fauzi' }
          ],
          statusText: 'Total patroli gabungan 2 shift berjalan normal.'
        };
    }
  }, [activeShiftFilter]);

  // Time & Greeting Logic
  const currentDate = new Date();
  const currentHour = currentDate.getHours();
  let greeting = 'Selamat Pagi';
  if (currentHour >= 12 && currentHour < 15) {
    greeting = 'Selamat Siang';
  } else if (currentHour >= 15 && currentHour < 18) {
    greeting = 'Selamat Sore';
  } else if (currentHour >= 18 || currentHour < 4) {
    greeting = 'Selamat Malam';
  }

  const formattedDate = currentDate.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // 7-Day Performance Bar Data
  const weeklyData = [
    { day: 'Sen', fullDay: 'Senin', volume: 118, attendance: 92, target: 120 },
    { day: 'Sel', fullDay: 'Selasa', volume: 134, attendance: 96, target: 120 },
    { day: 'Rab', fullDay: 'Rabu', volume: 128, attendance: 94, target: 120 },
    { day: 'Kam', fullDay: 'Kamis (Hari Ini)', volume: 146, attendance: 100, target: 120, isCurrent: true },
    { day: 'Jum', fullDay: 'Jumat', volume: 112, attendance: 90, target: 120 },
    { day: 'Sab', fullDay: 'Sabtu', volume: 98, attendance: 85, target: 120 },
    { day: 'Min', fullDay: 'Minggu', volume: 88, attendance: 82, target: 120 }
  ];

  // Live Activity Log Items (with relative humanized times and coordinates)
  const recentActivities = [
    {
      id: 'act-1',
      name: 'Budi Satpam Test',
      division: 'SECURITY',
      location: 'Pos Gerbang Utama',
      time: '14:48',
      relativeTime: '2 menit lalu',
      status: 'Normal • Geofence Valid',
      coords: '-6.2088, 106.8456 (Akurasi 8m)',
      photoUrl: '/placeholder-officer.jpg',
      notes: 'Area gerbang tertib, palang pintu otomatis berfungsi normal.'
    },
    {
      id: 'act-2',
      name: 'Akmal',
      division: 'CLEANING',
      location: 'Toilet - Lobby Utama',
      time: '14:32',
      relativeTime: '18 menit lalu',
      status: 'Sanitasi Lengkap Selesai',
      coords: '-6.2091, 106.8459 (Akurasi 6m)',
      photoUrl: '/placeholder-officer.jpg',
      notes: 'Wastafel, cermin, dan lantai telah dibersihkan & dipel dengan disinfektan.'
    },
    {
      id: 'act-3',
      name: 'Ahmad Fauzi',
      division: 'SECURITY',
      location: 'Ruang Server IT Lt 3',
      time: '13:55',
      relativeTime: '55 menit lalu',
      status: 'Suhu AC Normal (21°C)',
      coords: '-6.2085, 106.8452 (Akurasi 10m)',
      photoUrl: '/placeholder-officer.jpg',
      notes: 'Pintu server terkunci rapat, indikator LED rack server hijau stabil.'
    },
    {
      id: 'act-4',
      name: 'Armada B 1234 CD',
      division: 'DRIVER',
      location: 'Logistik Warehouse Cikarang',
      time: '13:10',
      relativeTime: '1 jam lalu',
      status: 'Odometer: 42.150 KM • Tiba Pool',
      coords: '-6.2981, 107.1523 (Akurasi 12m)',
      photoUrl: '/placeholder-officer.jpg',
      notes: 'Pengiriman paket logistik batch pagi tuntas tanpa insiden jalan raya.'
    }
  ];

  // Helper function for segmented pill bar (Lumio style)
  const renderSegmentedPill = (filledCount: number, totalCount: number = 10, activeColor: string = 'bg-teal-600') => {
    return (
      <div className="lumio-segmented-pill">
        {Array.from({ length: totalCount }).map((_, idx) => (
          <span
            key={idx}
            className={idx < filledCount ? activeColor : 'bg-slate-200'}
            title={`${filledCount}/${totalCount} Segmen`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-16">
      {/* ========================================================
          EMERGENCY SOS DARURAT BANNER (REALTIME BROADCAST)
          ======================================================== */}
      {activeSosAlert && (
        <div className="bg-rose-600 text-white p-4 rounded-2xl shadow-xl border border-rose-700 flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 bg-white text-rose-600 rounded-xl shadow-md">
              <ShieldAlert className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-white/20 text-white font-extrabold px-2 py-0.5 rounded text-[10px] tracking-wider uppercase">
                  Peringatan Darurat Aktif
                </span>
                <span className="text-xs text-rose-100">
                  {new Date(activeSosAlert.triggeredAt).toLocaleTimeString('id-ID')}
                </span>
              </div>
              <h4 className="font-extrabold text-base tracking-wide mt-0.5">
                SOS DARI {activeSosAlert.officerName.toUpperCase()} ({activeSosAlert.division}) - {activeSosAlert.siteName}
              </h4>
              <p className="text-xs text-rose-100">
                Pesan: {activeSosAlert.message || 'Petugas menekan tombol SOS panik dan membutuhkan dukungan darurat segera!'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2.5 w-full md:w-auto">
            <a
              href={activeSosAlert.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 md:flex-initial bg-white text-rose-700 hover:bg-rose-50 font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow transition"
            >
              <span>Buka Koordinat GPS</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <Link
              href="/emergency"
              className="flex-1 md:flex-initial bg-rose-800 hover:bg-rose-900 text-white font-bold px-4 py-2 rounded-xl text-xs text-center transition"
            >
              Pusat Komando SOS
            </Link>
          </div>
        </div>
      )}

      {/* ========================================================
          1. ATMOSPHERIC HERO COMMAND HEADER (LUMIO MODERN STYLE)
          ======================================================== */}
      <div className="pt-2 pb-5 px-1 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-teal-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Sistem Komando Aktif • {formattedDate}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
              {greeting}, Komandan Operasional.
            </h1>
            <p className="text-teal-100/90 text-xs sm:text-sm leading-relaxed">
              Pantau kesiapan personil, kepatuhan patroli keamanan, dan sanitasi fasilitas korporat hari ini.
            </p>
          </div>

          {/* Quick Action Pills & Site Switcher */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Site Switcher Dropdown */}
            <div className="relative">
              <select
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
                className="appearance-none bg-white/10 hover:bg-white/15 backdrop-blur-md text-white text-xs font-semibold px-4 py-2.5 pr-8 rounded-full border border-white/20 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm transition"
              >
                <option value="ALL" className="text-slate-900 bg-white">
                  🏢 Semua Fasilitas ({sites.length} Site)
                </option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id} className="text-slate-900 bg-white">
                    📍 {site.name} ({site.code})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/70" />
            </div>

            {/* Quick Export Pill */}
            <Link
              href="/export-laporan"
              className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 text-xs font-semibold px-4 py-2.5 rounded-full inline-flex items-center space-x-2 shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5 text-teal-300" />
              <span>Export Laporan</span>
            </Link>

            {/* SOS Center Pill */}
            <Link
              href="/emergency"
              className="bg-white hover:bg-teal-50 text-slate-950 font-extrabold text-xs px-5 py-2.5 rounded-full inline-flex items-center space-x-2 shadow-xl shadow-slate-950/20 transition group"
            >
              <Radio className="w-3.5 h-3.5 text-rose-600 group-hover:scale-110 transition" />
              <span>Pusat SOS</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. ASYMMETRIC GRID ROW 1:
             - Card 1: Presensi & Kesiapan Regu Hari Ini (Humanized)
             - Card 2: Radar Kepatuhan Pos & Rute Patroli (Replaces dot-plot!)
             - Card 3: Pusat Status Keamanan & Perimeter (Accurate Link!)
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* CARD 1: PRESENSI & KESIAPAN REGU OPERASIONAL (4 Columns) */}
        <div className="lg:col-span-4 lumio-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Presensi & Kesiapan Regu
                </span>
              </div>
              <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>100% Siaga</span>
              </span>
            </div>

            <div className="flex items-baseline space-x-2 mt-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tabular-nums">
                {totalPersonil}
              </span>
              <span className="text-sm font-semibold text-slate-500">
                Personil On-Duty
              </span>
            </div>

            {/* Active Shift Badge for Gaptek Clarity */}
            <div className="mt-2.5 p-2.5 rounded-xl bg-teal-50/70 border border-teal-100/80 flex items-center justify-between text-xs">
              <span className="font-semibold text-teal-800">Regu Rajawali (Shift Pagi)</span>
              <span className="font-bold text-teal-900">07:00 - 15:00</span>
            </div>
          </div>

          {/* Humanized Attendance Status (No weird fake curves) */}
          <div className="my-4 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 font-medium">Tingkat Kehadiran Shift Ini</span>
              <span className="font-extrabold text-emerald-700">3 dari 3 Hadir Tepat Waktu</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
              <div className="bg-emerald-500 h-full w-full rounded-full" title="Hadir Tepat Waktu (100%)" />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 pt-1">
              <span className="flex items-center space-x-1 text-emerald-700 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Hadir: {totalPersonil}</span>
              </span>
              <span className="flex items-center space-x-1 text-amber-600 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Terlambat: 0</span>
              </span>
              <span className="flex items-center space-x-1 text-slate-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                <span>Izin / Off: 0</span>
              </span>
            </div>
          </div>

          {/* Division Breakdown Counters */}
          <div>
            <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100">
              <div className="text-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Satpam</span>
                <span className="text-sm font-extrabold text-blue-700 tabular-nums">{securityPersonil}</span>
              </div>
              <div className="text-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Cleaning</span>
                <span className="text-sm font-extrabold text-emerald-700 tabular-nums">{cleaningPersonil}</span>
              </div>
              <div className="text-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Driver</span>
                <span className="text-sm font-extrabold text-amber-700 tabular-nums">{driverPersonil}</span>
              </div>
              <div className="text-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Staf</span>
                <span className="text-sm font-extrabold text-slate-700 tabular-nums">{staffPersonil}</span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 text-right">
              <Link
                href="/absensi"
                className="text-xs font-bold text-teal-700 hover:text-teal-800 hover:underline inline-flex items-center space-x-1"
              >
                <span>Rekap Presensi Lengkap & Lembur</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* CARD 2: RADAR KEPATUHAN POS & RUTE PATROLI (4 Columns - REVOLUSI UTAMA MENGGANTIKAN DOT-PLOT) */}
        <div className="lg:col-span-4 lumio-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Radar Kepatuhan Checkpoint
                </span>
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                    {shiftComplianceData.completed} / {shiftComplianceData.total}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Titik Tuntas ({shiftComplianceData.percent}%)
                  </span>
                </div>
              </div>

              {/* Functional Shift Selector */}
              <div className="relative">
                <select
                  value={activeShiftFilter}
                  onChange={(e) => setActiveShiftFilter(e.target.value as any)}
                  className="text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="PAGI">Shift Pagi</option>
                  <option value="SIANG">Shift Siang</option>
                  <option value="MALAM">Shift Malam</option>
                  <option value="ALL">Semua Shift</option>
                </select>
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              {shiftComplianceData.statusText}
            </p>
          </div>

          {/* Clean Progress Meter Bar */}
          <div className="space-y-3 py-1">
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-slate-700">{shiftComplianceData.shiftName}</span>
                <span className="font-extrabold text-teal-700">{shiftComplianceData.percent}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-teal-600 h-full rounded-full transition-all duration-500 shadow-xs"
                  style={{ width: `${shiftComplianceData.percent}%` }}
                />
              </div>
            </div>

            {/* List of Critical / Pending Points */}
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-900">
                <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Pos Belum Dipatroli (&gt; 2 Jam):</span>
              </div>
              <div className="space-y-1.5">
                {shiftComplianceData.pendingPos.map((pos, pIdx) => (
                  <div key={pIdx} className="flex justify-between items-center text-[11px] text-slate-700">
                    <span className="truncate font-medium">• {pos.name}</span>
                    <span className="text-amber-700 font-bold shrink-0 pl-2">{pos.lastScan}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Rute Patroli:</span>
            <Link
              href="/laporan?tab=tracking"
              className="font-bold text-teal-700 hover:text-teal-800 hover:underline flex items-center space-x-1"
            >
              <span>📍 Buka Peta Rute Patroli</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* CARD 3: SPOTLIGHT PERIMETER & KEAMANAN (4 Columns - Deep Teal Accent) */}
        <div className="lg:col-span-4 lumio-card-dark p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-9 h-9 rounded-xl bg-teal-400/20 border border-teal-300/30 flex items-center justify-center text-teal-200">
                <ShieldCheck className="w-5 h-5 text-teal-300" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                SOP Level: Prima
              </span>
            </div>

            <h3 className="text-xl font-bold text-white tracking-tight leading-snug">
              Perimeter Aman & Terverifikasi
            </h3>
            <p className="text-xs text-teal-100/80 mt-2 leading-relaxed">
              Seluruh pemindaian checkpoint QR tervalidasi presisi di dalam batas radius resmi perimeter fasilitas korporat.
            </p>
          </div>

          <div className="space-y-3.5 my-4">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
              <div className="flex items-center justify-between text-xs">
                <span className="text-teal-100/90 font-medium">Validasi Radius Geofence:</span>
                <span className="font-extrabold text-emerald-300">50m Max • 99.2% Akurat</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full w-[99%]" />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-teal-100/90 px-1">
              <span>Temuan Insiden Lapangan:</span>
              <span className="font-extrabold text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                0 Temuan Terbuka
              </span>
            </div>
          </div>

          {/* FIXED LINK: Directed to Security Reports instead of /absensi */}
          <Link
            href="/laporan?tab=security&role=anggota"
            className="w-full bg-white hover:bg-teal-50 text-slate-900 font-bold text-xs py-3 px-4 rounded-xl text-center shadow-lg transition flex items-center justify-center space-x-1.5 group"
          >
            <span>🛡️ Cek Laporan Keamanan & Temuan</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* ========================================================
          3. ASYMMETRIC GRID ROW 2:
             - Card 4: Progress 3 Divisi (Clickable Jump Cards, Fixed 0 Armada)
             - Card 5: Live Activity Feed (Relative Time & Quick Photo Modal)
             - Card 6: 7-Day Performance Bar Chart (Fixed Tooltip Anchor & Y-Axis)
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* CARD 4: PENYELESAIAN TUGAS PER DIVISI (4 Columns - INTERACTIVE JUMP CARDS) */}
        <div className="lg:col-span-4 lumio-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Penyelesaian Tugas per Divisi
              </span>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
                Hari Ini
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Klik divisi untuk langsung membuka rekapitulasi checklist lapangan.
            </p>

            <div className="space-y-3">
              {/* Satpam Security -> Jump to /laporan?tab=security */}
              <Link
                href="/laporan?tab=security&role=anggota"
                className="block p-3 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-blue-50/50 hover:border-blue-200 transition group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-800 group-hover:text-blue-900">Satpam Security</span>
                  </div>
                  <span className="text-xs font-extrabold text-blue-700 tabular-nums">85%</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{securityCheckpoints} Pos • Rute Terkontrol</span>
                  {renderSegmentedPill(9, 10, 'bg-blue-600')}
                </div>
              </Link>

              {/* Cleaning Service -> Jump to /laporan?tab=cleaning */}
              <Link
                href="/laporan?tab=cleaning"
                className="block p-3 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-emerald-50/50 hover:border-emerald-200 transition group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <Leaf className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-900">Cleaning Service</span>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-700 tabular-nums">90%</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{cleaningCheckpoints} Zona • Checklist Bersih</span>
                  {renderSegmentedPill(9, 10, 'bg-emerald-600')}
                </div>
              </Link>

              {/* Driver Fleet -> Jump to /laporan?tab=driver (Fixed mathematical discrepancy: Standby in Pool) */}
              <Link
                href="/laporan?tab=driver"
                className="block p-3 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-amber-50/50 hover:border-amber-200 transition group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <Car className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-800 group-hover:text-amber-900">Driver Logistik</span>
                  </div>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Standby di Pool
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>0 Jadwal Pengiriman Aktif</span>
                  <span className="text-[10px] text-slate-400">Armada Siap Digunakan</span>
                </div>
              </Link>

              {/* Staff Operasional -> Jump to /absensi */}
              <Link
                href="/absensi"
                className="block p-3 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-100 transition group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-4 h-4 text-slate-600 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-800">Staf Fasilitas</span>
                  </div>
                  <span className="text-xs font-extrabold text-slate-900 tabular-nums">100%</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Administrasi & Rekap Presensi</span>
                  {renderSegmentedPill(10, 10, 'bg-slate-700')}
                </div>
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-3 flex justify-between items-center text-xs">
            <span className="text-slate-500">Kepatuhan Total Divisi:</span>
            <span className="font-extrabold text-teal-700">88.5% Target Terpenuhi</span>
          </div>
        </div>

        {/* CARD 5: LIVE OPERATIONAL ACTIVITY FEED (4 Columns - RELATIVE TIME & CLICKABLE MODAL) */}
        <div className="lg:col-span-4 lumio-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Aktivitas Terkini (Live Feed)
              </span>
              <Link
                href="/laporan"
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline inline-flex items-center space-x-1"
              >
                <span>Lihat Semua</span>
                <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
              </Link>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Log pemindaian QR code dan pelaporan waktu-nyata. Klik item untuk cek bukti.
            </p>

            {/* List of Recent Activities with relative time */}
            <div className="space-y-2.5">
              {recentActivities.map((act) => (
                <div
                  key={act.id}
                  onClick={() => setSelectedActivity(act)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-teal-50/40 border border-transparent hover:border-teal-200/60 transition cursor-pointer group"
                  title="Klik untuk inspeksi bukti pemindaian"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        act.division === 'SECURITY'
                          ? 'bg-blue-100 text-blue-700'
                          : act.division === 'CLEANING'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {act.division === 'SECURITY' ? (
                        <Shield className="w-4 h-4" />
                      ) : act.division === 'CLEANING' ? (
                        <Leaf className="w-4 h-4" />
                      ) : (
                        <Car className="w-4 h-4" />
                      )}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 group-hover:text-teal-800 truncate flex items-center space-x-1.5">
                        <span>{act.name}</span>
                        <Eye className="w-3 h-3 text-slate-400 group-hover:text-teal-600 transition" />
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{act.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    <div className="text-[11px] font-bold text-slate-700 tabular-nums">
                      {act.relativeTime}
                    </div>
                    <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border mt-0.5 text-emerald-700 bg-emerald-50 border-emerald-200">
                      {act.status.split('•')[0]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Sync: Terhubung</span>
            </span>
            <span className="text-slate-400">Pembaruan otomatis</span>
          </div>
        </div>

        {/* CARD 6: TREN AKTIVITAS 7 HARI (4 Columns - FIXED TOOLTIP ANCHOR & Y-AXIS SCALE) */}
        <div className="lg:col-span-4 lumio-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Tren Performa 7 Hari Terakhir
              </span>
              <div className="relative">
                <select
                  value={barChartMetric}
                  onChange={(e) => setBarChartMetric(e.target.value as any)}
                  className="text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 cursor-pointer focus:outline-none"
                >
                  <option value="VOLUME">Volume Scan</option>
                  <option value="ATTENDANCE">% Kehadiran</option>
                </select>
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-2">
              Monitoring stabilitas aktivitas harian dibanding target SOP korporat.
            </p>

            {/* Target Legend indicator */}
            <div className="flex items-center space-x-3 text-[11px] text-slate-500 mb-2">
              <span className="flex items-center space-x-1">
                <span className="w-3 h-0.5 bg-teal-600 inline-block" />
                <span>Target SOP: 120 Scan/Hari</span>
              </span>
            </div>

            {/* Bar Chart Area with Fixed Column-Anchored Tooltip */}
            <div className="relative pt-6 pb-2">
              {/* Benchmark Line at 120 (approx 75% height) */}
              {barChartMetric === 'VOLUME' && (
                <div
                  className="absolute w-full border-b border-dashed border-teal-300 pointer-events-none z-0"
                  style={{ bottom: '38px' }}
                >
                  <span className="absolute -top-3.5 right-0 text-[9px] font-extrabold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                    Target 120
                  </span>
                </div>
              )}

              {/* Bars Visual */}
              <div className="h-40 flex items-end justify-between gap-2 border-b border-slate-100 relative z-10 px-1">
                {weeklyData.map((item, idx) => {
                  const val = barChartMetric === 'VOLUME' ? item.volume : item.attendance;
                  const maxVal = barChartMetric === 'VOLUME' ? 160 : 100;
                  const heightPercent = Math.min(100, Math.round((val / maxVal) * 100));
                  const isHovered = hoveredBarIndex === idx;

                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group relative"
                      onMouseEnter={() => setHoveredBarIndex(idx)}
                    >
                      {/* Fixed Tooltip: Anchored precisely on top of this individual bar column */}
                      {isHovered && (
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-all duration-150">
                          <div className="bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg shadow-xl whitespace-nowrap flex items-center space-x-1">
                            <span>{item.fullDay}:</span>
                            <span className="text-teal-300 font-extrabold">
                              {barChartMetric === 'VOLUME' ? `${item.volume} Scan` : `${item.attendance}%`}
                            </span>
                          </div>
                          <div className="w-2 h-2 bg-slate-900 rotate-45 mx-auto -mt-1" />
                        </div>
                      )}

                      <div className="w-full flex items-end justify-center h-full">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                            item.isCurrent
                              ? 'bg-teal-700 lumio-bar-pattern shadow-sm'
                              : isHovered
                              ? 'bg-teal-500 scale-105'
                              : 'bg-slate-200 group-hover:bg-slate-300'
                          }`}
                        />
                      </div>
                      <span
                        className={`text-[10px] font-bold mt-2 ${
                          item.isCurrent ? 'text-teal-700 font-extrabold' : 'text-slate-400'
                        }`}
                      >
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-500">Rata-rata 7 Hari:</span>
            <span className="font-extrabold text-slate-800">
              {barChartMetric === 'VOLUME' ? '117 Scan / Hari (97.5% Target)' : '90.7% Kepatuhan'}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================
          4. COMMAND QUICK ACTIONS DOCK (4 PRIORITY SHORTCUTS)
          ======================================================== */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-100 text-teal-700">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Pusat Pintasan Komando Cepat
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Akses cepat instruksi siaran, ekspor berkas operasional harian, dan radar pelacakan GPS.
            </p>
          </div>
        </div>

        {/* 4 Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full lg:w-auto">
          <Link
            href="/pesan-siaran"
            className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-900 border border-slate-200 hover:border-teal-300 text-xs font-bold transition shadow-2xs"
          >
            <Send className="w-3.5 h-3.5 text-teal-600" />
            <span>Kirim Siaran</span>
          </Link>

          <Link
            href="/export-laporan"
            className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-900 border border-slate-200 hover:border-teal-300 text-xs font-bold transition shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-teal-600" />
            <span>Unduh Laporan</span>
          </Link>

          <Link
            href="/laporan?tab=tracking"
            className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-900 border border-slate-200 hover:border-teal-300 text-xs font-bold transition shadow-2xs"
          >
            <Navigation className="w-3.5 h-3.5 text-teal-600" />
            <span>Live Tracking</span>
          </Link>

          <Link
            href="/emergency"
            className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-900 border border-rose-200 hover:border-rose-300 text-xs font-bold transition shadow-2xs"
          >
            <Radio className="w-3.5 h-3.5 text-rose-600" />
            <span>Riwayat SOS</span>
          </Link>
        </div>
      </div>

      {/* ========================================================
          5. QUICK INSPECTION MODAL (FOR ACTIVITY FEED PREVIEW)
          ======================================================== */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-teal-800 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="w-5 h-5 text-teal-300" />
                <h3 className="font-extrabold text-sm tracking-wide">
                  Inspeksi Bukti Pemindaian
                </h3>
              </div>
              <button
                onClick={() => setSelectedActivity(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-700">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Petugas Pelapor</span>
                  <div className="font-extrabold text-sm text-slate-900 mt-0.5">{selectedActivity.name}</div>
                  <span className="text-[11px] text-teal-700 font-semibold">{selectedActivity.division}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Waktu Validasi</span>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedActivity.time} WIB</div>
                  <span className="text-[11px] text-slate-500 font-medium">{selectedActivity.relativeTime}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Titik Checkpoint:</span>
                  <span className="font-bold text-slate-900">{selectedActivity.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Validasi Radius GPS:</span>
                  <span className="font-bold text-emerald-700">{selectedActivity.coords}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Status Kepatuhan:</span>
                  <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {selectedActivity.status}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Catatan Lapangan:</span>
                <p className="text-xs text-slate-700 italic leading-relaxed">
                  &ldquo;{selectedActivity.notes}&rdquo;
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 text-xs transition"
                >
                  Tutup
                </button>
                <Link
                  href="/laporan"
                  className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 font-bold text-white text-xs transition shadow-xs inline-flex items-center space-x-1"
                >
                  <span>Buka Semua Laporan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
