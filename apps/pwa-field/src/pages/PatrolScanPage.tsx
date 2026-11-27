import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import {
  ArrowLeft,
  Flashlight,
  SwitchCamera,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Send,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { patrolApi } from '../services/api';
import { enqueueOfflineTransaction } from '../services/offlineQueue';
import { OfflineStatusBar } from '../components/OfflineStatusBar';
import { SurfaceCard } from '../components/ui/SurfaceCard';
import { SkeuomorphicButton } from '../components/ui/SkeuomorphicButton';
import { StatusBadge } from '../components/ui/StatusBadge';

export const PatrolScanPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [scanResult, setScanResult] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [torchOn, setTorchOn] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Verification step state
  const [statusCondition, setStatusCondition] = useState<'Situasi Aman Terkendali' | 'Perlu Tindak Lanjut'>('Situasi Aman Terkendali');
  const [incidentNotes, setIncidentNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scanSuccessModal, setScanSuccessModal] = useState<{ token: string; time: string; status: string } | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Capture GPS coordinates on load (no silent fake fallback)
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {
          setCoords(null);
          setErrorMessage('Lokasi GPS tidak tersedia. Aktifkan izin lokasi/GPS perangkat sebelum mengirim patroli.');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setCoords(null);
      setErrorMessage('Perangkat tidak mendukung Geolocation GPS.');
    }
  }, []);

  const startScanner = async (mode: 'environment' | 'user') => {
    try {
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }
      const scannerId = 'reader-full';
      const scanner = new Html5Qrcode(scannerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: mode },
        { fps: 15, qrbox: { width: 220, height: 220 } },
        async (decodedText) => {
          setScanResult(decodedText);
          setIsScanning(false);
          scanner.stop().catch(console.error);
        },
        () => {
          // Scanning progress
        },
      );
      setErrorMessage((prev) => (prev && prev.includes('Kamera') ? null : prev));
    } catch (err: any) {
      setErrorMessage('Kamera tidak dapat digunakan. Pastikan izin kamera telah diberikan.');
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (isScanning) {
      startScanner(facingMode);
    }

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [facingMode, isScanning]);

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const toggleTorch = async () => {
    try {
      if (scannerRef.current && (scannerRef.current as any).applyVideoConstraints) {
        const nextTorch = !torchOn;
        await (scannerRef.current as any).applyVideoConstraints({
          advanced: [{ torch: nextTorch }],
        });
        setTorchOn(nextTorch);
      } else {
        setTorchOn(!torchOn);
      }
    } catch (e) {
      console.warn('Torch not supported on this device/browser');
      setTorchOn(!torchOn);
    }
  };

  const handleResetScan = () => {
    setScanResult(null);
    setStatusCondition('Situasi Aman Terkendali');
    setIncidentNotes('');
    setIsScanning(true);
  };

  const handleSubmitPatrol = async () => {
    if (!scanResult) return;
    if (!coords) {
      setErrorMessage('Koordinat GPS belum diperoleh. Pastikan GPS aktif lalu muat ulang halaman.');
      return;
    }
    setErrorMessage(null);
    setIsSubmitting(true);

    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
    const siteId = user?.siteId || '';
    const lat = coords.lat;
    const lng = coords.lng;

    const payload = {
      siteId,
      qrPayload: scanResult,
      latitude: lat,
      longitude: lng,
      statusResult: statusCondition,
      notes: statusCondition === 'Perlu Tindak Lanjut' ? incidentNotes : undefined,
    };

    if (!navigator.onLine) {
      await enqueueOfflineTransaction('PATROL_SCAN', payload);
      setScanSuccessModal({ token: scanResult, time: `${timeStr} (Offline)`, status: statusCondition });
      setIsSubmitting(false);
      return;
    }

    try {
      await patrolApi.recordScan(payload);
      setScanSuccessModal({ token: scanResult, time: timeStr, status: statusCondition });
    } catch (err: any) {
      const isNetworkErr = !err.response || err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED';
      if (isNetworkErr) {
        await enqueueOfflineTransaction('PATROL_SCAN', payload);
        setScanSuccessModal({ token: scanResult, time: `${timeStr} (Offline)`, status: statusCondition });
      } else {
        const msg = err?.response?.data?.message || 'Gagal mencatat patroli. Periksa QR Code atau hak akses Anda.';
        setErrorMessage(Array.isArray(msg) ? msg.join(', ') : msg);
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
          Patroli Security
        </span>
        <div className="w-8" />
      </header>

      {/* Offline Status & Pending Sync Bar */}
      <OfflineStatusBar />

      {/* Main Content Area */}
      <main className="px-4 pt-4 max-w-md mx-auto w-full flex-1 flex flex-col justify-between">
        {isScanning ? (
          <SurfaceCard className="p-4 space-y-4 flex flex-col items-center text-center">
            {errorMessage && (
              <div className="p-3 w-full bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                {errorMessage}
              </div>
            )}

            {/* Scanner Viewfinder Box */}
            <div className="relative w-full max-w-[300px] aspect-square rounded-3xl overflow-hidden bg-slate-900 border-2 border-slate-300 shadow-skeuo-inset flex items-center justify-center">
              <div id="reader-full" className="w-full h-full object-cover"></div>

              {/* Reticle Outline Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-52 h-52 relative border-2 border-sky-400/80 rounded-2xl shadow-sky-glow">
                  {/* 4 Corner Markers */}
                  <span className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-sky-400 rounded-tl-md" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-sky-400 rounded-tr-md" />
                  <span className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-sky-400 rounded-bl-md" />
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-sky-400 rounded-br-md" />

                  {/* Animated laser scan line */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-sky-400 to-transparent absolute top-1/2 -translate-y-1/2 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Instructional Labels */}
            <div className="space-y-1">
              <h2 className="text-sm font-extrabold text-slate-800 tracking-tight">
                Scan QR Code Checkpoint
              </h2>
              <p className="text-xs text-slate-500">
                Arahkan lensa kamera ke QR Code di lokasi pos patroli
              </p>
            </div>

            {/* 3 Action Controls underneath */}
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={toggleFacingMode}
                className="p-3 rounded-2xl bg-white border border-slate-300 shadow-skeuo-button-secondary text-slate-700 active:scale-95 transition"
                title="Ganti Kamera"
              >
                <SwitchCamera className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={toggleTorch}
                className={`p-3.5 rounded-2xl border transition active:scale-95 ${torchOn
                    ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-md'
                    : 'bg-white border-slate-300 shadow-skeuo-button-secondary text-slate-700'
                  }`}
                title="Senter Flash"
              >
                <Flashlight className="w-6 h-6" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/validasi-patroli/')}
                className="p-3 rounded-2xl bg-white border border-slate-300 shadow-skeuo-button-secondary text-slate-700 active:scale-95 transition"
                title="Batal"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </SurfaceCard>
        ) : (
          /* Checkpoint Verification & Result Condition Form */
          <SurfaceCard className="p-5 space-y-4">
            <div className="flex items-center space-x-3 pb-2 border-b border-slate-200">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-800 tracking-tight">
                  Verifikasi Hasil Patroli
                </h2>
                <p className="text-[11px] text-slate-500">
                  QR Terdeteksi: <span className="font-mono font-bold text-slate-700">{scanResult}</span>
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-700">
                Kondisi Lapangan / Hasil Pemeriksaan:
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setStatusCondition('Situasi Aman Terkendali')}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${statusCondition === 'Situasi Aman Terkendali'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm'
                      : 'bg-white border-slate-300 text-slate-600'
                    }`}
                >
                  <CheckCircle2 className={`w-5 h-5 mb-1 ${statusCondition === 'Situasi Aman Terkendali' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold leading-tight">Aman Terkendali</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Tidak ada kejanggalan</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusCondition('Perlu Tindak Lanjut')}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${statusCondition === 'Perlu Tindak Lanjut'
                      ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-sm'
                      : 'bg-white border-slate-300 text-slate-600'
                    }`}
                >
                  <AlertTriangle className={`w-5 h-5 mb-1 ${statusCondition === 'Perlu Tindak Lanjut' ? 'text-amber-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold leading-tight">Perlu Tindak Lanjut</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Ada temuan / kendala</span>
                </button>
              </div>

              {statusCondition === 'Perlu Tindak Lanjut' && (
                <div className="space-y-1.5 pt-1 animate-in fade-in duration-150">
                  <label className="text-xs font-semibold text-amber-900 flex items-center space-x-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Catatan Temuan Insiden / Kejanggalan:</span>
                  </label>
                  <textarea
                    rows={3}
                    value={incidentNotes}
                    onChange={(e) => setIncidentNotes(e.target.value)}
                    placeholder="Jelaskan kondisi pos, pintu terbuka, lampu padam, atau fasilitas rusak..."
                    className="w-full bg-[#F8FAFC] border border-amber-300 rounded-xl p-3 text-xs text-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:bg-white focus:border-amber-500"
                  />
                </div>
              )}
            </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-xs text-red-700">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5 pt-3">
              <SkeuomorphicButton
                type="button"
                variant="secondary"
                onClick={handleResetScan}
                icon={RotateCcw}
              >
                Scan Ulang
              </SkeuomorphicButton>

              <SkeuomorphicButton
                type="button"
                variant="primary"
                onClick={handleSubmitPatrol}
                disabled={isSubmitting || (statusCondition === 'Perlu Tindak Lanjut' && !incidentNotes.trim())}
                icon={Send}
              >
                {isSubmitting ? 'Menyimpan...' : 'Kirim Laporan'}
              </SkeuomorphicButton>
            </div>
          </SurfaceCard>
        )}
      </main>

      {/* SUCCESS CONFIRMATION MODAL */}
      {scanSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 text-center space-y-4 shadow-soft-xl border border-slate-200">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-md ${scanSuccessModal.status === 'Perlu Tindak Lanjut' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
              }`}>
              {scanSuccessModal.status === 'Perlu Tindak Lanjut' ? (
                <AlertTriangle className="w-9 h-9" />
              ) : (
                <CheckCircle2 className="w-9 h-9" />
              )}
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                {scanSuccessModal.status === 'Perlu Tindak Lanjut' ? 'Temuan Insiden Dilaporkan!' : 'Checkpoint Terverifikasi!'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {scanSuccessModal.time}
              </p>
              <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-bold break-all">
                {scanSuccessModal.token}
              </div>
            </div>

            <SkeuomorphicButton
              variant="primary"
              className="w-full"
              onClick={() => {
                setScanSuccessModal(null);
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
