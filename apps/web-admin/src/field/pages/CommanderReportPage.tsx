'use client';
import React, { useState } from 'react';
import { useNavigate } from '../utils/navigation';
import axios from 'axios';

export const CommanderReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [shift, setShift] = useState('Pagi');
  const [kehadiran, setKehadiran] = useState('Lengkap');
  const [jumlahHadir, setJumlahHadir] = useState('10');
  const [jumlahIzin, setJumlahIzin] = useState('0');
  const [kesimpulan, setKesimpulan] = useState('A'); // A: Aman, L: Ada catatan
  const [catatan, setCatatan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      alert('Laporan Komandan berhasil disimpan!');
      navigate('/validasi-patroli/');
    } catch (err: any) {
      alert('Gagal menyimpan laporan komandan: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fa] font-sans p-4 pb-12 select-none">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow p-5 border border-slate-200">
        <div className="text-center mb-4">
          <h2 className="text-base font-bold text-blue-600 tracking-wide">FORM LAPORAN KOMANDAN</h2>
          <p className="text-xs text-slate-500">Laporan harian komandan per shift</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Shift</label>
            <select
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none"
            >
              <option value="Pagi">Pagi</option>
              <option value="Siang">Siang</option>
              <option value="Malam">Malam</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Kehadiran Anggota</label>
            <select
              value={kehadiran}
              onChange={(e) => setKehadiran(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none"
            >
              <option value="Lengkap">Lengkap</option>
              <option value="Tidak Lengkap">Tidak Lengkap</option>
            </select>
          </div>

          {kehadiran === 'Tidak Lengkap' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Jumlah Hadir</label>
                <input
                  type="number"
                  value={jumlahHadir}
                  onChange={(e) => setJumlahHadir(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Jumlah Izin/Cuti</label>
                <input
                  type="number"
                  value={jumlahIzin}
                  onChange={(e) => setJumlahIzin(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Kesimpulan Komandan</label>
            <select
              value={kesimpulan}
              onChange={(e) => setKesimpulan(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none"
            >
              <option value="A">Situasi aman terkendali</option>
              <option value="L">Ada catatan</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Catatan</label>
            <textarea
              rows={3}
              maxLength={100}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Tulis catatan singkat..."
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:outline-none"
            />
            <div className="text-right text-[10px] text-slate-400 mt-0.5">
              {catatan.length}/100 karakter
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => navigate('/validasi-patroli/')}
              className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs border border-slate-300"
            >
              Kembali
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-md transition disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Laporan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


