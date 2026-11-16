import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Camera,
  MapPin,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Send,
  Building
} from 'lucide-react';
import { attendanceApi } from '../services/api';
import { enqueueOfflineTransaction } from '../services/offlineQueue';
import { OfflineStatusBar } from '../components/OfflineStatusBar';
import { SurfaceCard } from '../components/ui/SurfaceCard';
import { SkeuomorphicButton } from '../components/ui/SkeuomorphicButton';
import { StatusBadge } from '../components/ui/StatusBadge';

export const ClockInPage: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [locationDetected, setLocationDetected] = useState(false);
  const [locationInitializing, setLocationInitializing] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraInitializing, setCameraInitializing] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [alasan, setAlasan] = useState('1'); // 1: Piket Rutin, 2: Lembur, 3: Penugasan lain
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successTimestamp, setSuccessTimestamp] = useState<string>('');

  // 60-second Idle Timer matching patroli.site xxxxx_xx.php
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/validasi-patroli/');
    }, 60000);
    return () => clearTimeout(timer);
  }, [navigate]);

  // Request GPS
  const getLocation = () => {
    setLocationInitializing(true);
    setLocationDetected(false);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationDetected(true);
          setLocationInitializing(false);
          startCamera();
        },
        () => {
          setLocationInitializing(false);
          setLocationDetected(false);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 5000 },
      );
    } else {
      setLocationInitializing(false);
    }
  };

  // Start Camera
  const startCamera = async () => {
    setCameraInitializing(true);
    setCameraActive(false);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
      setCameraInitializing(false);
    } catch (e) {
      console.error(e);
      setCameraInitializing(false);
      setCameraActive(false);
    }
  };

  useEffect(() => {
    getLocation();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleSnap = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, 480, 480);
      const dataUri = canvas.toDataURL('image/jpeg', 0.6);
      setPhotoDataUrl(dataUri);
    }
  };

  const handleRetake = () => {
    setPhotoDataUrl(null);
    startCamera();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoDataUrl || !gpsCoords) {
      alert('Foto selfie dan lokasi GPS wajib ada!');
      return;
    }
    setIsSubmitting(true);

    const payload = {
      siteId: '11111111-1111-1111-1111-111111111111',
      latitude: gpsCoords.lat,
      longitude: gpsCoords.lng,
      photoBase64: photoDataUrl,
      notes: alasan === '2' ? 'Lembur' : alasan === '3' ? 'Penugasan lain' : 'Piket Rutin',
    };

    const recordSuccess = (offline = false) => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };
      const dateStr = now.toLocaleDateString('id-ID', options);
      const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
      setSuccessTimestamp(`${dateStr} • ${timeStr}${offline ? ' (Tersimpan Offline)' : ''}`);
      setShowSuccessModal(true);
    };

    try {
      if (!navigator.onLine) {
        await enqueueOfflineTransaction('ATTENDANCE_CLOCK_IN', payload);
        recordSuccess(true);
        return;
      }

      await attendanceApi.clockIn(payload);
      recordSuccess(false);
    } catch (err: any) {
      const isNetworkErr = !err.response || err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED';
      if (isNetworkErr) {
        await enqueueOfflineTransaction('ATTENDANCE_CLOCK_IN', payload);
        recordSuccess(true);
      } else {
        alert(err.response?.data?.message || err.message || 'Gagal menyimpan absensi');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E5E9EE] flex flex-col font-sans select-none pb-8 text-slate-800">
      {/* Top Header App Bar */}
      <header className="sticky top-0 z-30 bg-[#E5E9EE]/90 backdrop-blur-md px-4 py-3 border-b border-slate-300/60 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/validasi-patroli/')}
          className="p-1.5 rounded-xl bg-white border border-slate-300 shadow-skeuo-button-secondary text-slate-700 active:scale-95 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="font-extrabold text-sm text-slate-800 tracking-tight">
          Presensi Masuk (Clock-In)
        </span>
        <div className="w-8" />
      </header>

      {/* Offline Status & Pending Sync Bar */}
      <OfflineStatusBar />

      {/* Main Content Area */}
      <main className="px-4 pt-4 max-w-md mx-auto w-full flex-1 flex flex-col justify-between">
        <SurfaceCard className="p-4 space-y-4">
          {/* Status Badges Row */}
          <div className="flex items-center justify-between">
            <StatusBadge variant={locationDetected ? 'success' : locationInitializing ? 'warning' : 'danger'}>
              GPS: {locationDetected ? 'Terdeteksi' : locationInitializing ? 'Mencari...' : 'Gagal'}
            </StatusBadge>
            <StatusBadge variant={cameraActive ? 'success' : cameraInitializing ? 'warning' : 'danger'}>
              Kamera: {cameraActive ? 'Aktif' : cameraInitializing ? 'Memuat...' : 'Mati'}
            </StatusBadge>
          </div>

          {/* Camera Viewfinder Frame */}
          <div className="relative w-full aspect-square bg-slate-900 rounded-2xl overflow-hidden shadow-skeuo-inset border-2 border-slate-300 flex items-center justify-center">
            {photoDataUrl ? (
              <img src={photoDataUrl} alt="Preview Selfie" className="w-full h-full object-cover" />
            ) : (
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
            )}

            {/* Face alignment guide oval */}
            {!photoDataUrl && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-48 h-60 rounded-[50%] border-2 border-dashed border-sky-400/70" />
              </div>
            )}
          </div>

          {/* Form and Controls */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Pilih Alasan Presensi / Tipe Shift
              </label>
              <select
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
                required
                className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:bg-white focus:border-sky-500"
              >
                <option value="1">Piket Rutin Harian</option>
                <option value="2">Shift Lembur Tambahan</option>
                <option value="3">Penugasan Khusus / Bantuan</option>
              </select>
            </div>

            {/* Action Buttons */}
            {!photoDataUrl ? (
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <SkeuomorphicButton
                  type="button"
                  variant="secondary"
                  onClick={getLocation}
                  icon={RefreshCw}
                >
                  Refresh GPS
                </SkeuomorphicButton>
                <SkeuomorphicButton
                  type="button"
                  variant="primary"
                  onClick={handleSnap}
                  disabled={!cameraActive}
                  icon={Camera}
                >
                  Ambil Foto
                </SkeuomorphicButton>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <SkeuomorphicButton
                  type="button"
                  variant="secondary"
                  onClick={handleRetake}
                  icon={RotateCcw}
                >
                  Ulangi
                </SkeuomorphicButton>
                <SkeuomorphicButton
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  icon={Send}
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim Presensi'}
                </SkeuomorphicButton>
              </div>
            )}
          </form>
        </SurfaceCard>
      </main>

      {/* SUCCESS CONFIRMATION MODAL MATCHING VISUAL REFERENCE IMAGE */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 text-center space-y-4 shadow-soft-xl border border-slate-200">
            {/* Green Check Circle */}
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Absensi Berhasil!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {successTimestamp}
              </p>
            </div>

            <SkeuomorphicButton
              variant="primary"
              className="w-full"
              onClick={() => {
                setShowSuccessModal(false);
                navigate('/validasi-patroli/');
              }}
            >
              OK
            </SkeuomorphicButton>
          </div>
        </div>
      )}
    </div>
  );
};
