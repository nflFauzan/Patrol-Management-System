'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Shield,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  User as UserIcon,
  Lock,
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export const AdminLoginPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';

  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [hpInput, setHpInput] = useState(''); // Honeypot anti-bot
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password) {
      setErrorMessage('Username dan kata sandi wajib diisi');
      return;
    }

    setIsLoading(true);

    try {
      const loggedUser = await login({
        username: username.trim(),
        password,
        hp_input: hpInput,
      });

      // Role and permission-based smart redirection
      const perms = loggedUser.permissions || [];
      const role = loggedUser.role as string;
      const hasAdminAccess =
        role === 'ADMIN_SUPER' ||
        role === 'SUPER_ADMIN' ||
        role === 'OPS_MANAGER' ||
        role === 'SITE_SUPERVISOR' ||
        role === 'HRD_PAYROLL' ||
        perms.includes('ADMIN:DASHBOARD_ACCESS') ||
        perms.includes('DATA_INDUK:VIEW');

      let dest = '/dashboard';
      if (hasAdminAccess) {
        dest = returnUrl && returnUrl !== '/login' && returnUrl !== '/' ? returnUrl : '/dashboard';
      } else if (
        perms.includes('FIELD:DASHBOARD_ACCESS') ||
        role === 'SECURITY_OFFICER' ||
        role === 'CLEANER' ||
        role === 'DRIVER'
      ) {
        dest = '/validasi-patroli';
      } else {
        dest = '/dashboard';
      }

      window.location.href = dest;
    } catch (err: any) {
      setErrorMessage(err.message || 'Login gagal, periksa username atau kata sandi.');
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
      <header className="w-full max-w-md flex items-center justify-between pt-2 z-10">
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

      {/* Center Authentication Card */}
      <main className="w-full max-w-md my-auto z-10">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl shadow-slate-900/5 transition-all">
          {/* Header Card */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Masuk Akun
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Autentikasi Terpusat Petugas & Manajemen Operasional
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3.5 py-2.5 rounded-2xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
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

            {/* Username Input Pill */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 pl-3">
                Username / NIK
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username atau NIK"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white text-slate-900 text-sm rounded-full pl-11 pr-4 py-3 outline-none transition shadow-2xs font-medium placeholder:text-slate-400"
                />
                <UserIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Password Input Pill */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 pl-3">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white text-slate-900 text-sm rounded-full pl-11 pr-11 py-3 outline-none transition shadow-2xs font-medium placeholder:text-slate-400"
                />
                <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
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

            {/* Remember & Help Link */}
            <div className="flex items-center justify-between text-xs px-2 pt-0.5">
              <label className="flex items-center space-x-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span>Ingat sesi</span>
              </label>
              <span className="text-slate-400 hover:text-slate-600 cursor-pointer">
                Lupa sandi?
              </span>
            </div>

            {/* Submit Pill Button */}
            <button
              type="submit"
              aria-label="Masuk ke Command Center"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-full bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-sm font-semibold tracking-wide shadow-md shadow-slate-900/10 transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <span>MASUK</span>
              )}
            </button>
          </form>

          {/* Bottom Link to Register */}
          <div className="text-center mt-6 pt-5 border-t border-slate-100 text-xs text-slate-500">
            Belum memiliki akun terdaftar?{' '}
            <Link
              href="/register"
              className="font-bold text-slate-900 hover:underline"
            >
              DAFTAR di sini
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md text-center py-2 z-10 text-[11px] font-medium text-slate-400">
        © 2026 PT Korporat In-House • Single-Tenant Security
      </footer>
    </div>
  );
};
