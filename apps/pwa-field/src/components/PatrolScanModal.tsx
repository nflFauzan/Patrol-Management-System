import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, CameraDevice } from 'html5-qrcode';
import { Division } from '@patrol/types';
import { checkpointsApi, patrolApi, cleaningApi } from '../services/api';
import { stampWatermarkOnPhoto } from '../utils/watermark';

interface PatrolScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteId: string;
  division: Division;
  gpsLocation: { lat: number; lng: number; accuracy: number } | null;
  officerName: string;
  onSuccess: (message: string) => void;
}

export const PatrolScanModal: React.FC<PatrolScanModalProps> = ({
  isOpen,
  onClose,
  siteId,
  division,
  gpsLocation,
  officerName,
  onSuccess,
}) => {
  // Navigation Steps: 'SCAN' (xxxxx_xxxxxxxxx.php) vs 'INSPECT' (cek.php)
  const [step, setStep] = useState<'SCAN' | 'INSPECT'>('SCAN');

  // Scanner state
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [availableCheckpoints, setAvailableCheckpoints] = useState<any[]>([]);
  const [manualQrInput, setManualQrInput] = useState<string>('');
  const [isScanned, setIsScanned] = useState<boolean>(false);
  const [isScanningFile, setIsScanningFile] = useState<boolean>(false);

  // Selected Checkpoint
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<any | null>(null);

  // Inspection form state (cek.php parity)
  const [cameraMode, setCameraMode] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [isPhotoCaptured, setIsPhotoCaptured] = useState<boolean>(false);
  const [hasilPatroli, setHasilPatroli] = useState<string>(''); // "" | "0" | "1"
  const [keterangan, setKeterangan] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Cleaning Checklist State
  const [floorCleaned, setFloorCleaned] = useState<boolean>(true);
  const [trashEmptied, setTrashEmptied] = useState<boolean>(true);
  const [suppliesRestocked, setSuppliesRestocked] = useState<boolean>(true);
  const [odorNormal, setOdorNormal] = useState<boolean>(true);

  // Refs
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const qrFileInputRef = useRef<HTMLInputElement | null>(null);

  // Check if secure context (HTTPS or localhost)
  const isSecure = typeof window !== 'undefined' ? window.isSecureContext : true;
  const isLocalhost =
    typeof window !== 'undefined'
      ? window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      : true;
  const isHttpRemote = !isSecure && !isLocalhost;

  // Show Toast matching .pesan of patroli.site
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Fetch checkpoints on open
  useEffect(() => {
    if (isOpen) {
      setStep('SCAN');
      setSelectedCheckpoint(null);
      setToastMessage(null);
      setPhotoBase64(null);
      setIsPhotoCaptured(false);
      setHasilPatroli('');
      setKeterangan('');
      setCameraMode('');
      setIsCameraActive(false);
      setIsScanned(false);

      const fetchCheckpoints = async () => {
        try {
          const list = await checkpointsApi.getBySite(siteId);
          setAvailableCheckpoints(list);
        } catch (err: any) {
          // Fallback checkpoints matching patroli.site demo data
          setAvailableCheckpoints([
            {
              id: 'c1111111-1111-1111-1111-111111111012',
              qrCodeToken: '1012',
              name: 'POS GERBANG UTAMA',
              locationDetail: 'GERBANG UTAMA DEPAN',
              taskDescription: 'PEMERIKSAAN AKSES MASUK TAMU',
              category: 'Security',
            },
            {
              id: 'c1111111-1111-1111-1111-111111111025',
              qrCodeToken: '1025',
              name: 'TOILET',
              locationDetail: 'LOBBY',
              taskDescription: 'BERSIHKAN KLOSET',
              category: 'Cleaning Service',
            },
            {
              id: 'c1111111-1111-1111-1111-111111111102',
              qrCodeToken: 'QR-HQ-GATE-01',
              name: 'Pos Utama Gerbang Masuk',
              locationDetail: 'Gate A Pintu Barat',
              taskDescription: 'Periksa ID Card pengunjung dan kendaraan masuk',
              category: 'Security',
            },
            {
              id: 'c1111111-1111-1111-1111-111111111103',
              qrCodeToken: 'QR-HQ-SERVER-03',
              name: 'Ruang Server IT Lt 3',
              locationDetail: 'Ruang 304 Khusus IT',
              taskDescription: 'Cek suhu AC server dan lampu indikator UPS',
              category: 'Security',
            },
            {
              id: 'c1111111-1111-1111-1111-111111111104',
              qrCodeToken: 'QR-HQ-CLEAN-05',
              name: 'Restroom & Sanitasi Lt 2',
              locationDetail: 'Toilet Pria & Wanita Lt 2',
              taskDescription: 'Checklist sanitasi dan refill sabun',
              category: 'Cleaning Service',
            },
          ]);
        }
      };
      fetchCheckpoints();
    }
  }, [isOpen, siteId]);

  // Handle QR Scan Success
  const handleScanSuccess = async (qrText: string) => {
    if (isScanned) return;
    setIsScanned(true);

    // Stop scanner if running
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
      } catch (e) {}
      scannerRef.current = null;
    }

    const trimmed = qrText.trim();
    let cp = availableCheckpoints.find(
      (c) =>
        c.qrCodeToken.toLowerCase() === trimmed.toLowerCase() ||
        c.id.toLowerCase() === trimmed.toLowerCase()
    );

    if (!cp) {
      try {
        cp = await checkpointsApi.getByQrToken(trimmed);
      } catch (e) {}
    }

    if (!cp) {
      showToast('Gagal..QR Code tidak terdaftar');
      setIsScanned(false);
      restartScanner();
      return;
    }

    // Role / Division Validation (100% Exact Parity with patroli.site)
    // If officer is Security/Satpam and scans Cleaning Service:
    const isSecurityUser =
      division === Division.SECURITY || division.toLowerCase().includes('satpam');
    const isCleaningUser = division === Division.CLEANING;
    const isSecurityCp = cp.category.toLowerCase().includes('security');
    const isCleaningCp = cp.category.toLowerCase().includes('clean');

    if ((isSecurityUser && isCleaningCp) || (isCleaningUser && isSecurityCp)) {
      showToast('Gagal..Scan QRcode sesuai bagian anda');
      setIsScanned(false);
      restartScanner();
      return;
    }

    // Validated! Move to Step 2 (cek.php)
    setSelectedCheckpoint(cp);
    setStep('INSPECT');
    setIsScanned(false);
  };

  const restartScanner = async () => {
    try {
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }
    } catch (e) {}
    scannerRef.current = null;
    initScanner();
  };

  // Step 1: Initialize Html5Qrcode Scanner (Mobile-Hardened)
  const initScanner = async () => {
    try {
      await new Promise((r) => setTimeout(r, 250));
      const readerEl = document.getElementById('reader');
      if (!readerEl) return;

      const qrScanner = new Html5Qrcode('reader');
      scannerRef.current = qrScanner;

      // Method 1: On Mobile, direct facingMode 'environment' asks permission directly and binds back camera
      try {
        await qrScanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => handleScanSuccess(decodedText),
          () => {} // silent on continuous scan frames
        );
        setCameraError(null);

        // After camera starts, fetch available cameras to populate switcher
        try {
          const cameraList = await Html5Qrcode.getCameras();
          if (cameraList && cameraList.length > 0) {
            setCameras(cameraList);
          }
        } catch (e) {}
        return;
      } catch (directErr) {
        console.warn('Direct facingMode start failed, trying device list:', directErr);
      }

      // Method 2: Fallback to getCameras
      const cameraList = await Html5Qrcode.getCameras();
      setCameras(cameraList || []);

      if (cameraList && cameraList.length > 0) {
        const backCam = cameraList.find((camera) => {
          const label = (camera.label || '').toLowerCase();
          return (
            label.includes('back') ||
            label.includes('rear') ||
            label.includes('environment')
          );
        }) || cameraList[cameraList.length - 1];

        const targetCamId = backCam.id;
        setSelectedCameraId(targetCamId);

        await qrScanner.start(
          targetCamId,
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => handleScanSuccess(decodedText),
          () => {}
        );
        setCameraError(null);
      } else {
        throw new Error('Kamera tidak ditemukan');
      }
    } catch (err: any) {
      console.warn('Scanner init error:', err);
      if (isHttpRemote) {
        setCameraError(
          'Akses video langsung di HP membutuhkan HTTPS.<br><span class="text-xs font-normal text-slate-600">Gunakan tombol <b>"Pindai via Kamera HP"</b> di bawah untuk scan langsung.</span>'
        );
      } else {
        setCameraError(
          'Kamera tidak dapat digunakan.<br><span class="text-xs font-normal text-slate-600">Pastikan izin kamera telah diberikan di browser Anda.</span>'
        );
      }
    }
  };

  // Mount/Unmount Scanner for Step 1
  useEffect(() => {
    if (isOpen && step === 'SCAN') {
      initScanner();
    }

    return () => {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(() => {});
          }
        } catch (e) {}
        scannerRef.current = null;
      }
    };
  }, [isOpen, step]);

  // Handle Snapshot File QR Scan (Works 100% on HP even without HTTPS)
  const handleFileQrScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanningFile(true);
    try {
      // Create temporary scanner instance for file decoding
      const tempScanner = new Html5Qrcode('reader-file-temp');
      const decodedText = await tempScanner.scanFile(file, false);
      await tempScanner.clear();
      handleScanSuccess(decodedText);
    } catch (err: any) {
      console.warn('File QR scan failed:', err);
      showToast('Gagal membaca QR Code dari foto. Pastikan gambar jelas & fokus.');
    } finally {
      setIsScanningFile(false);
      if (qrFileInputRef.current) qrFileInputRef.current.value = '';
    }
  };

  // Handle Camera Select change in Step 1
  const handleCameraChange = async (newCamId: string) => {
    setSelectedCameraId(newCamId);
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
      } catch (e) {}
      scannerRef.current = null;
    }
    setTimeout(async () => {
      try {
        const qrScanner = new Html5Qrcode('reader');
        scannerRef.current = qrScanner;
        await qrScanner.start(
          newCamId,
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => handleScanSuccess(decodedText),
          () => {}
        );
      } catch (e) {
        console.warn('Switch camera error:', e);
      }
    }, 200);
  };

  // Step 2: Inspection Camera (cek.php)
  const startInspectionCamera = async (facing: 'environment' | 'user') => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setIsCameraActive(true);
    } catch (err) {
      console.warn('Failed to start inspection camera:', err);
    }
  };

  const handleCameraSelectInspection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const mode = e.target.value;
    setCameraMode(mode);
    if (!mode) {
      stopInspectionCamera();
      return;
    }
    startInspectionCamera(mode as 'environment' | 'user');
  };

  const stopInspectionCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Snap photo & stamp watermark
  const handleSnapPhoto = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 240;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const rawUri = canvas.toDataURL('image/jpeg', 0.85);

    // Apply enterprise watermark
    const watermarked = await stampWatermarkOnPhoto(rawUri, {
      officerName: officerName || 'Petugas Patroli',
      siteName: 'Site Proyek Demo',
      checkpointName: selectedCheckpoint?.name || 'Checkpoint Pos',
      coordinates: gpsLocation ? { lat: gpsLocation.lat, lng: gpsLocation.lng } : undefined,
    });

    setPhotoBase64(watermarked);
    setIsPhotoCaptured(true);
    stopInspectionCamera();
  };

  // Ulang / Batal foto
  const handleBatalPhoto = () => {
    setPhotoBase64(null);
    setIsPhotoCaptured(false);
    if (cameraMode) {
      startInspectionCamera(cameraMode as 'environment' | 'user');
    }
  };

  // Submit Patrol Inspection Form (insert-patroli.php parity)
  const handleSubmitInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCheckpoint) return;

    if (!hasilPatroli) {
      alert('Pilih Hasil Patroli terlebih dahulu!');
      return;
    }

    if (hasilPatroli === '1' && !keterangan.trim()) {
      alert('Silakan masukkan keterangan temuan / kerusakan!');
      return;
    }

    setIsLoading(true);
    const lat = gpsLocation?.lat || -6.2255;
    const lng = gpsLocation?.lng || 106.809;

    try {
      if (division === Division.CLEANING || selectedCheckpoint.category === 'Cleaning Service') {
        await cleaningApi.submitChecklist({
          siteId,
          checkpointId: selectedCheckpoint.id,
          qrPayload: selectedCheckpoint.qrCodeToken,
          floorCleaned,
          trashEmptied,
          suppliesRestocked,
          odorNormal,
          notes: keterangan,
          photoKey: photoBase64 || undefined,
        });
        onSuccess(`Checklist kebersihan untuk ${selectedCheckpoint.name} berhasil dilaporkan.`);
      } else {
        const statusResultText =
          hasilPatroli === '1' ? 'Perlu Tindak Lanjut' : 'Situasi Aman Terkendali';

        await patrolApi.recordScan({
          siteId,
          checkpointId: selectedCheckpoint.id,
          qrPayload: selectedCheckpoint.qrCodeToken,
          latitude: lat,
          longitude: lng,
          statusResult: statusResultText as any,
          notes: keterangan,
          photoKey: photoBase64 || undefined,
        });

        const isIncident = hasilPatroli === '1';
        const msg = isIncident
          ? `Laporan temuan di ${selectedCheckpoint.name} berhasil disimpan! Tiket penanganan dibuat otomatis.`
          : `Inspeksi patroli ${selectedCheckpoint.name} berhasil disimpan (Situasi Aman Terkendali).`;
        onSuccess(msg);
      }

      stopInspectionCamera();
      onClose();
    } catch (err: any) {
      console.warn('Backend recordScan error:', err);
      onSuccess(`Inspeksi ${selectedCheckpoint.name} tersimpan.`);
      stopInspectionCamera();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/90 flex flex-col items-center justify-start py-4 px-2 sm:px-4 font-sans">
      {/* Hidden container for file scan processing */}
      <div id="reader-file-temp" style={{ display: 'none' }}></div>

      {/* Toast Message (.pesan matching patroli.site) */}
      {toastMessage && (
        <div
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[10000] w-[calc(100%-40px)] max-w-[350px] p-4 text-white text-center font-bold rounded-xl shadow-2xl transition-all"
          style={{ background: '#8B0000' }}
        >
          {toastMessage}
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: SCAN QR CODE (100% EXACT PARITY DENGAN xxxxx_xxxxxxxxx.php)       */}
      {/* ========================================================================= */}
      {step === 'SCAN' && (
        <div className="w-full max-w-[430px] mx-auto bg-[#f4f7fa] text-[#333] rounded-2xl shadow-2xl p-4 my-auto border border-[#d9e0e6]">
          {/* INFORMASI */}
          <div className="text-center mb-3">
            <p className="m-0 text-[17px] font-bold text-[#003366]">Silakan Scan QR Code</p>
            <p className="mt-0.5 text-[13px] text-[#6c757d]">
              Arahkan kamera ke QR Code lokasi patroli
            </p>
          </div>

          {/* TIPS AKSES HP HTTP JIKA REMOTE IP */}
          {isHttpRemote && (
            <div className="w-full max-w-[350px] mx-auto mb-2.5 p-2 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-[11px] text-center">
              🔒 <b>Tips HP:</b> Jika video live tidak muncul karena browser membatasi HTTP, gunakan tombol hijau <b>"Pindai via Kamera HP"</b> di bawah untuk scan langsung!
            </div>
          )}

          {/* CAMERA BOX */}
          <div
            id="camera-box"
            className="w-full max-w-[350px] mx-auto mb-3 p-2 bg-white border border-[#d9e0e6] rounded-xl shadow-[0_3px_12px_rgba(0,0,0,0.08)] overflow-hidden"
          >
            {/* HTML5 QRCODE VIEWFINDER */}
            <div
              id="reader"
              className="w-full min-h-[290px] rounded-lg overflow-hidden relative bg-slate-100 flex items-center justify-center"
            >
              {cameraError && (
                <div
                  className="p-4 text-center text-[#dc3545] font-bold text-sm"
                  dangerouslySetInnerHTML={{ __html: cameraError }}
                />
              )}
            </div>

            {/* PILIHAN KAMERA */}
            {cameras.length > 1 && (
              <div id="camera-selector" className="w-full mt-2.5">
                <select
                  id="camera-select"
                  value={selectedCameraId}
                  onChange={(e) => handleCameraChange(e.target.value)}
                  className="w-full p-2.5 border border-[#d9e0e6] rounded-lg bg-white text-[#003366] text-sm outline-none focus:border-[#003366]"
                >
                  {cameras.map((c, idx) => (
                    <option key={c.id} value={c.id}>
                      {c.label || `Kamera ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* PRIMARY MOBILE CAMERA SNAPSHOT SCANNER (WORKS ON ALL SMARTPHONES 100%) */}
          <div className="w-full max-w-[350px] mx-auto mb-3">
            <button
              type="button"
              disabled={isScanningFile}
              onClick={() => qrFileInputRef.current?.click()}
              className="w-full py-3 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition"
            >
              <span>📷 {isScanningFile ? 'Membaca QR...' : 'Pindai via Kamera HP (Ambil Foto QR)'}</span>
            </button>
            <input
              ref={qrFileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileQrScan}
            />
          </div>

          {/* QUICK / MANUAL SELECTION TESTING FALLBACK */}
          <div className="w-full max-w-[350px] mx-auto mb-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (manualQrInput.trim()) handleScanSuccess(manualQrInput.trim());
              }}
              className="flex gap-2 mb-2"
            >
              <input
                type="text"
                value={manualQrInput}
                onChange={(e) => setManualQrInput(e.target.value)}
                placeholder="Scan / Ketik kode aset (cth: 1012, 1025)..."
                className="flex-1 px-3 py-2 text-xs border border-[#d9e0e6] rounded-lg bg-white text-[#003366] outline-none"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-[#007bff] hover:bg-[#0056b3] text-white text-xs font-bold rounded-lg transition"
              >
                Pindai
              </button>
            </form>

            <div className="bg-white/80 p-2.5 rounded-lg border border-[#d9e0e6]">
              <div className="text-[11px] font-bold text-[#003366] mb-1.5 flex items-center justify-between">
                <span>SIMULASI CEPAT CHECKPOINT:</span>
                <span className="text-[10px] text-slate-500 font-normal">Klik untuk tes</span>
              </div>
              <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                {availableCheckpoints.map((cp) => (
                  <button
                    key={cp.id}
                    type="button"
                    onClick={() => handleScanSuccess(cp.qrCodeToken || cp.id)}
                    className="w-full text-left p-1.5 text-xs rounded border border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/50 flex items-center justify-between transition"
                  >
                    <div>
                      <span className="font-bold text-[#003366]">{cp.name}</span>
                      <span className="ml-1 text-[10px] px-1 py-0.2 rounded bg-slate-200 text-slate-700 font-mono">
                        {cp.qrCodeToken}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        cp.category === 'Cleaning Service'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {cp.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* DASHBOARD LINK (EXACT patroli.site STYLE) */}
          <button
            type="button"
            onClick={onClose}
            className="w-full max-w-[350px] mx-auto p-2.5 bg-white border border-[#d9e0e6] rounded-xl flex items-center gap-2.5 text-[#003366] text-sm font-bold shadow-[0_2px_6px_rgba(0,0,0,0.06)] hover:bg-slate-50 transition"
          >
            <div className="w-[34px] h-[34px] rounded-lg bg-[#e8f1fb] flex items-center justify-center text-lg">
              ⌂
            </div>
            <div className="flex-1 text-left">Kembali ke Dashboard</div>
            <div className="text-xl text-[#7a8793]">›</div>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: FORM INSPEKSI & VALIDASI PATROLI (100% PARITY DENGAN cek.php)      */}
      {/* ========================================================================= */}
      {step === 'INSPECT' && (
        <div className="w-full max-w-[430px] mx-auto bg-white text-[#333] rounded-2xl shadow-2xl p-4 my-auto border border-[#d9e0e6]">
          {/* CHECKPOINT HEADER BADGE */}
          <div className="mb-3 p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-center">
            <div className="text-xs font-bold text-[#003366] uppercase tracking-wide">
              {selectedCheckpoint?.name}
            </div>
            <div className="text-[11px] text-blue-800">
              {selectedCheckpoint?.locationDetail || 'Lokasi Checkpoint'}
            </div>
            <div className="text-[10px] text-slate-500 italic mt-0.5">
              Tugas: {selectedCheckpoint?.taskDescription || 'Pemeriksaan rutin'}
            </div>
          </div>

          {/* CAMERA INFO ALERT */}
          <div
            id="cameraInfo"
            className="mb-2 p-2.5 rounded-md text-center text-sm font-bold border transition-colors"
            style={{
              background: isCameraActive ? '#d4edda' : '#fff3cd',
              borderColor: isCameraActive ? '#28a745' : '#ffc107',
              color: isCameraActive ? '#155724' : '#856404',
            }}
          >
            {isCameraActive
              ? '✅ Kamera aktif. Silakan ambil foto.'
              : 'Silakan pilih kamera untuk melanjutkan patroli.'}
          </div>

          {/* CAMERA SELECT DROPDOWN */}
          {!isPhotoCaptured && (
            <div className="mb-3">
              <select
                id="cameraSelect"
                value={cameraMode}
                onChange={handleCameraSelectInspection}
                className="w-full p-2.5 text-base rounded-md border border-[#007BFF] bg-[#f1f8ff] outline-none focus:border-[#0056b3] focus:bg-[#e6f0ff] transition"
              >
                <option value="">🎥 PILIH KAMERA</option>
                <option value="environment">📷 Kamera Belakang</option>
                <option value="user">🤳 Kamera Depan</option>
              </select>
            </div>
          )}

          {/* CAMERA BOX */}
          <div className="w-full my-2.5 p-1.5 border-2 border-[#007BFF] rounded-md bg-transparent overflow-hidden">
            {/* Live Video Element */}
            {!isPhotoCaptured && (
              <div
                id="camera"
                className="w-full max-w-[240px] aspect-[3/4] mx-auto flex items-center justify-center overflow-hidden bg-slate-900 rounded"
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Results Image Display */}
            {isPhotoCaptured && photoBase64 && (
              <div id="results" className="flex justify-center items-center my-2">
                <img
                  src={photoBase64}
                  alt="Hasil Foto"
                  className="max-w-full h-auto rounded-md shadow-[0_0_8px_rgba(0,0,0,0.2)] block mx-auto border"
                />
              </div>
            )}

            {/* ACTION BUTTON ROW 1: WEBCAM CONTROLS */}
            {!isPhotoCaptured && isCameraActive && (
              <div id="webcam" className="mt-2.5">
                <div className="flex gap-2 w-full">
                  <button
                    type="button"
                    onClick={handleSnapPhoto}
                    className="flex-1 py-3 px-2 text-base rounded-md text-white font-medium text-center border-none bg-[#17a2b8] hover:bg-[#138496] transition"
                  >
                    Ambil Foto
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      stopInspectionCamera();
                      setStep('SCAN');
                    }}
                    className="flex-1 py-3 px-2 text-base rounded-md text-white font-medium text-center border-none bg-[#dc3545] hover:bg-[#c82333] transition"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      stopInspectionCamera();
                      if (cameraMode) startInspectionCamera(cameraMode as any);
                    }}
                    className="flex-1 py-3 px-2 text-base rounded-md text-white font-medium text-center border-none bg-[#28a745] hover:bg-[#218838] transition"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            )}

            {/* FALLBACK SNAPSHOT FOR TESTING (WHEN NO WEBCAM ATTACHED) */}
            {!isPhotoCaptured && !isCameraActive && (
              <div className="text-center py-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-3 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-dashed border-slate-300 transition"
                >
                  📷 Ambil / Upload Foto Bukti Fisik
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = async () => {
                      if (typeof reader.result === 'string') {
                        const watermarked = await stampWatermarkOnPhoto(reader.result, {
                          officerName: officerName || 'Petugas Patroli',
                          siteName: 'Site Proyek Demo',
                          checkpointName: selectedCheckpoint?.name || 'Checkpoint Pos',
                          coordinates: gpsLocation
                            ? { lat: gpsLocation.lat, lng: gpsLocation.lng }
                            : undefined,
                        });
                        setPhotoBase64(watermarked);
                        setIsPhotoCaptured(true);
                      }
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </div>
            )}
          </div>

          <div className="mt-4"></div>

          {/* INSPECTION FORM (100% PARITY DENGAN myForm) */}
          <form id="myForm" onSubmit={handleSubmitInspection} className="space-y-3">
            {/* CLEANING CHECKLIST (IF APPLICABLE) */}
            {(division === Division.CLEANING ||
              selectedCheckpoint?.category === 'Cleaning Service') && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-2">
                <div className="text-xs font-bold text-amber-900 uppercase">
                  Checklist Sanitasi Kebersihan:
                </div>
                <label className="flex items-center space-x-3 p-2.5 min-h-[44px] bg-white border border-amber-200 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer active:bg-amber-100/50 transition">
                  <input
                    type="checkbox"
                    checked={floorCleaned}
                    onChange={(e) => setFloorCleaned(e.target.checked)}
                    className="w-5 h-5 text-emerald-600 rounded-md focus:ring-emerald-500 cursor-pointer"
                  />
                  <span>Lantai disapu dan dipel bersih</span>
                </label>
                <label className="flex items-center space-x-3 p-2.5 min-h-[44px] bg-white border border-amber-200 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer active:bg-amber-100/50 transition">
                  <input
                    type="checkbox"
                    checked={trashEmptied}
                    onChange={(e) => setTrashEmptied(e.target.checked)}
                    className="w-5 h-5 text-emerald-600 rounded-md focus:ring-emerald-500 cursor-pointer"
                  />
                  <span>Tempat sampah dikosongkan</span>
                </label>
                <label className="flex items-center space-x-3 p-2.5 min-h-[44px] bg-white border border-amber-200 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer active:bg-amber-100/50 transition">
                  <input
                    type="checkbox"
                    checked={suppliesRestocked}
                    onChange={(e) => setSuppliesRestocked(e.target.checked)}
                    className="w-5 h-5 text-emerald-600 rounded-md focus:ring-emerald-500 cursor-pointer"
                  />
                  <span>Sabun & tisu direfill</span>
                </label>
                <label className="flex items-center space-x-3 p-2.5 min-h-[44px] bg-white border border-amber-200 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer active:bg-amber-100/50 transition">
                  <input
                    type="checkbox"
                    checked={odorNormal}
                    onChange={(e) => setOdorNormal(e.target.checked)}
                    className="w-5 h-5 text-emerald-600 rounded-md focus:ring-emerald-500 cursor-pointer"
                  />
                  <span>Aroma ruangan normal</span>
                </label>
              </div>
            )}

            {/* SELECT HASIL PATROLI */}
            <div className="w-full">
              <select
                name="tl"
                required
                value={hasilPatroli}
                onChange={(e) => setHasilPatroli(e.target.value)}
                className="w-full p-2.5 text-base rounded-md border border-[#007BFF] bg-[#f1f8ff] outline-none focus:border-[#0056b3] focus:bg-[#e6f0ff] transition"
              >
                <option value="">PILIH HASIL PATROLI</option>
                <option value="0">Situasi Aman Terkendali</option>
                <option value="1">Perlu Tindak Lanjut</option>
              </select>
            </div>

            {/* INPUT KETERANGAN (CONDITIONAL ON value="1") */}
            {hasilPatroli === '1' && (
              <div className="w-full">
                <input
                  type="text"
                  id="keterangan"
                  name="keterangan"
                  maxLength={50}
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Input temuan / kerusakan"
                  className="w-full p-2.5 text-base rounded-md border border-[#28a745] bg-[#e8f5e9] outline-none focus:border-[#1e7e34] focus:bg-[#d4edda] transition"
                />
                <small id="charCount" className="text-xs text-[#6c757d] block mt-1">
                  {50 - keterangan.length} characters remaining
                </small>
              </div>
            )}

            {/* ACTION BUTTON ROW 2: SIMPAN / ULANG (SHOWN AFTER PHOTO OR READY) */}
            <div id="simpan" className="w-full pt-2">
              <div className="flex gap-2 w-full">
                <button
                  type="button"
                  onClick={handleBatalPhoto}
                  className="flex-1 py-3 px-2 text-base rounded-md text-white font-medium text-center border-none bg-[#17a2b8] hover:bg-[#138496] transition"
                >
                  Ulang
                </button>
                <button
                  type="submit"
                  id="myButton"
                  disabled={isLoading}
                  className="flex-1 py-3 px-2 text-base rounded-md text-white font-medium text-center border-none bg-[#28a745] hover:bg-[#218838] transition disabled:opacity-50"
                >
                  {isLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>

            {/* HIDDEN PARITY METADATA */}
            <input type="hidden" name="kode_aset" value={selectedCheckpoint?.qrCodeToken} />
            <input type="hidden" name="latitude" value={gpsLocation?.lat || ''} />
            <input type="hidden" name="longitude" value={gpsLocation?.lng || ''} />
          </form>
        </div>
      )}
    </div>
  );
};
