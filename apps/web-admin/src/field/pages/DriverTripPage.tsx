'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from '../utils/navigation';
import { driverApi } from '../services/api';

export const DriverTripPage: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [gpsReady, setGpsReady] = useState(false);
  const [gpsMessage, setGpsMessage] = useState('GPS belum diambil');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [tipe, setTipe] = useState('');
  const [nopol, setNopol] = useState('');
  const [tujuan, setTujuan] = useState('');
  const [keperluan, setKeperluan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startCamera = async (mode: 'environment' | 'user') => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
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
          setGpsMessage('âœ“ GPS berhasil diperoleh');

          if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth || 640;
            canvas.height = videoRef.current.videoHeight || 480;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
              setPhotoDataUrl(canvas.toDataURL('image/jpeg', 0.7));
            }
          }
        },
        (err) => {
          setGpsMessage('Gagal memperoleh GPS. Coba lagi.');
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoDataUrl || !coords) {
      alert('Foto keberangkatan dan lokasi GPS wajib diambil!');
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
      alert('Perjalanan driver berhasil disimpan!');
      navigate('/validasi-patroli/');
    } catch (err: any) {
      alert('Gagal menyimpan perjalanan: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-900 font-sans p-4 pb-12 select-none">
      <div className="max-w-md mx-auto">
        {/* Header matching patroli.site xxxxx_xxxxxxxxxx.php */}
        <div className="flex items-center text-white mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl mr-3">
            ðŸš—
          </div>
          <div>
            <h1 className="text-lg font-bold">Perjalanan Baru</h1>
            <p className="text-xs text-white/70">Catat keberangkatan kendaraan</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
          {/* Camera Section */}
          <div className="p-4 bg-slate-50 border-b">
            <div className="text-xs font-bold text-slate-800 mb-2">ðŸ“· Foto Keberangkatan</div>
            <div className="w-full h-56 bg-black rounded-xl overflow-hidden relative flex items-center justify-center">
              {photoDataUrl ? (
                <img src={photoDataUrl} alt="Departure" className="w-full h-full object-cover" />
              ) : (
                <video ref={videoRef} playsInline autoPlay muted className="w-full h-full object-cover" />
              )}
            </div>

            <div className="mt-2 flex gap-2">
              <select
                value={facingMode}
                onChange={(e) => setFacingMode(e.target.value as any)}
                className="flex-1 p-2 border border-slate-300 rounded-lg text-xs bg-white"
              >
                <option value="environment">Kamera Belakang</option>
                <option value="user">Kamera Depan</option>
              </select>
            </div>

            <div className={`mt-2 p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
              gpsReady ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}>
              <span>ðŸ“</span>
              <span className="font-semibold">{gpsMessage}</span>
            </div>

            <button
              type="button"
              onClick={handleCapturePhoto}
              className="w-full mt-3 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl text-xs shadow-md"
            >
              ðŸ“· Ambil Foto Keberangkatan
            </button>
          </div>

          {/* Form Information */}
          <form onSubmit={handleSubmit} className="p-4 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tipe Kendaraan</label>
              <input
                type="text"
                required
                value={tipe}
                onChange={(e) => setTipe(e.target.value)}
                placeholder="Contoh: Toyota Avanza"
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Polisi</label>
              <input
                type="text"
                required
                value={nopol}
                onChange={(e) => setNopol(e.target.value)}
                placeholder="Contoh: B 1234 PS"
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tujuan</label>
              <input
                type="text"
                required
                value={tujuan}
                onChange={(e) => setTujuan(e.target.value)}
                placeholder="Masukkan alamat tujuan"
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Keperluan Perjalanan</label>
              <input
                type="text"
                required
                value={keperluan}
                onChange={(e) => setKeperluan(e.target.value)}
                placeholder="Contoh: Antar logistik site / Dokumen dinas"
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => navigate('/validasi-patroli/')}
                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs border border-slate-300"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!photoDataUrl || !gpsReady || isSubmitting}
                className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition disabled:opacity-50"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perjalanan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


