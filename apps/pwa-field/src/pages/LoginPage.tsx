import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [hpInput, setHpInput] = useState(''); // Honeypot
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      // Honeypot check
      if (hpInput.trim() !== '') {
        throw new Error('Bot validation failed');
      }

      await authApi.login({
        username,
        password,
        hp_input: hpInput,
      });

      navigate('/validasi-patroli/');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Login gagal, periksa username dan password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fa] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-[360px] bg-white rounded-2xl shadow-xl p-6 text-center border border-slate-200">
        {/* LOGO */}
        <div className="mb-6 flex justify-center">
          <img src="/logo-ps.png" alt="PATROLI SITE" className="w-48 object-contain" />
        </div>

        {errorMessage && (
          <div className="mb-4 p-2.5 bg-red-100 border border-red-300 text-red-700 rounded-lg text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          {/* Honeypot field (hidden from humans) */}
          <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
            <input
              type="text"
              name="hp_input"
              value={hpInput}
              onChange={(e) => setHpInput(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                👤
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Username"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                🔒
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-10 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 text-sm mt-2"
          >
            {isLoading ? 'Memproses...' : 'Login'}
          </button>

          <button
            type="button"
            onClick={() => setIsRegisterModalOpen(true)}
            className="w-full py-2 bg-[#f39c12] hover:bg-[#e67e22] text-white font-bold rounded-xl shadow-md transition text-sm"
          >
            Buat Akun
          </button>
        </form>

        <div className="mt-5 text-xs text-blue-600">
          <a href="#" onClick={(e) => { e.preventDefault(); alert('Silakan hubungi administrator site / komandan untuk pemulihan akun.'); }}>
            Lupa username / password ?
          </a>
        </div>
      </div>

      {/* Floating WhatsApp helpdesk button */}
      <a
        href="https://wa.me/6281215293593"
        className="whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
        title="Hubungi Admin WhatsApp"
      >
        <img src="/admin.png" alt="Contact Center" />
      </a>

      {/* Modal Buat Akun */}
      {isRegisterModalOpen && (
        <div className="custom-modal show">
          <div className="custom-modal-box">
            <div className="custom-modal-header">
              Buat Akun Personil
              <span className="close-btn" onClick={() => setIsRegisterModalOpen(false)}>×</span>
            </div>
            <div className="custom-modal-body text-slate-700 text-xs leading-relaxed">
              <p className="mb-2">
                Pendaftaran akun personil dilakukan secara terpusat oleh Admin Site / Komandan Regu.
              </p>
              <div className="info-box">
                Silakan hubungi Administrator Korporat atau Supervisor Site untuk mendapatkan NIK & kredensial login Anda.
              </div>
            </div>
            <div className="custom-modal-footer">
              <button onClick={() => setIsRegisterModalOpen(false)}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

