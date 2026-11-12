import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { attendanceApi } from '../services/api';

export const ClockOutPage: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [locationDetected, setLocationDetected] = useState(false);
  const [locationInitializing, setLocationInitializing] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraInitializing, setCameraInitializing] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 60-second Idle Timer matching patroli.site xxxxx_xxx.php
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
        (err) => {
          setLocationInitializing(false);
          setLocationDetected(false);
          alert('Gagal mendapatkan lokasi GPS. Pastikan izin lokasi aktif.');
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 5000 },
      );
    } else {
      setLocationInitializing(false);
      alert('Browser tidak mendukung GPS.');
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
        video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 320 } },
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
    if (!locationDetected) {
      alert('Tunggu lokasi selesai terdeteksi!');
      return;
    }
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, 320, 320);
      const dataUri = canvas.toDataURL('image/jpeg', 0.2); // 20% compression
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
    try {
      await attendanceApi.clockOut({
        latitude: gpsCoords.lat,
        longitude: gpsCoords.lng,
        photoBase64: photoDataUrl,
        notes: 'Selesai shift/jaga',
      });
      alert('Absensi pulang berhasil disimpan!');
      navigate('/validasi-patroli/');
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Gagal menyimpan absensi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const locText = locationDetected ? 'Terdeteksi ✅' : locationInitializing ? 'Mencari lokasi...' : 'Belum aktif ❌';
  const locColor = locationDetected ? 'green' : locationInitializing ? '#ff9900' : 'red';
  const camText = cameraActive ? 'Aktif ✅' : cameraInitializing ? 'Mencari kamera...' : 'Belum aktif ❌';
  const camColor = cameraActive ? 'green' : cameraInitializing ? '#ff9900' : 'red';

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col font-sans select-none pb-16">
      {/* Header Oranye (#FF8C00) dengan Teks Hitam */}
      <div className="bg-[#FF8C00] text-black h-10 flex items-center justify-center font-bold text-sm tracking-wide">
        ABSEN PULANG
      </div>

      <div className="flex flex-col items-center px-4 pt-3 flex-1">
        <form onSubmit={handleSubmit} className="w-full max-w-[340px] flex flex-col items-center">
          {/* Camera Frame (320x320) */}
          <div className="w-[320px] h-[320px] border border-[#FF8C00] rounded-md overflow-hidden bg-black relative flex items-center justify-center mb-4">
            {photoDataUrl ? (
              <img src={photoDataUrl} alt="Preview Selfie" className="w-[320px] h-[320px] object-cover" />
            ) : (
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className="w-[320px] h-[320px] object-cover"
              />
            )}
          </div>

          {/* Action Buttons */}
          {!photoDataUrl ? (
            <div className="flex justify-center gap-2 flex-wrap mb-3 w-full">
              <button
                type="button"
                onClick={handleSnap}
                className="px-4 py-2 bg-[#007bff] hover:bg-blue-600 text-white rounded font-medium text-sm transition"
              >
                Foto
              </button>
              <button
                type="button"
                onClick={getLocation}
                className="px-4 py-2 bg-[#ff8000] hover:bg-orange-600 text-white rounded font-medium text-sm transition"
              >
                Refresh
              </button>
              <button
                type="button"
                onClick={() => navigate('/validasi-patroli/')}
                className="px-4 py-2 bg-[#555] hover:bg-slate-600 text-white rounded font-medium text-sm transition"
              >
                Batal
              </button>
            </div>
          ) : (
            <div className="flex justify-center gap-2 flex-wrap mb-3 w-full">
              <button
                type="button"
                onClick={handleRetake}
                className="px-4 py-2 bg-[#8000ff] hover:bg-purple-700 text-white rounded font-medium text-sm transition"
              >
                Ulangi
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-[#28a745] hover:bg-green-700 text-white rounded font-medium text-sm transition disabled:opacity-50"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/validasi-patroli/')}
                className="px-4 py-2 bg-[#555] hover:bg-slate-600 text-white rounded font-medium text-sm transition"
              >
                Batal
              </button>
            </div>
          )}
        </form>

        {/* Status Notification */}
        <div className="text-center my-2 text-xs font-bold leading-relaxed text-slate-700">
          <div>
            Lokasi: <span style={{ color: locColor }}>{locText}</span> | Kamera: <span style={{ color: camColor }}>{camText}</span>
          </div>
          {locationDetected && (
            <div className="text-[#0066cc] font-bold mt-2 text-sm">
              Silahkan klik Foto dan Simpan..!
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-[#e74c3c] text-white py-2 px-3 fixed bottom-0 left-0 w-full text-center text-xs">
        Pastikan izin lokasi aktif. Jika belum <br />silahkan aktifkan izin lokasi dan klik tombol refresh!
      </div>
    </div>
  );
};

