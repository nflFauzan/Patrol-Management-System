'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Truck, 
  Download,
  Building2,
  ExternalLink,
  Check,
  X,
  Volume2,
  VolumeX,
  Radio
} from 'lucide-react';
import io, { Socket } from 'socket.io-client';

interface SosAlert {
  id: string;
  officerName: string;
  officerPhone?: string;
  division: string;
  siteName: string;
  latitude: number;
  longitude: number;
  mapsUrl: string;
  triggeredAt: string;
  alertStatus: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  isWhatsappDispatched: boolean;
  message?: string;
}

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
  const [selectedDivision, setSelectedDivision] = useState<'ALL' | 'SECURITY' | 'CLEANING' | 'DRIVER'>('ALL');
  const [activeSosAlert, setActiveSosAlert] = useState<SosAlert | null>(null);
  const [isSirenMuted, setIsSirenMuted] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Live Activity Feed
  const [activities, setActivities] = useState<ActivityItem[]>([
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
      officerName: 'Siti Rahma (Cleaning Service)',
      timeStr: '13:15 WIB',
      title: 'Checklist Sanitasi Restroom Lt 2 Selesai',
      detail: 'Lantai dipel, tempat sampah kosong, aroma wangi lavender',
    },
    {
      id: 'act-3',
      badge: 'DRV',
      badgeColor: 'bg-purple-100 text-purple-600',
      officerName: 'Budi Santoso (Driver Operasional)',
      timeStr: '13:00 WIB',
      title: 'Perjalanan Logistik: HQ Sudirman ➔ Cikarang',
      detail: 'Armada B 1234 CD • Odometer: 45.210 km • Muatan aman',
    },
  ]);

  // Connect Socket.io
  useEffect(() => {
    const socket: Socket = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join:site_room', '11111111-1111-1111-1111-111111111111');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Real-time SOS Alert Listener
    socket.on('sos:new', (alertData: any) => {
      setActiveSosAlert({
        id: alertData.id || `sos-${Date.now()}`,
        officerName: alertData.officerName || 'Ahmad Fauzi',
        officerPhone: alertData.officerPhone || '0812-3456-7890',
        division: alertData.division || 'Security',
        siteName: alertData.siteName || 'Head Office Sudirman',
        latitude: alertData.latitude || -6.2255,
        longitude: alertData.longitude || 106.8090,
        mapsUrl: alertData.mapsUrl || `https://www.google.com/maps?q=${alertData.latitude || -6.2255},${alertData.longitude || 106.8090}`,
        triggeredAt: alertData.triggeredAt || new Date().toISOString(),
        alertStatus: 'ACTIVE',
        isWhatsappDispatched: alertData.isWhatsappDispatched ?? true,
        message: alertData.message || 'Petugas membutuhkan bantuan darurat segera!',
      });
    });

    // Status Change Listener
    socket.on('sos:status_changed', (changeData: any) => {
      if (changeData.alertStatus === 'RESOLVED') {
        setActiveSosAlert(null);
      } else {
        setActiveSosAlert((prev) => prev ? { ...prev, alertStatus: changeData.alertStatus } : null);
      }
    });

    // Patrol Activity Listener
    socket.on('patrol:checkpoint_scanned', (scan: any) => {
      setActivities((prev) => [
        {
          id: `scan-${Date.now()}`,
          badge: 'SEC',
          badgeColor: scan.isIncident ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600',
          officerName: scan.officerName || 'Ahmad Fauzi',
          timeStr: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
          title: `Scan Checkpoint: ${scan.checkpointName || 'Pos Pantau'}`,
          detail: `Status: ${scan.statusResult} ${scan.isIncident ? '🚨 TIKET INSIDEN DIBUAT' : '• Aman Terkendali'}`,
        },
        ...prev.slice(0, 9),
      ]);
    });

    // Cleaning Activity Listener
    socket.on('cleaning:submitted', (cln: any) => {
      setActivities((prev) => [
        {
          id: `cln-${Date.now()}`,
          badge: 'CLN',
          badgeColor: 'bg-emerald-100 text-emerald-600',
          officerName: cln.officerName || 'Siti Rahma',
          timeStr: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
          title: `Sanitasi: ${cln.checkpointName || 'Restroom'}`,
          detail: 'Checklist kebersihan terverifikasi lengkap',
        },
        ...prev.slice(0, 9),
      ]);
    });

    // Driver Trip Started Listener
    socket.on('driver:trip_started', (trip: any) => {
      setActivities((prev) => [
        {
          id: `drv-start-${Date.now()}`,
          badge: 'DRV',
          badgeColor: 'bg-purple-100 text-purple-600',
          officerName: trip.driverName || 'Driver Operasional',
          timeStr: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
          title: `Perjalanan Armada Berangkat (${trip.vehiclePlateNumber || 'Armada'})`,
          detail: `${trip.originLocation || 'HQ'} ➔ ${trip.destinationLocation || 'Destinasi'} • Odo: ${trip.odometerStart?.toLocaleString()} km`,
        },
        ...prev.slice(0, 9),
      ]);
    });

    // Driver Trip Completed Listener
    socket.on('driver:trip_completed', (trip: any) => {
      setActivities((prev) => [
        {
          id: `drv-end-${Date.now()}`,
          badge: 'DRV',
          badgeColor: 'bg-emerald-100 text-emerald-600',
          officerName: 'Driver Operasional',
          timeStr: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
          title: `Perjalanan Armada Selesai (${trip.vehiclePlateNumber || 'Armada'})`,
          detail: `Tiba di tujuan • Jarak: ${trip.totalDistanceKm || 0} km • Odo Akhir: ${trip.odometerEnd?.toLocaleString()} km`,
        },
        ...prev.slice(0, 9),
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const [isHrisModalOpen, setIsHrisModalOpen] = useState<boolean>(false);
  const [hrisFilterDivision, setHrisFilterDivision] = useState<string>('ALL');
  const [hrisRecords, setHrisRecords] = useState<any[]>([
    {
      nik: 'SEC-2024-001',
      fullName: 'Ahmad Fauzi',
      division: 'SECURITY',
      siteName: 'Head Office Sudirman',
      date: '2026-10-12',
      shiftName: 'Pagi (07:00 - 15:00)',
      clockInTime: '06:52:10',
      clockInDistanceMeters: 18,
      clockOutTime: '15:08:45',
      clockOutDistanceMeters: 22,
      lateMinutes: 0,
      workDurationMinutes: 496,
      effectiveWorkingHours: 8.27,
      overtimeMinutes: 0,
      overtimeHours: 0,
      statusLabel: 'SELESAI',
    },
    {
      nik: 'CLN-2024-004',
      fullName: 'Siti Rahma',
      division: 'CLEANING',
      siteName: 'Head Office Sudirman',
      date: '2026-10-12',
      shiftName: 'Pagi (06:00 - 14:00)',
      clockInTime: '06:14:00',
      clockInDistanceMeters: 12,
      clockOutTime: '14:05:00',
      clockOutDistanceMeters: 15,
      lateMinutes: 14,
      workDurationMinutes: 471,
      effectiveWorkingHours: 7.85,
      overtimeMinutes: 0,
      overtimeHours: 0,
      statusLabel: 'SELESAI',
    },
    {
      nik: 'DRV-2024-002',
      fullName: 'Budi Santoso',
      division: 'DRIVER',
      siteName: 'Warehouse Cikarang',
      date: '2026-10-12',
      shiftName: 'Normal (08:00 - 17:00)',
      clockInTime: '07:55:00',
      clockInDistanceMeters: 45,
      clockOutTime: '18:45:00',
      clockOutDistanceMeters: 52,
      lateMinutes: 0,
      workDurationMinutes: 650,
      effectiveWorkingHours: 10.83,
      overtimeMinutes: 105,
      overtimeHours: 1.75,
      statusLabel: 'SELESAI',
    },
    {
      nik: 'SEC-2024-003',
      fullName: 'Doni Pratama',
      division: 'SECURITY',
      siteName: 'Warehouse Cikarang',
      date: '2026-10-12',
      shiftName: 'Malam (23:00 - 07:00)',
      clockInTime: '22:50:00',
      clockInDistanceMeters: 28,
      clockOutTime: '07:10:00',
      clockOutDistanceMeters: 31,
      lateMinutes: 0,
      workDurationMinutes: 500,
      effectiveWorkingHours: 8.33,
      overtimeMinutes: 0,
      overtimeHours: 0,
      statusLabel: 'SELESAI',
    },
  ]);

  const handleDownloadHrisCsv = () => {
    const filtered = hrisFilterDivision === 'ALL'
      ? hrisRecords
      : hrisRecords.filter(r => r.division === hrisFilterDivision);

    const headers = [
      'NIK',
      'Nama Karyawan',
      'Divisi',
      'Fasilitas / Site',
      'Tanggal',
      'Shift',
      'Jam Masuk',
      'Jarak Masuk (m)',
      'Jam Pulang',
      'Jarak Pulang (m)',
      'Terlambat (menit)',
      'Durasi Kerja (jam)',
      'Lembur (jam)',
      'Status Kehadiran',
    ];

    const rows = filtered.map((d) => [
      `"${d.nik || '-'}"`,
      `"${d.fullName}"`,
      `"${d.division}"`,
      `"${d.siteName}"`,
      `"${d.date}"`,
      `"${d.shiftName || '-'}"`,
      `"${d.clockInTime || '-'}"`,
      d.clockInDistanceMeters ?? '-',
      `"${d.clockOutTime || '-'}"`,
      d.clockOutDistanceMeters ?? '-',
      d.lateMinutes || 0,
      d.effectiveWorkingHours || 0,
      d.overtimeHours || 0,
      `"${d.statusLabel}"`,
    ]);

    const csvString = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rekap_hris_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAcknowledge = () => {
    if (activeSosAlert) {
      setActiveSosAlert({ ...activeSosAlert, alertStatus: 'ACKNOWLEDGED' });
    }
  };

  const handleResolve = () => {
    setActiveSosAlert(null);
  };

  // Trigger demo SOS for simulation test
  const handleSimulateSos = () => {
    setActiveSosAlert({
      id: `sos-sim-${Date.now()}`,
      officerName: 'Ahmad Fauzi',
      officerPhone: '0812-8899-0011',
      division: 'Security',
      siteName: 'Head Office Sudirman',
      latitude: -6.2255,
      longitude: 106.8090,
      mapsUrl: 'https://www.google.com/maps?q=-6.2255,106.8090',
      triggeredAt: new Date().toISOString(),
      alertStatus: 'ACTIVE',
      isWhatsappDispatched: true,
      message: 'Petugas membutuhkan bantuan darurat segera di Pos Utama!',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800">
      {/* Top Navbar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow">
            PMS
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Enterprise Facility & Patrol Command Center</h1>
            <p className="text-xs text-slate-400">Single-Tenant Corporate In-House Management System</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs px-3 py-1.5 rounded-full font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{isConnected ? 'Real-time WebSocket Online' : 'Command Center Ready'}</span>
          </div>

          <button
            onClick={handleSimulateSos}
            className="text-[11px] bg-rose-900/40 hover:bg-rose-900/60 border border-rose-500/50 text-rose-300 font-semibold px-2.5 py-1 rounded-lg transition"
            title="Simulasikan broadcast SOS darurat"
          >
            🚨 Test Alarm SOS
          </button>

          <div className="flex items-center space-x-2 text-sm text-slate-300 border-l border-slate-700 pl-4">
            <span className="font-semibold text-white">Superadmin</span>
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded">HQ Central</span>
          </div>
        </div>
      </header>

      {/* EMERGENCY SOS BANNER / MODAL OVERLAY */}
      {activeSosAlert && (
        <div className="bg-rose-600 text-white border-b-4 border-rose-800 px-6 py-4 shadow-2xl animate-pulse flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white text-rose-600 rounded-2xl shadow-lg animate-bounce">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider">
                  STATUS: {activeSosAlert.alertStatus}
                </span>
                <span className="bg-emerald-950/80 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-400/40">
                  {activeSosAlert.isWhatsappDispatched ? '✅ WhatsApp Gateway Dispatched (Fonnte/Wablas)' : '⏳ Dispatching WhatsApp...'}
                </span>
              </div>
              <h2 className="text-base font-extrabold mt-1">
                🚨 ALARM DARURAT AKTIF: {activeSosAlert.officerName} ({activeSosAlert.division})
              </h2>
              <p className="text-xs text-rose-100 flex items-center space-x-2 mt-0.5">
                <span>Fasilitas: <strong>{activeSosAlert.siteName}</strong></span>
                <span>•</span>
                <span>Koordinat: <strong>{activeSosAlert.latitude.toFixed(5)}, {activeSosAlert.longitude.toFixed(5)}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 flex-shrink-0">
            <a
              href={activeSosAlert.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2.5 px-3.5 rounded-xl border border-white/30 flex items-center space-x-1.5 transition"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Buka Google Maps</span>
            </a>

            {activeSosAlert.alertStatus === 'ACTIVE' ? (
              <button
                onClick={handleAcknowledge}
                className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-lg transition active:scale-95"
              >
                Konfirmasi Respon (Acknowledge)
              </button>
            ) : (
              <button
                onClick={handleResolve}
                className="bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-lg transition active:scale-95 flex items-center space-x-1"
              >
                <Check className="w-4 h-4" />
                <span>Tandai Selesai (Resolve)</span>
              </button>
            )}

            <button
              onClick={() => setIsSirenMuted(!isSirenMuted)}
              className="p-2.5 rounded-xl bg-rose-700/60 hover:bg-rose-700 text-white transition"
              title={isSirenMuted ? 'Nyalakan Sirene' : 'Matikan Suara Sirene'}
            >
              {isSirenMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* KPI Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Personil On-Duty</p>
              <h3 className="text-2xl font-bold text-slate-900">42 / 45</h3>
              <p className="text-xs text-emerald-600 font-medium">93% Kehadiran Shift</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Patroli Selesai</p>
              <h3 className="text-2xl font-bold text-slate-900">19 / 24</h3>
              <p className="text-xs text-slate-500">79% Target Shift Tercapai</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Titik Checkpoint</p>
              <h3 className="text-2xl font-bold text-slate-900">128 Titik</h3>
              <p className="text-xs text-slate-500">Tersebar di 2 Fasilitas</p>
            </div>
          </div>

          <div className={`p-5 rounded-xl border shadow-sm flex items-center space-x-4 transition ${
            activeSosAlert ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500' : 'bg-white border-slate-200'
          }`}>
            <div className={`p-3 rounded-lg ${activeSosAlert ? 'bg-rose-600 text-white animate-bounce' : 'bg-rose-50 text-rose-600'}`}>
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Panic SOS Aktif</p>
              <h3 className={`text-2xl font-bold ${activeSosAlert ? 'text-rose-600' : 'text-slate-900'}`}>
                {activeSosAlert ? '1 Kasus' : '0 Kasus'}
              </h3>
              <p className={`text-xs font-medium ${activeSosAlert ? 'text-rose-600 font-bold' : 'text-emerald-600'}`}>
                {activeSosAlert ? 'Membutuhkan Penanganan Segera!' : 'Kondisi Aman Terkendali'}
              </p>
            </div>
          </div>
        </div>

        {/* Division Filter & HRIS Export Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Divisi:</span>
            <button 
              onClick={() => setSelectedDivision('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${selectedDivision === 'ALL' ? 'bg-slate-900 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Semua Divisi
            </button>
            <button 
              onClick={() => setSelectedDivision('SECURITY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${selectedDivision === 'SECURITY' ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Satpam (Security)</span>
            </button>
            <button 
              onClick={() => setSelectedDivision('CLEANING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${selectedDivision === 'CLEANING' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cleaning Service</span>
            </button>
            <button 
              onClick={() => setSelectedDivision('DRIVER')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${selectedDivision === 'DRIVER' ? 'bg-purple-600 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Driver Armada</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setIsHrisModalOpen(true)}
              className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Rekap HRIS (Excel / CSV)</span>
            </button>
          </div>
        </div>

        {/* Monitoring Section Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Facility Status Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-slate-500" />
                <span>Status Fasilitas & Lokasi</span>
              </h2>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">PostGIS Geofence</span>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900">Head Office Sudirman</h4>
                    <p className="text-xs text-slate-500">Kav. 52-53, Jakarta Selatan</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Radius 100m</span>
                </div>
                <div className="mt-2 text-xs text-slate-600 flex justify-between">
                  <span>Petugas Aktif: 18 Orang</span>
                  <span className="text-blue-600 font-medium">6 Checkpoint Security</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900">Warehouse & Factory Cikarang</h4>
                    <p className="text-xs text-slate-500">Kawasan Industri GIIC, Bekasi</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Radius 250m</span>
                </div>
                <div className="mt-2 text-xs text-slate-600 flex justify-between">
                  <span>Petugas Aktif: 24 Orang</span>
                  <span className="text-blue-600 font-medium">14 Checkpoint Area</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
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
      </main>

      {/* HRIS ATTENDANCE RECAP MODAL */}
      {isHrisModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-blue-600 rounded-xl shadow">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Rekapitulasi Absensi HRIS & Log Operasional</h3>
                  <p className="text-xs text-slate-400">
                    Perhitungan Otomatis: Jam Efektif, Menit Terlambat, Lembur (Overtime), & Validasi Geofence PostGIS
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsHrisModalOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal KPI Highlights */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Personil Hadir</span>
                <span className="text-xl font-extrabold text-slate-900">{hrisRecords.length} Personil</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Jam Kerja Efektif Total</span>
                <span className="text-xl font-extrabold text-blue-600">
                  {hrisRecords.reduce((acc, r) => acc + (r.effectiveWorkingHours || 0), 0).toFixed(1)} Jam
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Lembur Disetujui</span>
                <span className="text-xl font-extrabold text-purple-600">
                  {hrisRecords.reduce((acc, r) => acc + (r.overtimeHours || 0), 0).toFixed(2)} Jam
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Kepatuhan Geofence</span>
                <span className="text-xl font-extrabold text-emerald-600">100% In-Radius</span>
              </div>
            </div>

            {/* Modal Toolbar & Division Filter */}
            <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Filter Divisi:</span>
                <button
                  onClick={() => setHrisFilterDivision('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    hrisFilterDivision === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua Divisi ({hrisRecords.length})
                </button>
                <button
                  onClick={() => setHrisFilterDivision('SECURITY')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    hrisFilterDivision === 'SECURITY' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Satpam ({hrisRecords.filter(r => r.division === 'SECURITY').length})
                </button>
                <button
                  onClick={() => setHrisFilterDivision('CLEANING')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    hrisFilterDivision === 'CLEANING' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Cleaning ({hrisRecords.filter(r => r.division === 'CLEANING').length})
                </button>
                <button
                  onClick={() => setHrisFilterDivision('DRIVER')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    hrisFilterDivision === 'DRIVER' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Driver ({hrisRecords.filter(r => r.division === 'DRIVER').length})
                </button>
              </div>

              <button
                onClick={handleDownloadHrisCsv}
                className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Unduh File CSV HRIS (Excel-Ready)</span>
              </button>
            </div>

            {/* Modal Table Content */}
            <div className="flex-1 overflow-auto p-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-2.5 px-3">NIK</th>
                    <th className="py-2.5 px-3">Nama Lengkap</th>
                    <th className="py-2.5 px-3">Divisi</th>
                    <th className="py-2.5 px-3">Fasilitas / Site</th>
                    <th className="py-2.5 px-3">Shift</th>
                    <th className="py-2.5 px-3">Masuk / Jarak</th>
                    <th className="py-2.5 px-3">Pulang / Jarak</th>
                    <th className="py-2.5 px-3 text-center">Terlambat</th>
                    <th className="py-2.5 px-3 text-center">Jam Kerja</th>
                    <th className="py-2.5 px-3 text-center">Lembur (OT)</th>
                    <th className="py-2.5 px-3 text-center">Geofence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {hrisRecords
                    .filter(r => hrisFilterDivision === 'ALL' || r.division === hrisFilterDivision)
                    .map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-3 font-mono font-medium text-slate-500">{item.nik}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{item.fullName}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.division === 'SECURITY' ? 'bg-blue-100 text-blue-700' :
                            item.division === 'CLEANING' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {item.division}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{item.siteName}</td>
                        <td className="py-2.5 px-3 text-slate-500">{item.shiftName}</td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-slate-900">{item.clockInTime}</span>
                          <span className="block text-[10px] text-slate-400">({item.clockInDistanceMeters}m dari pusat)</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-slate-900">{item.clockOutTime}</span>
                          <span className="block text-[10px] text-slate-400">({item.clockOutDistanceMeters}m dari pusat)</span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {item.lateMinutes > 0 ? (
                            <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded">{item.lateMinutes} m</span>
                          ) : (
                            <span className="text-emerald-600 font-medium">Tepat Waktu</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                          {item.effectiveWorkingHours} jam
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {item.overtimeHours > 0 ? (
                            <span className="font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                              +{item.overtimeHours} jam
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="inline-flex items-center space-x-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold text-[10px]">
                            <Check className="w-3 h-3" />
                            <span>Valid (In-Radius)</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-between items-center text-xs text-slate-500">
              <p>Format export CSV kompatibel langsung dengan sistem payroll/HRIS korporat (SAP, Talenta, SunFish, dsb).</p>
              <button
                onClick={() => setIsHrisModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
