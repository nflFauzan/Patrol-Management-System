'use client';
import React, { useState } from 'react';
import { useNavigate } from '../utils/navigation';
import { authApi } from '../services/api';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('hendra.chief');
  const [passwordBaru, setPasswordBaru] = useState('');
  const [kfPasswordBaru, setKfPasswordBaru] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordBaru && passwordBaru !== kfPasswordBaru) {
      alert('Password baru dan konfirmasi tidak cocok!');
      return;
    }
    setIsSubmitting(true);
    try {
      if (passwordBaru) {
        await authApi.updatePassword('1447', passwordBaru);
      }
      alert('Profil & Kata Sandi berhasil diperbarui!');
      navigate('/validasi-patroli/');
    } catch (err: any) {
      alert('Gagal memperbarui profil: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fa] font-sans pb-10">
      {/* Alert Top matching patroli.site xxxxx_xxxxxxxx.php */}
      <div className="bg-[#17a2b8] text-white text-center py-2.5 font-bold text-sm shadow-sm tracking-wide">
        PROFILE
      </div>

      <div className="p-4 max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow p-5 border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                maxLength={15}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none"
              />
            </div>

            {/* Password Baru */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password Baru</label>
              <input
                type="text"
                value={passwordBaru}
                onChange={(e) => setPasswordBaru(e.target.value)}
                placeholder="Input password baru"
                maxLength={15}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Konfirmasi Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Konfirmasi Password</label>
              <input
                type="text"
                value={kfPasswordBaru}
                onChange={(e) => setKfPasswordBaru(e.target.value)}
                placeholder="Input konfirmasi password baru"
                maxLength={15}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Foto Profile Info */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-1">Foto Sekarang</label>
              <div className="w-24 h-24 rounded-full border-2 border-slate-200 overflow-hidden mx-auto bg-slate-100 flex items-center justify-center">
                <span className="text-3xl">ðŸ‘¤</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-3">
              <button
                type="button"
                onClick={() => navigate('/validasi-patroli/')}
                className="w-1/2 py-2.5 bg-[#6c757d] hover:bg-slate-600 text-white rounded-lg text-sm font-semibold transition"
              >
                Kembali
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-1/2 py-2.5 bg-[#007bff] hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


