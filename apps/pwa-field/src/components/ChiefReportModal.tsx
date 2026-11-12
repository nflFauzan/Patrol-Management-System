import React, { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';

interface ChiefReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    kodeAnggota: string;
    namaKomandan: string;
    disiplin: string;
    koordinasi: string;
    kehadiranRegu: string;
    reguHadir?: number;
    reguIzin?: number;
    insiden: string;
    detailInsiden?: string;
    catatan?: string;
  }) => void;
}

const COMMANDERS = [
  { id: '995', name: 'A1' },
  { id: '1356', name: 'ahmad lewa' },
  { id: '1094', name: 'ARIF MUNANDAR' },
  { id: '1436', name: 'budi santoso' },
  { id: '1430', name: 'DANDAN KOMANDAN' },
  { id: '1394', name: 'danrugiga' },
  { id: '1355', name: 'dedy yunus' },
  { id: '1010', name: 'dwi wahyono' },
  { id: '1111', name: 'eko purwanto' },
  { id: '1218', name: 'RIKO RIZKI MASRI' },
  { id: '1114', name: 'saepudin' },
  { id: '1100', name: 'SINGGIH PRASIWIJAYA' },
  { id: '1118', name: 'superiyanto' },
  { id: '1087', name: 'SUSILO ADI SAPUTRO' },
  { id: '1298', name: 'wahyudin' },
  { id: '1104', name: 'WAWAN BAGUS SAPUTRA' },
  { id: '1112', name: 'yudhi wibowo' },
];

export const ChiefReportModal: React.FC<ChiefReportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [kodeAnggota, setKodeAnggota] = useState<string>('');
  const [disiplin, setDisiplin] = useState<string>('Baik');
  const [koordinasi, setKoordinasi] = useState<string>('Baik');
  const [kehadiranRegu, setKehadiranRegu] = useState<string>('Lengkap');
  const [reguHadir, setReguHadir] = useState<number | ''>('');
  const [reguIzin, setReguIzin] = useState<number | ''>('');
  const [insiden, setInsiden] = useState<string>('Tidak Ada');
  const [detailInsiden, setDetailInsiden] = useState<string>('');
  const [catatan, setCatatan] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kodeAnggota) {
      alert('Pilih Komandan Regu yang dinilai!');
      return;
    }

    const commander = COMMANDERS.find((c) => c.id === kodeAnggota);
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit({
        kodeAnggota,
        namaKomandan: commander?.name || kodeAnggota,
        disiplin,
        koordinasi,
        kehadiranRegu,
        reguHadir: reguHadir !== '' ? Number(reguHadir) : undefined,
        reguIzin: reguIzin !== '' ? Number(reguIzin) : undefined,
        insiden,
        detailInsiden: insiden === 'Ada' ? detailInsiden : undefined,
        catatan,
      });
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white p-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold tracking-tight">FORM LAPORAN CHIEF</h3>
            <p className="text-xs text-blue-100 mt-0.5">Penilaian dan evaluasi harian Komandan Regu</p>
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
          {/* Pilihan Komandan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Komandan Regu</label>
            <select
              value={kodeAnggota}
              onChange={(e) => setKodeAnggota(e.target.value)}
              required
              className="w-full border border-blue-400 rounded-lg p-2.5 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">-- Pilih Komandan Regu --</option>
              {COMMANDERS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Disiplin Komandan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Disiplin Komandan</label>
            <select
              value={disiplin}
              onChange={(e) => setDisiplin(e.target.value)}
              required
              className="w-full border border-blue-400 rounded-lg p-2.5 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Baik">Baik</option>
              <option value="Cukup">Cukup</option>
              <option value="Kurang">Kurang</option>
            </select>
          </div>

          {/* Koordinasi & Komunikasi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Koordinasi & Komunikasi</label>
            <select
              value={koordinasi}
              onChange={(e) => setKoordinasi(e.target.value)}
              required
              className="w-full border border-blue-400 rounded-lg p-2.5 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Baik">Baik</option>
              <option value="Cukup">Cukup</option>
              <option value="Kurang">Kurang</option>
            </select>
          </div>

          {/* Kehadiran Regu */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kehadiran Regu (yang dipimpin komandan)
            </label>
            <select
              value={kehadiranRegu}
              onChange={(e) => setKehadiranRegu(e.target.value)}
              required
              className="w-full border border-blue-400 rounded-lg p-2.5 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Lengkap">Lengkap</option>
              <option value="Tidak Lengkap">Tidak Lengkap</option>
            </select>
          </div>

          {/* Detail if Tidak Lengkap */}
          {kehadiranRegu === 'Tidak Lengkap' && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 space-y-2">
              <label className="block text-xs font-bold text-blue-900">Detail Kehadiran Regu</label>
              <input
                type="number"
                min="0"
                value={reguHadir}
                onChange={(e) => setReguHadir(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Jumlah hadir"
                className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-800 bg-white"
              />
              <input
                type="number"
                min="0"
                value={reguIzin}
                onChange={(e) => setReguIzin(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Jumlah izin / cuti"
                className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-800 bg-white"
              />
            </div>
          )}

          {/* Temuan / Insiden */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Temuan / Insiden</label>
            <select
              value={insiden}
              onChange={(e) => setInsiden(e.target.value)}
              className="w-full border border-blue-400 rounded-lg p-2.5 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Tidak Ada">Tidak Ada</option>
              <option value="Ada">Ada</option>
            </select>
          </div>

          {/* Detail Insiden if Ada */}
          {insiden === 'Ada' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">Detail Singkat Temuan</label>
                <span className="text-[11px] text-slate-500">{detailInsiden.length}/100 karakter</span>
              </div>
              <textarea
                value={detailInsiden}
                onChange={(e) => setDetailInsiden(e.target.value.slice(0, 100))}
                maxLength={100}
                rows={2}
                placeholder="Jelaskan temuan atau insiden..."
                className="w-full border border-blue-400 rounded-lg p-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          )}

          {/* Catatan Singkat Chief */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700">Catatan Singkat Chief</label>
              <span className="text-[11px] text-slate-500">{catatan.length}/100 karakter</span>
            </div>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value.slice(0, 100))}
              maxLength={100}
              rows={2}
              placeholder="Catatan untuk komandan..."
              className="w-full border border-blue-400 rounded-lg p-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
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
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Laporan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

