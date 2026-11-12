'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  ChevronDown,
  Globe,
  Building,
  Users,
  Menu,
  X,
  ExternalLink,
  ShieldAlert,
  KeyRound,
  LogOut,
  Bell,
  Sparkles
} from 'lucide-react';
import { useData } from '../lib/DataContext';
import { ChangePasswordModal } from './ChangePasswordModal';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { activeSosAlert, setActiveSosAlert } = useData();

  // Active dropdown state
  const [activeDropdown, setActiveDropdown] = useState<'DATA_INDUK' | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const navRef = useRef<HTMLElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Check active routes
  const isHomeActive = pathname === '/';
  const isDataIndukActive = pathname.startsWith('/datainduk');
  const isAbsensiActive = pathname.startsWith('/absensi');
  const isLaporanActive = pathname.startsWith('/laporan');
  const isGajiActive = pathname.startsWith('/gaji');
  const isBroadcastActive = pathname.startsWith('/pesan-siaran');
  const isEmergencyActive = pathname.startsWith('/emergency');

  const toggleDropdown = (menu: 'DATA_INDUK') => {
    setActiveDropdown((prev) => (prev === menu ? null : menu));
  };

  const handleLinkClick = () => {
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full pt-3 pb-2 px-4 lg:px-8 transition-all" ref={navRef}>
        {/* ========================================================
            EMERGENCY SOS DARURAT BANNER (JIKA AKTIF)
            ======================================================== */}
        {activeSosAlert && (
          <div className="max-w-[1440px] mx-auto mb-3 bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 text-white rounded-2xl p-3 sm:p-4 shadow-2xl border border-rose-500/40 animate-pulse flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white text-rose-700 rounded-xl shadow-md">
                <ShieldAlert className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <p className="font-extrabold uppercase tracking-wide text-sm">
                  🚨 ALARM SOS AKTIF: {activeSosAlert.officerName} ({activeSosAlert.division}) - {activeSosAlert.siteName}
                </p>
                <p className="text-[11px] text-rose-100">
                  Peringatan darurat otomatis lapangan terverifikasi via WebSocket & WhatsApp Gateway.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <a
                href={activeSosAlert.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-white/20 hover:bg-white/30 text-white font-bold px-3.5 py-1.5 rounded-xl flex items-center space-x-1.5 transition"
              >
                <span>Buka Koordinat GPS</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setActiveSosAlert(null)}
                className="bg-white text-rose-700 hover:bg-rose-50 font-bold px-3.5 py-1.5 rounded-xl transition shadow"
              >
                Tutup Alarm
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            FLOATING FROSTED-GLASS NAVBAR (LUMIO MODERN STYLE)
            ======================================================== */}
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
          {/* BRAND LOGO & TITLE */}
          <Link href="/" onClick={handleLinkClick} className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-all">
              <Building2 className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-wider text-white">TES-PT</span>
              <span className="text-[10px] text-teal-200/80 font-medium tracking-tight">Enterprise Ops</span>
            </div>
          </Link>

          {/* DESKTOP FLOATING PILL NAVIGATION */}
          <nav className="hidden lg:flex items-center bg-white/10 backdrop-blur-xl border border-white/15 rounded-full p-1.5 shadow-2xl shadow-slate-950/20 space-x-0.5">
            {/* OVERVIEW */}
            <Link
              href="/"
              onClick={handleLinkClick}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isHomeActive
                  ? 'bg-white/25 text-white shadow-sm font-bold backdrop-blur-md'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              Overview
            </Link>

            {/* DATA INDUK (CLEAN POPOVER DROPDOWN) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('DATA_INDUK')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isDataIndukActive || activeDropdown === 'DATA_INDUK'
                    ? 'bg-white/25 text-white shadow-sm font-bold'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>Data Induk</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${
                    activeDropdown === 'DATA_INDUK' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {activeDropdown === 'DATA_INDUK' && (
                <div
                  className="absolute left-0 top-full mt-2.5 w-48 bg-slate-900/95 backdrop-blur-xl border border-white/15 rounded-2xl p-2 shadow-2xl shadow-slate-950/40 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link
                    href="/datainduk/area"
                    onClick={handleLinkClick}
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname === '/datainduk/area'
                        ? 'bg-white/20 text-white font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span>Area & Geofence</span>
                  </Link>
                  <Link
                    href="/datainduk/checkpoint"
                    onClick={handleLinkClick}
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname === '/datainduk/checkpoint'
                        ? 'bg-white/20 text-white font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Building className="w-4 h-4 text-emerald-400" />
                    <span>Titik Checkpoint QR</span>
                  </Link>
                  <Link
                    href="/datainduk/personil"
                    onClick={handleLinkClick}
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname === '/datainduk/personil'
                        ? 'bg-white/20 text-white font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>Data Personil</span>
                  </Link>
                </div>
              )}
            </div>

            {/* ABSENSI */}
            <Link
              href="/absensi"
              onClick={handleLinkClick}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isAbsensiActive
                  ? 'bg-white/25 text-white shadow-sm font-bold backdrop-blur-md'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              Absensi
            </Link>

            {/* LAPORAN (DIRECT LINK TO UNIFIED OPERATIONS HUB - NO TRICKY FLYOUT!) */}
            <Link
              href="/laporan"
              onClick={handleLinkClick}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isLaporanActive
                  ? 'bg-white/25 text-white shadow-sm font-bold backdrop-blur-md'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              Laporan
            </Link>

            {/* GAJI (PRESERVED AS REQUESTED) */}
            <Link
              href="/gaji"
              onClick={handleLinkClick}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isGajiActive
                  ? 'bg-white/25 text-white shadow-sm font-bold backdrop-blur-md'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              Gaji
            </Link>

            {/* PESAN SIARAN */}
            <Link
              href="/pesan-siaran"
              onClick={handleLinkClick}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isBroadcastActive
                  ? 'bg-white/25 text-white shadow-sm font-bold backdrop-blur-md'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              Pesan Siaran
            </Link>

            {/* EMERGENCY SOS */}
            <Link
              href="/emergency"
              onClick={handleLinkClick}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                isEmergencyActive
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'text-rose-200 hover:text-white hover:bg-rose-500/25'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-300" />
              <span>SOS</span>
            </Link>
          </nav>

          {/* USER ACTIONS & PROFILE */}
          <div className="flex items-center space-x-2">
            {/* Password Modal Button */}
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(true)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white backdrop-blur-md border border-white/10 transition shadow-sm"
              title="Ubah Password Akun"
            >
              <KeyRound className="w-4 h-4" />
            </button>

            {/* Logout Action */}
            <button
              type="button"
              onClick={() => {
                if (confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
                  alert('Sesi administrator telah selesai.');
                }
              }}
              className="p-2 rounded-full bg-white/10 hover:bg-rose-500/20 text-rose-200 hover:text-white backdrop-blur-md border border-white/10 transition shadow-sm"
              title="Keluar dari Sistem"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* User Avatar Chip */}
            <div className="hidden sm:flex items-center space-x-2 pl-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-teal-300 flex items-center justify-center text-slate-950 font-black text-xs shadow-md border border-white/30">
                A
              </div>
            </div>

            {/* Mobile Hamburger Toggle */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-white/90 hover:text-white rounded-xl bg-white/10 backdrop-blur-md border border-white/10"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================
            MOBILE ACCORDION DRAWER
            ======================================================== */}
        {isMobileMenuOpen && (
          <div className="lg:hidden max-w-[1440px] mx-auto mt-3 bg-slate-900/95 backdrop-blur-2xl border border-white/15 rounded-3xl p-4 shadow-2xl space-y-2 animate-in fade-in zoom-in-95 duration-150">
            <Link
              href="/"
              onClick={handleLinkClick}
              className={`block px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                isHomeActive ? 'bg-white/20 text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Overview
            </Link>

            <div className="pt-1 pb-1">
              <span className="block px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Data Induk
              </span>
              <div className="space-y-1 pl-2 mt-1">
                <Link
                  href="/datainduk/area"
                  onClick={handleLinkClick}
                  className="block px-4 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/10"
                >
                  Area & Geofence
                </Link>
                <Link
                  href="/datainduk/checkpoint"
                  onClick={handleLinkClick}
                  className="block px-4 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/10"
                >
                  Titik Checkpoint QR
                </Link>
                <Link
                  href="/datainduk/personil"
                  onClick={handleLinkClick}
                  className="block px-4 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/10"
                >
                  Data Personil
                </Link>
              </div>
            </div>

            <Link
              href="/absensi"
              onClick={handleLinkClick}
              className={`block px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                isAbsensiActive ? 'bg-white/20 text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Absensi
            </Link>

            <Link
              href="/laporan"
              onClick={handleLinkClick}
              className={`block px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                isLaporanActive ? 'bg-white/20 text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Laporan Operasional
            </Link>

            <Link
              href="/gaji"
              onClick={handleLinkClick}
              className={`block px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                isGajiActive ? 'bg-white/20 text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Gaji & Rekap
            </Link>

            <Link
              href="/pesan-siaran"
              onClick={handleLinkClick}
              className={`block px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                isBroadcastActive ? 'bg-white/20 text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Pesan Siaran
            </Link>

            <Link
              href="/emergency"
              onClick={handleLinkClick}
              className={`block px-4 py-2.5 rounded-xl text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition ${
                isEmergencyActive ? 'bg-rose-600 text-white' : ''
              }`}
            >
              Pusat SOS Darurat
            </Link>
          </div>
        )}
      </header>

      {/* Global Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
};
