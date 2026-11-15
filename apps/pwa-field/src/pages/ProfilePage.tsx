import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  KeyRound, 
  CheckCircle2, 
  Send, 
  LogOut,
  ShieldCheck,
  Building
} from 'lucide-react';
import { authApi } from '../services/api';
import { SurfaceCard } from '../components/ui/SurfaceCard';
import { SkeuomorphicButton } from '../components/ui/SkeuomorphicButton';
import { StatusBadge } from '../components/ui/StatusBadge';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('muhamad.naufal');
  const [passwordBaru, setPasswordBaru] = useState('');
  const [kfPasswordBaru, setKfPasswordBaru] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
      setShowSuccessModal(true);
    } catch (err: any) {
      alert('Gagal memperbarui profil: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
      localStorage.removeItem('patrol_auth_token');
      navigate('/login.php');
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
          Profil & Pengaturan Akun
        </span>
        <div className="w-8" />
      </header>

      {/* Main Content Area */}
      <main className="px-4 pt-4 max-w-md mx-auto w-full flex-1 space-y-4">
        {/* User Card */}
        <SurfaceCard className="p-5 flex flex-col items-center text-center space-y-3">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-white shadow-soft-md overflow-hidden bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white">
              <User className="w-10 h-10" />
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Muhamad Naufal
            </h2>
            <p className="text-xs text-slate-500">
              Administrator • Divisi Security & Operasional
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <StatusBadge variant="info">Site Kantor Pusat</StatusBadge>
            <StatusBadge variant="success">Akun Aktif</StatusBadge>
          </div>
        </SurfaceCard>

        {/* Change Password Form */}
        <SurfaceCard className="p-5 space-y-4">
          <div className="flex items-center space-x-3 pb-2 border-b border-slate-200/80">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">
                Ubah Kata Sandi
              </h3>
              <p className="text-[11px] text-slate-500">
                Perbarui kredensial login akun Anda
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Username</label>
              <input
                type="text"
                disabled
                value={username}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-600 font-semibold cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Password Baru</label>
              <input
                type="password"
                value={passwordBaru}
                onChange={(e) => setPasswordBaru(e.target.value)}
                placeholder="Masukkan kata sandi baru"
                className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:bg-white focus:border-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Konfirmasi Password Baru</label>
              <input
                type="password"
                value={kfPasswordBaru}
                onChange={(e) => setKfPasswordBaru(e.target.value)}
                placeholder="Ulangi kata sandi baru"
                className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:bg-white focus:border-sky-500"
              />
            </div>

            <SkeuomorphicButton
              type="submit"
              variant="primary"
              disabled={isSubmitting || !passwordBaru}
              className="w-full"
              icon={Send}
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Kata Sandi'}
            </SkeuomorphicButton>
          </form>
        </SurfaceCard>

        {/* Logout Card */}
        <SurfaceCard className="p-4">
          <SkeuomorphicButton
            variant="danger"
            className="w-full"
            onClick={handleLogout}
            icon={LogOut}
          >
            Keluar dari Sistem (Logout)
          </SkeuomorphicButton>
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
                Kata Sandi Diperbarui!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Kredensial keamanan akun Anda telah berhasil diubah.
              </p>
            </div>

            <SkeuomorphicButton
              variant="primary"
              className="w-full"
              onClick={() => {
                setShowSuccessModal(false);
                setPasswordBaru('');
                setKfPasswordBaru('');
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
