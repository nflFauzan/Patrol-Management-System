'use client';
import React, { useState } from 'react';
import { useNavigate } from '../utils/navigation';
import { attendanceApi } from '../services/api';
import { AttendanceStatus } from '@patrol/types';

export const LeavePage: React.FC = () => {
  const navigate = useNavigate();
  const [alasan, setAlasan] = useState('Sakit');
  const [keterangan, setKeterangan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      alert('Izin tidak masuk berhasil diajukan!');
      navigate('/validasi-patroli/');
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Gagal mengajukan izin');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans p-4 max-w-md mx-auto">
      {/* Header #8B0000 matching patroli.site xxxxx_xxxx.php */}
      <div
        style={{
          background: '#8B0000',
          color: '#fff',
          height: '35px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '15px',
          fontWeight: 'bold',
          fontSize: '14px',
          borderRadius: '4px',
        }}
      >
        IZIN TIDAK MASUK
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1">
            Alasan Izin:
          </label>
          <select
            value={alasan}
            onChange={(e) => setAlasan(e.target.value)}
            required
            className="w-full p-2.5 border border-slate-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-red-800"
          >
            <option value="Sakit">Sakit</option>
            <option value="Keperluan Keluarga">Keperluan Keluarga</option>
            <option value="Keperluan Pribadi">Keperluan Pribadi</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1">
            Keterangan:
          </label>
          <textarea
            rows={4}
            maxLength={50}
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            required
            placeholder="Berikan keterangan singkat lebih lanjut (opsional)"
            className="w-full p-2.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-red-800"
          />
          <div className="text-right text-[11px] text-slate-400 mt-0.5">
            {keterangan.length}/50 karakter
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 bg-[#007bff] hover:bg-blue-600 text-white rounded font-medium text-sm transition disabled:opacity-50"
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/validasi-patroli/')}
            className="px-5 py-2 bg-[#6c757d] hover:bg-slate-600 text-white rounded font-medium text-sm transition"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
};


