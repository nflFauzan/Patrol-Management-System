import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Camera,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Send,
  Building,
  CheckSquare,
  Square
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cleaningApi, checkpointsApi } from '../services/api';
import { enqueueOfflineTransaction } from '../services/offlineQueue';
import { OfflineStatusBar } from '../components/OfflineStatusBar';
import { SurfaceCard } from '../components/ui/SurfaceCard';
import { SkeuomorphicButton } from '../components/ui/SkeuomorphicButton';
import { StatusBadge } from '../components/ui/StatusBadge';

export const CleaningChecklistPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [checkpoints, setCheckpoints] = useState<any[]>([]);
  const [selectedCheckpointId, setSelectedCheckpointId] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [gpsReady, setGpsReady] = useState(false);
  const [gpsMessage, setGpsMessage] = useState('Mengambil koordinat GPS...');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  // 6 Sanitation Sub-tasks state
  const [floorCleaned, setFloorCleaned] = useState(true);
  const [trashEmptied, setTrashEmptied] = useState(true);
  const [soapRestocked, setSoapRestocked] = useState(true);
  const [mirrorCleaned, setMirrorCleaned] = useState(true);
  const [tissueRestocked, setTissueRestocked] = useState(true);
  const [odorFreshened, setOdorFreshened] = useState(true);

  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState<boolean>(false);

  // Load cleaning checkpoints
  useEffect(() => {
    const fetchCheckpoints = async () => {
      try {
        const siteId = user?.siteId || '11111111-1111-1111-1111-111111111111';
        const list = await checkpointsApi.getBySite(siteId, 'Cleaning Service');
        if (Array.isArray(list) && list.length > 0) {
          setCheckpoints(list);
          setSelectedCheckpointId(list[0].id);
        } else {
          // Fallback defaults
          const defaultList = [
            { id: 'cp-clean-1', name: 'Toilet Lobby Lantai 1', location_detail: 'Lobby Utama' },
            { id: 'cp-clean-2', name: 'Toilet Eksekutif Lantai 2', location_detail: 'Gedung A Lantai 2' },
            { id: 'cp-clean-3', name: 'Pantry & Ruang Makan', location_detail: 'Lantai 1 Belakang' },
            { id: 'cp-clean-4', name: 'Koridor Utama & Area Resepsionis', location_detail: 'Lobi Depan' },
          ];
          setCheckpoints(defaultList);
          setSelectedCheckpointId(defaultList[0].id);
        }
      } catch {
        const defaultList = [
          { id: 'cp-clean-1', name: 'Toilet Lobby Lantai 1', location_detail: 'Lobby Utama' },
          { id: 'cp-clean-2', name: 'Toilet Eksekutif Lantai 2', location_detail: 'Gedung A Lantai 2' },
          { id: 'cp-clean-3', name: 'Pantry & Ruang Makan', location_detail: 'Lantai 1 Belakang' },
        ];
        setCheckpoints(defaultList);
        setSelectedCheckpointId(defaultList[0].id);
      }
    };

    fetchCheckpoints();
  }, [user]);

  // Camera Handling
  const startCamera = async (mode: 'environment' | 'user') => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 640 }, height: { ideal: 480 } },
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
    setGpsMessage('Mencari sinyal GPS...');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGpsReady(true);
          setGpsMessage('GPS Terkunci');

          if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth || 640;
            canvas.height = videoRef.current.videoHeight || 480;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
              setPhotoDataUrl(canvas.toDataURL('image/jpeg', 0.6));
            }
          }
        },
        () => {
          setCoords({ lat: -6.2088, lng: 106.8456 });
          setGpsReady(true);
          setGpsMessage('GPS Default');
          if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth || 640;
            canvas.height = videoRef.current.videoHeight || 480;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
              setPhotoDataUrl(canvas.toDataURL('image/jpeg', 0.6));
            }
          }
        },
        { enableHighAccuracy: true, timeout: 8000 },
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoDataUrl) {
      alert('Foto bukti hasil pembersihan wajib diambil!');
      return;
    }

    setIsSubmitting(true);
    const siteId = user?.siteId || '11111111-1111-1111-1111-111111111111';

    const payload = {
      siteId,
      checkpointId: selectedCheckpointId,
      floorCleaned,
      trashEmptied,
      soapRestocked,
      mirrorCleaned,
      tissueRestocked,
      odorFreshened,
      notes: notes || undefined,
      photoBase64: photoDataUrl,
    };

    if (!navigator.onLine) {
      await enqueueOfflineTransaction('CLEANING_CHECKLIST', payload);
      setSuccessModal(true);
      setIsSubmitting(false);
      return;
    }

    try {
      await cleaningApi.submitChecklist(payload);
      setSuccessModal(true);
    } catch (err: any) {
      alert('Gagal menyimpan checklist kebersihan: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const subTaskList = [
    { label: 'Lantai Bersih & Dipel', val: floorCleaned, setVal: setFloorCleaned },
    { label: 'Tempat Sampah Kosong & Plastik Baru', val: trashEmptied, setVal: setTrashEmptied },
    { label: 'Sabun Cuci Tangan / Sanitizer Terisi', val: soapRestocked, setVal: setSoapRestocked },
    { label: 'Cermin & Wastafel Bersih Tanpa Noda', val: mirrorCleaned, setVal: setMirrorCleaned },
    { label: 'Ketersediaan Tisu / Hand Dryer Siap', val: tissueRestocked, setVal: setTissueRestocked },
    { label: 'Pengharum Ruangan / Aroma Segar', val: odorFreshened, setVal: setOdorFreshened },
  ];

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
          Checklist Kebersihan & Sanitasi
        </span>
        <div className="w-8" />
      </header>

      {/* Offline Status & Pending Sync Bar */}
      <OfflineStatusBar />

      {/* Main Content Area */}
      <main className="px-4 pt-4 max-w-md mx-auto w-full flex-1 space-y-4">
        <SurfaceCard className="p-5 space-y-4">
          <div className="flex items-center space-x-3 pb-2 border-b border-slate-200">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 tracking-tight">
                Sanitasi Zona & Fasilitas
              </h2>
              <p className="text-[11px] text-slate-500">
                Pilih pos ruangan, verifikasi 6 sub-tugas, dan unggah foto
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Checkpoint selector */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Pilih Area / Zona Sanitasi</label>
              <select
                value={selectedCheckpointId}
                onChange={(e) => setSelectedCheckpointId(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:bg-white focus:border-teal-500"
              >
                {checkpoints.map((cp) => (
                  <option key={cp.id} value={cp.id}>
                    {cp.name} {cp.location_detail ? `(${cp.location_detail})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* 6 Sub-Checklist Tasks */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">
                Verifikasi 6 Indikator Kebersihan:
              </label>

              <div className="space-y-1.5 bg-slate-50/70 p-3 rounded-2xl border border-slate-200/80">
                {subTaskList.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => item.setVal(!item.val)}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-white transition"
                  >
                    <span className="text-xs text-slate-700 font-medium">{item.label}</span>
                    {item.val ? (
                      <CheckSquare className="w-4 h-4 text-teal-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Camera Photo Proof */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Foto Bukti Hasil Kebersihan</label>
                <StatusBadge variant={gpsReady ? 'success' : 'warning'}>
                  {gpsMessage}
                </StatusBadge>
              </div>

              <div className="w-full h-40 bg-slate-900 rounded-2xl overflow-hidden shadow-skeuo-inset border-2 border-slate-300 relative flex items-center justify-center">
                {photoDataUrl ? (
                  <img src={photoDataUrl} alt="Cleaning Proof" className="w-full h-full object-cover" />
                ) : (
                  <video ref={videoRef} playsInline autoPlay muted className="w-full h-full object-cover" />
                )}
              </div>

              <SkeuomorphicButton
                type="button"
                variant="secondary"
                className="w-full"
                onClick={handleCapturePhoto}
                icon={Camera}
              >
                {photoDataUrl ? 'Foto Ulang' : 'Ambil Foto Bukti Sanitasi'}
              </SkeuomorphicButton>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Catatan / Temuan Khusus</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Kondisi bersih, sabun restock 500ml"
                className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:bg-white focus:border-teal-500"
              />
            </div>

            {/* Submit Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <SkeuomorphicButton
                type="button"
                variant="secondary"
                onClick={() => navigate('/validasi-patroli/')}
              >
                Batal
              </SkeuomorphicButton>
              <SkeuomorphicButton
                type="submit"
                variant="primary"
                disabled={!photoDataUrl || isSubmitting}
                icon={Send}
              >
                {isSubmitting ? 'Menyimpan...' : 'Kirim Sanitasi'}
              </SkeuomorphicButton>
            </div>
          </form>
        </SurfaceCard>
      </main>

      {/* Confirmation Modal */}
      {successModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 text-center space-y-4 shadow-soft-xl border border-slate-200">
            <div className="w-16 h-16 rounded-full bg-teal-500 text-white flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Sanitasi Berhasil Dicatat!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Laporan kebersihan 6 sub-indikator dan foto bukti telah disimpan secara rapi.
              </p>
            </div>

            <SkeuomorphicButton
              variant="primary"
              className="w-full"
              onClick={() => {
                setSuccessModal(false);
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
