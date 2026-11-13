'use client';
import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, FileText } from 'lucide-react';

interface CommanderReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    shift: string;
    kehadiran: string;
    jumlahHadir?: number;
    jumlahIzin?: number;
    kesimpulan: string;
    catatan?: string;
  }) => void;
}

export const CommanderReportModal: React.FC<CommanderReportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [shift, setShift] = useState<string>('');
  const [kehadiran, setKehadiran] = useState<string>('');
  const [jumlahHadir, setJumlahHadir] = useState<number | ''>('');
  const [jumlahIzin, setJumlahIzin] = useState<number | ''>('');
  const [kesimpulan, setKesimpulan] = useState<string>('');
  const [catatan, setCatatan] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shift || !kehadiran || !kesimpulan) {
      alert('Mohon lengkapi shift, status kehadiran, dan kesimpulan komandan.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit({
        shift,
        kehadiran,
        jumlahHadir: jumlahHadir !== '' ? Number(jumlahHadir) : undefined,
        jumlahIzin: jumlahIzin !== '' ? Number(jumlahIzin) : undefined,
        kesimpulan,
        catatan,
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
          <div>
            <h3 className="text-base font-bold tracking-tight">FORM LAPORAN KOMANDAN</h3>
            <p className="text-xs text-blue-100 mt-0.5">Laporan harian komandan regu per shift</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-blue-100 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3.5 text-sm">
          {/* Shift */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Shift</label>
            <select
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              required
              className="w-full border border-blue-400 rounded-lg p-2.5 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">-- Pilih Shift --</option>
              <option value="Pagi">Pagi</option>
              <option value="Siang">Siang</option>
              <option value="Malam">Malam</option>
            </select>
          </div>

          {/* Kehadiran Anggota */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Kehadiran Anggota</label>
            <select
              value={kehadiran}
              onChange={(e) => setKehadiran(e.target.value)}
              required
              className="w-full border border-blue-400 rounded-lg p-2.5 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">-- Pilih Kehadiran --</option>
              <option value="Lengkap">Lengkap</option>
              <option value="Tidak Lengkap">Tidak Lengkap</option>
            </select>
          </div>

          {/* Detail Kehadiran if Tidak Lengkap */}
          {kehadiran === 'Tidak Lengkap' && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 space-y-2">
              <label className="block text-xs font-bold text-blue-900">Detail Kehadiran Regu</label>
              <input
                type="number"
                min="0"
                value={jumlahHadir}
                onChange={(e) => setJumlahHadir(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Jumlah hadir"
                className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-800 bg-white"
              />
              <input
                type="number"
                min="0"
                value={jumlahIzin}
                onChange={(e) => setJumlahIzin(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Jumlah izin / cuti"
                className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-800 bg-white"
              />
              <p className="text-[10px] text-slate-500">Isi sesuai kondisi kehadiran personil.</p>
            </div>
          )}

          {/* Kesimpulan Komandan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Kesimpulan Komandan</label>
            <select
              value={kesimpulan}
              onChange={(e) => setKesimpulan(e.target.value)}
              required
              className="w-full border border-blue-400 rounded-lg p-2.5 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">-- Pilih Kesimpulan --</option>
              <option value="A">Situasi aman terkendali</option>
              <option value="L">Ada catatan</option>
            </select>
          </div>

          {/* Catatan Khusus if 'L' */}
          {kesimpulan === 'L' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">Catatan Khusus</label>
                <span className="text-[11px] text-slate-500">Sisa {100 - catatan.length} karakter</span>
              </div>
              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value.slice(0, 100))}
                maxLength={100}
                rows={3}
                placeholder="Tulis catatan singkat..."
                className="w-full border border-blue-400 rounded-lg p-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          )}

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
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Laporan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


