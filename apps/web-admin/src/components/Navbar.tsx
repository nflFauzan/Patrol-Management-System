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
  Sparkles,
  Smartphone,
  UserCheck,
  Shield,
} from 'lucide-react';
import { useData } from '../lib/DataContext';
import { useAuth } from '../lib/AuthContext';
import { ChangePasswordModal } from './ChangePasswordModal';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { activeSosAlert, setActiveSosAlert } = useData();
  const { user, logout, hasPermission, hasAnyPermission } = useAuth();

  // Active dropdown state
  const [activeDropdown, setActiveDropdown] = useState<'DATA_INDUK' | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const navRef = useRef<HTMLElement>(null);

  // Permission Checks
  const canAccessDataInduk = hasAnyPermission(['DATA_INDUK:VIEW', 'USER:APPROVE', 'RBAC:MANAGE']);
  const canViewDataInduk = hasPermission('DATA_INDUK:VIEW');
  const canApproveUser = hasPermission('USER:APPROVE');
  const canManageRbac = hasPermission('RBAC:MANAGE');
  const canViewAbsensi = hasPermission('ABSENSI:VIEW');
  const canViewLaporan = hasAnyPermission(['LAPORAN:EXPORT', 'PATROL:VIEW']);
  const canAccessGaji = hasPermission('GAJI:ACCESS');
  const canSendBroadcast = hasPermission('BROADCAST:SEND');
  const canResolveSos = hasPermission('SOS:RESOLVE');

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
  const isDashboardActive = pathname === '/dashboard' || pathname === '/';
  const isDataIndukActive = pathname.startsWith('/datainduk');
  const isAbsensiActive = pathname.startsWith('/absensi');
  const isLaporanActive = pathname.startsWith('/laporan');
  const isGajiActive = pathname.startsWith('/gaji');
  const isBroadcastActive = pathname.startsWith('/pesan-siaran');
  const isEmergencyActive = pathname.startsWith('/emergency');

  const toggleDropdown = (menu: 'DATA_INDUK') => {
    setActiveDropdown((prev) => (prev === menu ? null : menu));
  };

  // Close dropdowns when clicking outside or upon route change
  useEffect(() => {
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLinkClick = () => {
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
          <Link href="/dashboard" onClick={handleLinkClick} className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-all">
              <Building2 className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div className="flex flex-col">
              <span className="brand-text font-extrabold text-sm tracking-wider text-white">TES-PT</span>
              <span className="text-[10px] text-teal-200/80 font-medium tracking-tight">Enterprise Ops</span>
            </div>
          </Link>

          {/* DESKTOP FLOATING PILL NAVIGATION */}
          <nav className="hidden lg:flex items-center bg-white/10 backdrop-blur-xl border border-white/15 rounded-full p-1.5 shadow-2xl shadow-slate-950/20 space-x-0.5">
            {/* OVERVIEW */}
            <Link
              href="/dashboard"
              onClick={handleLinkClick}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${isDashboardActive
                  ? 'bg-white/25 text-white shadow-sm font-bold backdrop-blur-md'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
            >
              Overview
            </Link>

            {/* DATA INDUK (CLEAN POPOVER DROPDOWN) */}
            {canAccessDataInduk && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown('DATA_INDUK')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${isDataIndukActive || activeDropdown === 'DATA_INDUK'
                      ? 'bg-white/25 text-white shadow-sm font-bold'
                      : 'text-slate-200 hover:text-white hover:bg-white/10'
                    }`}
                >
                  <span>Data Induk</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform ${activeDropdown === 'DATA_INDUK' ? 'rotate-180' : ''
                      }`}
                  />
                </button>

                {activeDropdown === 'DATA_INDUK' && (
                  <div
                    className="absolute left-0 top-full mt-2.5 w-52 bg-slate-900/95 backdrop-blur-xl border border-white/15 rounded-2xl p-2 shadow-2xl shadow-slate-950/40 z-50 animate-in fade-in zoom-in-95 duration-150"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {canViewDataInduk && (
                      <>
                        <Link
                          href="/datainduk/area"
                          onClick={handleLinkClick}
                          className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${pathname === '/datainduk/area'
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
                          className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${pathname === '/datainduk/checkpoint'
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
                          className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${pathname === '/datainduk/personil'
                              ? 'bg-white/20 text-white font-bold'
                              : 'text-slate-300 hover:text-white hover:bg-white/10'
                            }`}
                        >
                          <Users className="w-4 h-4 text-amber-400" />
                          <span>Data Personil</span>
                        </Link>
                      </>
                    )}
                    {canApproveUser && (
                      <Link
                        href="/datainduk/approval"
                        onClick={handleLinkClick}
                        className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${pathname === '/datainduk/approval'
                            ? 'bg-white/20 text-white font-bold'
                            : 'text-slate-300 hover:text-white hover:bg-white/10'
                          }`}
                      >
                        <UserCheck className="w-4 h-4 text-blue-400" />
                        <div className="flex items-center justify-between flex-1">
                          <span>Antrean Approval</span>
                          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                        </div>
                      </Link>
                    )}
                    {canManageRbac && (
                      <Link
                        href="/datainduk/rbac"
                        onClick={handleLinkClick}
                        className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${pathname === '/datainduk/rbac'
                            ? 'bg-white/20 text-white font-bold'
                            : 'text-slate-300 hover:text-white hover:bg-white/10'
                          }`}
                      >
                        <Shield className="w-4 h-4 text-purple-400" />
                        <span>Hak Akses & Role</span>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ABSENSI */}
            {canViewAbsensi && (
              <Link
                href="/absensi"
                onClick={handleLinkClick}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${isAbsensiActive
                    ? 'bg-white/25 text-white shadow-sm font-bold backdrop-blur-md'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
              >
                Absensi
              </Link>
            )}

            {/* LAPORAN (DIRECT LINK TO UNIFIED OPERATIONS HUB - NO TRICKY FLYOUT!) */}
            {canViewLaporan && (
              <Link
                href="/laporan"
                onClick={handleLinkClick}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${isLaporanActive
                    ? 'bg-white/25 text-white shadow-sm font-bold backdrop-blur-md'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
              >
                Laporan
              </Link>
            )}

            {/* GAJI (PRESERVED AS REQUESTED) */}
            {canAccessGaji && (
              <Link
                href="/gaji"
                onClick={handleLinkClick}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${isGajiActive
                    ? 'bg-white/25 text-white shadow-sm font-bold backdrop-blur-md'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
              >
                Gaji
              </Link>
            )}

            {/* PESAN SIARAN */}
            {canSendBroadcast && (
              <Link
                href="/pesan-siaran"
                onClick={handleLinkClick}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${isBroadcastActive
                    ? 'bg-white/25 text-white shadow-sm font-bold backdrop-blur-md'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
              >
                Pesan Siaran
              </Link>
            )}

            {/* EMERGENCY SOS */}
            {canResolveSos && (
              <Link
                href="/emergency"
                onClick={handleLinkClick}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${isEmergencyActive
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                    : 'text-rose-200 hover:text-white hover:bg-rose-500/25'
                  }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-300" />
                <span>SOS</span>
              </Link>
            )}
          </nav>

          {/* USER ACTIONS & PROFILE */}
          <div className="flex items-center space-x-2">
            {/* Field PWA Mode Switcher */}
            <Link
              href="/validasi-patroli"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 hover:text-white border border-cyan-400/30 text-xs font-semibold transition shadow-sm"
              title="Buka Tampilan Lapangan Satpam / Cleaning / Driver"
            >
              <Smartphone className="w-3.5 h-3.5 text-cyan-300" />
              <span className="hidden md:inline">Mode Lapangan</span>
            </Link>

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
                if (confirm('Apakah Anda yakin ingin keluar dari Command Center?')) {
                  logout();
                }
              }}
              className="p-2 rounded-full bg-white/10 hover:bg-rose-500/30 text-rose-200 hover:text-white backdrop-blur-md border border-white/10 transition shadow-sm"
              title="Keluar dari Sistem (Logout)"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* User Avatar & Name Chip */}
            <div className="hidden sm:flex items-center space-x-2 pl-2">
              <div className="text-right">
                <div className="text-xs font-bold text-white truncate max-w-[130px]" title={user?.fullName || 'Administrator'}>
                  {user?.fullName || 'Administrator'}
                </div>
                <div className="text-[10px] text-cyan-300 font-semibold truncate max-w-[130px]">
                  {user?.securityRank || user?.role || 'Super Admin'}
                </div>
              </div>
              <div
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-teal-300 flex items-center justify-center text-slate-950 font-black text-xs shadow-md border border-white/30"
                title={`${user?.fullName || 'User'} (${user?.role || ''})`}
              >
                {(user?.fullName || 'A').charAt(0).toUpperCase()}
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
              href="/dashboard"
              onClick={handleLinkClick}
              className={`block px-4 py-2.5 rounded-xl text-xs font-semibold transition ${isDashboardActive ? 'bg-white/20 text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
            >
              Overview
            </Link>

            {canAccessDataInduk && (
              <div className="pt-1 pb-1">
                <span className="block px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Data Induk
                </span>
                <div className="space-y-1 pl-2 mt-1">
                  {canViewDataInduk && (
                    <>
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
                    </>
                  )}
                  {canApproveUser && (
                    <Link
                      href="/datainduk/approval"
                      onClick={handleLinkClick}
                      className="block px-4 py-2 rounded-xl text-xs text-blue-300 hover:text-white hover:bg-white/10 font-semibold"
                    >
                      Antrean Approval
                    </Link>
                  )}
                  {canManageRbac && (
                    <Link
                      href="/datainduk/rbac"
                      onClick={handleLinkClick}
                      className="block px-4 py-2 rounded-xl text-xs text-purple-300 hover:text-white hover:bg-white/10 font-semibold"
                    >
                      Hak Akses & Role
                    </Link>
                  )}
                </div>
              </div>
            )}

            {canViewAbsensi && (
              <Link
                href="/absensi"
                onClick={handleLinkClick}
                className={`block px-4 py-2.5 rounded-xl text-xs font-semibold transition ${isAbsensiActive ? 'bg-white/20 text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
              >
                Absensi
              </Link>
            )}

            {canViewLaporan && (
              <Link
                href="/laporan"
                onClick={handleLinkClick}
                className={`block px-4 py-2.5 rounded-xl text-xs font-semibold transition ${isLaporanActive ? 'bg-white/20 text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
              >
                Laporan Operasional
              </Link>
            )}

            {canAccessGaji && (
              <Link
                href="/gaji"
                onClick={handleLinkClick}
                className={`block px-4 py-2.5 rounded-xl text-xs font-semibold transition ${isGajiActive ? 'bg-white/20 text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
              >
                Gaji & Rekap
              </Link>
            )}

            {canSendBroadcast && (
              <Link
                href="/pesan-siaran"
                onClick={handleLinkClick}
                className={`block px-4 py-2.5 rounded-xl text-xs font-semibold transition ${isBroadcastActive ? 'bg-white/20 text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
              >
                Pesan Siaran
              </Link>
            )}

            <Link
              href="/validasi-patroli"
              onClick={handleLinkClick}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition"
            >
              <Smartphone className="w-4 h-4 text-cyan-300" />
              <span>Buka Tampilan Lapangan (PWA)</span>
            </Link>

            {canResolveSos && (
              <Link
                href="/emergency"
                onClick={handleLinkClick}
                className={`block px-4 py-2.5 rounded-xl text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition ${isEmergencyActive ? 'bg-rose-600 text-white' : ''
                  }`}
              >
                Pusat SOS Darurat
              </Link>
            )}

            {/* Mobile User Info & Logout */}
            <div className="pt-2 mt-2 border-t border-white/10 flex items-center justify-between px-3">
              <div className="text-left">
                <div className="text-xs font-bold text-white">{user?.fullName || 'Administrator'}</div>
                <div className="text-[10px] text-cyan-300">{user?.role || 'Super Admin'}</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Keluar dari Command Center?')) {
                    logout();
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-600/30 text-rose-200 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            </div>
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
