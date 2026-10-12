import React, { useState } from 'react';
import { X, User, Lock, Camera, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { authApi } from '../services/api';
import { SelfieCameraModal } from './SelfieCameraModal';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    fullName: string;
    username: string;
    role: string;
    division: string;
    badgeNumber?: string;
    photoUrl?: string;
  };
  onSuccess: (message: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'PASSWORD' | 'PHOTO'>('PASSWORD');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword.length < 6) {
      setErrorMsg('Password baru minimal 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok.');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.updatePassword(user.id, newPassword);
      setNewPassword('');
      setConfirmPassword('');
      onSuccess('Password berhasil diperbarui!');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal mengubah password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoCaptured = async (base64Image: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await authApi.updatePhoto(user.id, base64Image);
      onSuccess('Foto profil berhasil diperbarui!');
      setIsCameraOpen(false);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal memperbarui foto profil.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl max-w-md w-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Update Profil Akun</h2>
              <p className="text-xs text-slate-400">Kelola kredensial dan foto petugas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 p-2 bg-slate-950/60 border-b border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('PASSWORD')}
            className={`py-2 rounded-lg transition flex items-center justify-center space-x-1.5 ${
              activeTab === 'PASSWORD'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Ganti Password</span>
          </button>
          <button
            onClick={() => setActiveTab('PHOTO')}
            className={`py-2 rounded-lg transition flex items-center justify-center space-x-1.5 ${
              activeTab === 'PHOTO'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Foto Profil Webcam</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-950/80 border border-rose-600/80 rounded-xl text-xs text-rose-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'PASSWORD' ? (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Username</label>
                <input
                  type="text"
                  value={user.username}
                  disabled
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-400 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Password Baru</label>
                <input
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  placeholder="Ulangi password baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl text-xs shadow-lg shadow-cyan-950/50 flex items-center justify-center space-x-2 active:scale-95 transition"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Simpan Password Baru</span>}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4 py-2">
              <div className="w-24 h-24 mx-auto rounded-full bg-slate-800 border-2 border-cyan-500/50 flex items-center justify-center overflow-hidden shadow-inner">
                {user.photoUrl ? (
                  <img src={user.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-slate-500" />
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-white">{user.fullName}</h4>
                <p className="text-xs text-slate-400">Ambil swafoto webcam langsung untuk kartu identitas resmi</p>
              </div>

              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl text-xs shadow-lg shadow-cyan-950/50 flex items-center justify-center space-x-2 active:scale-95 transition"
              >
                <Camera className="w-4 h-4" />
                <span>Buka Kamera Webcam</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium text-xs transition"
          >
            Tutup
          </button>
        </div>
      </div>

      <SelfieCameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handlePhotoCaptured}
        title="Ambil Foto Profil Webcam"
      />
    </div>
  );
};
