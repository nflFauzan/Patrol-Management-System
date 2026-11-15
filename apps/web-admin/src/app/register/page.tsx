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
  PhoneCall
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
      setErrorMessage('Konfirmasi kata sandi tidak cocok dengan kata sandi yang dimasukkan.');
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
    <div className="min-h-screen w-full bg-[#08212b] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-teal-600 selection:text-white">
      {/* Background Decorative Radial Gradients (Dashboard Matching Background) */}
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

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-xl mx-auto">
          {isSuccess ? (
            /* Success State Card */
            <div className="bg-white/95 text-slate-900 rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/50 backdrop-blur-xl text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold tracking-wider text-emerald-700 uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  REGISTRASI BERHASIL DISERAHKAN
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-3">
                  Menunggu Persetujuan Administrator
                </h2>
                <p className="text-slate-600 text-xs sm:text-sm mt-2.5 leading-relaxed max-w-md mx-auto">
                  Data personil atas nama <strong className="text-slate-900 font-bold">{fullName}</strong> (NIK: {nik}) telah berhasil didaftarkan ke sistem dan masuk ke dalam antrean approval verifikasi Administrator Korporat.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs text-slate-600 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <UserCheck className="w-4 h-4 text-teal-600" />
                  <span>Alur Verifikasi Akun Korporat:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] pl-1 text-slate-600">
                  <li>Administrator akan memeriksa validitas NIK dan identitas personil.</li>
                  <li>Administrator menetapkan Divisi, Hak Akses (Role), dan Penempatan Fasilitas (Site).</li>
                  <li>Setelah status disetujui (<span className="text-emerald-600 font-bold">Approved</span>), Anda dapat langsung login menggunakan username dan kata sandi Anda.</li>
                </ul>
              </div>

              <div className="pt-2">
                <Link
                  href="/login"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-2xl shadow-lg shadow-teal-600/30 transition text-sm"
                >
                  <span>Menuju Halaman Login</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            /* Registration Clean White Card */
            <div className="bg-white/95 text-slate-900 rounded-3xl p-7 sm:p-9 shadow-2xl border border-white/50 backdrop-blur-xl relative">
              {/* Card Top Row: Back Arrow + Status Tag */}
              <div className="flex items-center justify-between mb-5">
                <Link
                  href="/"
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 flex items-center justify-center transition shadow-2xs group"
                  title="Kembali ke Beranda"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                </Link>

                <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-700 bg-teal-50 border border-teal-200/60 px-2.5 py-1 rounded-full">
                  Registrasi Calon Personil
                </span>
              </div>

              {/* Title & Subtitle */}
              <div className="mb-6 text-left">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Pendaftaran Personil
                </h2>
                <p className="text-slate-500 text-xs mt-1">
                  Daftarkan diri Anda untuk operasional internal korporat. Akun memerlukan verifikasi Administrator sebelum aktif.
                </p>
              </div>

              {/* Error Alert Banner */}
              {errorMessage && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-start space-x-2 text-xs animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium">{errorMessage}</div>
                  <button
                    onClick={() => setErrorMessage(null)}
                    className="text-rose-500 hover:text-rose-700 text-xs font-bold"
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Lengkap (KTP)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 transition"
                        placeholder="Contoh: Rian Pratama"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nomor Induk KTP (16 Digit)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={nik}
                        onChange={(e) => setNik(e.target.value.replace(/\D/g, '').slice(0, 16))}
                        required
                        maxLength={16}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 transition font-mono"
                        placeholder="3201xxxxxxxxxxxx"
                      />
                    </div>
                  </div>
                </div>

                {/* Nomor WhatsApp & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      No. WhatsApp / HP Aktif
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 transition"
                        placeholder="0812xxxxxxxx"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Alamat Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 transition"
                        placeholder="nama@email.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Username & Divisi Peminatan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Username Sistem
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                        required
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 transition font-mono"
                        placeholder="contoh: rian.security"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Peminatan Divisi Operasional
                    </label>
                    <select
                      value={divisionInterest}
                      onChange={(e) => setDivisionInterest(e.target.value as Division)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600/20 transition cursor-pointer"
                    >
                      <option value={Division.SECURITY}>Satpam / Security Officer</option>
                      <option value={Division.CLEANING}>Cleaning Service & Sanitasi</option>
                      <option value={Division.DRIVER}>Driver Logistik & Armada</option>
                      <option value={Division.STAFF}>Operasional & Manajemen Staff</option>
                    </select>
                  </div>
                </div>

                {/* Kata Sandi & Konfirmasi Sandi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Kata Sandi
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 transition"
                        placeholder="Min. 6 karakter"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Ulangi Kata Sandi
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        required
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 transition"
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
                    className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-2xl shadow-lg shadow-teal-600/30 transition duration-150 disabled:opacity-50 text-sm flex items-center justify-center space-x-2 cursor-pointer"
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
              <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500">
                  Sudah memiliki akun terdaftar atau disetujui?{' '}
                  <Link
                    href="/login"
                    className="font-extrabold text-teal-700 hover:text-teal-900 uppercase tracking-wide hover:underline"
                  >
                    Masuk di sini
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-white/10 bg-slate-950/40 backdrop-blur-md px-6 py-4 text-center text-xs text-teal-200/60">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 PT Mahakarya Facility & Security Enterprise. Hak Cipta Dilindungi.</span>
          <span className="text-[11px] text-teal-300/60">
            Enterprise Single-Tenant In-House Edition
          </span>
        </div>
      </footer>
    </div>
  );
}
