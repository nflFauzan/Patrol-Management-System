import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Briefcase, 
  CheckCircle2, 
  Send, 
  ClipboardList,
  Building,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { staffApi } from '../services/api';
import { enqueueOfflineTransaction } from '../services/offlineQueue';
import { OfflineStatusBar } from '../components/OfflineStatusBar';
import { SurfaceCard } from '../components/ui/SurfaceCard';
import { SkeuomorphicButton } from '../components/ui/SkeuomorphicButton';
import { StatusBadge } from '../components/ui/StatusBadge';

export const StaffActivityPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activityType, setActivityType] = useState('Administrasi & Pelaporan');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('COMPLETED');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const categories = [
    'Administrasi & Pelaporan',
    'Meeting & Koordinasi',
    'Dokumentasi & Arsip',
    'Penginputan Data Operasional',
    'Koordinasi Lapangan / Site',
    'Pemeliharaan Aset & Fasilitas',
    'Pelatihan & Evaluasi Tim',
    'Kegiatan Operasional Lainnya',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Deskripsi kegiatan operasional wajib diisi!');
      return;
    }

    setIsSubmitting(true);
    const siteId = user?.siteId || '11111111-1111-1111-1111-111111111111';

    const payload = {
      siteId,
      activityType,
      description,
      status,
    };

    if (!navigator.onLine) {
      await enqueueOfflineTransaction('STAFF_ACTIVITY', payload);
      setShowSuccessModal(true);
      setIsSubmitting(false);
      return;
    }

    try {
      await staffApi.createActivity(payload);
      setShowSuccessModal(true);
    } catch (err: any) {
      alert('Gagal menyimpan kegiatan staff: ' + (err.response?.data?.message || err.message));
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
          Logbook Staf Operasional
        </span>
        <div className="w-8" />
      </header>

      {/* Offline Status & Pending Sync Bar */}
      <OfflineStatusBar />

      {/* Main Content Area */}
      <main className="px-4 pt-4 max-w-md mx-auto w-full flex-1">
        <SurfaceCard className="p-5 space-y-4">
          <div className="flex items-center space-x-3 pb-2 border-b border-slate-200/80">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 tracking-tight">
                Catat Laporan Kegiatan Harian
              </h2>
              <p className="text-[11px] text-slate-500">
                Pencatatan aktivitas kantor, meeting, koordinasi, dan pemeliharaan
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Kategori Kegiatan Staf
              </label>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:bg-white focus:border-indigo-500"
              >
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Deskripsi Rincian Pekerjaan
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Contoh: Menginput rekapitulasi data checkpoint bulan Oktober, verifikasi koordinat GPS, dan pengarsipan berita acara."
                className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:bg-white focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Status Penyelesaian
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:bg-white focus:border-indigo-500"
              >
                <option value="COMPLETED">Selesai (Completed)</option>
                <option value="IN_PROGRESS">Sedang Berjalan (In Progress)</option>
              </select>
            </div>

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
                disabled={isSubmitting || !description.trim()}
                icon={Send}
              >
                {isSubmitting ? 'Menyimpan...' : 'Kirim Laporan'}
              </SkeuomorphicButton>
            </div>
          </form>
        </SurfaceCard>
      </main>

      {/* Confirmation Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 text-center space-y-4 shadow-soft-xl border border-slate-200">
            <div className="w-16 h-16 rounded-full bg-indigo-500 text-white flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Laporan Tersimpan!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Aktivitas staf operasional berhasil dicatat dan masuk ke rekapitulasi harian.
              </p>
            </div>

            <SkeuomorphicButton
              variant="primary"
              className="w-full"
              onClick={() => {
                setShowSuccessModal(false);
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
