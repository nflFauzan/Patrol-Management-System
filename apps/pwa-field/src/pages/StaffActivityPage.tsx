import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  Send, 
  ClipboardList,
  Building
} from 'lucide-react';
import { SurfaceCard } from '../components/ui/SurfaceCard';
import { SkeuomorphicButton } from '../components/ui/SkeuomorphicButton';
import { StatusBadge } from '../components/ui/StatusBadge';

export const StaffActivityPage: React.FC = () => {
  const navigate = useNavigate();
  const [jenisKegiatan, setJenisKegiatan] = useState('Pembersihan & Sanitasi');
  const [zonaArea, setZonaArea] = useState('Lobi Utama & Resepsionis');
  const [detailLainnya, setDetailLainnya] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [status, setStatus] = useState('selesai');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post('/insert_staf.php', {
        jenis_kegiatan: jenisKegiatan,
        zona_area: zonaArea,
        detail_lainnya: detailLainnya,
        deskripsi,
        status,
      });
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
          Form Kegiatan Cleaning & Fasilitas
        </span>
        <div className="w-8" />
      </header>

      {/* Main Content Area */}
      <main className="px-4 pt-4 max-w-md mx-auto w-full flex-1">
        <SurfaceCard className="p-5 space-y-4">
          <div className="flex items-center space-x-3 pb-2 border-b border-slate-200/80">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 tracking-tight">
                Checklist Kebersihan & Fasilitas
              </h2>
              <p className="text-[11px] text-slate-500">
                Pencatatan sanitasi zona lantai dan fasilitas operasional
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Jenis Kegiatan / Tugas
              </label>
              <select
                value={jenisKegiatan}
                onChange={(e) => setJenisKegiatan(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:bg-white focus:border-sky-500"
              >
                <option value="Pembersihan & Sanitasi">Pembersihan & Sanitasi</option>
                <option value="Pengepelan Lantai">Pengepelan & Disinfeksi Lantai</option>
                <option value="Sanitasi Toilet & Wastafel">Sanitasi Toilet & Wastafel</option>
                <option value="Pengosongan Tempat Sampah">Pengosongan Tempat Sampah</option>
                <option value="Pembersihan Kaca & Jendela">Pembersihan Kaca & Jendela</option>
                <option value="Restock Perlengkapan">Restock Sabun & Tissue</option>
                <option value="Lainnya">Kegiatan Lainnya</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Zona / Lokasi Pembersihan
              </label>
              <select
                value={zonaArea}
                onChange={(e) => setZonaArea(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:bg-white focus:border-sky-500"
              >
                <option value="Lobi Utama & Resepsionis">Lobi Utama & Resepsionis</option>
                <option value="Koridor Lantai 1">Koridor Lantai 1</option>
                <option value="Koridor Lantai 2">Koridor Lantai 2</option>
                <option value="Toilet Karyawan Lantai 1">Toilet Karyawan Lantai 1</option>
                <option value="Toilet Eksekutif Lantai 2">Toilet Eksekutif Lantai 2</option>
                <option value="Ruang Rapat & Meeting">Ruang Rapat & Meeting</option>
                <option value="Area Parkir & Teras Depan">Area Parkir & Teras Depan</option>
              </select>
            </div>

            {jenisKegiatan === 'Lainnya' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Rincian Kegiatan Khusus
                </label>
                <input
                  type="text"
                  value={detailLainnya}
                  onChange={(e) => setDetailLainnya(e.target.value)}
                  placeholder="Tuliskan rincian kegiatan..."
                  className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:bg-white focus:border-sky-500"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Catatan Temuan / Kondisi Area
              </label>
              <textarea
                rows={3}
                maxLength={150}
                required
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Jelaskan kondisi kebersihan dan tindakan sanitasi..."
                className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:bg-white focus:border-sky-500 leading-relaxed"
              />
              <div className="text-right text-[10px] text-slate-400">
                Sisa {150 - deskripsi.length} karakter
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Status Penyelesaian
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:bg-white focus:border-sky-500"
              >
                <option value="selesai">Selesai Bersih</option>
                <option value="tertunda">Perlu Tindak Lanjut</option>
                <option value="dibatalkan">Dibatalkan</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-3">
              <SkeuomorphicButton
                type="button"
                variant="secondary"
                onClick={() => navigate('/validasi-patroli/')}
              >
                Kembali
              </SkeuomorphicButton>
              <SkeuomorphicButton
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                icon={Send}
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Tugas'}
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
                Laporan Sanitasi Tersimpan!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Data checklist kegiatan kebersihan telah berhasil dikirimkan ke server.
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
