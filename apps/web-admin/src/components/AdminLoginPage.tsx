'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Building2,
  AlertCircle,
  KeyRound,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '../lib/AuthContext';

export const AdminLoginPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';

  const { login } = useAuth();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [hpInput, setHpInput] = useState(''); // Honeypot anti-bot
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isDemoDrawerOpen, setIsDemoDrawerOpen] = useState(false);
  const [selectedDemoIndex, setSelectedDemoIndex] = useState<number>(0);

  const handleSelectDemo = (index: number) => {
    setSelectedDemoIndex(index);
    const acc = DEMO_ACCOUNTS[index];
    if (acc) {
      setUsername(acc.username);
      setPassword(acc.password);
      setErrorMessage(null);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const loggedUser = await login({
        username,
        password,
        hp_input: hpInput,
      });

      // Role-based smart redirection
      const role = loggedUser.role as string;
      const rank = loggedUser.securityRank as string | undefined;

      const isManagement =
        role === 'ADMIN_SUPER' ||
        role === 'SUPER_ADMIN' ||
        role === 'ADMIN' ||
        role === 'HRD' ||
        role === 'OPS_MANAGER' ||
        role === 'SITE_SUPERVISOR' ||
        rank === 'CHIEF';

      let dest = '/dashboard';
      if (isManagement) {
        dest = returnUrl && returnUrl !== '/login' && returnUrl !== '/' ? returnUrl : '/dashboard';
      } else {
        dest = returnUrl && returnUrl !== '/login' && returnUrl !== '/' ? returnUrl : '/validasi-patroli';
      }

      window.location.href = dest;
    } catch (err: any) {
      setErrorMessage(err.message || 'Login gagal, periksa kredensial Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const activeDemo = DEMO_ACCOUNTS[selectedDemoIndex] || DEMO_ACCOUNTS[0];

  return (
    <div className="min-h-screen w-full bg-[#08212b] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-teal-600 selection:text-white">
      {/* Background Decorative Radial Gradients (Dashboard Matching Theme) */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-100"
          style={{
            backgroundImage: `
              radial-gradient(100% 600px at 50% 0px, #0b2f3d 0%, #0d3847 38%, #08212b 75%, #05161d 100%),
              radial-gradient(circle 600px at 85% 80px, rgba(20, 184, 166, 0.18) 0%, transparent 70%),
              radial-gradient(circle 500px at 15% 140px, rgba(6, 182, 212, 0.16) 0%, transparent 70%)
            `,
            backgroundRepeat: 'no-repeat',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Top Header / Subtle Brand Bar */}
      <header className="relative z-10 w-full px-6 py-4 flex items-center justify-between border-b border-white/10 bg-slate-950/40 backdrop-blur-md">
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-slate-950 shadow-md shadow-teal-500/20 group-hover:scale-105 transition-all">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-xs tracking-wider text-white">
              MAHAKARYA ENTERPRISE
            </span>
            <span className="text-[10px] text-teal-200/70">In-House Single-Tenant</span>
          </div>
        </Link>

        <Link
          href="/"
          className="text-xs text-teal-100/80 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md transition shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Beranda</span>
        </Link>
      </header>

      {/* Main Container: Centered Clean Floating Card (Minibank-Style) */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-[430px] mx-auto">
          {/* Clean Centered White Card */}
          <div className="bg-white/95 text-slate-900 rounded-3xl p-7 sm:p-9 shadow-2xl border border-white/50 backdrop-blur-xl relative">
            
            {/* Top Navigation Row: Back Arrow Button & Corporate Tag */}
            <div className="flex items-center justify-between mb-5">
              <Link
                href="/"
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 flex items-center justify-center transition shadow-2xs group"
                title="Kembali ke Halaman Pilihan Portal"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              </Link>

              <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-700 bg-teal-50 border border-teal-200/60 px-2.5 py-1 rounded-full">
                Portal Masuk
              </span>
            </div>

            {/* Header: Welcome Back (Minibank Friendly Style) */}
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Welcome Back!
              </h2>
              <p className="text-xs text-slate-500 mt-1.5">
                Masuk ke Command Center Patrol & Facility
              </p>
            </div>

            {/* Error Alert Banner */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{errorMessage}</div>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="text-rose-500 hover:text-rose-700 text-xs font-bold"
                >
                  ×
                </button>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
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

              {/* Username Input (Clean rounded-2xl with light tint) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Username Akun
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 transition shadow-2xs"
                    placeholder="Masukkan username"
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password Input (Clean with eye toggle) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Kata Sandi
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsHelpModalOpen(true)}
                    className="text-[11px] text-teal-700 hover:text-teal-900 font-semibold transition"
                  >
                    Lupa password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 transition shadow-2xs"
                    placeholder="Masukkan password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 focus:outline-none"
                    title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Ingat sesi di perangkat ini</span>
                </label>
              </div>

              {/* Submit Button (Prominent Bold Minibank-Style Action) */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-teal-600/30 transition duration-150 disabled:opacity-50 flex items-center justify-center space-x-2 mt-4 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Memverifikasi Akun...</span>
                  </>
                ) : (
                  <>
                    <span>LOGIN</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Registration Link (Minibank format: "Create an Account? SIGN UP here") */}
            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Belum memiliki akun personil?{' '}
                <Link
                  href="/register"
                  className="font-extrabold text-teal-700 hover:text-teal-900 uppercase tracking-wide hover:underline"
                >
                  Daftar di sini
                </Link>
              </p>
            </div>

            {/* Collapsible Demo Accounts (Tuck away to keep interface completely clean!) */}
            <div className="mt-4 pt-2">
              <button
                type="button"
                onClick={() => setIsDemoDrawerOpen(!isDemoDrawerOpen)}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center justify-between transition border border-slate-200/80"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>Mode Uji Coba: Pilih Kredensial Demo</span>
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${isDemoDrawerOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isDemoDrawerOpen && (
                <div className="mt-2 p-2.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 animate-in fade-in duration-150">
                  <div className="grid grid-cols-3 gap-1.5">
                    {DEMO_ACCOUNTS.map((acc, idx) => (
                      <button
                        key={acc.username}
                        type="button"
                        onClick={() => handleSelectDemo(idx)}
                        className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition text-left truncate flex flex-col ${
                          selectedDemoIndex === idx
                            ? 'bg-teal-700 text-white shadow-xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                        title={`${acc.fullName} (${acc.username})`}
                      >
                        <span className="truncate">{acc.fullName.split(' ')[0]}</span>
                        <span className="text-[9px] opacity-75 truncate">{acc.username}</span>
                      </button>
                    ))}
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                    <span>Terpilih: <strong className="text-slate-800">{activeDemo.fullName}</strong></span>
                    <span className="text-teal-700 font-bold">{activeDemo.role}</span>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* Corporate Footer */}
      <footer className="relative z-10 w-full border-t border-white/10 bg-slate-950/40 backdrop-blur-md px-6 py-4 text-center text-xs text-teal-200/60">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 PT Mahakarya Facility & Security Enterprise. Hak Cipta Dilindungi.</span>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setIsHelpModalOpen(true)}
              className="hover:text-white transition"
            >
              Prosedur Akun Korporat
            </button>
            <span className="text-slate-600">|</span>
            <a
              href="https://wa.me/6281215293593"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center space-x-1"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Helpdesk WA</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Help Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-slate-900 shadow-2xl text-left border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-teal-600" />
                <h3 className="font-black text-base text-slate-900">Panduan Kredensial & Akun</h3>
              </div>
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-sm font-bold"
              >
                ×
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                Sistem ini merupakan sistem <strong>In-House Beli Putus Korporat (Single-Tenant)</strong>. Registrasi akun tidak dibuka untuk publik.
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-[11px]">
                <div className="font-bold text-slate-900">Ketentuan Hak Akses Akun:</div>
                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                  <li><strong>Administrator</strong>: Dikelola oleh HRD & Manajer Operasional Pusat.</li>
                  <li><strong>Chief & Komandan Regu</strong>: Diberikan wewenang supervisi laporan & monitoring shift.</li>
                  <li><strong>Petugas Lapangan (Satpam, Cleaning, Driver)</strong>: Didaftarkan melalui Master Personil di Command Center.</li>
                </ul>
              </div>
              <p className="text-slate-500 text-[11px]">
                Jika Anda lupa password, silakan hubungi Administrator Site atau Manajer HR/GA untuk reset password melalui portal manajemen.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsHelpModalOpen(false)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
