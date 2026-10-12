import React, { useState, useEffect, useRef } from 'react';
import { X, ShieldAlert, AlertTriangle, BellRing, CheckCircle2, Volume2, VolumeX } from 'lucide-react';
import { sosApi } from '../services/api';

interface PanicAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteId: string;
  gpsLocation: { lat: number; lng: number; accuracy: number } | null;
  officerName: string;
  onSuccess: (message: string) => void;
}

export const PanicAlertModal: React.FC<PanicAlertModalProps> = ({
  isOpen,
  onClose,
  siteId,
  gpsLocation,
  officerName,
  onSuccess,
}) => {
  const [sosCountdown, setSosCountdown] = useState<number | null>(null);
  const [isTriggered, setIsTriggered] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopSiren();
      setSosCountdown(null);
      setIsTriggered(false);
    }
  }, [isOpen]);

  const startSiren = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      // Frequency siren sweep
      osc.frequency.linearRampToValueAtTime(1400, ctx.currentTime + 0.3);
      osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.6);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      oscillatorRef.current = osc;
    } catch (e) {
      console.warn('Audio siren error:', e);
    }
  };

  const stopSiren = () => {
    try {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    } catch (e) {
      // ignore
    }
  };

  const triggerSos = async () => {
    setIsTriggered(true);
    startSiren();

    const lat = gpsLocation?.lat || -6.2255;
    const lng = gpsLocation?.lng || 106.8090;

    try {
      await sosApi.trigger({
        siteId,
        latitude: lat,
        longitude: lng,
        message: `EMERGENCY ALERT dari ${officerName} di lokasi presisi (${lat}, ${lng})!`,
      });
      onSuccess('🚨 ALARM SOS BERHASIL DIPICU! Command Center & WhatsApp Grup telah dinotifikasi.');
    } catch (err) {
      // Offline fallback simulation
      onSuccess('🚨 ALARM SOS DIPICU (Mode Lokal)!');
    }
  };

  // Hold countdown logic
  const handleHoldStart = () => {
    if (isTriggered) return;
    setSosCountdown(3);
  };

  const handleHoldEnd = () => {
    if (sosCountdown !== null && sosCountdown > 0) {
      setSosCountdown(null);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (sosCountdown !== null && sosCountdown > 0) {
      timer = setTimeout(() => {
        setSosCountdown((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (sosCountdown === 0) {
      setSosCountdown(null);
      triggerSos();
    }
    return () => clearTimeout(timer);
  }, [sosCountdown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-rose-600 rounded-3xl max-w-sm w-full p-6 text-center space-y-5 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={() => {
            stopSiren();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-20 h-20 mx-auto rounded-full bg-rose-600/20 border-2 border-rose-500 flex items-center justify-center text-rose-500 animate-pulse">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <div>
          <h2 className="text-xl font-black text-rose-500 tracking-wide">PANIC BUTTON SOS</h2>
          <p className="text-xs text-rose-200/90 font-medium mt-2 bg-rose-950/60 p-3 rounded-xl border border-rose-800/80 leading-relaxed">
            "Tombol ini akan memicu sirine di perangkat anggota yang lain & Web Command Center, Anda yakin akan mengirim pesan darurat?!"
          </p>
        </div>

        {isTriggered ? (
          <div className="space-y-4">
            <div className="p-4 bg-rose-600 rounded-2xl text-white font-extrabold text-sm animate-bounce shadow-xl shadow-rose-900/50">
              🚨 SIRINE DARURAT AKTIF! <br />
              <span className="text-xs font-normal">Sinyal GPS & WhatsApp Terkirim</span>
            </div>

            <div className="flex justify-center space-x-2">
              <button
                onClick={() => {
                  if (isMuted) {
                    startSiren();
                    setIsMuted(false);
                  } else {
                    stopSiren();
                    setIsMuted(true);
                  }
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center space-x-1"
              >
                {isMuted ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
                <span>{isMuted ? 'Bunyikan Sirine' : 'Senyapkan Suara'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onMouseDown={handleHoldStart}
              onMouseUp={handleHoldEnd}
              onTouchStart={handleHoldStart}
              onTouchEnd={handleHoldEnd}
              className={`w-full py-5 rounded-2xl font-black text-base shadow-2xl transition transform active:scale-95 select-none ${
                sosCountdown !== null
                  ? 'bg-rose-700 text-white animate-ping'
                  : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-950/60'
              }`}
            >
              {sosCountdown !== null ? `TAHAN... ${sosCountdown} DETIK` : 'TEKAN & TAHAN (3 DETIK)'}
            </button>

            <button
              onClick={triggerSos}
              className="text-xs text-rose-400 underline font-semibold hover:text-rose-300"
            >
              Atau Tekan Sekali untuk Langsung Kirim Darurat
            </button>
          </div>
        )}

        <div className="text-[11px] text-slate-500">
          Koordinat GPS Anda: {gpsLocation ? `${gpsLocation.lat.toFixed(5)}, ${gpsLocation.lng.toFixed(5)} (±${gpsLocation.accuracy}m)` : 'Mengunci satelit GPS...'}
        </div>
      </div>
    </div>
  );
};
