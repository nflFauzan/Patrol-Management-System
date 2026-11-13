'use client';
import React, { useState } from 'react';
import { useNavigate } from '../utils/navigation';
import { sosApi } from '../services/api';

export const PanicPage: React.FC = () => {
  const navigate = useNavigate();
  const [isTriggering, setIsTriggering] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleTriggerSOS = async () => {
    setIsTriggering(true);
    setStatusMessage('Mengambil lokasi GPS...');

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            setStatusMessage('Mengirim sinyal darurat SOS...');
            await sosApi.triggerAlert({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              notes: 'PANIC BUTTON SOS DIPICU DARI PWA FIELD APP',
            });
            setStatusMessage('ðŸš¨ ALARM SOS BERHASIL DIKIRIMKAN KE COMMAND CENTER & WHATSAPP!');
            setTimeout(() => {
              navigate('/validasi-patroli/');
            }, 3000);
          } catch (err: any) {
            alert('Gagal mengirim SOS: ' + (err.response?.data?.message || err.message));
            setIsTriggering(false);
            setStatusMessage(null);
          }
        },
        (error) => {
          alert('GPS gagal diperoleh. Pastikan izin lokasi aktif.');
          setIsTriggering(false);
          setStatusMessage(null);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
      );
    } else {
      alert('Browser tidak mendukung geolokasi GPS.');
      setIsTriggering(false);
      setStatusMessage(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fa] font-sans flex flex-col justify-between p-4 select-none">
      <div>
        {/* Info Alert matching patroli.site xxxxx_xxxxxxx.php */}
        <div className="bg-[#17a2b8] text-white text-center p-3 rounded-lg text-xs font-semibold leading-relaxed shadow-sm mb-6">
          Tombol ini akan memicu sirine diperangkat anggota yang lain, <br />
          anda yakin akan mengirim pesan darurat !!..???
        </div>

        {statusMessage && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-800 text-center rounded-xl text-xs font-bold animate-pulse">
            {statusMessage}
          </div>
        )}

        {/* Skeuomorphic 3D Push Button */}
        <div className="flex flex-col items-center justify-center my-8">
          <button
            type="button"
            id="sosButton"
            disabled={isTriggering}
            onClick={handleTriggerSOS}
            className="sos-btn-3d"
          >
            {isTriggering ? 'SOS...' : 'SOS'}
          </button>
        </div>
      </div>

      {/* Cancel Button */}
      <div className="text-center pb-6">
        <button
          type="button"
          onClick={() => navigate('/validasi-patroli/')}
          className="inline-block px-6 py-2.5 bg-[#ffc107] hover:bg-yellow-500 text-black font-bold rounded-lg text-sm shadow-md transition"
        >
          ðŸš« Klik untuk batalkan
        </button>
      </div>
    </div>
  );
};


