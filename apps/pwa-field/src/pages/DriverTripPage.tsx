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
  Fuel
} from 'lucide-react';
import { driverApi } from '../services/api';
import { SurfaceCard } from '../components/ui/SurfaceCard';
import { SkeuomorphicButton } from '../components/ui/SkeuomorphicButton';
import { StatusBadge } from '../components/ui/StatusBadge';

export const DriverTripPage: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [gpsReady, setGpsReady] = useState(false);
  const [gpsMessage, setGpsMessage] = useState('Menunggu pengambilan GPS...');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [tipe, setTipe] = useState('Toyota Avanza (Operasional)');
  const [nopol, setNopol] = useState('B 1824 PKO');
  const [tujuan, setTujuan] = useState('');
  const [keperluan, setKeperluan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
          setGpsMessage('Gagal memperoleh GPS. Coba lagi.');
        },
        { enableHighAccuracy: true, timeout: 8000 },
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoDataUrl || !coords) {
      alert('Foto odometer / kendaraan dan lokasi GPS wajib diambil!');
      return;
    }
    setIsSubmitting(true);
    try {
      await driverApi.startTrip({
        siteId: '11111111-1111-1111-1111-111111111111',
        vehicleType: tipe,
        vehiclePlateNumber: nopol,
        originLocation: 'Kantor Pusat',
        destinationLocation: tujuan,
        tripNotes: keperluan,
        photoBase64: photoDataUrl,
      });
      setShowSuccessModal(true);
    } catch (err: any) {
      alert('Gagal menyimpan perjalanan: ' + (err.response?.data?.message || err.message));
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
          Log Armada Driver
        </span>
        <div className="w-8" />
      </header>

      {/* Main Content Area */}
      <main className="px-4 pt-4 max-w-md mx-auto w-full flex-1 space-y-4">
        <SurfaceCard className="p-5 space-y-4">
          <div className="flex items-center space-x-3 pb-2 border-b border-slate-200/80">
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

          {/* Camera Frame for Odometer & Vehicle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">
                Foto Odometer / Fisik Kendaraan
              </label>
              <StatusBadge variant={gpsReady ? 'success' : 'warning'}>
                {gpsMessage}
              </StatusBadge>
            </div>

            <div className="w-full h-48 bg-slate-900 rounded-2xl overflow-hidden shadow-skeuo-inset border-2 border-slate-300 relative flex items-center justify-center">
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

          {/* Form Information */}
          <form onSubmit={handleSubmit} className="space-y-3 pt-2">
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

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Tujuan Perjalanan</label>
              <input
                type="text"
                required
                value={tujuan}
                onChange={(e) => setTujuan(e.target.value)}
                placeholder="Contoh: Pabrik Bekasi / Gudang Cakung"
                className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:bg-white focus:border-sky-500"
              />
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

            <div className="grid grid-cols-2 gap-2.5 pt-3">
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
      </main>

      {/* Confirmation Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 text-center space-y-4 shadow-soft-xl border border-slate-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Perjalanan Dimulai!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Data armada {nopol} berhasil dicatat. Berkendara dengan aman dan patuhi rambu lalu lintas.
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
