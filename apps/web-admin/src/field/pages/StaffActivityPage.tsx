'use client';
import React, { useState } from 'react';
import { useNavigate } from '../utils/navigation';
import axios from 'axios';

export const StaffActivityPage: React.FC = () => {
  const navigate = useNavigate();
  const [jenisKegiatan, setJenisKegiatan] = useState('Pengecekan');
  const [detailLainnya, setDetailLainnya] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [status, setStatus] = useState('selesai');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post('/insert_staf.php', {
        jenis_kegiatan: jenisKegiatan,
        detail_lainnya: detailLainnya,
        deskripsi,
        status,
      });
      alert('Kegiatan staff berhasil disimpan!');
      navigate('/validasi-patroli/');
    } catch (err: any) {
      alert('Gagal menyimpan kegiatan staff: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fa] font-sans p-4 pb-12 select-none">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow p-5 border border-slate-200">
        <div className="text-center mb-4">
          <h2 className="text-base font-bold text-blue-600 tracking-wide">FORM KEGIATAN STAFF</h2>
          <p className="text-xs text-slate-500">Input aktivitas kerja harian staff</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Kegiatan</label>
            <select
              value={jenisKegiatan}
              onChange={(e) => setJenisKegiatan(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none"
            >
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

          {jenisKegiatan === 'Lainnya' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Detail Kegiatan Lainnya</label>
              <input
                type="text"
                value={detailLainnya}
                onChange={(e) => setDetailLainnya(e.target.value)}
                placeholder="Tulis kegiatan..."
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi</label>
            <textarea
              rows={4}
              maxLength={150}
              required
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Jelaskan rincian aktivitas yang dikerjakan..."
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:outline-none"
            />
            <div className="text-right text-[10px] text-slate-400 mt-0.5">
              Sisa {150 - deskripsi.length} karakter
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Status Kegiatan</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none"
            >
              <option value="selesai">Selesai</option>
              <option value="tertunda">Tertunda</option>
              <option value="dibatalkan">Dibatalkan</option>
            </select>
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
              {isSubmitting ? 'Menyimpan...' : 'Simpan Kegiatan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


