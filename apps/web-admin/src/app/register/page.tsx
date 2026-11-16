'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Shield,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  User as UserIcon,
  CreditCard,
  Phone,
  Mail,
  Lock,
  ChevronDown
} from 'lucide-react';
import { authApi } from '../../lib/api';
import { Division } from '@patrol/types';

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [nik, setNik] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [divisionInterest, setDivisionInterest] = useState<Division>(Division.SECURITY);
  const [requestedRole, setRequestedRole] = useState('SECURITY_OFFICER');
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

    // Client-side validations
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
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsLoading(true);

    try {
      await authApi.register({
        fullName: fullName.trim(),
        nik: nik.trim(),
        phone: phoneNumber.trim(),
        email: email.trim().toLowerCase() || `${username.trim().toLowerCase()}@corp.local`,
        username: username.trim().toLowerCase(),
        divisionInterest,
        requestedRole,
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
    <div className="min-h-screen w-full bg-[#f8f9fa] flex flex-col justify-between items-center p-4 sm:p-6 relative overflow-hidden font-sans select-none">
      {/* Subtle Ambient Background Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-slate-200/50 via-slate-100/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-t from-slate-200/40 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      {/* Top Bar Navigation */}
      <header className="w-full max-w-xl flex items-center justify-between pt-2 z-10">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors p-2 -ml-2 rounded-lg hover:bg-slate-200/50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </Link>
        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
          <Shield className="w-4 h-4 text-emerald-500" />
          <span>Patrol Management</span>
        </div>
      </header>

      {/* Floating Center Card (Ala Minibank Tazkia Signup Card) */}
      <main className="w-full max-w-xl my-auto z-10">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl shadow-slate-900/5 transition-all">
          {/* Success Screen */}
          {isSuccess ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200 shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Pendaftaran Berhasil!
              </h2>
              <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto font-medium">
                Akun personil Anda telah didaftarkan. Silakan menunggu proses verifikasi dan persetujuan (approval) oleh supervisor fasilitas.
              </p>
              <div className="mt-6">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center py-3.5 px-8 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold tracking-wide shadow-md shadow-slate-900/10 transition-all"
                >
                  Lanjut ke Halaman Masuk
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Header Card */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Pendaftaran Akun
                </h1>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Registrasi personil operasional untuk approval supervisi
                </p>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3.5 py-2.5 rounded-2xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 2-Column Clean Pill Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Honeypot hidden input */}
                <input
                  type="text"
                  name="hp_input"
                  value={hpInput}
                  onChange={(e) => setHpInput(e.target.value)}
                  className="hidden"
                  autoComplete="off"
                  tabIndex={-1}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Nama Lengkap */}
                  <div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nama Lengkap"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white text-slate-900 text-sm rounded-full px-4 py-3 outline-none transition shadow-2xs font-medium placeholder:text-slate-400"
                    />
                  </div>

                  {/* NIK KTP */}
                  <div>
                    <input
                      type="text"
                      required
                      maxLength={16}
                      value={nik}
                      onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                      placeholder="NIK KTP (16 Digit)"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white text-slate-900 text-sm rounded-full px-4 py-3 outline-none transition shadow-2xs font-medium placeholder:text-slate-400"
                    />
                  </div>

                  {/* No WhatsApp */}
                  <div>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/[^\d+]/g, ''))}
                      placeholder="Nomor WhatsApp"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white text-slate-900 text-sm rounded-full px-4 py-3 outline-none transition shadow-2xs font-medium placeholder:text-slate-400"
                    />
                  </div>

                  {/* Divisi Operasional */}
                  <div className="relative">
                    <select
                      value={divisionInterest}
                      onChange={(e) => setDivisionInterest(e.target.value as Division)}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white text-slate-900 text-sm rounded-full px-4 py-3 outline-none transition shadow-2xs font-medium cursor-pointer"
                    >
                      <option value={Division.SECURITY}>Satpam (Security)</option>
                      <option value={Division.CLEANING}>Cleaning Service</option>
                      <option value={Division.DRIVER}>Driver Logistik</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>

                  {/* Username */}
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                      placeholder="Username yang Diinginkan"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white text-slate-900 text-sm rounded-full px-4 py-3 outline-none transition shadow-2xs font-medium placeholder:text-slate-400"
                    />
                  </div>

                  {/* Kata Sandi */}
                  <div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Kata Sandi (min 6 karakter)"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white text-slate-900 text-sm rounded-full px-4 py-3 outline-none transition shadow-2xs font-medium placeholder:text-slate-400"
                    />
                  </div>

                  {/* Konfirmasi Kata Sandi */}
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      placeholder="Ulangi Kata Sandi"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white text-slate-900 text-sm rounded-full px-4 py-3 pr-11 outline-none transition shadow-2xs font-medium placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Pill Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-full bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-sm font-semibold tracking-wide shadow-md shadow-slate-900/10 transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Mendaftarkan...</span>
                    </>
                  ) : (
                    <span>DAFTAR SEKARANG</span>
                  )}
                </button>
              </form>

              {/* Bottom Link to Login */}
              <div className="text-center mt-5 text-xs text-slate-500">
                Sudah memiliki akun?{' '}
                <Link
                  href="/login"
                  className="font-bold text-slate-900 hover:underline"
                >
                  MASUK di sini
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-xl text-center py-2 z-10 text-[11px] font-medium text-slate-400">
        © 2026 PT Korporat In-House • Registrasi Internal Personil
      </footer>
    </div>
  );
}
