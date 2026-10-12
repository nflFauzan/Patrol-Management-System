import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle } from 'lucide-react';

interface SelfieCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
  title?: string;
}

export const SelfieCameraModal: React.FC<SelfieCameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = 'Swafoto Presensi (Selfie)',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Initialize camera stream
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    if (isOpen && !capturedImage) {
      setIsInitializing(true);
      setCameraError(null);

      navigator.mediaDevices
        ?.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        })
        .then((mediaStream) => {
          activeStream = mediaStream;
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
          setIsInitializing(false);
        })
        .catch((err) => {
          console.warn('Camera stream blocked or unavailable:', err);
          setCameraError('Kamera tidak dapat diakses langsung. Gunakan tombol alternatif di bawah.');
          setIsInitializing(false);
        });
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, capturedImage]);

  // Handle capture from video stream
  const handleTakePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Flip horizontally for natural selfie reflection
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Compress to JPEG with 0.7 quality (< 150KB)
    const base64 = canvas.toDataURL('image/jpeg', 0.7);
    setCapturedImage(base64);

    // Stop stream once photo is taken
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  // Fallback file input capture
  const handleFileFallback = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCapturedImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      handleClose();
    }
  };

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCapturedImage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-white">{title}</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Container */}
        <div className="relative aspect-[3/4] bg-slate-950 flex items-center justify-center overflow-hidden">
          {capturedImage ? (
            <img src={capturedImage} alt="Captured Selfie" className="w-full h-full object-cover" />
          ) : (
            <>
              {isInitializing && (
                <div className="text-slate-400 text-xs flex flex-col items-center space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
                  <span>Mengaktifkan kamera depan...</span>
                </div>
              )}

              {cameraError ? (
                <div className="p-4 text-center space-y-3">
                  <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                  <p className="text-xs text-slate-300">{cameraError}</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow"
                  >
                    Buka Kamera Native HP
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="user"
                    className="hidden"
                    onChange={handleFileFallback}
                  />
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover -scale-x-100"
                />
              )}

              {/* Face Guide Overlay */}
              {!cameraError && !isInitializing && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-60 border-2 border-dashed border-blue-400/60 rounded-[40px]" />
                </div>
              )}
            </>
          )}

          {/* Hidden Canvas */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-4">
          {capturedImage ? (
            <>
              <button
                onClick={handleRetake}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 px-4 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Foto Ulang</span>
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-900/40 transition active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Gunakan Foto</span>
              </button>
            </>
          ) : (
            !cameraError && (
              <button
                onClick={handleTakePhoto}
                disabled={isInitializing}
                className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-90 transition border-4 border-slate-900 shadow-xl flex items-center justify-center text-white disabled:opacity-50"
              >
                <div className="w-6 h-6 rounded-full bg-white" />
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};
