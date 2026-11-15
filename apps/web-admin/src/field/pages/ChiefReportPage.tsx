import React, { useState } from 'react';
import { useNavigate } from '../utils/navigation';
import axios from 'axios';
import { 
  ArrowLeft, 
  Award, 
  CheckCircle2, 
  Send 
} from 'lucide-react';
import { SurfaceCard } from '../components/ui/SurfaceCard';
import { SkeuomorphicButton } from '../components/ui/SkeuomorphicButton';

export const ChiefReportPage: React.FC = () => {
  const navigate = useNavigate();

  const COMMANDERS = [
    { id: '1436', name: 'Budi Santoso (Danru A)' },
    { id: '1430', name: 'Dandan Komandan (Danru B)' },
    { id: '1100', name: 'Singgih Prasiwijaya (Danru C)' },
    { id: '1094', name: 'Arif Munandar (Danru D)' },
    { id: '1356', name: 'Ahmad Lewa (Danru E)' },
  ];

  const [selectedDanru, setSelectedDanru] = useState('1436');
  const [disiplin, setDisiplin] = useState('Baik');
  const [koordinasi, setKoordinasi] = useState('Baik');
  const [kehadiranRegu, setKehadiranRegu] = useState('Lengkap');
  const [reguHadir, setReguHadir] = useState('12');
  const [reguIzin, setReguIzin] = useState('0');
  const [insiden, setInsiden] = useState('Tidak Ada');
  const [detailInsiden, setDetailInsiden] = useState('');
  const [catatan, setCatatan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post('/insert_chief.php', {
        kode_anggota: selectedDanru,
        disiplin,
        koordinasi,
        kehadiran_regu: kehadiranRegu,
        regu_hadir: reguHadir,
        regu_izin: reguIzin,
        insiden,
        detail_insiden: detailInsiden,
        catatan,
      });
      setShowSuccessModal(true);
    } catch (err: any) {
      alert('Gagal menyimpan laporan chief: ' + (err.response?.data?.message || err.message));
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
          Supervisi Chief Security
        </span>
        <div className="w-8" />
      </header>

      <main className="px-4 pt-4 max-w-md mx-auto w-full flex-1">
        <SurfaceCard className="p-5 space-y-4">
          <div className="flex items-center space-x-3 pb-2 border-b border-slate-200/80">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 tracking-tight">
                Evaluasi Kinerja Danru
              </h2>
              <p className="text-[11px] text-slate-500">
                Audit kedisiplinan dan kepatuhan standar operasional regu
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Komandan Regu yang Dinilai</label>
              <select
                value={selectedDanru}
                onChange={(e) => setSelectedDanru(e.target.value)}
                required
                className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:bg-white focus:border-sky-500"
              >
                {COMMANDERS.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Kedisiplinan</label>
                <select
                  value={disiplin}
                  onChange={(e) => setDisiplin(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:bg-white focus:border-sky-500"
                >
                  <option value="Sangat Baik">Sangat Baik</option>
                  <option value="Baik">Baik</option>
                  <option value="Cukup">Cukup</option>
                  <option value="Kurang">Kurang</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Koordinasi</label>
                <select
                  value={koordinasi}
                  onChange={(e) => setKoordinasi(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:bg-white focus:border-sky-500"
                >
                  <option value="Sangat Baik">Sangat Baik</option>
                  <option value="Baik">Baik</option>
                  <option value="Cukup">Cukup</option>
                  <option value="Kurang">Kurang</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Status Insiden Keamanan</label>
              <select
                value={insiden}
                onChange={(e) => setInsiden(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:bg-white focus:border-sky-500"
              >
                <option value="Tidak Ada">Tidak Ada Insiden (Aman)</option>
                <option value="Ada">Ada Insiden Keamanan</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Catatan Supervisi Chief</label>
              <textarea
                rows={3}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Arahan khusus, evaluasi ketertiban pos, atau tindak lanjut..."
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
                {isSubmitting ? 'Menyimpan...' : 'Kirim Supervisi'}
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
                Supervisi Chief Tersimpan!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Data penilaian kinerja dan evaluasi harian Danru telah diverifikasi.
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
