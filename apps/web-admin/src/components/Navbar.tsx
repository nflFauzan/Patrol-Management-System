'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Database,
  CalendarCheck,
  FileText,
  DollarSign,
  Megaphone,
  AlertCircle,
  Printer,
  KeyRound,
  LogOut,
  ChevronDown,
  ChevronRight,
  Globe,
  Building,
  Users,
  Menu,
  X,
  ExternalLink,
  Shield,
  Briefcase,
  Leaf,
  Car,
  MapPin,
  Calendar,
  List,
  Monitor
} from 'lucide-react';
import { useData } from '../lib/DataContext';
import { ChangePasswordModal } from './ChangePasswordModal';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { activeSosAlert, setActiveSosAlert } = useData();

  // Active dropdown state: click-to-open and stays open!
  const [activeDropdown, setActiveDropdown] = useState<'DATA_INDUK' | 'ABSENSI' | 'LAPORAN' | null>(null);
  const [isSecuritySubmenuOpen, setIsSecuritySubmenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const navRef = useRef<HTMLElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
        setIsSecuritySubmenuOpen(false);
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
  const isExportActive = pathname.startsWith('/export-laporan');

  const toggleDropdown = (menu: 'DATA_INDUK' | 'ABSENSI' | 'LAPORAN') => {
    setActiveDropdown((prev) => (prev === menu ? null : menu));
    setIsSecuritySubmenuOpen(false);
  };

  const handleLinkClick = () => {
    setActiveDropdown(null);
    setIsSecuritySubmenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full shadow-lg" ref={navRef}>
        {/* ========================================================
            EMERGENCY SOS DARURAT BANNER (JIKA AKTIF)
            ======================================================== */}
        {activeSosAlert && (
          <div className="bg-rose-600 text-white border-b-2 border-rose-800 px-4 py-2.5 shadow-2xl animate-pulse flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3">
              <div className="p-1.5 bg-white text-rose-600 rounded-lg shadow animate-bounce">
                <AlertCircle className="w-5 h-5" />
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
            MAIN NAVBAR (100% PARITY DENGAN PATROLI.SITE)
            ======================================================== */}
        <nav className="patroli-nav text-white px-4 lg:px-6 py-2 border-b border-white/5">
          <div className="max-w-[1440px] mx-auto flex items-center justify-between">
            {/* BRAND LOGO & TITLE */}
            <div className="flex items-center space-x-3">
              <Link href="/" onClick={handleLinkClick} className="flex items-center space-x-2.5 group">
                <div className="w-11 h-11 bg-white rounded-[10px] p-1 flex items-center justify-center patroli-brand-img group-hover:scale-105 transition shadow-sm">
                  <div className="w-full h-full border border-slate-300 rounded-[8px] flex flex-col items-center justify-center p-0.5 text-center">
                    <Building className="w-4 h-4 text-slate-700" />
                    <span className="text-[7px] font-black text-slate-800 leading-tight uppercase">
                      LOGO
                    </span>
                  </div>
                </div>
                <span className="font-bold text-sm tracking-wider text-white uppercase brand-text">
                  TES-PT
                </span>
              </Link>
            </div>

            {/* DESKTOP NAVIGATION MENU */}
            <div className="hidden lg:flex items-center space-x-0.5">
              {/* HOME */}
              <Link
                href="/"
                onClick={handleLinkClick}
                className={`patroli-nav-link ${isHomeActive ? 'active' : ''}`}
                title="Home Dashboard"
              >
                <Home className="w-4 h-4" />
                <small>Home</small>
              </Link>

              {/* DATA INDUK (DROPDOWN) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown('DATA_INDUK')}
                  className={`patroli-nav-link flex flex-col items-center justify-center cursor-pointer ${
                    isDataIndukActive || activeDropdown === 'DATA_INDUK' ? 'active' : ''
                  }`}
                  aria-expanded={activeDropdown === 'DATA_INDUK'}
                >
                  <div className="flex items-center gap-1">
                    <Database className="w-4 h-4" />
                    <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === 'DATA_INDUK' ? 'rotate-180' : ''}`} />
                  </div>
                  <small>Data Induk</small>
                </button>

                {activeDropdown === 'DATA_INDUK' && (
                  <div
                    className="absolute left-0 top-full mt-1.5 patroli-dropdown-menu animate-in fade-in zoom-in-95 duration-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link
                      href="/datainduk/area"
                      onClick={handleLinkClick}
                      className={`patroli-dropdown-item ${pathname === '/datainduk/area' ? 'active' : ''}`}
                    >
                      <Globe className="w-4 h-4 text-cyan-400" />
                      <span>Area</span>
                    </Link>

                    <div className="patroli-dropdown-divider" />

                    <Link
                      href="/datainduk/checkpoint"
                      onClick={handleLinkClick}
                      className={`patroli-dropdown-item ${pathname === '/datainduk/checkpoint' ? 'active' : ''}`}
                    >
                      <Building className="w-4 h-4 text-emerald-400" />
                      <span>Checkpoint</span>
                    </Link>

                    <div className="patroli-dropdown-divider" />

                    <Link
                      href="/datainduk/personil"
                      onClick={handleLinkClick}
                      className={`patroli-dropdown-item ${pathname === '/datainduk/personil' ? 'active' : ''}`}
                    >
                      <Users className="w-4 h-4 text-amber-400" />
                      <span>Personil</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* ABSENSI (DROPDOWN) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown('ABSENSI')}
                  className={`patroli-nav-link flex flex-col items-center justify-center cursor-pointer ${
                    isAbsensiActive || activeDropdown === 'ABSENSI' ? 'active' : ''
                  }`}
                  aria-expanded={activeDropdown === 'ABSENSI'}
                >
                  <div className="flex items-center gap-1">
                    <CalendarCheck className="w-4 h-4" />
                    <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === 'ABSENSI' ? 'rotate-180' : ''}`} />
                  </div>
                  <small>Absensi</small>
                </button>

                {activeDropdown === 'ABSENSI' && (
                  <div
                    className="absolute left-0 top-full mt-1.5 patroli-dropdown-menu animate-in fade-in zoom-in-95 duration-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link
                      href="/absensi"
                      onClick={handleLinkClick}
                      className="patroli-dropdown-item"
                    >
                      <List className="w-4 h-4 text-emerald-400" />
                      <span>Semua Data</span>
                    </Link>

                    <Link
                      href="/absensi"
                      onClick={handleLinkClick}
                      className="patroli-dropdown-item"
                    >
                      <Monitor className="w-4 h-4 text-cyan-400" />
                      <span>Monitoring</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* LAPORAN (DROPDOWN WITH SUBMENU) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown('LAPORAN')}
                  className={`patroli-nav-link flex flex-col items-center justify-center cursor-pointer ${
                    isLaporanActive || activeDropdown === 'LAPORAN' ? 'active' : ''
                  }`}
                  aria-expanded={activeDropdown === 'LAPORAN'}
                >
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === 'LAPORAN' ? 'rotate-180' : ''}`} />
                  </div>
                  <small>Laporan</small>
                </button>

                {activeDropdown === 'LAPORAN' && (
                  <div
                    className="absolute left-0 top-full mt-1.5 patroli-dropdown-menu w-56 animate-in fade-in zoom-in-95 duration-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Security Submenu Parent */}
                    <div
                      className="relative"
                      onMouseEnter={() => setIsSecuritySubmenuOpen(true)}
                      onMouseLeave={() => setIsSecuritySubmenuOpen(false)}
                    >
                      <button
                        type="button"
                        onClick={() => setIsSecuritySubmenuOpen(!isSecuritySubmenuOpen)}
                        className="patroli-dropdown-item justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-400" />
                          <span>Security</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-white/50" />
                      </button>

                      {/* Nested Flyout Submenu */}
                      {isSecuritySubmenuOpen && (
                        <div className="absolute left-full top-0 ml-1 patroli-dropdown-menu w-44 shadow-2xl animate-in fade-in duration-100">
                          <Link
                            href="/laporan"
                            onClick={handleLinkClick}
                            className="patroli-dropdown-item"
                          >
                            <span>Anggota</span>
                          </Link>
                          <Link
                            href="/laporan"
                            onClick={handleLinkClick}
                            className="patroli-dropdown-item"
                          >
                            <span>Komandan</span>
                          </Link>
                          <Link
                            href="/laporan"
                            onClick={handleLinkClick}
                            className="patroli-dropdown-item"
                          >
                            <span>Chief</span>
                          </Link>
                        </div>
                      )}
                    </div>

                    <Link
                      href="/laporan"
                      onClick={handleLinkClick}
                      className="patroli-dropdown-item"
                    >
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      <span>Staff Operasional</span>
                    </Link>

                    <Link
                      href="/laporan"
                      onClick={handleLinkClick}
                      className="patroli-dropdown-item"
                    >
                      <Leaf className="w-4 h-4 text-emerald-400" />
                      <span>Cleaning Service</span>
                    </Link>

                    <Link
                      href="/laporan"
                      onClick={handleLinkClick}
                      className="patroli-dropdown-item"
                    >
                      <Car className="w-4 h-4 text-amber-400" />
                      <span>Driver</span>
                    </Link>

                    <div className="patroli-dropdown-divider" />

                    <Link
                      href="/laporan"
                      onClick={handleLinkClick}
                      className="patroli-dropdown-item font-bold"
                    >
                      <MapPin className="w-4 h-4 text-rose-400" />
                      <span>Tracking Patroli</span>
                    </Link>

                    <div className="patroli-dropdown-divider" />

                    <Link
                      href="/laporan"
                      onClick={handleLinkClick}
                      className="patroli-dropdown-item font-bold"
                    >
                      <Calendar className="w-4 h-4 text-cyan-400" />
                      <span>Rekap Kegiatan</span>
                    </Link>

                    <div className="patroli-dropdown-divider" />

                    <Link
                      href="/laporan"
                      onClick={handleLinkClick}
                      className="patroli-dropdown-item font-bold"
                    >
                      <Shield className="w-4 h-4 text-indigo-400" />
                      <span>Monitoring Kegiatan</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* GAJI */}
              <Link
                href="/gaji"
                onClick={handleLinkClick}
                className={`patroli-nav-link ${isGajiActive ? 'active' : ''}`}
                title="Laporan Gaji Personil"
              >
                <DollarSign className="w-4 h-4" />
                <small>Gaji</small>
              </Link>

              {/* PESAN SIARAN */}
              <Link
                href="/pesan-siaran"
                onClick={handleLinkClick}
                className={`patroli-nav-link ${isBroadcastActive ? 'active' : ''}`}
                title="Pesan Siaran"
              >
                <Megaphone className="w-4 h-4" />
                <small>Pesan Siaran</small>
              </Link>

              {/* EMERGENCY */}
              <Link
                href="/emergency"
                onClick={handleLinkClick}
                className={`patroli-nav-link ${isEmergencyActive ? 'active' : ''}`}
                title="Emergency Log"
              >
                <AlertCircle className="w-4 h-4" />
                <small>Emergency</small>
              </Link>

              {/* EXPORT LAPORAN */}
              <Link
                href="/export-laporan"
                onClick={handleLinkClick}
                className={`patroli-nav-link ${isExportActive ? 'active' : ''}`}
                title="Export Laporan"
              >
                <Printer className="w-4 h-4" />
                <small>Export Laporan</small>
              </Link>

              {/* UBAH PASSWORD */}
              <button
                type="button"
                onClick={() => {
                  setActiveDropdown(null);
                  setIsPasswordModalOpen(true);
                }}
                className="patroli-nav-link cursor-pointer"
                title="Ubah Password"
              >
                <KeyRound className="w-4 h-4" />
                <small>Ubah Password</small>
              </button>
            </div>

            {/* LOGOUT */}
            <div className="hidden lg:flex items-center">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
                    alert('Sesi administrator telah selesai.');
                  }
                }}
                className="patroli-nav-link cursor-pointer text-rose-300 hover:text-white"
                title="Logout dari akun"
              >
                <LogOut className="w-4 h-4" />
                <small>Logout</small>
              </button>
            </div>

            {/* MOBILE HAMBURGER BUTTON */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* MOBILE ACCORDION MENU */}
          {isMobileMenuOpen && (
            <div className="lg:hidden mt-3 pt-3 border-t border-white/10 space-y-2 pb-2 text-sm font-semibold">
              <Link
                href="/"
                onClick={handleLinkClick}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10"
              >
                <Home className="w-4 h-4 text-blue-400" />
                <span>Home</span>
              </Link>

              <div className="px-3 pt-2 text-[11px] font-bold text-slate-400 uppercase">
                Data Induk
              </div>
              <Link
                href="/datainduk/area"
                onClick={handleLinkClick}
                className="flex items-center space-x-2 pl-6 py-1.5 rounded-lg hover:bg-white/10 text-xs"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Area</span>
              </Link>
              <Link
                href="/datainduk/checkpoint"
                onClick={handleLinkClick}
                className="flex items-center space-x-2 pl-6 py-1.5 rounded-lg hover:bg-white/10 text-xs"
              >
                <Building className="w-3.5 h-3.5 text-emerald-400" />
                <span>Checkpoint</span>
              </Link>
              <Link
                href="/datainduk/personil"
                onClick={handleLinkClick}
                className="flex items-center space-x-2 pl-6 py-1.5 rounded-lg hover:bg-white/10 text-xs"
              >
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>Personil</span>
              </Link>

              <div className="px-3 pt-2 text-[11px] font-bold text-slate-400 uppercase">
                Absensi & Laporan
              </div>
              <Link
                href="/absensi"
                onClick={handleLinkClick}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10"
              >
                <CalendarCheck className="w-4 h-4 text-emerald-400" />
                <span>Absensi</span>
              </Link>
              <Link
                href="/laporan"
                onClick={handleLinkClick}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10"
              >
                <FileText className="w-4 h-4 text-purple-400" />
                <span>Laporan</span>
              </Link>
              <Link
                href="/gaji"
                onClick={handleLinkClick}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10"
              >
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Gaji</span>
              </Link>
              <Link
                href="/pesan-siaran"
                onClick={handleLinkClick}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10"
              >
                <Megaphone className="w-4 h-4 text-amber-400" />
                <span>Pesan Siaran</span>
              </Link>
              <Link
                href="/emergency"
                onClick={handleLinkClick}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10"
              >
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>Emergency</span>
              </Link>
              <Link
                href="/export-laporan"
                onClick={handleLinkClick}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10"
              >
                <Printer className="w-4 h-4 text-cyan-400" />
                <span>Export Laporan</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsPasswordModalOpen(true);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10 text-left"
              >
                <KeyRound className="w-4 h-4 text-yellow-400" />
                <span>Ubah Password</span>
              </button>
            </div>
          )}
        </nav>
      </header>

      {/* MODAL UBAH PASSWORD */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
};
