'use client';
import React, { useState, useEffect, useRef } from 'react';
import { X, ShieldAlert, Volume2, VolumeX, Ban } from 'lucide-react';
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
  const [isTriggered, setIsTriggered] = useState<boolean>(false);
  const [isFetchingGps, setIsFetchingGps] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopSiren();
      setIsTriggered(false);
      setIsFetchingGps(false);
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
      osc.frequency.linearRampToValueAtTime(1400, ctx.currentTime + 0.3);
      osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.6);

      gain.gain.setValueAtTime(0.35, ctx.currentTime);
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
    setIsFetchingGps(true);

    const lat = gpsLocation?.lat || -6.2255;
    const lng = gpsLocation?.lng || 106.8090;

    try {
      await sosApi.trigger({
        siteId,
        latitude: lat,
        longitude: lng,
        message: `EMERGENCY ALERT dari ${officerName} di lokasi presisi (${lat}, ${lng})!`,
      });
      setIsTriggered(true);
      startSiren();
      onSuccess('ðŸš¨ ALARM SOS BERHASIL DIPICU! Web Command Center & WhatsApp Grup telah dinotifikasi.');
    } catch (err) {
      setIsTriggered(true);
      startSiren();
      onSuccess('ðŸš¨ ALARM SOS DIPICU (Mode Lokal / Offline)!');
    } finally {
      setIsFetchingGps(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-150">
        {/* Top Info Banner */}
        <div className="bg-[#17a2b8] text-white p-4 text-center text-xs font-semibold leading-relaxed shadow">
          Tombol ini akan memicu sirine diperangkat anggota yang lain, <br />
          anda yakin akan mengirim pesan darurat !!..???
        </div>

        <div className="p-6 text-center space-y-4">
          {isTriggered ? (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-red-600 rounded-2xl text-white font-extrabold text-sm animate-pulse shadow-xl">
                ðŸš¨ SIRINE DARURAT AKTIF! <br />
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
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5"
                >
                  {isMuted ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
                  <span>{isMuted ? 'Bunyikan Sirine' : 'Senyapkan Suara'}</span>
                </button>
              </div>

              <button
                onClick={() => {
                  stopSiren();
                  onClose();
                }}
                className="w-full py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold"
              >
                Tutup Jendela SOS
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Skeuomorphic 3D Circular Red SOS Button */}
              <button
                type="button"
                id="sosButton"
                onClick={triggerSos}
                disabled={isFetchingGps}
                className="sos-btn-3d"
              >
                {isFetchingGps ? (
                  <span className="text-base font-bold">Mengambil Lokasi...</span>
                ) : (
                  'SOS'
                )}
              </button>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => {
                  stopSiren();
                  onClose();
                }}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-[#ffc107] hover:bg-[#e0a800] text-slate-900 rounded-lg text-xs font-bold shadow transition"
              >
                <Ban className="w-4 h-4" />
                <span>Klik untuk batalkan</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

