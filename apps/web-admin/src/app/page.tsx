'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, ArrowRight, UserPlus } from 'lucide-react';

export default function PreLoginPage() {
  return (
    <div className="min-h-screen w-full bg-[#f8f9fa] flex flex-col justify-between items-center p-6 relative overflow-hidden select-none font-sans">
      {/* Subtle Ambient Background Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-slate-200/50 via-slate-100/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-t from-slate-200/40 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      {/* Top Brand Tag */}
      <header className="w-full max-w-5xl flex items-center justify-between pt-2 z-10">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-xs font-bold tracking-wider uppercase text-slate-800">
            Patrol Management System
          </span>
        </div>
        <div className="text-[11px] font-medium text-slate-400">
          In-House Corporate v2.4
        </div>
      </header>

      {/* Center Hero & Action Gateway (Ala Minibank Tazkia) */}
      <main className="flex flex-col items-center justify-center text-center my-auto z-10 max-w-lg w-full">
        {/* Emblem Logo */}
        <div className="w-20 h-20 rounded-3xl bg-slate-900 text-white flex items-center justify-center shadow-xl shadow-slate-900/10 mb-6 border border-slate-800">
          <Shield className="w-10 h-10 text-emerald-400" />
        </div>

        {/* Corporate Titles (Direct, Clean, Anti-AI Slop) */}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
          Patrol & Facility Management
        </h1>
        <p className="text-xs sm:text-sm font-medium text-slate-500 mb-8 max-w-sm">
          Sistem Komando Operasional Keamanan, Kebersihan, dan Armada Logistik
        </p>

        {/* Two Ramping Pill Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xs">
          <Link
            href="/login"
            className="w-full py-3.5 px-6 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold tracking-wide shadow-md shadow-slate-900/10 hover:shadow-lg transition-all flex items-center justify-center space-x-2 group"
          >
            <span>MASUK</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="/register"
            className="w-full py-3.5 px-6 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 hover:border-slate-400 text-sm font-semibold tracking-wide shadow-2xs hover:shadow transition-all flex items-center justify-center space-x-2"
          >
            <UserPlus className="w-4 h-4 text-slate-500" />
            <span>DAFTAR</span>
          </Link>
        </div>
      </main>

      {/* Minimalist Corporate Footer */}
      <footer className="w-full max-w-5xl text-center py-2 z-10 text-[11px] font-medium text-slate-400">
        © 2026 PT Korporat In-House • Single-Tenant Command Center
      </footer>
    </div>
  );
}
