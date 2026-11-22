import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Car, 
  Camera, 
  MapPin, 
  CheckCircle2, 
  Send, 
  RotateCcw,
  Navigation,
  Fuel,
  Clock,
  Gauge
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { driverApi } from '../services/api';
import { enqueueOfflineTransaction } from '../services/offlineQueue';
import { OfflineStatusBar } from '../components/OfflineStatusBar';
import { SurfaceCard } from '../components/ui/SurfaceCard';
import { SkeuomorphicButton } from '../components/ui/SkeuomorphicButton';
import { StatusBadge } from '../components/ui/StatusBadge';

export const DriverTripPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [activeTrip, setActiveTrip] = useState<any | null>(null);
  const [isLoadingActive, setIsLoadingActive] = useState<boolean>(true);

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [gpsReady, setGpsReady] = useState(false);
  const [gpsMessage, setGpsMessage] = useState('Menunggu pengambilan GPS...');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Form Departure (Start)
  const [tipe, setTipe] = useState('Toyota Avanza (Operasional)');
  const [nopol, setNopol] = useState('B 1824 PKO');
  const [tujuan, setTujuan] = useState('');
  const [keperluan, setKeperluan] = useState('');
  const [odometerStart, setOdometerStart] = useState<number>(45000);

  // Form Arrival (Complete)
  const [odometerEnd, setOdometerEnd] = useState<number>(45050);
  const [catatanSelesai, setCatatanSelesai] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState<{ title: string; desc: string } | null>(null);

  // 1. Fetch active trip on mount
  useEffect(() => {
    const checkActiveTrip = async () => {
      try {
        const trip = await driverApi.getActiveTrip();
        if (trip && trip.id) {
          setActiveTrip(trip);
          if (trip.odometerStart) {
            setOdometerEnd(trip.odometerStart + 25);
          }
        } else {
          setActiveTrip(null);
        }
      } catch (err) {
        console.warn('Error fetching active trip:', err);
      } finally {
        setIsLoadingActive(false);
      }
    };

    checkActiveTrip();
  }, []);

  // 2. Camera Handling
  const startCamera = async (mode: 'environment' | 'user') => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (e) {
      console.warn('Camera failed:', e);
    }
  };

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [facingMode]);

  const handleCapturePhoto = () => {
    setGpsMessage('Sedang mencari lokasi GPS...');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGpsReady(true);
          setGpsMessage('GPS Terverifikasi');

          if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth || 640;
            canvas.height = videoRef.current.videoHeight || 480;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
              setPhotoDataUrl(canvas.toDataURL('image/jpeg', 0.6));
            }
          }
        },
        () => {
          setCoords({ lat: -6.2088, lng: 106.8456 });
          setGpsReady(true);
          setGpsMessage('GPS Default Digunakan');
          if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth || 640;
            canvas.height = videoRef.current.videoHeight || 480;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
              setPhotoDataUrl(canvas.toDataURL('image/jpeg', 0.6));
            }
          }
        },
        { enableHighAccuracy: true, timeout: 8000 },
      );
    }
  };

  // 3. Submit Start Trip
  const handleStartSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoDataUrl || !gpsReady) {
      alert('Foto odometer / kendaraan dan lokasi GPS wajib diambil!');
      return;
    }
    setIsSubmitting(true);
    const siteId = user?.siteId || '11111111-1111-1111-1111-111111111111';

    const payload = {
      siteId,
      vehicleType: tipe,
      vehiclePlateNumber: nopol,
      originLocation: 'Kantor Pusat / Pool',
      destinationLocation: tujuan,
      odometerStart: Number(odometerStart),
      tripNotes: keperluan,
      photoBase64: photoDataUrl,
    };

    if (!navigator.onLine) {
      await enqueueOfflineTransaction('DRIVER_START_TRIP', payload);
      setSuccessModal({
        title: 'Keberangkatan Tercatat (Offline)',
        desc: `Perjalanan armada ${nopol} tersimpan di memori perangkat dan akan disinkronkan saat terhubung internet.`,
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await driverApi.startTrip(payload);
      setActiveTrip(res);
      setSuccessModal({
        title: 'Perjalanan Dimulai!',
        desc: `Data armada ${nopol} berhasil dicatat. Odometer awal: ${odometerStart} km. Berkendara dengan aman!`,
      });
    } catch (err: any) {
      alert('Gagal mencatat keberangkatan: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Submit Complete Trip (Return)
  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrip) return;
    if (odometerEnd < (activeTrip.odometerStart || 0)) {
      alert(`Odometer akhir (${odometerEnd}) tidak boleh lebih kecil dari odometer awal (${activeTrip.odometerStart})`);
      return;
    }
    setIsSubmitting(true);

    const payload = {
      odometerEnd: Number(odometerEnd),
      tripNotes: catatanSelesai || 'Perjalanan selesai dengan selamat.',
      photoBase64: photoDataUrl || undefined,
    };

    if (!navigator.onLine) {
      await enqueueOfflineTransaction('DRIVER_COMPLETE_TRIP', { tripId: activeTrip.id, ...payload });
      setSuccessModal({
        title: 'Kepulangan Tercatat (Offline)',
        desc: `Penyelesaian perjalanan tersimpan di memori perangkat dan akan disinkronkan saat online.`,
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await driverApi.completeTrip(activeTrip.id, payload);
      setActiveTrip(null);
      setSuccessModal({
        title: 'Perjalanan Selesai!',
        desc: `Armada telah kembali ke pool. Total jarak tempuh: ${res.totalDistanceKm || (odometerEnd - activeTrip.odometerStart)} km. Terima kasih!`,
      });
    } catch (err: any) {
      alert('Gagal menyelesaikan perjalanan: ' + (err.response?.data?.message || err.message));
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
          Logistik Armada Driver
        </span>
        <div className="w-8" />
      </header>

      {/* Offline Status & Pending Sync Bar */}
      <OfflineStatusBar />

      {/* Main Content Area */}
      <main className="px-4 pt-4 max-w-md mx-auto w-full flex-1 space-y-4">
        {isLoadingActive ? (
          <SurfaceCard className="p-8 text-center text-xs text-slate-500">
            Memeriksa status armada...
          </SurfaceCard>
        ) : activeTrip ? (
          /* ACTIVE TRIP: COMPLETION / RETURN FORM */
          <SurfaceCard className="p-5 space-y-4">
            <div className="flex items-center space-x-3 pb-2 border-b border-slate-200">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-800 tracking-tight">
                  Selesaikan Perjalanan Armada
                </h2>
                <p className="text-[11px] text-slate-500">
                  Armada sedang aktif di jalan. Catat kepulangan & odometer akhir
                </p>
              </div>
            </div>

            {/* Active Trip Summary Badge */}
            <div className="bg-sky-50/80 border border-sky-200 rounded-2xl p-3.5 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Kendaraan:</span>
                <span className="font-bold text-sky-900 font-mono">{activeTrip.vehiclePlateNumber || activeTrip.licensePlate} ({activeTrip.vehicleType})</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Tujuan:</span>
                <span className="font-bold text-slate-800">{activeTrip.destinationLocation || activeTrip.destination}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Odometer Awal:</span>
                <span className="font-bold text-slate-800 font-mono">{activeTrip.odometerStart} km</span>
              </div>
            </div>

            {/* Camera Frame for Return Odometer */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Foto Odometer Akhir Kepulangan
                </label>
                <StatusBadge variant={gpsReady ? 'success' : 'warning'}>
                  {gpsMessage}
                </StatusBadge>
              </div>

              <div className="w-full h-44 bg-slate-900 rounded-2xl overflow-hidden shadow-skeuo-inset border-2 border-slate-300 relative flex items-center justify-center">
                {photoDataUrl ? (
                  <img src={photoDataUrl} alt="Arrival" className="w-full h-full object-cover" />
                ) : (
                  <video ref={videoRef} playsInline autoPlay muted className="w-full h-full object-cover" />
                )}
              </div>

              <SkeuomorphicButton
                type="button"
                variant="secondary"
                className="w-full"
                onClick={handleCapturePhoto}
                icon={Camera}
              >
                {photoDataUrl ? 'Foto Ulang Odometer' : 'Ambil Foto & Kunci GPS'}
              </SkeuomorphicButton>
            </div>

            {/* Return Form */}
            <form onSubmit={handleCompleteSubmit} className="space-y-3.5 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>Odometer Akhir (KM)</span>
                  <span className="text-sky-600 font-mono font-bold text-[11px]">
                    Jarak: {Math.max(0, odometerEnd - (activeTrip.odometerStart || 0))} KM
                  </span>
                </label>
                <input
                  type="number"
                  required
                  min={activeTrip.odometerStart || 0}
                  value={odometerEnd}
                  onChange={(e) => setOdometerEnd(Number(e.target.value))}
                  className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-mono font-bold shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Catatan Selesai Perjalanan</label>
                <input
                  type="text"
                  value={catatanSelesai}
                  onChange={(e) => setCatatanSelesai(e.target.value)}
                  placeholder="Contoh: Muatan telah diserahterimakan, kendaraan bersih"
                  className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <SkeuomorphicButton
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/validasi-patroli/')}
                >
                  Kembali
                </SkeuomorphicButton>
                <SkeuomorphicButton
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  icon={CheckCircle2}
                >
                  {isSubmitting ? 'Menyimpan...' : 'Selesaikan Trip'}
                </SkeuomorphicButton>
              </div>
            </form>
          </SurfaceCard>
        ) : (
          /* NO ACTIVE TRIP: START DEPARTURE FORM */
          <SurfaceCard className="p-5 space-y-4">
            <div className="flex items-center space-x-3 pb-2 border-b border-slate-200">
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600">
                <Car className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-800 tracking-tight">
                  Catat Keberangkatan Armada
                </h2>
                <p className="text-[11px] text-slate-500">
                  Log odometer awal, pelat nomor, dan verifikasi GPS lokasi awal
                </p>
              </div>
            </div>

            {/* Camera Frame */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Foto Odometer / Fisik Kendaraan
                </label>
                <StatusBadge variant={gpsReady ? 'success' : 'warning'}>
                  {gpsMessage}
                </StatusBadge>
              </div>

              <div className="w-full h-44 bg-slate-900 rounded-2xl overflow-hidden shadow-skeuo-inset border-2 border-slate-300 relative flex items-center justify-center">
                {photoDataUrl ? (
                  <img src={photoDataUrl} alt="Departure" className="w-full h-full object-cover" />
                ) : (
                  <video ref={videoRef} playsInline autoPlay muted className="w-full h-full object-cover" />
                )}
              </div>

              <SkeuomorphicButton
                type="button"
                variant="secondary"
                className="w-full"
                onClick={handleCapturePhoto}
                icon={Camera}
              >
                {photoDataUrl ? 'Foto Ulang Odometer' : 'Ambil Foto & Kunci GPS'}
              </SkeuomorphicButton>
            </div>

            {/* Start Form */}
            <form onSubmit={handleStartSubmit} className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Tipe Kendaraan</label>
                  <input
                    type="text"
                    required
                    value={tipe}
                    onChange={(e) => setTipe(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Nomor Polisi</label>
                  <input
                    type="text"
                    required
                    value={nopol}
                    onChange={(e) => setNopol(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono font-bold uppercase shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Tujuan Perjalanan</label>
                  <input
                    type="text"
                    required
                    value={tujuan}
                    onChange={(e) => setTujuan(e.target.value)}
                    placeholder="Contoh: Pabrik Bekasi"
                    className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Odometer Awal (KM)</label>
                  <input
                    type="number"
                    required
                    value={odometerStart}
                    onChange={(e) => setOdometerStart(Number(e.target.value))}
                    className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono font-bold shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Keperluan & Muatan Logistik</label>
                <input
                  type="text"
                  required
                  value={keperluan}
                  onChange={(e) => setKeperluan(e.target.value)}
                  placeholder="Contoh: Pengiriman dokumen dinas & logistik pos"
                  className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <SkeuomorphicButton
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/validasi-patroli/')}
                >
                  Batal
                </SkeuomorphicButton>
                <SkeuomorphicButton
                  type="submit"
                  variant="primary"
                  disabled={!photoDataUrl || !gpsReady || isSubmitting}
                  icon={Send}
                >
                  {isSubmitting ? 'Menyimpan...' : 'Mulai Jalan'}
                </SkeuomorphicButton>
              </div>
            </form>
          </SurfaceCard>
        )}
      </main>

      {/* Confirmation Modal */}
      {successModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 text-center space-y-4 shadow-soft-xl border border-slate-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                {successModal.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {successModal.desc}
              </p>
            </div>

            <SkeuomorphicButton
              variant="primary"
              className="w-full"
              onClick={() => {
                setSuccessModal(null);
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
