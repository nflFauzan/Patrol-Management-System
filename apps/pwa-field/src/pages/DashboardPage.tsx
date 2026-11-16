import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Bell,
  Users,
  MapPin,
  Building2,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  Clock,
  Info,
  QrCode,
  LogOut,
  Calendar,
  User,
  FileText,
  Home,
  Sparkles,
  Car
} from 'lucide-react';
import { Attendance } from '@patrol/types';
import { attendanceApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SurfaceCard } from '../components/ui/SurfaceCard';
import { SkeuomorphicButton } from '../components/ui/SkeuomorphicButton';
import { StatusBadge } from '../components/ui/StatusBadge';
import { OfflineStatusBar } from '../components/OfflineStatusBar';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Dynamic User Profile from Authenticated Session
  const userProfile = {
    id: user?.id || 'guest',
    fullName: user?.fullName || 'Petugas Lapangan',
    username: user?.username || '',
    role: (user?.role as string) || 'SECURITY_OFFICER',
    division: (user?.division as string) || 'SECURITY',
    badgeNumber: user?.username ? `NIK-${user.username.toUpperCase()}` : 'NIK-FIELD',
    rank: (user?.securityRank as string) || (user?.role === 'ADMIN_SUPER' ? 'CHIEF' : 'ANGGOTA'),
  };

  const [activeAttendance, setActiveAttendance] = useState<Attendance | null>(null);
  const [activeTab, setActiveTab] = useState<'beranda' | 'patroli' | 'laporan' | 'profil'>('beranda');

  // Check today's attendance status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const todayData = await attendanceApi.getTodayStatus();
        if (todayData && todayData.clockInTime) {
          setActiveAttendance(todayData);
        }
      } catch (err) {
        console.warn('Could not fetch today status:', err);
      }
    };
    checkStatus();
  }, []);

  const isClockedIn = !!(activeAttendance && activeAttendance.clockInTime && !activeAttendance.clockOutTime);

  const handleOpenInputKegiatan = () => {
    if (userProfile.role === 'CHIEF' || userProfile.rank === 'CHIEF') {
      navigate('/validasi-patroli/xxxxx_xxxxxxxxxxxxx.php');
    } else if (userProfile.role === 'COMMANDER' || userProfile.rank === 'DANRU') {
      navigate('/validasi-patroli/xxxxx_xxxxxxxxxxxx.php');
    } else if (userProfile.division === 'DRIVER' || userProfile.role === 'DRIVER') {
      navigate('/validasi-patroli/xxxxx_xxxxxxxxxx.php');
    } else if (userProfile.division === 'CLEANING' || userProfile.role === 'STAFF') {
      navigate('/validasi-patroli/xxxxx_xxxxxxxxxxxxxx.php');
    } else {
      navigate('/validasi-patroli/xxxxx_xxxxxxxxx.php');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#E5E9EE] pb-24 text-slate-800 font-sans select-none">
      {/* Top Header App Bar */}
      <header className="sticky top-0 z-30 bg-[#E5E9EE]/90 backdrop-blur-md px-4 py-3 border-b border-slate-300/60 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white shadow-soft-xs border border-white/40">
            <Shield className="w-4 h-4 fill-white/20" />
          </div>
          <span className="font-extrabold text-sm text-slate-800 tracking-tight">
            Patroli <span className="text-sky-600 font-black">Site</span>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Active User Division & Rank Badge */}
          <span className="text-[10px] font-bold bg-slate-900 text-white rounded-lg px-2.5 py-1 uppercase tracking-wider shadow-xs">
            {userProfile.division} • {userProfile.rank}
          </span>

          {/* Notification Bell */}
          <button
            type="button"
            onClick={() => navigate('/validasi-patroli/xxxxx_xxxxxx.php')}
            className="relative p-2 rounded-xl bg-white border border-slate-300/80 shadow-skeuo-button-secondary text-slate-600 hover:text-slate-900 active:scale-95 transition"
            aria-label="Notifikasi"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse ring-2 ring-white" />
          </button>
        </div>
      </header>

      {/* Offline Status & Pending Sync Bar */}
      <OfflineStatusBar />

      {/* Main Content Area */}
      <main className="px-4 pt-4 space-y-4 max-w-md mx-auto">
        {/* Hero Greeting Section */}
        <div className="pt-1">
          <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
            Selamat Pagi, {userProfile.fullName} 👋
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Semoga hari ini operasional berjalan lancar.
          </p>
        </div>

        {/* 2x2 Bento Stat Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: Personel */}
          <SurfaceCard className="p-3.5 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">Personel</p>
              <p className="text-base font-extrabold text-slate-800 tracking-tight">124</p>
            </div>
          </SurfaceCard>

          {/* Card 2: Area */}
          <SurfaceCard className="p-3.5 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">Area</p>
              <p className="text-base font-extrabold text-slate-800 tracking-tight">12</p>
            </div>
          </SurfaceCard>

          {/* Card 3: Site */}
          <SurfaceCard className="p-3.5 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">Site</p>
              <p className="text-base font-extrabold text-slate-800 tracking-tight">48</p>
            </div>
          </SurfaceCard>

          {/* Card 4: Absensi Hari Ini */}
          <SurfaceCard className="p-3.5 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">Absensi Hari Ini</p>
              <p className="text-base font-extrabold text-slate-800 tracking-tight">96%</p>
            </div>
          </SurfaceCard>
        </div>

        {/* Hero Active Patrol Pill Card */}
        <button
          type="button"
          onClick={() => navigate('/validasi-patroli/xxxxx_xxxxxxxxx.php')}
          className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-sky-500 via-sky-600 to-sky-700 text-white shadow-sky-glow border-t border-white/30 border-b border-sky-800 flex items-center justify-between transition hover:brightness-105 active:scale-[0.99]"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white border border-white/30">
              <Shield className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-extrabold tracking-wide">Patroli Aktif</div>
              <div className="text-[11px] text-sky-100 font-medium">7 Personel Bertugas</div>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
            <ChevronRight className="w-4 h-4 text-white" />
          </div>
        </button>

        {/* Primary Operational Action Grid */}
        <SurfaceCard className="p-4 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Menu Operasional Lapangan
            </h2>
            <StatusBadge variant={isClockedIn ? 'success' : 'warning'} dot={true}>
              {isClockedIn ? 'Sedang Shift' : 'Belum Absen'}
            </StatusBadge>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Action 1: Presensi Masuk / Pulang */}
            {!isClockedIn ? (
              <button
                type="button"
                onClick={() => navigate('/validasi-patroli/xxxxx_xx.php')}
                className="p-3 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 text-white font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-soft-xs border-t border-white/30 active:scale-95 transition"
              >
                <Clock className="w-5 h-5" />
                <span>Absen Masuk</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/validasi-patroli/xxxxx_xxx.php')}
                className="p-3 rounded-xl bg-gradient-to-b from-amber-500 to-amber-600 text-white font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-soft-xs border-t border-white/30 active:scale-95 transition"
              >
                <Clock className="w-5 h-5" />
                <span>Absen Pulang</span>
              </button>
            )}

            {/* Action 2: Scan QR / Input Kegiatan */}
            <button
              type="button"
              onClick={handleOpenInputKegiatan}
              className="p-3 rounded-xl bg-gradient-to-b from-sky-500 to-sky-600 text-white font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-soft-xs border-t border-white/30 active:scale-95 transition"
            >
              <QrCode className="w-5 h-5" />
              <span>
                {userProfile.division === 'DRIVER'
                  ? 'Log Armada'
                  : userProfile.division === 'CLEANING'
                    ? 'Checklist Zona'
                    : 'Scan Patroli'}
              </span>
            </button>

            {/* Action 3: Riwayat Absen */}
            <button
              type="button"
              onClick={() => navigate('/validasi-patroli/xxxxx_xxxxx.php')}
              className="p-3 rounded-xl bg-white border border-slate-200/90 text-slate-700 font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-skeuo-button-secondary hover:bg-slate-50 active:scale-95 transition"
            >
              <Calendar className="w-5 h-5 text-sky-600" />
              <span>Riwayat Absen</span>
            </button>

            {/* Action 4: Panic Button SOS */}
            <button
              type="button"
              onClick={() => navigate('/validasi-patroli/xxxxx_xxxxxxx.php')}
              className="p-3 rounded-xl bg-gradient-to-b from-rose-500 to-rose-600 text-white font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-soft-xs border-t border-white/30 active:scale-95 transition"
            >
              <AlertTriangle className="w-5 h-5 text-white" />
              <span>Panic SOS</span>
            </button>
          </div>
        </SurfaceCard>

        {/* Aktivitas Terbaru (Recent Activity Feed matching reference image) */}
        <SurfaceCard className="p-4 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-xs font-bold text-slate-800">
              Aktivitas Terbaru
            </h2>
            <button
              type="button"
              onClick={() => navigate('/validasi-patroli/xxxxx_xxxxxx.php')}
              className="text-[11px] font-bold text-sky-600 hover:text-sky-700 flex items-center space-x-0.5"
            >
              <span>Lihat Semua</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {/* Feed 1: Patroli Selesai */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/70">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Patroli Selesai</p>
                  <p className="text-[10px] text-slate-500">Site Produksi • 08:50</p>
                </div>
              </div>
            </div>

            {/* Feed 2: Absensi Masuk */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/70">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Absensi Masuk</p>
                  <p className="text-[10px] text-slate-500">Area Utama • 08:40</p>
                </div>
              </div>
            </div>

            {/* Feed 3: Panic Alert */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/70">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Panic Alert</p>
                  <p className="text-[10px] text-slate-500">Area Gudang • 09:12</p>
                </div>
              </div>
            </div>
          </div>
        </SurfaceCard>
      </main>

      {/* Pinned Bottom Navigation Bar matching visual reference image */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-soft-lg px-6 py-2 flex items-center justify-around max-w-md mx-auto">
        <button
          type="button"
          onClick={() => setActiveTab('beranda')}
          className={`flex flex-col items-center space-y-0.5 transition ${activeTab === 'beranda' ? 'text-sky-600' : 'text-slate-400 hover:text-slate-600'
            }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold">Beranda</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('patroli');
            handleOpenInputKegiatan();
          }}
          className={`flex flex-col items-center space-y-0.5 transition ${activeTab === 'patroli' ? 'text-sky-600' : 'text-slate-400 hover:text-slate-600'
            }`}
        >
          <Shield className="w-5 h-5" />
          <span className="text-[10px] font-bold">Patroli</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('laporan');
            navigate('/validasi-patroli/xxxxx_xxxxxx.php');
          }}
          className={`flex flex-col items-center space-y-0.5 transition ${activeTab === 'laporan' ? 'text-sky-600' : 'text-slate-400 hover:text-slate-600'
            }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px] font-bold">Laporan</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('profil');
            navigate('/validasi-patroli/xxxxx_xxxxxxxx.php');
          }}
          className={`flex flex-col items-center space-y-0.5 transition ${activeTab === 'profil' ? 'text-sky-600' : 'text-slate-400 hover:text-slate-600'
            }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-bold">Profil</span>
        </button>
      </nav>
    </div>
  );
};
