import React, { useState, useEffect } from 'react';
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
  WifiOff
} from 'lucide-react';
import { Division } from '@patrol/types';

export default function App() {
  const [isClockedIn, setIsClockedIn] = useState<boolean>(false);
  const [currentDivision, setCurrentDivision] = useState<Division>(Division.SECURITY);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [sosCountdown, setSosCountdown] = useState<number | null>(null);
  const [sosTriggered, setSosTriggered] = useState<boolean>(false);
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);

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
      navigator.geolocation.getCurrentPosition(
        (pos) => setGpsLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn('GPS Error:', err.message),
        { enableHighAccuracy: true },
      );
    }
  }, []);

  // SOS Hold Countdown Handler
  const handleSosPressStart = () => {
    setSosCountdown(3);
  };

  const handleSosPressEnd = () => {
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
      setSosTriggered(true);
      setSosCountdown(null);
    }
    return () => clearTimeout(timer);
  }, [sosCountdown]);

  return (
    <div className="min-h-screen max-w-md mx-auto bg-slate-900 text-slate-100 flex flex-col justify-between p-4 shadow-2xl">
      {/* Top Header */}
      <header className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xs">
              PMS
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight">Field Patrol System</h1>
              <p className="text-[11px] text-slate-400">Head Office Sudirman</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isOnline ? (
              <span className="flex items-center space-x-1 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                <Wifi className="w-3 h-3" />
                <span>Online</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-[11px] text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full">
                <WifiOff className="w-3 h-3" />
                <span>Offline</span>
              </span>
            )}
          </div>
        </div>

        {/* User Card */}
        <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-blue-400">
              TF
            </div>
            <div>
              <h2 className="text-sm font-semibold">Testi (Satpam Regu A)</h2>
              <p className="text-[11px] text-slate-400">NIK: SEC-2026-0042</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
              {currentDivision}
            </span>
            <div className="flex items-center justify-end space-x-1 text-[10px] text-slate-400 mt-1">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>{gpsLocation ? `${gpsLocation.lat.toFixed(4)}, ${gpsLocation.lng.toFixed(4)}` : 'Mencari GPS...'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area: 2-Phase State Machine */}
      <main className="flex-1 my-4 flex flex-col justify-center space-y-4">
        {!isClockedIn ? (
          /* ================= PHASE 1: UNCLOCKED STATE ================= */
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center space-y-5">
            <div className="w-16 h-16 mx-auto bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Shift Belum Dimulai</h3>
              <p className="text-xs text-slate-400 mt-1">
                Lakukan verifikasi swafoto dan validasi geofence GPS untuk memulai dinas kerja.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => setIsClockedIn(true)}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg flex items-center justify-center space-x-2 active:scale-95 transition"
              >
                <Camera className="w-5 h-5" />
                <span>Absen Masuk (Selfie GPS)</span>
              </button>

              <button
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 px-4 rounded-xl text-xs border border-slate-700 active:scale-95 transition"
              >
                Ajukan Izin / Sakit
              </button>
            </div>
          </div>
        ) : (
          /* ================= PHASE 2: CLOCKED-IN ACTIVE STATE ================= */
          <div className="space-y-4">
            {/* Shift Active Banner */}
            <div className="bg-emerald-950/40 border border-emerald-600/40 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-xs font-semibold text-emerald-400">Shift Pagi Aktif (07:00 - 15:00)</span>
              </div>
              <span className="text-[11px] text-slate-400">Masuk: 06:58 WIB</span>
            </div>

            {/* Division-Specific Primary Actions */}
            {currentDivision === Division.SECURITY && (
              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <QrCode className="w-4 h-4 text-blue-400" />
                    <span>Patroli Rute Checkpoint</span>
                  </h3>
                  <span className="text-xs text-blue-400 font-medium">Progress: 4/12</span>
                </div>

                <p className="text-xs text-slate-400">
                  Arahkan kamera ke QR Code yang terpasang pada titik patroli untuk mencatat kondisi pos.
                </p>

                <button
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg flex items-center justify-center space-x-2 active:scale-95 transition"
                >
                  <QrCode className="w-5 h-5" />
                  <span>Scan QR Checkpoint</span>
                </button>
              </div>
            )}

            {/* Emergency SOS Panic Button */}
            <div className="bg-rose-950/30 border border-rose-900/60 rounded-2xl p-4 text-center space-y-3">
              <div className="flex items-center justify-center space-x-1.5 text-rose-400 text-xs font-bold uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4" />
                <span>Panic Button SOS</span>
              </div>

              {sosTriggered ? (
                <div className="bg-rose-600 text-white p-3 rounded-xl font-bold text-xs animate-bounce">
                  🚨 ALARM SOS TERKIRIM KE DASHBOARD & WHATSAPP SUPERVISOR!
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-slate-400">
                    Tahan tombol selama 3 detik dalam situasi darurat kriminal, kebakaran, atau kecelakaan.
                  </p>

                  <button
                    onMouseDown={handleSosPressStart}
                    onMouseUp={handleSosPressEnd}
                    onTouchStart={handleSosPressStart}
                    onTouchEnd={handleSosPressEnd}
                    className="w-full bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg shadow-rose-950/50 flex items-center justify-center space-x-2 active:scale-95 transition select-none"
                  >
                    <ShieldAlert className="w-5 h-5" />
                    <span>
                      {sosCountdown !== null ? `TAHAN... (${sosCountdown}s)` : 'TEKAN & TAHAN SOS'}
                    </span>
                  </button>
                </>
              )}
            </div>

            {/* Clock Out Action */}
            <button
              onClick={() => setIsClockedIn(false)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 px-4 rounded-xl text-xs border border-slate-700 flex items-center justify-center space-x-2 active:scale-95 transition"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Absen Pulang (Akhiri Shift)</span>
            </button>
          </div>
        )}
      </main>

      {/* Bottom Bar */}
      <footer className="text-center text-[10px] text-slate-500 border-t border-slate-800 pt-3">
        Patrol Management System v1.0.0 (Enterprise In-House)
      </footer>
    </div>
  );
}
