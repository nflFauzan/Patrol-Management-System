'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  Activity,
  QrCode,
  Clock,
  ShieldAlert,
  Users,
  UserCheck,
  Building2,
  KeyRound,
  FileBarChart,
  FileSpreadsheet,
  DollarSign,
  Radio,
  LogOut,
  ChevronDown,
  ChevronRight,
  FolderTree,
  Navigation,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { useData } from '../../lib/DataContext';
import { ChangePasswordModal } from '../ChangePasswordModal';

export const AppSidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout, hasPermission, hasAnyPermission } = useAuth();
  const { activeSosAlert, sites } = useData();

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Tree expansion state (auto-opens if path is inside)
  const isDataIndukRoute = pathname.startsWith('/datainduk');
  const isLaporanRoute = pathname.startsWith('/laporan') || pathname.startsWith('/export-laporan') || pathname.startsWith('/gaji') || pathname.startsWith('/pesan-siaran');

  const [isDataIndukOpen, setIsDataIndukOpen] = useState(true);
  const [isLaporanOpen, setIsLaporanOpen] = useState(true);

  // Permission Checks
  const canAccessDataInduk = hasAnyPermission(['DATA_INDUK:VIEW', 'USER:APPROVE', 'RBAC:MANAGE']);
  const canViewDataInduk = hasPermission('DATA_INDUK:VIEW');
  const canApproveUser = hasPermission('USER:APPROVE');
  const canManageRbac = hasPermission('RBAC:MANAGE');
  const canViewAbsensi = hasPermission('ABSENSI:VIEW');
  const canViewLaporan = hasAnyPermission(['LAPORAN:EXPORT', 'PATROL:VIEW']);
  const canAccessGaji = hasPermission('GAJI:ACCESS');
  const canSendBroadcast = hasPermission('BROADCAST:SEND');

  const getInitials = (name?: string) => {
    if (!name) return 'AD';
    return name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <>
      <aside className="w-[260px] shrink-0 h-screen sticky top-0 flex flex-col justify-between bg-[#263442] border-r border-[#1B2631] z-30 select-none font-sans text-slate-300">
        {/* ========================================================
            HEADER: Brand Corporate Identity (Modern Skeuomorphism)
            ======================================================== */}
        <div className="p-4 border-b border-[#334454]/60">
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            {/* Raised Cyan Badge with Shield */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#38BDF8] via-[#0284C7] to-[#0369A1] text-white flex items-center justify-center shadow-md shadow-sky-950/40 border-t border-white/40 group-hover:brightness-110 transition duration-150">
              <Shield className="w-5 h-5 text-white drop-shadow-sm" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-extrabold tracking-tight text-white group-hover:text-sky-300 transition">
                Patroli Site
              </span>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                Enterprise Command
              </span>
            </div>
          </Link>
        </div>

        {/* ========================================================
            NAVIGATION: Structured Single Panel with Trees
            ======================================================== */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-700">
          {/* GROUP 1: OPERASIONAL */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Operasional
            </div>
            <nav className="space-y-1">
              {/* Komando Utama */}
              <Link
                href="/dashboard"
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  pathname === '/dashboard'
                    ? 'bg-gradient-to-r from-[#0284C7] to-[#38BDF8] text-white shadow-sky-glow border-t border-white/30'
                    : 'text-slate-300 hover:text-white hover:bg-[#2F4152]/80'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <Activity
                    className={`w-4 h-4 shrink-0 ${
                      pathname === '/dashboard' ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">Komando Utama</span>
                </div>
              </Link>

              {/* Monitoring Patroli */}
              <Link
                href="/validasi-patroli"
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  pathname.startsWith('/validasi-patroli')
                    ? 'bg-gradient-to-r from-[#0284C7] to-[#38BDF8] text-white shadow-sky-glow border-t border-white/30'
                    : 'text-slate-300 hover:text-white hover:bg-[#2F4152]/80'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <QrCode
                    className={`w-4 h-4 shrink-0 ${
                      pathname.startsWith('/validasi-patroli') ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">Monitoring Patroli</span>
                </div>
              </Link>

              {/* Pemantauan Absensi */}
              {canViewAbsensi && (
                <Link
                  href="/absensi"
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    pathname.startsWith('/absensi')
                      ? 'bg-gradient-to-r from-[#0284C7] to-[#38BDF8] text-white shadow-sky-glow border-t border-white/30'
                      : 'text-slate-300 hover:text-white hover:bg-[#2F4152]/80'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <Clock
                      className={`w-4 h-4 shrink-0 ${
                        pathname.startsWith('/absensi') ? 'text-white' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">Pemantauan Absensi</span>
                  </div>
                </Link>
              )}

              {/* Pusat Darurat SOS */}
              <Link
                href="/emergency"
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  pathname.startsWith('/emergency')
                    ? 'bg-gradient-to-r from-[#EF4444] to-[#B91C1C] text-white shadow-md shadow-rose-950/40 border-t border-white/30'
                    : 'text-slate-300 hover:text-white hover:bg-[#2F4152]/80'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <ShieldAlert
                    className={`w-4 h-4 shrink-0 ${
                      activeSosAlert ? 'text-rose-400 animate-bounce' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">Pusat Darurat SOS</span>
                </div>
                {activeSosAlert && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-rose-500 text-white animate-pulse">
                    AKTIF
                  </span>
                )}
              </Link>
            </nav>
          </div>

          {/* GROUP 2: DATA INDUK (Tree Submenu) */}
          {canAccessDataInduk && (
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setIsDataIndukOpen(!isDataIndukOpen)}
                className="w-full flex items-center justify-between px-3 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase hover:text-slate-200 transition"
              >
                <div className="flex items-center space-x-1.5">
                  <FolderTree className="w-3 h-3 text-slate-500" />
                  <span>Data Induk</span>
                </div>
                {isDataIndukOpen ? (
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                )}
              </button>

              {isDataIndukOpen && (
                <div className="ml-4 pl-3 border-l border-slate-600/50 space-y-0.5 py-1">
                  {canViewDataInduk && (
                    <Link
                      href="/datainduk/area"
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                        pathname.startsWith('/datainduk/area')
                          ? 'text-[#38BDF8] font-bold bg-[#1E2B37]'
                          : 'text-slate-300 hover:text-white hover:bg-[#2F4152]/60'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Area & Site</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700/80 text-slate-300">
                        {sites?.length || 0}
                      </span>
                    </Link>
                  )}

                  {canViewDataInduk && (
                    <Link
                      href="/datainduk/checkpoint"
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition ${
                        pathname.startsWith('/datainduk/checkpoint')
                          ? 'text-[#38BDF8] font-bold bg-[#1E2B37]'
                          : 'text-slate-300 hover:text-white hover:bg-[#2F4152]/60'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>Checkpoint QR</span>
                    </Link>
                  )}

                  {canViewDataInduk && (
                    <Link
                      href="/datainduk/personil"
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition ${
                        pathname.startsWith('/datainduk/personil')
                          ? 'text-[#38BDF8] font-bold bg-[#1E2B37]'
                          : 'text-slate-300 hover:text-white hover:bg-[#2F4152]/60'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5 shrink-0" />
                      <span>Personil</span>
                    </Link>
                  )}

                  {canApproveUser && (
                    <Link
                      href="/datainduk/approval"
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition ${
                        pathname.startsWith('/datainduk/approval')
                          ? 'text-[#38BDF8] font-bold bg-[#1E2B37]'
                          : 'text-slate-300 hover:text-white hover:bg-[#2F4152]/60'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>Persetujuan Akun</span>
                    </Link>
                  )}

                  {canManageRbac && (
                    <Link
                      href="/datainduk/rbac"
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition ${
                        pathname.startsWith('/datainduk/rbac')
                          ? 'text-[#38BDF8] font-bold bg-[#1E2B37]'
                          : 'text-slate-300 hover:text-white hover:bg-[#2F4152]/60'
                      }`}
                    >
                      <KeyRound className="w-3.5 h-3.5 shrink-0" />
                      <span>Hak Akses & Role</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* GROUP 3: REKAP & LAPORAN (Tree Submenu) */}
          {(canViewLaporan || canAccessGaji || canSendBroadcast) && (
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setIsLaporanOpen(!isLaporanOpen)}
                className="w-full flex items-center justify-between px-3 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase hover:text-slate-200 transition"
              >
                <div className="flex items-center space-x-1.5">
                  <FileBarChart className="w-3 h-3 text-slate-500" />
                  <span>Rekap & Laporan</span>
                </div>
                {isLaporanOpen ? (
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                )}
              </button>

              {isLaporanOpen && (
                <div className="ml-4 pl-3 border-l border-slate-600/50 space-y-0.5 py-1">
                  {canViewLaporan && (
                    <Link
                      href="/laporan"
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition ${
                        pathname === '/laporan' || pathname.startsWith('/laporan/')
                          ? 'text-[#38BDF8] font-bold bg-[#1E2B37]'
                          : 'text-slate-300 hover:text-white hover:bg-[#2F4152]/60'
                      }`}
                    >
                      <FileBarChart className="w-3.5 h-3.5 shrink-0" />
                      <span>Laporan Operasional</span>
                    </Link>
                  )}

                  {canViewLaporan && (
                    <Link
                      href="/export-laporan"
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition ${
                        pathname.startsWith('/export-laporan')
                          ? 'text-[#38BDF8] font-bold bg-[#1E2B37]'
                          : 'text-slate-300 hover:text-white hover:bg-[#2F4152]/60'
                      }`}
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
                      <span>Pusat Ekspor Dokumen</span>
                    </Link>
                  )}

                  {canAccessGaji && (
                    <Link
                      href="/gaji"
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition ${
                        pathname.startsWith('/gaji')
                          ? 'text-[#38BDF8] font-bold bg-[#1E2B37]'
                          : 'text-slate-300 hover:text-white hover:bg-[#2F4152]/60'
                      }`}
                    >
                      <DollarSign className="w-3.5 h-3.5 shrink-0" />
                      <span>Penggajian (Payroll)</span>
                    </Link>
                  )}

                  {canSendBroadcast && (
                    <Link
                      href="/pesan-siaran"
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition ${
                        pathname.startsWith('/pesan-siaran')
                          ? 'text-[#38BDF8] font-bold bg-[#1E2B37]'
                          : 'text-slate-300 hover:text-white hover:bg-[#2F4152]/60'
                      }`}
                    >
                      <Radio className="w-3.5 h-3.5 shrink-0" />
                      <span>Pesan Siaran</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================================
            FOOTER: User Profile & Quick Actions
            ======================================================== */}
        <div className="p-3 border-t border-[#334454]/60 bg-[#1E2B37]/60">
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#1E2B37] border border-[#334454] shadow-sm">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0284C7] to-[#38BDF8] text-white flex items-center justify-center font-bold text-xs shrink-0 relative shadow-sm">
                {getInitials(user?.fullName)}
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-[#1E2B37]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate">
                  {user?.fullName || 'Administrator'}
                </span>
                <span className="text-[10px] text-slate-400 truncate capitalize">
                  {user?.role?.replace('_', ' ').toLowerCase() || 'Super Admin'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-0.5 shrink-0 ml-1">
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                title="Ganti Kata Sandi"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition"
              >
                <KeyRound className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={logout}
                title="Keluar dari Sistem"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
};
