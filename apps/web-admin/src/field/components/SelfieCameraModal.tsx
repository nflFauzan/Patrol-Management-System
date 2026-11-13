'use client';
import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, AlertCircle, Check } from 'lucide-react';

interface SelfieCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string, statusReason?: string) => void;
  title?: string;
  mode?: 'CLOCK_IN' | 'CLOCK_OUT';
  gpsLocation?: { lat: number; lng: number; accuracy: number } | null;
}

export const SelfieCameraModal: React.FC<SelfieCameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  mode = 'CLOCK_IN',
  gpsLocation,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [alasan, setAlasan] = useState<string>('1'); // 1: Piket Rutin, 2: Lembur, 3: Penugasan lain

  const isCheckIn = mode === 'CLOCK_IN';
  const headerBg = isCheckIn ? '#006400' : '#FF8C00';
  const headerTitle = isCheckIn ? 'ABSEN MASUK' : 'ABSEN PULANG';

  // 60-second idle auto-redirect
  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      handleClose();
    }, 60000);
  };

  const startCamera = async () => {
    setIsCameraActive(false);
    setCameraError(null);

    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 320 },
          height: { ideal: 320 },
          facingMode: 'user',
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Camera stream error:', err);
      setCameraError('Gagal mengakses kamera. Pastikan izin kamera telah diberikan.');
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    if (isOpen && !capturedImage) {
      resetIdleTimer();
      startCamera();
    }

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, capturedImage]);

  const handleTakePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    resetIdleTimer();

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = 320;
    canvas.height = 320;

    // Draw frame
    context.drawImage(video, 0, 0, 320, 320);

    // Compress to JPEG with 0.20 quality (patroli.site specification: jpeg_quality 20)
    const base64 = canvas.toDataURL('image/jpeg', 0.2);
    setCapturedImage(base64);

    // Stop stream to save battery
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    resetIdleTimer();
    startCamera();
  };

  const handleConfirm = () => {
    if (!capturedImage) return;
    onCapture(capturedImage, isCheckIn ? alasan : undefined);
    handleClose();
  };

  const handleRefresh = () => {
    resetIdleTimer();
    startCamera();
  };

  const handleClose = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCapturedImage(null);
    onClose();
  };

  if (!isOpen) return null;

  const isLocationDetected = Boolean(gpsLocation);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="bg-[#f5f5f5] rounded-xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        {/* Header matching patroli.site */}
        <div
          style={{ backgroundColor: headerBg }}
          className="text-white h-11 flex items-center justify-between px-4 font-bold text-sm tracking-wide shadow"
        >
          <span>{headerTitle}</span>
          <button onClick={handleClose} className="p-1 rounded text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Container */}
        <div className="p-4 flex flex-col items-center overflow-y-auto">
          {/* Status Dropdown (Absen Masuk) */}
          {isCheckIn && (
            <div className="w-full mb-3">
              <select
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
                className="w-full p-2.5 text-green-700 bg-white border border-green-600 rounded-lg text-sm font-semibold focus:outline-none"
              >
                <option value="1">Piket Rutin</option>
                <option value="2">Lembur</option>
                <option value="3">Penugasan lain</option>
              </select>
            </div>
          )}

          {/* Camera Viewfinder (320x320) */}
          <div
            style={{ borderColor: headerBg }}
            className="w-[280px] h-[280px] bg-black rounded-lg overflow-hidden border-2 flex items-center justify-center relative shadow-inner"
          >
            {capturedImage ? (
              <img src={capturedImage} alt="Selfie" className="w-full h-full object-cover" />
            ) : cameraError ? (
              <div className="text-center p-4 text-white text-xs space-y-2">
                <AlertCircle className="w-7 h-7 text-amber-400 mx-auto" />
                <p>{cameraError}</p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-bold"
                >
                  Coba Lagi
                </button>
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Buttons Before Snapshot */}
          {!capturedImage ? (
            <div className="flex justify-center gap-2 mt-4 w-full">
              <button
                type="button"
                onClick={handleTakePhoto}
                disabled={!isCameraActive}
                className="px-5 py-2.5 bg-[#007bff] hover:bg-blue-600 text-white rounded-lg text-sm font-bold shadow disabled:opacity-50"
              >
                Foto
              </button>
              <button
                type="button"
                onClick={handleRefresh}
                className="px-4 py-2.5 bg-[#ff8000] hover:bg-orange-600 text-white rounded-lg text-sm font-bold shadow"
              >
                Refresh
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 bg-[#555] hover:bg-neutral-600 text-white rounded-lg text-sm font-semibold"
              >
                Batal
              </button>
            </div>
          ) : (
            /* Buttons After Snapshot */
            <div className="flex justify-center gap-2 mt-4 w-full">
              <button
                type="button"
                onClick={handleRetake}
                className="px-4 py-2.5 bg-[#8000ff] hover:bg-purple-700 text-white rounded-lg text-sm font-bold shadow"
              >
                Ulangi
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-5 py-2.5 bg-[#28a745] hover:bg-green-600 text-white rounded-lg text-sm font-bold shadow"
              >
                Simpan
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 bg-[#555] hover:bg-neutral-600 text-white rounded-lg text-sm font-semibold"
              >
                Batal
              </button>
            </div>
          )}

          {/* Status Indicators matching patroli.site */}
          <div className="text-center mt-3 text-xs">
            <div>
              Lokasi:{' '}
              <span className={isLocationDetected ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>
                {isLocationDetected ? 'Terdeteksi âœ…' : 'Mencari lokasi... â³'}
              </span>{' '}
              | Kamera:{' '}
              <span className={isCameraActive ? 'text-green-600 font-bold' : 'text-amber-500 font-bold'}>
                {isCameraActive ? 'Aktif âœ…' : 'Menyiapkan...'}
              </span>
            </div>
            {isLocationDetected && (
              <div className="text-[#0066cc] font-bold mt-2 text-sm">
                Silahkan klik Foto dan Simpan..!
              </div>
            )}
          </div>
        </div>

        {/* Footer Warning matching patroli.site */}
        <div className="bg-[#e74c3c] text-white py-2 px-3 text-center text-xs leading-tight">
          Pastikan izin lokasi aktif. Jika belum silahkan aktifkan izin lokasi dan klik tombol refresh!
        </div>
      </div>
    </div>
  );
};

