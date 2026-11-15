import React, { useState } from 'react';
import { useNavigate } from '../utils/navigation';
import axios from 'axios';
import { 
  ArrowLeft, 
  Users, 
  CheckCircle2, 
  Send 
} from 'lucide-react';
import { SurfaceCard } from '../components/ui/SurfaceCard';
import { SkeuomorphicButton } from '../components/ui/SkeuomorphicButton';

export const CommanderReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [shift, setShift] = useState('Pagi');
  const [kehadiran, setKehadiran] = useState('Lengkap');
  const [jumlahHadir, setJumlahHadir] = useState('10');
  const [jumlahIzin, setJumlahIzin] = useState('0');
  const [kesimpulan, setKesimpulan] = useState('A');
  const [catatan, setCatatan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post('/insert_komandan.php', {
        shift,
        kehadiran,
        jumlah_hadir: jumlahHadir,
        jumlah_izin: jumlahIzin,
        kesimpulan,
        catatan,
      });
      setShowSuccessModal(true);
    } catch (err: any) {
      alert('Gagal menyimpan laporan komandan: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E5E9EE] flex flex-col font-sans select-none pb-8 text-slate-800">
      <header className="sticky top-0 z-30 bg-[#E5E9EE]/90 backdrop-blur-md px-4 py-3 border-b border-slate-300/60 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/validasi-patroli/')}
          className="p-1.5 rounded-xl bg-white border border-slate-300 shadow-skeuo-button-secondary text-slate-700 active:scale-95 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="font-extrabold text-sm text-slate-800 tracking-tight">
          Laporan Komandan Regu (Danru)
        </span>
        <div className="w-8" />
      </header>

      <main className="px-4 pt-4 max-w-md mx-auto w-full flex-1">
        <SurfaceCard className="p-5 space-y-4">
          <div className="flex items-center space-x-3 pb-2 border-b border-slate-200/80">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 tracking-tight">
                Serah Terima & Apel Regu
              </h2>
              <p className="text-[11px] text-slate-500">
                Laporan pergantian shift dan absensi apel pasukan security
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Shift Penugasan</label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:bg-white focus:border-sky-500"
              >
                <option value="Pagi">Shift Pagi (07:00 - 15:00 WIB)</option>
                <option value="Siang">Shift Siang (15:00 - 23:00 WIB)</option>
                <option value="Malam">Shift Malam (23:00 - 07:00 WIB)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Kehadiran Anggota Regu</label>
              <select
                value={kehadiran}
                onChange={(e) => setKehadiran(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:bg-white focus:border-sky-500"
              >
                <option value="Lengkap">Lengkap (Semua Pos Terisi)</option>
                <option value="Tidak Lengkap">Tidak Lengkap (Ada Anggota Izin / Absen)</option>
              </select>
            </div>

            {kehadiran === 'Tidak Lengkap' && (
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Jumlah Hadir</label>
                  <input
                    type="number"
                    value={jumlahHadir}
                    onChange={(e) => setJumlahHadir(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Jumlah Izin/Sakit</label>
                  <input
                    type="number"
                    value={jumlahIzin}
                    onChange={(e) => setJumlahIzin(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Kesimpulan Situasi Shift</label>
              <select
                value={kesimpulan}
                onChange={(e) => setKesimpulan(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:bg-white focus:border-sky-500"
              >
                <option value="A">Situasi Aman Terkendali</option>
                <option value="L">Ada Catatan Insiden Khusus</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Catatan Serah Terima</label>
              <textarea
                rows={3}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Rincian serah terima inventaris, radio HT, kunci gembok..."
                className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:bg-white focus:border-sky-500 leading-relaxed"
              />
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
                {isSubmitting ? 'Menyimpan...' : 'Kirim Laporan'}
              </SkeuomorphicButton>
            </div>
          </form>
        </SurfaceCard>
      </main>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 text-center space-y-4 shadow-soft-xl border border-slate-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Laporan Danru Tersimpan!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Data serah terima dan apel regu telah dicatat di log sistem.
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
