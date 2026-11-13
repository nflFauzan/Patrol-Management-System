'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from '../utils/navigation';
import { Html5Qrcode } from 'html5-qrcode';
import { patrolApi } from '../services/api';

export const PatrolScanPage: React.FC = () => {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const scannerId = 'reader-full';
    const scanner = new Html5Qrcode(scannerId);
    scannerRef.current = scanner;

    const startScanner = async () => {
      try {
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            setScanResult(decodedText);
            setIsScanning(false);
            scanner.stop().catch(console.error);

            // Submit to patrol check API
            try {
              if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(async (pos) => {
                  await patrolApi.scanCheckpoint({
                    siteId: '11111111-1111-1111-1111-111111111111',
                    qrCodeToken: decodedText,
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                  });
                  alert(`âœ… Checkpoint Berhasil Dipindai!\nToken: ${decodedText}`);
                  navigate('/validasi-patroli/');
                });
              } else {
                alert(`âœ… QR Terbaca: ${decodedText}`);
                navigate('/validasi-patroli/');
              }
            } catch (err: any) {
              alert('Gagal memvalidasi checkpoint: ' + (err.response?.data?.message || err.message));
              navigate('/validasi-patroli/');
            }
          },
          (err) => {
            // Scanning in progress
          },
        );
      } catch (err: any) {
        setErrorMessage('Kamera tidak dapat digunakan. Pastikan izin kamera telah diberikan.');
        setIsScanning(false);
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#f4f7fa] font-sans p-4 flex flex-col justify-between select-none">
      <div className="max-w-md mx-auto w-full text-center">
        <h1 className="text-xl font-bold text-slate-800 mb-1">Silakan Scan QR Code</h1>
        <p className="text-xs text-slate-500 mb-4">Arahkan kamera ke QR Code lokasi patroli</p>

        {errorMessage && (
          <div className="p-3 bg-red-100 border border-red-300 text-red-700 text-xs rounded-lg font-medium mb-4">
            {errorMessage}
          </div>
        )}

        {/* Scanner Container (250x250) */}
        <div className="w-full max-w-[320px] mx-auto bg-black rounded-2xl overflow-hidden shadow-lg border-2 border-slate-300 relative min-h-[300px] flex items-center justify-center">
          <div id="reader-full" className="w-full h-full"></div>
        </div>

        {scanResult && (
          <div className="mt-4 p-3 bg-green-100 text-green-800 font-bold rounded-lg text-xs">
            QR Terbaca: {scanResult}
          </div>
        )}
      </div>

      {/* Kembali ke Dashboard button matching patroli.site xxxxx_xxxxxxxxx.php */}
      <div className="max-w-md mx-auto w-full pt-6 text-center">
        <button
          onClick={() => navigate('/validasi-patroli/')}
          className="w-full max-w-[300px] py-3 bg-white border border-slate-300 rounded-xl text-[#003366] font-bold text-sm shadow-sm hover:bg-slate-50 transition inline-flex items-center justify-center gap-2"
        >
          <span>âŒ‚</span> Kembali ke Dashboard
        </button>
      </div>
    </div>
  );
};


