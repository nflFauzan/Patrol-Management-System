'use client';

import React from 'react';
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
  X,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { useData } from '../../lib/DataContext';

interface MobileNavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNavigationDrawer: React.FC<MobileNavigationDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const pathname = usePathname();
  const { user, logout, hasPermission, hasAnyPermission } = useAuth();
  const { activeSosAlert } = useData();

  if (!isOpen) return null;

  const canAccessDataInduk = hasAnyPermission(['DATA_INDUK:VIEW', 'USER:APPROVE', 'RBAC:MANAGE']);
  const canViewDataInduk = hasPermission('DATA_INDUK:VIEW');
  const canApproveUser = hasPermission('USER:APPROVE');
  const canManageRbac = hasPermission('RBAC:MANAGE');
  const canViewAbsensi = hasPermission('ABSENSI:VIEW');
  const canViewLaporan = hasAnyPermission(['LAPORAN:EXPORT', 'PATROL:VIEW']);
  const canAccessGaji = hasPermission('GAJI:ACCESS');
  const canSendBroadcast = hasPermission('BROADCAST:SEND');

  const navLinks = [
    { title: 'Komando Utama', href: '/dashboard', icon: Activity, visible: true },
    { title: 'Monitoring Patroli', href: '/validasi-patroli', icon: QrCode, visible: true },
    { title: 'Pemantauan Absensi', href: '/absensi', icon: Clock, visible: canViewAbsensi },
    { title: 'Pusat Darurat SOS', href: '/emergency', icon: ShieldAlert, visible: true, badge: activeSosAlert ? 'AKTIF' : null },
    { title: 'Fasilitas & Area', href: '/datainduk/area', icon: Building2, visible: canViewDataInduk },
    { title: 'Checkpoint QR', href: '/datainduk/checkpoint', icon: MapPin, visible: canViewDataInduk },
    { title: 'Data Personil', href: '/datainduk/personil', icon: Users, visible: canViewDataInduk },
    { title: 'Persetujuan Akun', href: '/datainduk/approval', icon: UserCheck, visible: canApproveUser },
    { title: 'Hak Akses & Role', href: '/datainduk/rbac', icon: KeyRound, visible: canManageRbac },
    { title: 'Laporan Operasional', href: '/laporan', icon: FileBarChart, visible: canViewLaporan },
    { title: 'Pusat Ekspor Dokumen', href: '/export-laporan', icon: FileSpreadsheet, visible: canViewLaporan },
    { title: 'Penggajian (Payroll)', href: '/gaji', icon: DollarSign, visible: canAccessGaji },
    { title: 'Pesan Siaran', href: '/pesan-siaran', icon: Radio, visible: canSendBroadcast },
  ];

  return (
    <div className="fixed inset-0 z-50 flex select-none lg:hidden font-sans">
      {/* Backdrop scrim */}
      <div
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Drawer Canvas */}
      <div className="relative w-[85vw] max-w-[320px] bg-[#263442] h-full flex flex-col justify-between shadow-2xl z-10 text-slate-300 border-r border-[#1B2631]">
        {/* Header */}
        <div className="p-4 border-b border-[#334454] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#38BDF8] to-[#0284C7] text-white flex items-center justify-center shadow-md">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-sm font-extrabold text-white block">Patroli Site</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Menu Navigasi</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="px-4 py-3 bg-[#1E2B37] border-b border-[#334454]/60">
          <div className="text-xs font-bold text-white truncate">{user?.fullName || 'Administrator'}</div>
          <div className="text-[10px] text-sky-400 font-medium capitalize truncate">
            {user?.role?.replace('_', ' ').toLowerCase() || 'Super Admin'}
          </div>
        </div>

        {/* Links List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {navLinks
            .filter((item) => item.visible)
            .map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-gradient-to-r from-[#0284C7] to-[#38BDF8] text-white shadow-sky-glow'
                      : 'text-slate-300 hover:text-white hover:bg-[#2F4152]/80'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.title}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-rose-500 text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-[#334454] space-y-2 bg-[#1E2B37]/80">
          <Link
            href="/emergency"
            onClick={onClose}
            className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 text-white text-xs font-bold shadow-md active:translate-y-px"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>PANIC BUTTON SOS</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-rose-400 text-xs font-semibold border border-slate-700 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar dari Sistem</span>
          </button>
        </div>
      </div>
    </div>
  );
};
