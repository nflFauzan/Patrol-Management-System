'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Shield,
  ShieldCheck,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Building2,
  Sparkles,
  MapPin,
  Radio,
  Car,
  Leaf,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Loader2,
  PhoneCall,
  KeyRound,
  FileCheck
} from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '../lib/AuthContext';

export const AdminLoginPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';

  const { login } = useAuth();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [hpInput, setHpInput] = useState(''); // Honeypot
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
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

      if (
        role === 'ADMIN_SUPER' ||
        role === 'SUPER_ADMIN' ||
        role === 'ADMIN' ||
        role === 'HRD' ||
        role === 'OPS_MANAGER' ||
        role === 'SITE_SUPERVISOR' ||
        rank === 'CHIEF'
      ) {
        router.push(returnUrl.startsWith('/') && returnUrl !== '/login' ? returnUrl : '/');
      } else {
        // Field personnel default to field view or dashboard if requested
        if (returnUrl && returnUrl !== '/' && returnUrl !== '/login') {
          router.push(returnUrl);
        } else {
          router.push('/validasi-patroli');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login gagal, periksa kredensial Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const activeDemo = DEMO_ACCOUNTS[selectedDemoIndex] || DEMO_ACCOUNTS[0];

  return (
    <div className="min-h-screen w-full bg-[#070d1e] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      {/* Background Decorative Tech Gradients */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-[300px] h-[300px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Subtle Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Top Corporate Status Bar */}
      <header className="relative z-10 w-full border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-6 py-3.5">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 border border-white/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-wide text-white">
                  PT MAHAKARYA FACILITY & SECURITY ENTERPRISE
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  IN-HOUSE SINGLE-TENANT
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Patrol & Facility Management System • Enterprise Command Center</p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4 text-xs text-slate-400">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-300">Server PostGIS 3.5: Normal</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center space-x-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>WebSocket SOS: Siap</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Showcase & Form */}
      <main className="relative z-10 flex-1 max-w-[1440px] w-full mx-auto p-4 sm:p-6 lg:p-10 flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 w-full items-center">
          
          {/* LEFT COLUMN: Operations Hub Overview (Desktop) */}
          <div className="hidden lg:flex lg:col-span-7 flex-col space-y-6 pr-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold w-fit">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Sistem Terpadu 3 Divisi Operasional Korporat</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Enterprise Command Center & Pemantauan Operasional Lapangan
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                Platform terpusat terintegrasi untuk pengawasan rute patroli Satpam, checklist kebersihan sanitasi
                Cleaning Service, pelacakan armada Driver Logistik, serta manajemen presisi absensi & penggajian korporat.
              </p>
            </div>

            {/* 3 Core Operational Division Highlights */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white mb-1">Satpam / Security</h4>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Rute QR checkpoint, geofence PostGIS, laporan kejadian, & Panic SOS darurat.
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                  <Leaf className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white mb-1">Cleaning Service</h4>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Checklist sanitasi toilet/lantai, foto verifikasi berkala, & rating kebersihan.
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                  <Car className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white mb-1">Driver Logistik</h4>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Log perjalanan armada, catatan odometer awal/akhir, & status muatan site.
                </p>
              </div>
            </div>

            {/* In-House Enterprise Guarantees */}
            <div className="bg-gradient-to-r from-slate-900/90 to-slate-900/40 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-cyan-400" />
                  Cakupan Site Internal Korporat:
                </span>
                <span className="text-cyan-300 font-bold">2 Fasilitas Terkoneksi</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-400" /> Head Office SCBD Senayan (Radius 100m)
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-400" /> Logistics Hub Cikarang (Radius 250m)
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-slate-300">
                  <FileCheck className="w-3.5 h-3.5 text-blue-400" /> Retensi Media Otomatis: 180 Hari
                </span>
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Enkripsi Kredensial Bcrypt (Cost 10)
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Command Center Access Form */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto">
            <div className="bg-slate-900/85 border border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl relative">
              
              {/* Form Title & Badge */}
              <div className="mb-6 text-left">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold tracking-wider text-blue-400 uppercase flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-400" />
                    AUTENTIKASI INTERNAL
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Port :3001
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Masuk ke Command Center
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Masukkan username & password akun internal korporat Anda.
                </p>
              </div>

              {/* Quick 1-Click Role Switcher (For Evaluation & Instant Testing) */}
              <div className="mb-5 bg-slate-950/70 border border-slate-800/90 rounded-2xl p-3">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-2">
                  <span>Pilih Akun Demo (1-Klik):</span>
                  <span className="text-[10px] text-blue-400 font-normal">Klik untuk mengisi</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {DEMO_ACCOUNTS.map((acc, idx) => (
                    <button
                      key={acc.username}
                      type="button"
                      onClick={() => handleSelectDemo(idx)}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition text-left truncate flex flex-col ${
                        selectedDemoIndex === idx
                          ? `${acc.badgeColor} border font-extrabold shadow-sm`
                          : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
                      }`}
                      title={`${acc.fullName} (${acc.username})`}
                    >
                      <span className="truncate">{acc.fullName.split(' ')[0]}</span>
                      <span className="text-[9px] font-normal opacity-80 truncate">{acc.username}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between pt-1.5 border-t border-slate-800/60">
                  <span>Target: <strong className="text-slate-200">{activeDemo.fullName}</strong></span>
                  <span className="text-slate-400">{activeDemo.role}</span>
                </div>
              </div>

              {/* Error Alert Banner */}
              {errorMessage && (
                <div className="mb-4 p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl flex items-start space-x-2.5 text-rose-200 text-xs animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium">{errorMessage}</div>
                  <button
                    onClick={() => setErrorMessage(null)}
                    className="text-rose-400 hover:text-white text-xs font-bold"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
                {/* Honeypot field (hidden from humans & screen readers) */}
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

                {/* Username Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Username Akun
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                      placeholder="Masukkan username"
                      autoComplete="username"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsHelpModalOpen(true)}
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold transition"
                    >
                      Lupa password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                      placeholder="Masukkan password"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 focus:outline-none"
                      title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & System Scope */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-950 w-4 h-4"
                    />
                    <span>Ingat sesi di perangkat ini</span>
                  </label>
                  <span className="text-[10px] text-slate-500">Bcrypt SHA-256</span>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition duration-150 disabled:opacity-50 text-sm flex items-center justify-center space-x-2 mt-4"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Memverifikasi Kredensial...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Command Center</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom Support & Help */}
              <div className="mt-6 pt-4 border-t border-slate-800 text-center">
                <p className="text-[11px] text-slate-400">
                  Butuh bantuan akses atau registrasi personil baru?
                </p>
                <div className="mt-2 flex items-center justify-center space-x-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setIsHelpModalOpen(true)}
                    className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-2"
                  >
                    Prosedur Akun Korporat
                  </button>
                  <span className="text-slate-700">•</span>
                  <a
                    href="https://wa.me/6281215293593"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                  >
                    <PhoneCall className="w-3 h-3" />
                    Helpdesk WhatsApp
                  </a>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Corporate Footer */}
      <footer className="relative z-10 w-full border-t border-slate-800/60 bg-slate-950/70 backdrop-blur-md px-6 py-3 text-center text-xs text-slate-500">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 PT Mahakarya Facility & Security Enterprise. Hak Cipta Dilindungi.</span>
          <span className="text-[11px] text-slate-600">
            Enterprise Single-Tenant In-House Edition • Versi 1.0.0 Parity
          </span>
        </div>
      </footer>

      {/* Floating WhatsApp Helpdesk Pill */}
      <a
        href="https://wa.me/6281215293593"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-full shadow-2xl shadow-emerald-600/40 border border-emerald-400/30 text-xs font-bold transition transform hover:scale-105"
        title="Hubungi Helpdesk Operasional via WhatsApp"
      >
        <PhoneCall className="w-4 h-4" />
        <span className="hidden sm:inline">Bantuan Admin</span>
      </a>

      {/* Accessible Help & Account Procedure Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 text-slate-100 shadow-2xl text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm text-white">Panduan Kredensial & Akun</h3>
              </div>
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold"
              >
                ×
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                Sistem ini merupakan sistem <strong>In-House Beli Putus Korporat (Single-Tenant)</strong>. Registrasi akun tidak dibuka untuk publik.
              </p>
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5 text-[11px]">
                <div className="font-semibold text-white">Ketentuan Hak Akses Akun:</div>
                <ul className="list-disc pl-4 space-y-1 text-slate-400">
                  <li><strong>Administrator</strong>: Dikelola oleh HRD & Manajer Operasional Pusat.</li>
                  <li><strong>Chief & Komandan Regu</strong>: Diberikan wewenang supervisi laporan & monitoring shift.</li>
                  <li><strong>Petugas Lapangan (Satpam, Cleaning, Driver)</strong>: Didaftarkan melalui fitur Master Personil di Command Center.</li>
                </ul>
              </div>
              <p className="text-slate-400 text-[11px]">
                Jika Anda lupa password, silakan hubungi Administrator Site atau Manajer HR/GA untuk reset password melalui portal manajemen.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsHelpModalOpen(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition"
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

