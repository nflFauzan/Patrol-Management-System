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
  Radio,
  Calendar,
  FileText,
  DollarSign,
  Bell,
  LayoutDashboard,
  Upload,
  Printer
} from 'lucide-react';
import io, { Socket } from 'socket.io-client';

import { AttendanceMatrixTab } from '../components/AttendanceMatrixTab';
import { HourlyPatrolMatrixTab } from '../components/HourlyPatrolMatrixTab';
import { PayrollTab } from '../components/PayrollTab';
import { MasterDataTab } from '../components/MasterDataTab';
import { ReportsTab } from '../components/ReportsTab';
import { BroadcastTab } from '../components/BroadcastTab';
import { ExportCenterTab } from '../components/ExportCenterTab';
import { BulkImportModal } from '../components/BulkImportModal';
import { PrintQrModal } from '../components/PrintQrModal';
import { PrintIdCardModal } from '../components/PrintIdCardModal';

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
  const [activeMainTab, setActiveMainTab] = useState<
    'DASHBOARD' | 'DATA_INDUK' | 'ABSENSI_MATRIX' | 'PATROLI_24H' | 'LAPORAN' | 'GAJI' | 'BROADCAST' | 'EXPORT_CENTER'
  >('DASHBOARD');

  const [selectedSiteId, setSelectedSiteId] = useState<string>('11111111-1111-1111-1111-111111111111');
  const [selectedDivision, setSelectedDivision] = useState<'ALL' | 'SECURITY' | 'CLEANING' | 'DRIVER'>('ALL');
  const [activeSosAlert, setActiveSosAlert] = useState<SosAlert | null>(null);
  const [isSirenMuted, setIsSirenMuted] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Modals state
  const [isHrisModalOpen, setIsHrisModalOpen] = useState<boolean>(false);
  const [bulkImportType, setBulkImportType] = useState<'CHECKPOINT' | 'PERSONIL' | null>(null);
  const [printQrTarget, setPrintQrTarget] = useState<any | null>(null);
  const [printIdCardTarget, setPrintIdCardTarget] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
      socket.emit('join:site_room', selectedSiteId);
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

    return () => {
      socket.disconnect();
    };
  }, [selectedSiteId]);

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

  const handleAcknowledge = () => {
    if (activeSosAlert) {
      setActiveSosAlert({ ...activeSosAlert, alertStatus: 'ACKNOWLEDGED' });
    }
  };

  const handleResolve = () => {
    setActiveSosAlert(null);
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
            <p className="text-xs text-slate-400">Single-Tenant Corporate In-House Management System (SCBD & Cikarang)</p>
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

      {/* Main Navigation Tabs Ribbon matching patroli.site */}
      <nav className="bg-white border-b border-slate-200 px-6 py-2 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-1.5 text-xs font-bold">
          <button
            onClick={() => setActiveMainTab('DASHBOARD')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition ${
              activeMainTab === 'DASHBOARD' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>DASHBOARD</span>
          </button>

          <button
            onClick={() => setActiveMainTab('DATA_INDUK')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition ${
              activeMainTab === 'DATA_INDUK' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-4 h-4 text-blue-500" />
            <span>DATA INDUK</span>
          </button>

          <button
            onClick={() => setActiveMainTab('ABSENSI_MATRIX')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition ${
              activeMainTab === 'ABSENSI_MATRIX' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4 text-emerald-500" />
            <span>ABSENSI (31-HARI)</span>
          </button>

          <button
            onClick={() => setActiveMainTab('PATROLI_24H')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition ${
              activeMainTab === 'PATROLI_24H' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>PATROLI (24-JAM)</span>
          </button>

          <button
            onClick={() => setActiveMainTab('LAPORAN')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition ${
              activeMainTab === 'LAPORAN' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4 text-purple-500" />
            <span>LAPORAN DIVISI</span>
          </button>

          <button
            onClick={() => setActiveMainTab('GAJI')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition ${
              activeMainTab === 'GAJI' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>GAJI (H/L/I)</span>
          </button>

          <button
            onClick={() => setActiveMainTab('BROADCAST')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition ${
              activeMainTab === 'BROADCAST' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Bell className="w-4 h-4 text-amber-500" />
            <span>PESAN SIARAN</span>
          </button>

          <button
            onClick={() => setActiveMainTab('EXPORT_CENTER')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition ${
              activeMainTab === 'EXPORT_CENTER' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>EXPORT CENTER</span>
          </button>
        </div>
      </nav>

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

      {/* Dynamic Toast Feedback */}
      {toastMessage && (
        <div className="max-w-7xl mx-auto w-full px-6 pt-4">
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-xl text-xs flex justify-between items-center shadow-sm">
            <span className="font-semibold">✅ {toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Render Tab 1: DASHBOARD */}
        {activeMainTab === 'DASHBOARD' && (
          <div className="space-y-6">
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

            {/* Division Filter & Quick Actions */}
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
                  onClick={() => setActiveMainTab('ABSENSI_MATRIX')}
                  className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow transition"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Lihat Matriks 31-Hari</span>
                </button>
                <button 
                  onClick={() => setActiveMainTab('PATROLI_24H')}
                  className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow transition"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Monitoring Patroli 24H</span>
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
                        <p className="text-xs text-slate-500">Kav. 52-53 SCBD, Jakarta Selatan</p>
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
          </div>
        )}

        {/* Render Tab 2: DATA INDUK */}
        {activeMainTab === 'DATA_INDUK' && (
          <MasterDataTab
            onOpenBulkImport={(type) => setBulkImportType(type)}
            onOpenPrintQr={(checkpoint) => setPrintQrTarget(checkpoint)}
            onOpenPrintIdCard={(user) => setPrintIdCardTarget(user)}
          />
        )}

        {/* Render Tab 3: ABSENSI (31-HARI MATRIX) */}
        {activeMainTab === 'ABSENSI_MATRIX' && (
          <AttendanceMatrixTab selectedSiteId={selectedSiteId} />
        )}

        {/* Render Tab 4: PATROLI (24-JAM MATRIX) */}
        {activeMainTab === 'PATROLI_24H' && (
          <HourlyPatrolMatrixTab selectedSiteId={selectedSiteId} />
        )}

        {/* Render Tab 5: LAPORAN DIVISI */}
        {activeMainTab === 'LAPORAN' && (
          <ReportsTab selectedSiteId={selectedSiteId} />
        )}

        {/* Render Tab 6: GAJI (H/L/I) */}
        {activeMainTab === 'GAJI' && (
          <PayrollTab selectedSiteId={selectedSiteId} />
        )}

        {/* Render Tab 7: PESAN SIARAN */}
        {activeMainTab === 'BROADCAST' && (
          <BroadcastTab selectedSiteId={selectedSiteId} />
        )}

        {/* Render Tab 8: EXPORT CENTER */}
        {activeMainTab === 'EXPORT_CENTER' && (
          <ExportCenterTab />
        )}
      </main>

      {/* ALL MODALS */}
      {bulkImportType && (
        <BulkImportModal
          isOpen={!!bulkImportType}
          type={bulkImportType}
          onClose={() => setBulkImportType(null)}
          onSuccess={(msg) => setToastMessage(msg)}
        />
      )}

      {printQrTarget && (
        <PrintQrModal
          isOpen={!!printQrTarget}
          checkpoint={printQrTarget}
          onClose={() => setPrintQrTarget(null)}
        />
      )}

      {printIdCardTarget && (
        <PrintIdCardModal
          isOpen={!!printIdCardTarget}
          user={printIdCardTarget}
          onClose={() => setPrintIdCardTarget(null)}
        />
      )}
    </div>
  );
}
