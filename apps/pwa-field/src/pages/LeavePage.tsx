import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle2, 
  Send, 
  FileText
} from 'lucide-react';
import { attendanceApi } from '../services/api';
import { AttendanceStatus } from '@patrol/types';
import { SurfaceCard } from '../components/ui/SurfaceCard';
import { SkeuomorphicButton } from '../components/ui/SkeuomorphicButton';

export const LeavePage: React.FC = () => {
  const navigate = useNavigate();
  const [alasan, setAlasan] = useState('Sakit');
  const [keterangan, setKeterangan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await attendanceApi.requestLeave({
        siteId: '11111111-1111-1111-1111-111111111111',
        status: alasan === 'Sakit' ? AttendanceStatus.SICK : AttendanceStatus.PERMISSION,
        date: new Date().toISOString().split('T')[0],
        leaveReason: `${alasan}${keterangan ? ' - ' + keterangan : ''}`,
      });
      setShowSuccessModal(true);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Gagal mengajukan permohonan izin');
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
          Pengajuan Izin / Cuti
        </span>
        <div className="w-8" />
      </header>

      {/* Main Content Area */}
      <main className="px-4 pt-4 max-w-md mx-auto w-full flex-1">
        <SurfaceCard className="p-5 space-y-4">
          <div className="flex items-center space-x-3 pb-2 border-b border-slate-200/80">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 tracking-tight">
                Formulir Izin Ketidakhadiran
              </h2>
              <p className="text-[11px] text-slate-500">
                Kirimkan permohonan dispensasi resmi kepada supervisor dan HRD
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Jenis Alasan Izin
              </label>
              <select
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
                required
                className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:bg-white focus:border-sky-500"
              >
                <option value="Sakit">Sakit (Dengan / Tanpa Surat Dokter)</option>
                <option value="Keperluan Keluarga">Keperluan Mendesak Keluarga</option>
                <option value="Keperluan Pribadi">Keperluan Pribadi / Dispensasi</option>
                <option value="Cuti Tahunan">Hak Cuti Tahunan</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Keterangan Detail (Maks. 100 Karakter)
              </label>
              <textarea
                rows={3}
                maxLength={100}
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                required
                placeholder="Tuliskan keterangan detail atau diagnosis singkat..."
                className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:bg-white focus:border-sky-500 leading-relaxed"
              />
              <div className="text-right text-[10px] text-slate-400">
                {keterangan.length}/100 karakter
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-3">
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
                disabled={isSubmitting}
                icon={Send}
              >
                {isSubmitting ? 'Mengirim...' : 'Kirim Izin'}
              </SkeuomorphicButton>
            </div>
          </form>
        </SurfaceCard>
      </main>

      {/* Confirmation Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 text-center space-y-4 shadow-soft-xl border border-slate-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Pengajuan Terkirim!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Permohonan izin Anda telah diterima dan diteruskan ke supervisor & rekap HRD.
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
