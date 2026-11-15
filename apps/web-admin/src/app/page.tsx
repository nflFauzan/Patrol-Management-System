'use client';

import React from 'react';
import Link from 'next/link';
import {
  Shield,
  ShieldCheck,
  Lock,
  UserPlus,
  ArrowRight,
  Sparkles,
  PhoneCall,
  LayoutDashboard,
  CheckCircle2,
  Building2,
  Radio
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export default function PortalGatewayPage() {
  const { user, isAuthenticated, isLoading } = useAuth();

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

      {/* Top Header Bar */}
      <header className="relative z-10 w-full border-b border-white/10 bg-slate-950/40 backdrop-blur-md px-6 py-4">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-slate-950 shadow-lg shadow-teal-500/20 border border-white/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-wide text-white">
                  PT MAHAKARYA FACILITY & SECURITY ENTERPRISE
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-400/30">
                  IN-HOUSE SINGLE-TENANT
                </span>
              </div>
              <p className="text-[11px] text-teal-200/70">
                Patrol & Facility Management System • Portal Akses Korporat
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-3 text-xs text-slate-300">
            <div className="flex items-center space-x-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-medium text-teal-100">Sistem Online & Siaga</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Center Gateway Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12 sm:px-6">
        <div className="max-w-3xl w-full text-center space-y-8">
          
          {/* Slogan Pill */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-400/20 text-teal-300 text-xs font-semibold backdrop-blur-md shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            <span>Sistem Terpadu 3 Divisi Operasional Korporat</span>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Enterprise Command Center & Operasional Lapangan
            </h1>
            <p className="text-sm sm:text-base text-teal-100/80 max-w-xl mx-auto leading-relaxed">
              Selamat datang di portal operasional terintegrasi pengawasan patroli Satpam, checklist sanitasi Cleaning Service, dan pelacakan logistik armada.
            </p>
          </div>

          {/* If user is already authenticated: Smart Banner */}
          {!isLoading && isAuthenticated && user && (
            <div className="max-w-md mx-auto p-4 rounded-2xl bg-teal-900/60 border border-teal-400/40 backdrop-blur-md text-left flex items-center justify-between gap-4 animate-in fade-in duration-200">
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5 text-xs text-teal-200 font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Sesi Aktif Terdeteksi</span>
                </div>
                <div className="text-sm font-extrabold text-white truncate mt-0.5">
                  {user.fullName}
                </div>
                <div className="text-[11px] text-teal-300/80">
                  {user.securityRank || user.role} • {user.siteName || 'Head Office'}
                </div>
              </div>
              <Link
                href="/dashboard"
                className="bg-white hover:bg-teal-50 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl inline-flex items-center space-x-1.5 shrink-0 shadow-lg shadow-teal-950/30 transition group"
              >
                <span>Buka Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 text-teal-700 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          )}

          {/* Pilihan Utama: Login vs Sign Up (2 Centered Action Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto pt-2 text-left">
            {/* Card 1: Masuk ke Command Center (Login) */}
            <div className="group relative bg-white/95 text-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-white/40 backdrop-blur-xl flex flex-col justify-between hover:-translate-y-1 transition duration-200">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    Masuk ke Akun
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Akses Command Center bagi Administrator, Supervisor, Komandan Regu, dan personil terdaftar.
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href="/login"
                  className="w-full inline-flex items-center justify-center space-x-2 py-3 px-5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-teal-600/30 transition group-hover:shadow-teal-600/40"
                >
                  <span>Masuk Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Card 2: Pendaftaran Calon Personil (Sign Up) */}
            <div className="group relative bg-white/10 text-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-white/15 backdrop-blur-xl flex flex-col justify-between hover:bg-white/[0.14] hover:-translate-y-1 transition duration-200">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 text-teal-300 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">
                    Pendaftaran Personil
                  </h3>
                  <p className="text-xs text-teal-100/70 mt-1.5 leading-relaxed">
                    Pengajuan pendaftaran mandiri bagi calon personil lapangan untuk diverifikasi oleh Administrator.
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href="/register"
                  className="w-full inline-flex items-center justify-center space-x-2 py-3 px-5 bg-white/15 hover:bg-white/25 text-white border border-white/25 font-extrabold text-sm rounded-2xl shadow-lg transition"
                >
                  <span>Daftar Akun Baru</span>
                  <ArrowRight className="w-4 h-4 text-teal-300" />
                </Link>
              </div>
            </div>
          </div>

          {/* Operational Scope Highlights */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-teal-200/70">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              Satpam Patroli & Geofence
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Checklist Sanitasi Cleaning
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-cyan-400" />
              Logistik Armada Driver
            </span>
          </div>

        </div>
      </main>

      {/* Corporate Footer */}
      <footer className="relative z-10 w-full border-t border-white/10 bg-slate-950/40 backdrop-blur-md px-6 py-4 text-center text-xs text-teal-200/60">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© 2026 PT Mahakarya Facility & Security Enterprise. Hak Cipta Dilindungi.</span>
          <div className="flex items-center space-x-4">
            <span className="text-[11px] text-teal-300/60">
              Enterprise In-House Single-Tenant Edition
            </span>
            <span className="text-slate-600">|</span>
            <a
              href="https://wa.me/6281215293593"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center space-x-1"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Helpdesk WhatsApp</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
