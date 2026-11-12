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
  Radio
} from 'lucide-react';
import { useData } from '../lib/DataContext';

export default function DashboardPage() {
  const { sites, checkpoints, users, activeSosAlert } = useData();

  // Active filter state
  const [selectedSiteId, setSelectedSiteId] = useState<string>('ALL');
  const [activeShiftFilter, setActiveShiftFilter] = useState<'ALL' | 'PAGI' | 'SIANG' | 'MALAM'>('ALL');
  const [barChartMetric, setBarChartMetric] = useState<'VOLUME' | 'ATTENDANCE'>('VOLUME');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(3); // Default highlight index 3 (Kamis/Today)

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

  // Shift & Cadence Matrix Data
  const hourlyCadence = [
    { hour: '06:00', label: '06', pagi: 4, siang: 0, malam: 2, total: 6 },
    { hour: '08:00', label: '08', pagi: 8, siang: 0, malam: 0, total: 8 },
    { hour: '10:00', label: '10', pagi: 7, siang: 0, malam: 0, total: 7 },
    { hour: '12:00', label: '12', pagi: 6, siang: 1, malam: 0, total: 7 },
    { hour: '14:00', label: '14', pagi: 8, siang: 2, malam: 0, total: 10 },
    { hour: '16:00', label: '16', pagi: 1, siang: 7, malam: 0, total: 8 },
    { hour: '18:00', label: '18', pagi: 0, siang: 8, malam: 0, total: 8 },
    { hour: '20:00', label: '20', pagi: 0, siang: 7, malam: 2, total: 9 },
    { hour: '22:00', label: '22', pagi: 0, siang: 3, malam: 6, total: 9 },
    { hour: '24:00', label: '00', pagi: 0, siang: 0, malam: 8, total: 8 }
  ];

  // 7-Day Performance Bar Data (Lumio Pattern Style)
  const weeklyData = [
    { day: 'Sen', fullDay: 'Senin', volume: 118, attendance: 92, target: 120 },
    { day: 'Sel', fullDay: 'Selasa', volume: 134, attendance: 96, target: 120 },
    { day: 'Rab', fullDay: 'Rabu', volume: 128, attendance: 94, target: 120 },
    { day: 'Kam', fullDay: 'Kamis (Hari Ini)', volume: 146, attendance: 100, target: 120, isCurrent: true },
    { day: 'Jum', fullDay: 'Jumat', volume: 112, attendance: 90, target: 120 },
    { day: 'Sab', fullDay: 'Sabtu', volume: 98, attendance: 85, target: 120 },
    { day: 'Min', fullDay: 'Minggu', volume: 88, attendance: 82, target: 120 }
  ];

  // Live Activity Log Items
  const recentActivities = [
    {
      id: 'act-1',
      name: 'Budi Satpam Test',
      division: 'SECURITY',
      location: 'Pos Gerbang Utama',
      time: '14:48',
      status: 'Normal • Geofence Valid',
      statusColor: 'text-emerald-600 bg-emerald-50 border-emerald-200'
    },
    {
      id: 'act-2',
      name: 'Akmal',
      division: 'CLEANING',
      location: 'Toilet - Lobby Utama',
      time: '14:32',
      status: 'Sanitasi Lengkap Selesai',
      statusColor: 'text-emerald-600 bg-emerald-50 border-emerald-200'
    },
    {
      id: 'act-3',
      name: 'Ahmad Fauzi',
      division: 'SECURITY',
      location: 'Ruang Server IT Lt 3',
      time: '13:55',
      status: 'Suhu AC Normal (21°C)',
      statusColor: 'text-cyan-700 bg-cyan-50 border-cyan-200'
    },
    {
      id: 'act-4',
      name: 'Armada B 1234 CD',
      division: 'DRIVER',
      location: 'Logistik Warehouse Cikarang',
      time: '13:10',
      status: 'Check-In Odometer: 42.150 KM',
      statusColor: 'text-amber-700 bg-amber-50 border-amber-200'
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

            {/* SOS Center Pill (Lumio High-Contrast White Pill) */}
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
             - Hero Attendance Card (Sparkline + Breakdown)
             - Hourly Shift & Checkpoint Cadence Matrix
             - Facility Readiness Spotlight (Teal Accent Card)
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* CARD 1: HERO OPERATIONAL ATTENDANCE (5 Columns) */}
        <div className="lg:col-span-4 lumio-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Kesiapan Personil
                </span>
              </div>
              <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                <TrendingUp className="w-3 h-3" />
                <span>100% Siaga</span>
              </span>
            </div>

            <div className="flex items-baseline space-x-2 mt-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tabular-nums">
                {totalPersonil}
              </span>
              <span className="text-sm font-semibold text-slate-500">
                Personil Terdaftar
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Kehadiran personil shift aktif sesuai target harian.
            </p>
          </div>

          {/* SVG Sparkline Curve (Lumio style smooth curve with gradient fill) */}
          <div className="my-5">
            <div className="h-14 w-full">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 70">
                <defs>
                  <linearGradient id="lumioSparklineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d9488" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 55 Q 50 50, 100 42 T 200 25 T 300 12 L 300 70 L 0 70 Z"
                  fill="url(#lumioSparklineGrad)"
                />
                <path
                  d="M 0 55 Q 50 50, 100 42 T 200 25 T 300 12"
                  fill="none"
                  stroke="#0f766e"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="300" cy="12" r="4.5" fill="#0f766e" stroke="#ffffff" strokeWidth="2" />
              </svg>
            </div>
            <div className="flex justify-between text-[10px] font-semibold text-slate-400 mt-1 px-1">
              <span>Sen</span>
              <span>Sel</span>
              <span>Rab</span>
              <span>Kam</span>
              <span>Jum</span>
              <span>Sab</span>
              <span className="text-teal-700 font-bold">Hari Ini</span>
            </div>
          </div>

          {/* Micro Division Breakdown Pills */}
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
        </div>

        {/* CARD 2: HOURLY CADENCE & MATRIX DISTRIBUTION (4 Columns) */}
        <div className="lg:col-span-4 lumio-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Distribusi Pemindaian Checkpoint
                </span>
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                    {totalCheckpoints}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Titik QR Terdaftar
                  </span>
                </div>
              </div>

              {/* Time Selector */}
              <div className="relative">
                <select
                  value={activeShiftFilter}
                  onChange={(e) => setActiveShiftFilter(e.target.value as any)}
                  className="text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200/80 cursor-pointer focus:outline-none"
                >
                  <option value="ALL">Semua Jam</option>
                  <option value="PAGI">Shift Pagi</option>
                  <option value="SIANG">Shift Siang</option>
                  <option value="MALAM">Shift Malam</option>
                </select>
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Ritme checkpoint per 2 jam untuk memastikan seluruh pos terpantau berkala.
            </p>
          </div>

          {/* Matrix Dot Plot Visual (Lumio Forecast style) */}
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-10 gap-1.5 text-center">
              {hourlyCadence.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center space-y-1">
                  <div className="h-20 w-full bg-slate-50 rounded-lg flex flex-col justify-end items-center p-1 space-y-1 border border-slate-100">
                    {Array.from({ length: 4 }).map((_, dotIdx) => {
                      const isActive = dotIdx < (item.total > 7 ? 4 : item.total > 5 ? 3 : 2);
                      return (
                        <span
                          key={dotIdx}
                          className={`w-2 h-2 rounded-full transition-all ${
                            isActive
                              ? idx === 4
                                ? 'bg-teal-700 scale-110 shadow-xs'
                                : 'bg-teal-400'
                              : 'bg-slate-200'
                          }`}
                        />
                      );
                    })}
                  </div>
                  <span className={`text-[10px] font-bold ${idx === 4 ? 'text-teal-700 font-extrabold' : 'text-slate-400'}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-600" />
                <span>Patroli Terjadwal</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-300" />
                <span>Standby / Transisi Shift</span>
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Status Site:</span>
            <span className="font-bold text-slate-800">
              Shift Berjalan: Pagi (07:00 - 15:00)
            </span>
          </div>
        </div>

        {/* CARD 3: SPOTLIGHT FACILITY READINESS (4 Columns, Deep Teal Accent) */}
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
              99.2% pemindaian QR code tervalidasi presisi di dalam batas perimeter fasilitas (radius aman maksimum 50 meter).
            </p>
          </div>

          <div className="space-y-4 my-4">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
              <div className="flex items-center justify-between text-xs">
                <span className="text-teal-100/90 font-medium">Validasi Radius Geofence:</span>
                <span className="font-extrabold text-emerald-300">50m Max • Akurat</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full w-[98%]" />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-teal-100/80">
              <span>Temuan Insiden Aktif:</span>
              <span className="font-bold text-white">0 Temuan Terbuka</span>
            </div>
          </div>

          <Link
            href="/absensi"
            className="w-full bg-white hover:bg-teal-50 text-slate-900 font-bold text-xs py-3 px-4 rounded-xl text-center shadow-lg transition flex items-center justify-center space-x-1.5 group"
          >
            <span>Buka Monitoring Absensi & Rute</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* ========================================================
          3. ASYMMETRIC GRID ROW 2:
             - Division Operational Progress (Segmented Bars)
             - Live Activity Feed (Recent Check-Ins & Incident Logs)
             - 7-Day Performance Bar Chart (with active highlight & tooltip)
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* CARD 4: DIVISION OPERATIONAL PROGRESS (4 Columns, Lumio "Where your money goes" style) */}
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
            <p className="text-xs text-slate-500 mb-5">
              Rasio kelengkapan checklist patroli, sanitasi zona, dan perjalanan logistik.
            </p>

            <div className="space-y-4">
              {/* Security Patrol */}
              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800">Satpam Security</span>
                  </div>
                  <span className="text-xs font-extrabold text-slate-900 tabular-nums">85%</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{securityCheckpoints} Pos • Rute Terkontrol</span>
                  {renderSegmentedPill(9, 10, 'bg-blue-600')}
                </div>
              </div>

              {/* Cleaning Service */}
              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <Leaf className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800">Cleaning Service</span>
                  </div>
                  <span className="text-xs font-extrabold text-slate-900 tabular-nums">90%</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{cleaningCheckpoints} Zona • Checklist Bersih</span>
                  {renderSegmentedPill(9, 10, 'bg-emerald-600')}
                </div>
              </div>

              {/* Driver Fleet */}
              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <Car className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-slate-800">Driver Logistik</span>
                  </div>
                  <span className="text-xs font-extrabold text-slate-900 tabular-nums">75%</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{driverPersonil} Armada • 0 Keterlambatan</span>
                  {renderSegmentedPill(7, 10, 'bg-amber-600')}
                </div>
              </div>

              {/* Staff Operasional */}
              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-4 h-4 text-slate-600" />
                    <span className="text-xs font-bold text-slate-800">Staf Fasilitas</span>
                  </div>
                  <span className="text-xs font-extrabold text-slate-900 tabular-nums">100%</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Administrasi & Rekap Presensi</span>
                  {renderSegmentedPill(10, 10, 'bg-slate-700')}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex justify-between items-center text-xs">
            <span className="text-slate-500">Kepatuhan Total Divisi:</span>
            <span className="font-extrabold text-teal-700">88.5% Target Terpenuhi</span>
          </div>
        </div>

        {/* CARD 5: LIVE OPERATIONAL ACTIVITY FEED (4 Columns, Lumio "Recent activity" style) */}
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
            <p className="text-xs text-slate-500 mb-4">
              Log pemindaian QR code dan pelaporan tugas lapangan secara waktu-nyata.
            </p>

            {/* List of Recent Activities */}
            <div className="space-y-3">
              {recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition"
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
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {act.name}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{act.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    <div className="text-xs font-bold text-slate-700 tabular-nums">
                      {act.time}
                    </div>
                    <span
                      className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border mt-0.5 ${act.statusColor}`}
                    >
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

        {/* CARD 6: 7-DAY OPERATIONAL VOLUME PERFORMANCE (4 Columns, Lumio style bar chart with active bar) */}
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
            <p className="text-xs text-slate-500 mb-4">
              Monitoring stabilitas aktivitas harian dibanding target kuota operasional.
            </p>

            {/* Bar Chart Area with Active Tooltip */}
            <div className="relative py-4">
              {/* Floating Tooltip for Active / Hovered Bar */}
              {hoveredBarIndex !== null && (
                <div
                  className="absolute -top-3 transition-all duration-200 pointer-events-none z-20"
                  style={{
                    left: `${(hoveredBarIndex / (weeklyData.length - 1)) * 75 + 5}%`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  <div className="bg-slate-900 text-white text-[10px] font-bold py-1 px-2.5 rounded-lg shadow-lg whitespace-nowrap flex items-center space-x-1">
                    <span>{weeklyData[hoveredBarIndex].fullDay}:</span>
                    <span className="text-teal-300 font-extrabold">
                      {barChartMetric === 'VOLUME'
                        ? `${weeklyData[hoveredBarIndex].volume} Scan`
                        : `${weeklyData[hoveredBarIndex].attendance}%`}
                    </span>
                  </div>
                  <div className="w-2 h-2 bg-slate-900 rotate-45 mx-auto -mt-1" />
                </div>
              )}

              {/* Bars Visual */}
              <div className="h-40 flex items-end justify-between gap-2.5 pt-6 pb-2 px-1 border-b border-slate-100">
                {weeklyData.map((item, idx) => {
                  const val = barChartMetric === 'VOLUME' ? item.volume : item.attendance;
                  const maxVal = barChartMetric === 'VOLUME' ? 160 : 100;
                  const heightPercent = Math.min(100, Math.round((val / maxVal) * 100));
                  const isHovered = hoveredBarIndex === idx;

                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group"
                      onMouseEnter={() => setHoveredBarIndex(idx)}
                    >
                      <div className="w-full flex items-end justify-center h-full">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                            item.isCurrent
                              ? 'bg-teal-700 lumio-bar-pattern shadow-sm'
                              : isHovered
                              ? 'bg-teal-500'
                              : 'bg-slate-100 group-hover:bg-slate-200'
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
              {barChartMetric === 'VOLUME' ? '117 Scan / Hari' : '90.7% Kepatuhan'}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================
          4. CONDITIONAL ATTENTION & ESCALATION STRIP
             (Only renders when there is attention needed or positive status)
          ======================================================== */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-2 rounded-xl bg-teal-50 border border-teal-100 text-teal-700">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              Status Keseluruhan: Kondisi Normal & Terkendali
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Tidak ada personil izin hari ini. Semua checkpoint pos patroli dan sanitasi area terdistribusi sesuai jadwal operasional masing-masing site.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <Link
            href="/datainduk/checkpoint"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition text-center"
          >
            Kelola Checkpoint QR
          </Link>
          <Link
            href="/laporan"
            className="text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-1.5 rounded-lg shadow-xs transition text-center"
          >
            Buka Arsip Laporan
          </Link>
        </div>
      </div>
    </div>
  );
}
