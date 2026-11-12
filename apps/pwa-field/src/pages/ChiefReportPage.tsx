import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const ChiefReportPage: React.FC = () => {
  const navigate = useNavigate();

  // 17 Danru options matching patroli.site xxxxx_xxxxxxxxxxxxx.php
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
      alert('Laporan Chief berhasil disimpan!');
      navigate('/validasi-patroli/');
    } catch (err: any) {
      alert('Gagal menyimpan laporan chief: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fa] font-sans p-4 pb-12 select-none">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow p-5 border border-slate-200">
        <div className="text-center mb-4">
          <h2 className="text-base font-bold text-blue-600 tracking-wide">FORM LAPORAN CHIEF</h2>
          <p className="text-xs text-slate-500">Penilaian dan evaluasi harian Komandan Regu</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Komandan Regu</label>
            <select
              value={selectedDanru}
              onChange={(e) => setSelectedDanru(e.target.value)}
              required
              className="w-full p-2.5 border border-cyan-500 rounded-lg text-xs bg-white focus:outline-none"
            >
              {COMMANDERS.map((cmd) => (
                <option key={cmd.id} value={cmd.id}>
                  {cmd.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Disiplin Komandan</label>
              <select
                value={disiplin}
                onChange={(e) => setDisiplin(e.target.value)}
                className="w-full p-2.5 border border-cyan-500 rounded-lg text-xs bg-white focus:outline-none"
              >
                <option value="Baik">Baik</option>
                <option value="Cukup">Cukup</option>
                <option value="Kurang">Kurang</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Koordinasi & Komunikasi</label>
              <select
                value={koordinasi}
                onChange={(e) => setKoordinasi(e.target.value)}
                className="w-full p-2.5 border border-cyan-500 rounded-lg text-xs bg-white focus:outline-none"
              >
                <option value="Baik">Baik</option>
                <option value="Cukup">Cukup</option>
                <option value="Kurang">Kurang</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Kehadiran Regu</label>
            <select
              value={kehadiranRegu}
              onChange={(e) => setKehadiranRegu(e.target.value)}
              className="w-full p-2.5 border border-cyan-500 rounded-lg text-xs bg-white focus:outline-none"
            >
              <option value="Lengkap">Lengkap</option>
              <option value="Tidak Lengkap">Tidak Lengkap</option>
            </select>
          </div>

          {kehadiranRegu === 'Tidak Lengkap' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Regu Hadir</label>
                <input
                  type="number"
                  value={reguHadir}
                  onChange={(e) => setReguHadir(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Regu Izin/Cuti</label>
                <input
                  type="number"
                  value={reguIzin}
                  onChange={(e) => setReguIzin(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Insiden</label>
            <select
              value={insiden}
              onChange={(e) => setInsiden(e.target.value)}
              className="w-full p-2.5 border border-cyan-500 rounded-lg text-xs bg-white focus:outline-none"
            >
              <option value="Tidak Ada">Tidak Ada</option>
              <option value="Ada">Ada</option>
            </select>
          </div>

          {insiden === 'Ada' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Detail Insiden</label>
              <textarea
                rows={2}
                maxLength={100}
                value={detailInsiden}
                onChange={(e) => setDetailInsiden(e.target.value)}
                placeholder="Rincian insiden yang terjadi..."
                className="w-full p-2 border border-red-300 rounded-lg text-xs focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Chief</label>
            <textarea
              rows={3}
              maxLength={100}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Catatan untuk komandan..."
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

