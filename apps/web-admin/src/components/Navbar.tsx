'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Database,
  CalendarCheck,
  FileText,
  DollarSign,
  Megaphone,
  ShieldAlert,
  Printer,
  KeyRound,
  LogOut,
  ChevronDown,
  Globe,
  QrCode,
  Users,
  Menu,
  X,
  Building,
  Volume2,
  VolumeX,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { useData } from '../lib/DataContext';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { activeSosAlert, setActiveSosAlert, isSirenMuted, setIsSirenMuted } = useData();

  const [isDataIndukOpen, setIsDataIndukOpen] = useState(false);
  const [isAbsensiOpen, setIsAbsensiOpen] = useState(false);
  const [isLaporanOpen, setIsLaporanOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check active routes
  const isHomeActive = pathname === '/';
  const isDataIndukActive = pathname.startsWith('/datainduk');
  const isAbsensiActive = pathname.startsWith('/absensi');
  const isLaporanActive = pathname.startsWith('/laporan');
  const isGajiActive = pathname.startsWith('/gaji');
  const isBroadcastActive = pathname.startsWith('/pesan-siaran');
  const isEmergencyActive = pathname.startsWith('/emergency');
  const isExportActive = pathname.startsWith('/export-laporan');

  return (
    <header className="sticky top-0 z-50 w-full shadow-lg">
      {/* ========================================================
          EMERGENCY SOS BROADCAST BANNER (IF ACTIVE ALERT)
          ======================================================== */}
      {activeSosAlert && (
        <div className="bg-rose-600 text-white border-b-2 border-rose-800 px-4 py-2.5 shadow-2xl animate-pulse flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 bg-white text-rose-600 rounded-lg shadow animate-bounce">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold uppercase tracking-wide">
                🚨 SOS DARURAT AKTIF: {activeSosAlert.officerName} ({activeSosAlert.division}) - {activeSosAlert.siteName}
              </p>
              <p className="text-[11px] text-rose-100">
                Peringatan darurat otomatis via WhatsApp Gateway & WebSocket Real-time.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <a
              href={activeSosAlert.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-white/20 hover:bg-white/30 text-white font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1"
            >
              <span>Buka Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => setActiveSosAlert(null)}
              className="bg-white text-rose-700 hover:bg-rose-50 font-bold px-3 py-1.5 rounded-lg"
            >
              Tutup Alarm
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          MAIN NAVBAR: 100% PARITY DENGAN PATROLI.SITE
          ======================================================== */}
      <nav className="bg-[#151c2f] border-b border-white/5 text-white px-4 lg:px-6 py-2.5 transition">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          {/* BRAND LOGO */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
              <Building className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] tracking-wider text-slate-400 font-semibold uppercase leading-none">
                ENTERPRISE
              </span>
              <span className="text-base font-black tracking-wider text-white uppercase mt-0.5">
                TES-PT
              </span>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION MENU */}
          <div className="hidden xl:flex items-center space-x-1 text-[13px] font-semibold">
            {/* HOME */}
            <Link
              href="/"
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition duration-150 ${
                isHomeActive
                  ? 'bg-gradient-to-r from-[#0d6efd] to-[#2563eb] text-white shadow-md shadow-blue-500/30'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>HOME</span>
            </Link>

            {/* DATA INDUK (DROPDOWN) */}
            <div
              className="relative"
              onMouseEnter={() => setIsDataIndukOpen(true)}
              onMouseLeave={() => setIsDataIndukOpen(false)}
            >
              <button
                type="button"
                onClick={() => setIsDataIndukOpen(!isDataIndukOpen)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition duration-150 ${
                  isDataIndukActive
                    ? 'bg-gradient-to-r from-[#0d6efd] to-[#2563eb] text-white shadow-md shadow-blue-500/30'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Database className="w-4 h-4 text-blue-400" />
                <span>DATA INDUK</span>
                <ChevronDown className="w-3.5 h-3.5 text-white/60 ml-0.5" />
              </button>

              {/* DROPDOWN MENU */}
              {isDataIndukOpen && (
                <div className="absolute left-0 mt-1 w-48 bg-[#151c2f] border border-white/10 rounded-xl p-1.5 shadow-2xl z-50 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                  <Link
                    href="/datainduk/area"
                    onClick={() => setIsDataIndukOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition text-xs ${
                      pathname === '/datainduk/area'
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-slate-200 hover:bg-blue-600/20 hover:text-white'
                    }`}
                  >
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span>Area & Shift</span>
                  </Link>
                  <Link
                    href="/datainduk/checkpoint"
                    onClick={() => setIsDataIndukOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition text-xs ${
                      pathname === '/datainduk/checkpoint'
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-slate-200 hover:bg-blue-600/20 hover:text-white'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    <span>Checkpoint / Aset</span>
                  </Link>
                  <Link
                    href="/datainduk/personil"
                    onClick={() => setIsDataIndukOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition text-xs ${
                      pathname === '/datainduk/personil'
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-slate-200 hover:bg-blue-600/20 hover:text-white'
                    }`}
                  >
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>Personil & Gaji</span>
                  </Link>
                </div>
              )}
            </div>

            {/* ABSENSI */}
            <div
              className="relative"
              onMouseEnter={() => setIsAbsensiOpen(true)}
              onMouseLeave={() => setIsAbsensiOpen(false)}
            >
              <button
                type="button"
                onClick={() => setIsAbsensiOpen(!isAbsensiOpen)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition duration-150 ${
                  isAbsensiActive
                    ? 'bg-gradient-to-r from-[#0d6efd] to-[#2563eb] text-white shadow-md shadow-blue-500/30'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <CalendarCheck className="w-4 h-4 text-emerald-400" />
                <span>ABSENSI</span>
                <ChevronDown className="w-3.5 h-3.5 text-white/60 ml-0.5" />
              </button>

              {isAbsensiOpen && (
                <div className="absolute left-0 mt-1 w-48 bg-[#151c2f] border border-white/10 rounded-xl p-1.5 shadow-2xl z-50 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                  <Link
                    href="/absensi"
                    onClick={() => setIsAbsensiOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-200 hover:bg-blue-600/20 hover:text-white text-xs transition"
                  >
                    <span>Matriks 31-Hari</span>
                  </Link>
                </div>
              )}
            </div>

            {/* LAPORAN */}
            <div
              className="relative"
              onMouseEnter={() => setIsLaporanOpen(true)}
              onMouseLeave={() => setIsLaporanOpen(false)}
            >
              <button
                type="button"
                onClick={() => setIsLaporanOpen(!isLaporanOpen)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition duration-150 ${
                  isLaporanActive
                    ? 'bg-gradient-to-r from-[#0d6efd] to-[#2563eb] text-white shadow-md shadow-blue-500/30'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <FileText className="w-4 h-4 text-purple-400" />
                <span>LAPORAN</span>
                <ChevronDown className="w-3.5 h-3.5 text-white/60 ml-0.5" />
              </button>

              {isLaporanOpen && (
                <div className="absolute left-0 mt-1 w-52 bg-[#151c2f] border border-white/10 rounded-xl p-1.5 shadow-2xl z-50 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                  <Link
                    href="/laporan"
                    onClick={() => setIsLaporanOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-200 hover:bg-blue-600/20 hover:text-white text-xs transition"
                  >
                    <span>Laporan 3 Divisi Terpadu</span>
                  </Link>
                </div>
              )}
            </div>

            {/* GAJI */}
            <Link
              href="/gaji"
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition duration-150 ${
                isGajiActive
                  ? 'bg-gradient-to-r from-[#0d6efd] to-[#2563eb] text-white shadow-md shadow-blue-500/30'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>GAJI</span>
            </Link>

            {/* PESAN SIARAN */}
            <Link
              href="/pesan-siaran"
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition duration-150 ${
                isBroadcastActive
                  ? 'bg-gradient-to-r from-[#0d6efd] to-[#2563eb] text-white shadow-md shadow-blue-500/30'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Megaphone className="w-4 h-4 text-amber-400" />
              <span>PESAN SIARAN</span>
            </Link>

            {/* EMERGENCY */}
            <Link
              href="/emergency"
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition duration-150 ${
                isEmergencyActive
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-500/30 font-bold'
                  : 'text-rose-400 hover:text-white hover:bg-rose-600/20'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>EMERGENCY</span>
            </Link>

            {/* EXPORT LAPORAN */}
            <Link
              href="/export-laporan"
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition duration-150 ${
                isExportActive
                  ? 'bg-gradient-to-r from-[#0d6efd] to-[#2563eb] text-white shadow-md shadow-blue-500/30'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              <span>EXPORT LAPORAN</span>
            </Link>
          </div>

          {/* RIGHT UTILITIES: UBAH PASSWORD & LOGOUT */}
          <div className="hidden lg:flex items-center space-x-2 text-[13px] font-semibold">
            <button
              type="button"
              onClick={() => alert('Fitur Ubah Password Administrator')}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
              title="Ubah Password Admin"
            >
              <KeyRound className="w-4 h-4 text-yellow-400" />
              <span>UBAH PASSWORD</span>
            </button>

            <button
              type="button"
              onClick={() => alert('Sesi login administrator telah diakhiri.')}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-rose-300 hover:text-white hover:bg-rose-600/20 transition"
              title="Keluar dari Akun"
            >
              <LogOut className="w-4 h-4" />
              <span>LOGOUT</span>
            </button>
          </div>

          {/* MOBILE HAMBURGER BUTTON */}
          <div className="xl:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU ACCORDION */}
        {isMobileMenuOpen && (
          <div className="xl:hidden mt-3 pt-3 border-t border-white/10 space-y-2 pb-2 text-sm font-semibold">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10"
            >
              <Home className="w-4 h-4" />
              <span>HOME</span>
            </Link>
            <div className="px-3 py-1 text-xs text-slate-400 font-bold uppercase">DATA INDUK:</div>
            <Link
              href="/datainduk/area"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-2 pl-6 py-1.5 rounded-lg hover:bg-white/10 text-xs"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Area & Shift</span>
            </Link>
            <Link
              href="/datainduk/checkpoint"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-2 pl-6 py-1.5 rounded-lg hover:bg-white/10 text-xs"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-400" />
              <span>Checkpoint / Aset</span>
            </Link>
            <Link
              href="/datainduk/personil"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-2 pl-6 py-1.5 rounded-lg hover:bg-white/10 text-xs"
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>Personil & Gaji</span>
            </Link>
            <Link
              href="/absensi"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10"
            >
              <CalendarCheck className="w-4 h-4 text-emerald-400" />
              <span>ABSENSI (31-HARI)</span>
            </Link>
            <Link
              href="/laporan"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10"
            >
              <FileText className="w-4 h-4 text-purple-400" />
              <span>LAPORAN</span>
            </Link>
            <Link
              href="/gaji"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10"
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>GAJI</span>
            </Link>
            <Link
              href="/pesan-siaran"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10"
            >
              <Megaphone className="w-4 h-4 text-amber-400" />
              <span>PESAN SIARAN</span>
            </Link>
            <Link
              href="/emergency"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-600/20"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>EMERGENCY</span>
            </Link>
            <Link
              href="/export-laporan"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              <span>EXPORT LAPORAN</span>
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};
