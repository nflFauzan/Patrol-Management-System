'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Shield,
  ShieldCheck,
  UserCheck,
  Lock,
  User as UserIcon,
  CreditCard,
  Phone,
  Mail,
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { authApi } from '../../field/services/api';
import { Division } from '@patrol/types';

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [nik, setNik] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [divisionInterest, setDivisionInterest] = useState<Division>(Division.SECURITY);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [hpInput, setHpInput] = useState(''); // Honeypot anti-bot
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Client-side validations
    if (hpInput.trim() !== '') {
      setErrorMessage('Terdeteksi aktivitas bot.');
      return;
    }

    if (!/^\d{16}$/.test(nik.trim())) {
      setErrorMessage('Nomor NIK KTP wajib tepat 16 digit angka.');
      return;
    }

    if (phoneNumber.trim().length < 10) {
      setErrorMessage('Nomor telepon / WhatsApp minimal 10 digit.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password minimal 6 karakter.');
      return;
    }

    if (password !== passwordConfirm) {
      setErrorMessage('Konfirmasi password tidak cocok dengan password yang dimasukkan.');
      return;
    }

    setIsLoading(true);

    try {
      await authApi.register({
        fullName: fullName.trim(),
        nik: nik.trim(),
        phone: phoneNumber.trim(),
        email: email.trim().toLowerCase(),
        username: username.trim().toLowerCase(),
        divisionInterest,
        password,
        passwordConfirm,
        hp_input: hpInput,
      });

      setIsSuccess(true);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Gagal mendaftarkan akun. Silakan periksa kembali data Anda.';
      setErrorMessage(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#070d1e] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      {/* Background Decorative Tech Gradients */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Corporate Header */}
      <header className="relative z-10 w-full px-6 py-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md">
        <Link href="/login" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-all">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-black text-sm tracking-wide text-white flex items-center gap-1.5">
              MAHAKARYA ENTERPRISE
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
                Single-Tenant
              </span>
            </span>
            <span className="text-[10px] text-slate-400">Patrol & Facility In-House System</span>
          </div>
        </Link>

        <Link
          href="/login"
          className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Login</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-xl mx-auto">
          {isSuccess ? (
            /* Success State Card */
            <div className="bg-slate-900/90 border border-emerald-500/40 rounded-3xl p-8 shadow-2xl backdrop-blur-xl text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <span className="text-[11px] font-bold tracking-wider text-emerald-400 uppercase bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  REGISTRASI BERHASIL DISERAHKAN
                </span>
                <h2 className="text-2xl font-black text-white mt-3">
                  Menunggu Persetujuan Administrator
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm mt-3 leading-relaxed max-w-md mx-auto">
                  Data personil atas nama <strong className="text-white font-bold">{fullName}</strong> (NIK: {nik}) telah berhasil didaftarkan ke sistem dan masuk ke dalam antrean approval verifikasi Administrator Korporat.
                </p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-left text-xs text-slate-400 space-y-2">
                <div className="flex items-center gap-2 text-slate-200 font-semibold">
                  <UserCheck className="w-4 h-4 text-blue-400" />
                  <span>Alur Verifikasi Akun Korporat:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] pl-1 text-slate-300">
                  <li>Administrator akan memeriksa validitas NIK dan identitas personil.</li>
                  <li>Administrator menetapkan Divisi, Hak Akses (Role), dan Penempatan Fasilitas (Site).</li>
                  <li>Setelah status disetujui (<span className="text-emerald-400 font-bold">Approved</span>), Anda dapat langsung login menggunakan username dan password Anda.</li>
                </ul>
              </div>

              <div className="pt-2">
                <Link
                  href="/login"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition text-sm"
                >
                  <span>Menuju Halaman Login</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            /* Registration Form Card */
            <div className="bg-slate-900/85 border border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl relative">
              {/* Form Title & Badge */}
              <div className="mb-6 text-left">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold tracking-wider text-cyan-400 uppercase flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                    PENDAFTARAN PERSONIL MANDIRI
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Approval Workflow
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Formulir Calon Personil
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Daftarkan diri Anda untuk operasional internal. Akun memerlukan verifikasi Administrator sebelum aktif.
                </p>
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

              {/* Form Inputs */}
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
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

                {/* Nama Lengkap & NIK */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Nama Lengkap (KTP)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                        placeholder="Contoh: Rian Pratama"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Nomor Induk KTP (16 Digit)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={nik}
                        onChange={(e) => setNik(e.target.value.replace(/\D/g, '').slice(0, 16))}
                        required
                        maxLength={16}
                        className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition font-mono"
                        placeholder="3201xxxxxxxxxxxx"
                      />
                    </div>
                  </div>
                </div>

                {/* Nomor WhatsApp & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      No. WhatsApp / HP Aktif
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                        className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                        placeholder="0812xxxxxxxx"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Alamat Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                        placeholder="nama@email.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Username & Divisi Peminatan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Username Sistem
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                        required
                        className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition font-mono"
                        placeholder="contoh: rian.security"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Peminatan Divisi Operasional
                    </label>
                    <select
                      value={divisionInterest}
                      onChange={(e) => setDivisionInterest(e.target.value as Division)}
                      className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                    >
                      <option value={Division.SECURITY}>Satpam / Security Officer</option>
                      <option value={Division.CLEANING}>Cleaning Service & Sanitasi</option>
                      <option value={Division.DRIVER}>Driver Logistik & Armada</option>
                      <option value={Division.STAFF}>Operasional & Manajemen Staff</option>
                    </select>
                  </div>
                </div>

                {/* Password & Konfirmasi Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Kata Sandi (Password)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pl-9 pr-9 py-2 bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                        placeholder="Min. 6 karakter"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Ulangi Kata Sandi
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        required
                        className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                        placeholder="Ketik ulang sandi"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition duration-150 disabled:opacity-50 text-xs sm:text-sm flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Mendaftarkan Akun ke Antrean Approval...</span>
                      </>
                    ) : (
                      <>
                        <span>Ajukan Pendaftaran Akun</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Already have account */}
              <div className="mt-5 pt-4 border-t border-slate-800 text-center">
                <p className="text-xs text-slate-400">
                  Sudah memiliki akun terdaftar atau disetujui?{' '}
                  <Link
                    href="/login"
                    className="text-blue-400 hover:text-blue-300 font-bold underline underline-offset-4"
                  >
                    Masuk ke Command Center
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-slate-800/60 bg-slate-950/70 backdrop-blur-md px-6 py-3 text-center text-xs text-slate-500">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 PT Mahakarya Facility & Security Enterprise. Hak Cipta Dilindungi.</span>
          <span className="text-[11px] text-slate-600">
            Enterprise Single-Tenant In-House Edition
          </span>
        </div>
      </footer>
    </div>
  );
}
