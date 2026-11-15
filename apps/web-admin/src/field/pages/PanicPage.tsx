import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from '../utils/navigation';
import { 
  ArrowLeft, 
  AlertTriangle, 
  ShieldAlert
} from 'lucide-react';
import { sosApi } from '../services/api';
import { SurfaceCard } from '../components/ui/SurfaceCard';
import { SkeuomorphicButton } from '../components/ui/SkeuomorphicButton';

export const PanicPage: React.FC = () => {
  const navigate = useNavigate();
  const [isPressing, setIsPressing] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isTriggering, setIsTriggering] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [sosSentSuccess, setSosSentSuccess] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startHold = () => {
    if (isTriggering || sosSentSuccess) return;
    setIsPressing(true);
    setHoldProgress(0);

    const startTime = Date.now();
    const duration = 3000;

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setHoldProgress(pct);
    }, 50);

    timerRef.current = setTimeout(() => {
      clearInterval(intervalRef.current!);
      setHoldProgress(100);
      handleTriggerSOS();
    }, duration);
  };

  const endHold = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsPressing(false);
    if (holdProgress < 100 && !isTriggering && !sosSentSuccess) {
      setHoldProgress(0);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleTriggerSOS = async () => {
    setIsTriggering(true);
    setStatusMessage('Mengambil titik koordinat GPS presisi...');

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            setStatusMessage('Menghubungkan ke Command Center & WhatsApp...');
            await sosApi.triggerAlert({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              notes: 'PANIC BUTTON SOS DARURAT DIPICU DARI PWA FIELD APP',
            });
            setIsTriggering(false);
            setSosSentSuccess(true);
          } catch (err: any) {
            alert('Gagal mengirim SOS: ' + (err.response?.data?.message || err.message));
            setIsTriggering(false);
            setStatusMessage(null);
            setHoldProgress(0);
          }
        },
        () => {
          alert('GPS gagal diperoleh. Pastikan izin lokasi perangkat telah aktif.');
          setIsTriggering(false);
          setStatusMessage(null);
          setHoldProgress(0);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
      );
    } else {
      alert('Browser tidak mendukung geolokasi GPS.');
      setIsTriggering(false);
      setStatusMessage(null);
      setHoldProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-[#E5E9EE] flex flex-col font-sans select-none pb-8 text-slate-800">
      <header className="sticky top-0 z-30 bg-[#E5E9EE]/90 backdrop-blur-md px-4 py-3 border-b border-slate-300/60 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/validasi-patroli/')}
          className="p-1.5 rounded-xl bg-white border border-slate-300 shadow-skeuo-button-secondary text-slate-700 active:scale-95 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="font-extrabold text-sm text-slate-800 tracking-tight">
          Panic Button
        </span>
        <div className="w-8" />
      </header>

      <main className="px-4 pt-6 max-w-md mx-auto w-full flex-1 flex flex-col items-center justify-between">
        <SurfaceCard className="p-6 w-full flex flex-col items-center text-center space-y-6">
          {statusMessage && (
            <div className="w-full p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl animate-pulse">
              {statusMessage}
            </div>
          )}

          <div className="relative flex items-center justify-center py-6">
            {isPressing && (
              <div 
                className="absolute rounded-full border-4 border-rose-400 animate-ping pointer-events-none"
                style={{ width: '220px', height: '220px' }}
              />
            )}
            <div className="absolute w-52 h-52 rounded-full bg-rose-500/10 pointer-events-none" />
            <div className="absolute w-44 h-44 rounded-full bg-rose-500/15 pointer-events-none" />

            <svg className="absolute w-44 h-44 -rotate-90 pointer-events-none" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="4"
              />
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="#EF4444"
                strokeWidth="5"
                strokeDasharray="289.02"
                strokeDashoffset={289.02 - (289.02 * holdProgress) / 100}
                strokeLinecap="round"
                className="transition-all duration-75"
              />
            </svg>

            <button
              type="button"
              onPointerDown={startHold}
              onPointerUp={endHold}
              onPointerLeave={endHold}
              onTouchStart={startHold}
              onTouchEnd={endHold}
              disabled={isTriggering || sosSentSuccess}
              className={`w-36 h-36 rounded-full flex flex-col items-center justify-center text-white transition-all select-none shadow-soft-xl ${
                isPressing 
                  ? 'scale-95 bg-gradient-to-b from-rose-600 to-rose-800 shadow-[inset_0_4px_12px_rgba(0,0,0,0.5)]' 
                  : 'bg-gradient-to-b from-rose-500 via-rose-600 to-rose-700 border-t-2 border-white/40 border-b-4 border-rose-900 active:scale-95'
              }`}
            >
              <AlertTriangle className="w-10 h-10 mb-1 text-white stroke-[2.5]" />
              <span className="text-xl font-black tracking-widest uppercase">
                SOS
              </span>
            </button>
          </div>

          <div className="space-y-1.5 max-w-xs">
            <h2 className="text-sm font-extrabold text-slate-800 tracking-tight">
              Tekan untuk mengirim peringatan darurat
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pastikan hanya digunakan dalam kondisi darurat. <br />
              <span className="font-semibold text-rose-600">
                {isPressing ? `Menahan... ${holdProgress}%` : 'Tahan tombol selama 3 detik'}
              </span>
            </p>
          </div>

          <SkeuomorphicButton
            variant="secondary"
            className="w-full max-w-xs"
            onClick={() => navigate('/validasi-patroli/')}
          >
            Batal & Kembali
          </SkeuomorphicButton>
        </SurfaceCard>
      </main>

      {sosSentSuccess && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 text-center space-y-4 shadow-soft-xl border border-rose-200">
            <div className="w-16 h-16 rounded-full bg-rose-500 text-white flex items-center justify-center mx-auto shadow-md">
              <ShieldAlert className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Peringatan SOS Terkirim!
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Sinyal darurat, koordinat GPS presisi, dan notifikasi WhatsApp otomatis telah dikirimkan ke Command Center & Supervisor.
              </p>
            </div>

            <SkeuomorphicButton
              variant="danger"
              className="w-full"
              onClick={() => {
                setSosSentSuccess(false);
                navigate('/validasi-patroli/');
              }}
            >
              Saya Mengerti
            </SkeuomorphicButton>
          </div>
        </div>
      )}
    </div>
  );
};
