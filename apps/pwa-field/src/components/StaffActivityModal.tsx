import React, { useState } from 'react';
import { X, CheckCircle2, Sparkles } from 'lucide-react';

interface StaffActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    jenisKegiatan: string;
    detailLainnya?: string;
    deskripsi: string;
    status: string;
  }) => void;
}

export const StaffActivityModal: React.FC<StaffActivityModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [jenisKegiatan, setJenisKegiatan] = useState<string>('');
  const [detailLainnya, setDetailLainnya] = useState<string>('');
  const [deskripsi, setDeskripsi] = useState<string>('');
  const [status, setStatus] = useState<string>('Selesai');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jenisKegiatan || !deskripsi) {
      alert('Mohon pilih jenis kegiatan dan isi deskripsi aktivitas.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit({
        jenisKegiatan,
        detailLainnya: jenisKegiatan === 'Lainnya' ? detailLainnya : undefined,
        deskripsi,
        status,
      });
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="text-base font-bold tracking-tight">FORM KEGIATAN STAFF</h3>
              <p className="text-xs text-blue-100 mt-0.5">Input aktivitas kerja harian staff & cleaning</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-blue-100 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3.5 text-xs">
          {/* Jenis Kegiatan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Kegiatan</label>
            <select
              value={jenisKegiatan}
              onChange={(e) => setJenisKegiatan(e.target.value)}
              required
              className="w-full border border-blue-400 rounded-lg p-2.5 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">-- Pilih Kegiatan --</option>
              <option value="Administrasi">Administrasi</option>
              <option value="Monitoring">Monitoring</option>
              <option value="Koordinasi">Koordinasi</option>
              <option value="Meeting">Meeting</option>
              <option value="Pengecekan">Pengecekan</option>
              <option value="Follow Up">Follow Up</option>
              <option value="Laporan">Laporan</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          {/* Detail Lainnya if Lainnya */}
          {jenisKegiatan === 'Lainnya' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Detail Kegiatan Lainnya</label>
              <input
                type="text"
                value={detailLainnya}
                onChange={(e) => setDetailLainnya(e.target.value)}
                placeholder="Tuliskan jenis kegiatan..."
                className="w-full border border-blue-400 rounded-lg p-2.5 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          )}

          {/* Deskripsi */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700">Deskripsi Aktivitas</label>
              <span className="text-[11px] text-slate-500">Sisa {150 - deskripsi.length} karakter</span>
            </div>
            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value.slice(0, 150))}
              maxLength={150}
              rows={3}
              placeholder="Jelaskan ringkasan pekerjaan yang dilakukan..."
              required
              className="w-full border border-blue-400 rounded-lg p-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Status Kegiatan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Status Kegiatan</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-blue-400 rounded-lg p-2.5 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Selesai">Selesai</option>
              <option value="Tertunda">Tertunda</option>
              <option value="Dibatalkan">Dibatalkan</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold"
            >
              Kembali
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Kegiatan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

