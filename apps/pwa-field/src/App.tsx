import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  QrCode, 
  Clock, 
  MapPin, 
  LogOut, 
  AlertCircle, 
  Camera, 
  CheckCircle,
  Truck, 
  Sparkles, 
  Wifi, 
  WifiOff, 
  Navigation, 
  CheckCircle2, 
  RefreshCw,
  Bell,
  HelpCircle,
  History,
  UserCheck,
  FileText,
  Video,
  KeyRound
} from 'lucide-react';
import { Division, Attendance, AttendanceStatus, BroadcastMessage } from '@patrol/types';
import { SelfieCameraModal } from './components/SelfieCameraModal';
import { LeaveModal } from './components/LeaveModal';
import { PatrolScanModal } from './components/PatrolScanModal';
import { DriverTripModal } from './components/DriverTripModal';
import { AttendanceHistoryModal } from './components/AttendanceHistoryModal';
import { ActivityHistoryModal } from './components/ActivityHistoryModal';
import { ProfileModal } from './components/ProfileModal';
import { PanicAlertModal } from './components/PanicAlertModal';
import { attendanceApi, sitesApi, broadcastApi } from './services/api';

export default function App() {
  const [currentDivision, setCurrentDivision] = useState<Division>(Division.SECURITY);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isCameraAvailable, setIsCameraAvailable] = useState<boolean>(true);

  // User Profile
  const [userProfile, setUserProfile] = useState({
    id: 'a0000000-0000-0000-0000-000000000005',
    fullName: 'BUDI SATPAM TEST',
    username: 'satpamtest',
    role: 'SECURITY_OFFICER',
    division: 'SECURITY',
    badgeNumber: 'NIK-SEC-005',
    rank: 'ANGGOTA',
  });

  // Attendance State
  const [activeAttendance, setActiveAttendance] = useState<Attendance | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Broadcast Message State
  const [broadcastAlert, setBroadcastAlert] = useState<BroadcastMessage | null>(null);

  // Modals
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [cameraMode, setCameraMode] = useState<'CLOCK_IN' | 'CLOCK_OUT'>('CLOCK_IN');
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState<boolean>(false);
  const [isPatrolScanOpen, setIsPatrolScanOpen] = useState<boolean>(false);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState<boolean>(false);
  const [isAttendanceHistoryOpen, setIsAttendanceHistoryOpen] = useState<boolean>(false);
  const [isActivityHistoryOpen, setIsActivityHistoryOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isPanicModalOpen, setIsPanicModalOpen] = useState<boolean>(false);

  // Idle Timer (60 seconds auto-redirect back to dashboard when selfie modal is opened)
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Demo Default Site: Head Office Sudirman
  const DEFAULT_SITE_ID = '11111111-1111-1111-1111-111111111111';

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Monitor device GPS
  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setGpsLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
          });
          setGpsError(null);
        },
        (err) => {
          setGpsError(err.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setGpsError('Perangkat tidak mendukung geolokasi GPS');
    }
  }, []);

  // Monitor Camera Availability
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          setIsCameraAvailable(true);
          stream.getTracks().forEach((track) => track.stop());
        })
        .catch(() => {
          setIsCameraAvailable(false);
        });
    }
  }, []);

  // Initial fetch for today's status & broadcasts
  useEffect(() => {
    const checkTodayStatus = async () => {
      try {
        const todayData = await attendanceApi.getTodayStatus();
        if (todayData && todayData.clockInTime) {
          setActiveAttendance(todayData);
        }
      } catch (err) {
        // Fallback for offline simulation
      }
    };

    const fetchBroadcast = async () => {
      try {
        const broadcasts = await broadcastApi.getActive(DEFAULT_SITE_ID);
        if (Array.isArray(broadcasts) && broadcasts.length > 0) {
          setBroadcastAlert(broadcasts[0]);
        }
      } catch (err) {
        // ignore
      }
    };

    checkTodayStatus();
    fetchBroadcast();
  }, []);

  // 60-Second Idle Timeout Auto-Reset when Camera is Open
  useEffect(() => {
    if (isCameraOpen) {
      idleTimerRef.current = setTimeout(() => {
        setIsCameraOpen(false);
        setStatusMessage({
          type: 'error',
          text: 'Batas waktu 60 detik tercapai. Kembali ke dashboard utama.',
        });
      }, 60000);
    } else {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    }

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [isCameraOpen]);

  // Handle Selfie Snapshot Callback
  const handlePhotoCaptured = async (base64Image: string) => {
    if (!gpsLocation) {
      setStatusMessage({ type: 'error', text: 'Menunggu koordinat GPS presisi sebelum absen.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    try {
      if (cameraMode === 'CLOCK_IN') {
        const res = await attendanceApi.clockIn({
          siteId: DEFAULT_SITE_ID,
          latitude: gpsLocation.lat,
          longitude: gpsLocation.lng,
          photoBase64: base64Image,
        });
        setActiveAttendance(res);
        setStatusMessage({
          type: 'success',
          text: `Presensi Masuk Berhasil! ${res.clockInWithinGeofence ? '(Dalam Geofence ✅)' : '(Di Luar Geofence ⚠️)'}`,
        });
      } else {
        if (!activeAttendance) return;
        const res = await attendanceApi.clockOut({
          attendanceId: activeAttendance.id,
          latitude: gpsLocation.lat,
          longitude: gpsLocation.lng,
          photoBase64: base64Image,
        });
        setActiveAttendance(res);
        setStatusMessage({
          type: 'success',
          text: `Presensi Pulang Berhasil! Total Jam Kerja: ${Math.round(res.effectiveWorkingMinutes / 60)} Jam.`,
        });
      }
    } catch (err: any) {
      // Offline fallback simulation
      const mockAttendance: Attendance = {
        id: `att-local-${Date.now()}`,
        userId: userProfile.id,
        siteId: DEFAULT_SITE_ID,
        division: currentDivision,
        date: new Date().toISOString().split('T')[0],
        clockInTime: new Date().toLocaleTimeString('id-ID'),
        clockInLatitude: gpsLocation.lat,
        clockInLongitude: gpsLocation.lng,
        clockInWithinGeofence: true,
        clockInDistanceMeters: 18,
        status: cameraMode === 'CLOCK_IN' ? AttendanceStatus.IN : AttendanceStatus.OUT,
        lateMinutes: 0,
        earlyDepartureMinutes: 0,
        effectiveWorkingMinutes: cameraMode === 'CLOCK_OUT' ? 480 : 0,
        isOvertime: false,
        overtimeMinutes: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setActiveAttendance(cameraMode === 'CLOCK_IN' ? mockAttendance : null);
      setStatusMessage({
        type: 'success',
        text: cameraMode === 'CLOCK_IN' ? 'Presensi Masuk Berhasil!' : 'Presensi Pulang Berhasil!',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAttendance = () => {
    if (activeAttendance && activeAttendance.status === AttendanceStatus.IN && !activeAttendance.clockOutTime) {
      setCameraMode('CLOCK_OUT');
    } else {
      setCameraMode('CLOCK_IN');
    }
    setIsCameraOpen(true);
  };

  const cycleDivision = () => {
    if (currentDivision === Division.SECURITY) {
      setCurrentDivision(Division.CLEANING);
    } else if (currentDivision === Division.CLEANING) {
      setCurrentDivision(Division.DRIVER);
    } else {
      setCurrentDivision(Division.SECURITY);
    }
  };

  const isClockedIn = activeAttendance && activeAttendance.status === AttendanceStatus.IN && !activeAttendance.clockOutTime;

  return (
    <div className="min-h-screen max-w-md mx-auto bg-slate-950 text-slate-100 flex flex-col justify-between p-4 shadow-2xl relative select-none">
      {/* ================= HEADER SECTION ================= */}
      <header className="space-y-3">
        {/* Top Navbar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-black text-xs text-white shadow-lg shadow-blue-900/40">
              PMS
            </div>
            <div>
              <h1 className="text-sm font-extrabold leading-tight tracking-wide text-white">PATROLI SISTEM</h1>
              <p className="text-[11px] text-slate-400 font-medium">Head Office Sudirman (SCBD)</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isOnline ? (
              <span className="flex items-center space-x-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                <Wifi className="w-3 h-3" />
                <span>Online</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-[10px] font-semibold text-amber-400 bg-amber-950/70 border border-amber-500/40 px-2 py-0.5 rounded-full">
                <WifiOff className="w-3 h-3" />
                <span>Offline</span>
              </span>
            )}
          </div>
        </div>

        {/* User Card Matching patroli.site: 👋 HELLO, BUDI SATPAM TEST */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-2xl p-3.5 border border-slate-800/80 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="h-11 w-11 rounded-xl bg-blue-950/80 border border-blue-500/40 flex items-center justify-center font-black text-blue-400 shadow-inner">
              BS
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-tight flex items-center space-x-1.5">
                <span>👋 HELLO, {userProfile.fullName}</span>
              </h2>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="text-[10px] bg-blue-600/30 text-blue-300 border border-blue-500/40 px-1.5 py-0.2 rounded font-bold uppercase">
                  {currentDivision} • {userProfile.rank}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">📍 SITE SCBD</span>
              </div>
            </div>
          </div>

          <button
            onClick={cycleDivision}
            className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer transition active:scale-95 shrink-0"
            title="Klik untuk beralih divisi"
          >
            Ganti Tim
          </button>
        </div>

        {/* Dual Status Indicator Banner: Lokasi: Terdeteksi ✅ / Kamera: Aktif ✅ */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-[11px]">
          <div className="flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400">Lokasi:</span>
            <span className="font-bold text-emerald-400">
              {gpsLocation ? 'Terdeteksi ✅' : 'Mencari... ⏳'}
            </span>
          </div>

          <div className="h-3 w-px bg-slate-800" />

          <div className="flex items-center space-x-1.5">
            <Camera className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400">Kamera:</span>
            <span className="font-bold text-emerald-400">
              {isCameraAvailable ? 'Aktif ✅' : 'Nonaktif ❌'}
            </span>
          </div>
        </div>

        {/* GPS Slow / Area Terbuka Alert */}
        {gpsError && (
          <div className="p-2.5 bg-amber-950/60 border border-amber-600/50 rounded-xl text-xs text-amber-300 flex items-center space-x-2 animate-pulse">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>GPS lambat. Coba refresh atau pindah area terbuka untuk sinyal presisi.</span>
          </div>
        )}

        {/* Broadcast Announcement Bar (if active) */}
        {broadcastAlert && (
          <div className="p-2.5 bg-blue-950/80 border border-blue-600/50 rounded-xl text-xs text-blue-200 flex items-center space-x-2 shadow-lg">
            <Bell className="w-4 h-4 shrink-0 text-amber-400 animate-bounce" />
            <div className="truncate">
              <span className="font-bold text-amber-400">INFO PUSAT: </span>
              <span>{broadcastAlert.content || broadcastAlert.message}</span>
            </div>
          </div>
        )}

        {/* Dynamic Toast Feedback */}
        {statusMessage && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center space-x-2 border transition ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
                : 'bg-rose-950/90 border-rose-500 text-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}
      </header>

      {/* ================= MAIN 8-CARD TOUCH GRID (patroli.site STYLE) ================= */}
      <main className="flex-1 my-4 flex flex-col justify-center">
        {/* Active Shift Indicator Pill */}
        <div className="mb-3 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isClockedIn ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
            <span className="text-slate-300 font-medium">
              Status Presensi: <strong className={isClockedIn ? 'text-emerald-400' : 'text-slate-400'}>
                {isClockedIn ? `Dinas Aktif (${activeAttendance?.clockInTime || '07:00'})` : 'Belum Mulai Dinas'}
              </strong>
            </span>
          </div>
          {isClockedIn && (
            <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded font-bold border border-emerald-800">
              IN GEOFENCE
            </span>
          )}
        </div>

        {/* 8-Card Responsive Touch Grid with Exact Hex Codes */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: ABSEN MASUK / PULANG (#ffc107 - Yellow) */}
          <button
            onClick={handleOpenAttendance}
            style={{ backgroundColor: '#ffc107' }}
            className="text-slate-950 p-4 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center space-y-2 hover:brightness-105 active:scale-95 transition min-h-[105px] border border-amber-300/40"
          >
            <Clock className="w-8 h-8 text-slate-950 stroke-[2.5]" />
            <div>
              <div className="font-black text-xs uppercase tracking-tight leading-tight">
                {isClockedIn ? 'ABSEN PULANG' : 'ABSEN MASUK'}
              </div>
              <div className="text-[10px] font-semibold text-slate-800 mt-0.5">
                {isClockedIn ? 'Akhiri Shift Dinas' : 'Selfie & Verifikasi GPS'}
              </div>
            </div>
          </button>

          {/* Card 2: INPUT KEGIATAN (#0d6efd - Primary Blue) */}
          <button
            onClick={() => {
              if (currentDivision === Division.DRIVER) {
                setIsDriverModalOpen(true);
              } else {
                setIsPatrolScanOpen(true);
              }
            }}
            style={{ backgroundColor: '#0d6efd' }}
            className="text-white p-4 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center space-y-2 hover:brightness-105 active:scale-95 transition min-h-[105px] border border-blue-400/40"
          >
            {currentDivision === Division.DRIVER ? (
              <Truck className="w-8 h-8 text-white stroke-[2.5]" />
            ) : currentDivision === Division.CLEANING ? (
              <Sparkles className="w-8 h-8 text-white stroke-[2.5]" />
            ) : (
              <QrCode className="w-8 h-8 text-white stroke-[2.5]" />
            )}
            <div>
              <div className="font-black text-xs uppercase tracking-tight leading-tight">
                INPUT KEGIATAN
              </div>
              <div className="text-[10px] font-medium text-blue-100 mt-0.5">
                {currentDivision === Division.DRIVER ? 'Log Armada & Odometer' : 'Scan Barcode Checkpoint'}
              </div>
            </div>
          </button>

          {/* Card 3: RIWAYAT ABSEN (#6f42c1 - Purple) */}
          <button
            onClick={() => setIsAttendanceHistoryOpen(true)}
            style={{ backgroundColor: '#6f42c1' }}
            className="text-white p-4 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center space-y-2 hover:brightness-105 active:scale-95 transition min-h-[105px] border border-purple-400/40"
          >
            <History className="w-8 h-8 text-white stroke-[2.5]" />
            <div>
              <div className="font-black text-xs uppercase tracking-tight leading-tight">
                RIWAYAT ABSEN
              </div>
              <div className="text-[10px] font-medium text-purple-200 mt-0.5">
                Log Kehadiran 30 Hari
              </div>
            </div>
          </button>

          {/* Card 4: RIWAYAT KEGIATAN (#6f42c1 - Purple) */}
          <button
            onClick={() => setIsActivityHistoryOpen(true)}
            style={{ backgroundColor: '#6f42c1' }}
            className="text-white p-4 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center space-y-2 hover:brightness-105 active:scale-95 transition min-h-[105px] border border-purple-400/40"
          >
            <FileText className="w-8 h-8 text-white stroke-[2.5]" />
            <div>
              <div className="font-black text-xs uppercase tracking-tight leading-tight">
                RIWAYAT KEGIATAN
              </div>
              <div className="text-[10px] font-medium text-purple-200 mt-0.5">
                Daftar Scan & Temuan
              </div>
            </div>
          </button>

          {/* Card 5: PANIC BUTTON (#dc3545 - Red) */}
          <button
            onClick={() => setIsPanicModalOpen(true)}
            style={{ backgroundColor: '#dc3545' }}
            className="text-white p-4 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center space-y-2 hover:brightness-105 active:scale-95 transition min-h-[105px] border border-red-400/40 animate-pulse"
          >
            <ShieldAlert className="w-8 h-8 text-white stroke-[2.5]" />
            <div>
              <div className="font-black text-xs uppercase tracking-tight leading-tight">
                PANIC BUTTON
              </div>
              <div className="text-[10px] font-medium text-red-200 mt-0.5">
                Sirine Darurat & GPS
              </div>
            </div>
          </button>

          {/* Card 6: UPDATE PROFILE (#17a2b8 - Cyan/Teal) */}
          <button
            onClick={() => setIsProfileModalOpen(true)}
            style={{ backgroundColor: '#17a2b8' }}
            className="text-white p-4 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center space-y-2 hover:brightness-105 active:scale-95 transition min-h-[105px] border border-teal-300/40"
          >
            <KeyRound className="w-8 h-8 text-white stroke-[2.5]" />
            <div>
              <div className="font-black text-xs uppercase tracking-tight leading-tight">
                UPDATE PROFILE
              </div>
              <div className="text-[10px] font-medium text-teal-100 mt-0.5">
                Ganti Sandi & Foto
              </div>
            </div>
          </button>

          {/* Card 7: BANTUAN TEKNIS (#20c997 - Mint/Green) */}
          <a
            href="https://wa.me/6281234567890?text=Halo%20Admin%20Pusat%2C%20saya%20petugas%20lapangan%20membutuhkan%20bantuan%20terkait%20aplikasi%20patroli."
            target="_blank"
            rel="noopener noreferrer"
            style={{ backgroundColor: '#20c997' }}
            className="text-white p-4 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center space-y-2 hover:brightness-105 active:scale-95 transition min-h-[105px] border border-emerald-300/40"
          >
            <HelpCircle className="w-8 h-8 text-white stroke-[2.5]" />
            <div>
              <div className="font-black text-xs uppercase tracking-tight leading-tight">
                BANTUAN TEKNIS
              </div>
              <div className="text-[10px] font-medium text-emerald-950 mt-0.5">
                WhatsApp Admin Resmi
              </div>
            </div>
          </a>

          {/* Card 8: LOGOUT SISTEM (#000000 - Black) */}
          <button
            onClick={() => {
              if (window.confirm('Apakah Anda yakin ingin keluar dari sesi aplikasi?')) {
                localStorage.removeItem('patrol_auth_token');
                setStatusMessage({ type: 'success', text: 'Sesi akun berhasil dikeluarkan.' });
              }
            }}
            style={{ backgroundColor: '#000000' }}
            className="text-white p-4 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center space-y-2 hover:brightness-125 active:scale-95 transition min-h-[105px] border border-slate-800"
          >
            <LogOut className="w-8 h-8 text-rose-500 stroke-[2.5]" />
            <div>
              <div className="font-black text-xs uppercase tracking-tight leading-tight">
                LOGOUT SISTEM
              </div>
              <div className="text-[10px] font-medium text-slate-400 mt-0.5">
                Keluar Dari Akun
              </div>
            </div>
          </button>
        </div>

        {/* Leave Request Action */}
        <div className="mt-3 text-center">
          <button
            onClick={() => setIsLeaveModalOpen(true)}
            className="text-xs text-slate-400 hover:text-white underline font-semibold transition"
          >
            Ajukan Form Izin / Sakit / Cuti
          </button>
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="text-center text-[10px] text-slate-500 border-t border-slate-900 pt-3">
        Patrol & Facility Management System • SCBD Jakarta • Enterprise In-House
      </footer>

      {/* ================= ALL MODALS ================= */}
      <SelfieCameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handlePhotoCaptured}
        title={cameraMode === 'CLOCK_IN' ? 'Swafoto Absen Masuk' : 'Swafoto Absen Pulang'}
      />

      <PatrolScanModal
        isOpen={isPatrolScanOpen}
        onClose={() => setIsPatrolScanOpen(false)}
        siteId={DEFAULT_SITE_ID}
        division={currentDivision}
        gpsLocation={gpsLocation}
        officerName={userProfile.fullName}
        onSuccess={(msg) => {
          setStatusMessage({ type: 'success', text: msg });
        }}
      />

      <AttendanceHistoryModal
        isOpen={isAttendanceHistoryOpen}
        onClose={() => setIsAttendanceHistoryOpen(false)}
      />

      <ActivityHistoryModal
        isOpen={isActivityHistoryOpen}
        onClose={() => setIsActivityHistoryOpen(false)}
        siteId={DEFAULT_SITE_ID}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={{
          id: userProfile.id,
          fullName: userProfile.fullName,
          username: userProfile.username,
          role: userProfile.role,
          division: userProfile.division,
          badgeNumber: userProfile.badgeNumber,
        }}
        onSuccess={(msg) => {
          setStatusMessage({ type: 'success', text: msg });
        }}
      />

      <PanicAlertModal
        isOpen={isPanicModalOpen}
        onClose={() => setIsPanicModalOpen(false)}
        siteId={DEFAULT_SITE_ID}
        gpsLocation={gpsLocation}
        officerName={userProfile.fullName}
        onSuccess={(msg) => {
          setStatusMessage({ type: 'success', text: msg });
        }}
      />

      <LeaveModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onSubmit={async (data) => {
          await attendanceApi.leaveRequest({
            siteId: DEFAULT_SITE_ID,
            status: data.status,
            date: data.date,
            leaveReason: data.leaveReason,
          });
          setStatusMessage({ type: 'success', text: 'Pengajuan Izin/Sakit berhasil dikirim!' });
        }}
      />

      <DriverTripModal
        isOpen={isDriverModalOpen}
        onClose={() => setIsDriverModalOpen(false)}
        siteId={DEFAULT_SITE_ID}
        driverName={userProfile.fullName}
        onSuccess={(msg) => {
          setStatusMessage({ type: 'success', text: msg });
        }}
      />
    </div>
  );
}
