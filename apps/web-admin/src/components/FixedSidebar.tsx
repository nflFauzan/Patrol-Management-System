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
  MapPin,
  Building2,
  KeyRound,
  FileBarChart,
  FileSpreadsheet,
  DollarSign,
  Radio,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useData } from '../lib/DataContext';
import { ChangePasswordModal } from './ChangePasswordModal';

export const FixedSidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout, hasPermission, hasAnyPermission } = useAuth();
  const { activeSosAlert, sites } = useData();

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Permission Checks
  const canAccessDataInduk = hasAnyPermission(['DATA_INDUK:VIEW', 'USER:APPROVE', 'RBAC:MANAGE']);
  const canViewDataInduk = hasPermission('DATA_INDUK:VIEW');
  const canApproveUser = hasPermission('USER:APPROVE');
  const canManageRbac = hasPermission('RBAC:MANAGE');
  const canViewAbsensi = hasPermission('ABSENSI:VIEW');
  const canViewLaporan = hasAnyPermission(['LAPORAN:EXPORT', 'PATROL:VIEW']);
  const canAccessGaji = hasPermission('GAJI:ACCESS');
  const canSendBroadcast = hasPermission('BROADCAST:SEND');

  // Nav Groups
  const navigationGroups = [
    {
      group: 'OPERASIONAL',
      visible: true,
      items: [
        {
          title: 'Komando Utama',
          href: '/dashboard',
          icon: Activity,
          visible: true,
          badge: null,
          isActive: pathname === '/dashboard',
        },
        {
          title: 'Monitoring Patroli',
          href: '/monitoring-patroli',
          icon: QrCode,
          visible: true,
          badge: null,
          isActive: pathname.startsWith('/monitoring-patroli') || pathname.startsWith('/validasi-patroli'),
        },
        {
          title: 'Pemantauan Absensi',
          href: '/absensi',
          icon: Clock,
          visible: canViewAbsensi,
          badge: null,
          isActive: pathname.startsWith('/absensi'),
        },
        {
          title: 'Pusat Darurat SOS',
          href: '/emergency',
          icon: ShieldAlert,
          visible: true,
          badge: activeSosAlert ? 'AKTIF' : null,
          badgeColor: 'bg-rose-500 text-white animate-pulse',
          isActive: pathname.startsWith('/emergency'),
        },
      ],
    },
    {
      group: 'MASTER DATA',
      visible: canAccessDataInduk,
      items: [
        {
          title: 'Data Personil',
          href: '/datainduk/personil',
          icon: Users,
          visible: canViewDataInduk,
          badge: null,
          isActive: pathname.startsWith('/datainduk/personil'),
        },
        {
          title: 'Persetujuan Akun',
          href: '/datainduk/approval',
          icon: UserCheck,
          visible: canApproveUser,
          badge: null,
          isActive: pathname.startsWith('/datainduk/approval'),
        },
        {
          title: 'Titik Checkpoint QR',
          href: '/datainduk/checkpoint',
          icon: MapPin,
          visible: canViewDataInduk,
          badge: null,
          isActive: pathname.startsWith('/datainduk/checkpoint'),
        },
        {
          title: 'Fasilitas & Area',
          href: '/datainduk/area',
          icon: Building2,
          visible: canViewDataInduk,
          badge: `${sites?.length || 0} Site`,
          badgeColor: 'bg-slate-100 text-slate-600',
          isActive: pathname.startsWith('/datainduk/area'),
        },
        {
          title: 'Hak Akses & Role',
          href: '/datainduk/rbac',
          icon: KeyRound,
          visible: canManageRbac,
          badge: null,
          isActive: pathname.startsWith('/datainduk/rbac'),
        },
      ],
    },
    {
      group: 'REKAP & LAPORAN',
      visible: canViewLaporan || canAccessGaji || canSendBroadcast,
      items: [
        {
          title: 'Laporan Operasional',
          href: '/laporan',
          icon: FileBarChart,
          visible: canViewLaporan,
          badge: null,
          isActive: pathname.startsWith('/laporan'),
        },
        {
          title: 'Pusat Ekspor Dokumen',
          href: '/export-laporan',
          icon: FileSpreadsheet,
          visible: canViewLaporan,
          badge: null,
          isActive: pathname.startsWith('/export-laporan'),
        },
        {
          title: 'Penggajian (Payroll)',
          href: '/gaji',
          icon: DollarSign,
          visible: canAccessGaji,
          badge: null,
          isActive: pathname.startsWith('/gaji'),
        },
        {
          title: 'Pesan Siaran',
          href: '/pesan-siaran',
          icon: Radio,
          visible: canSendBroadcast,
          badge: null,
          isActive: pathname.startsWith('/pesan-siaran'),
        },
      ],
    },
  ];

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
      <aside className="w-64 shrink-0 h-screen sticky top-0 flex flex-col justify-between bg-white border-r border-slate-200/80 z-30 select-none font-sans">
        {/* ========================================================
            HEADER: Brand Corporate Identity
            ======================================================== */}
        <div className="p-4 border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm shadow-slate-900/10 group-hover:bg-slate-800 transition">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold tracking-wider text-slate-900 uppercase truncate">
                Patrol System
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-tight">
                Command Center
              </span>
            </div>
          </Link>
        </div>

        {/* ========================================================
            NAVIGATION: Structured Single Panel
            ======================================================== */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navigationGroups
            .filter((grp) => grp.visible)
            .map((group) => {
              const visibleItems = group.items.filter((item) => item.visible);
              if (visibleItems.length === 0) return null;

              return (
                <div key={group.group} className="space-y-1">
                  <div className="px-3 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    {group.group}
                  </div>
                  <nav className="space-y-0.5">
                    {visibleItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                            item.isActive
                              ? 'bg-slate-900 text-white shadow-xs font-semibold'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <Icon
                              className={`w-4 h-4 shrink-0 transition-colors ${
                                item.isActive
                                  ? 'text-emerald-400'
                                  : 'text-slate-400 group-hover:text-slate-700'
                              }`}
                            />
                            <span className="truncate">{item.title}</span>
                          </div>

                          {item.badge && (
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                                item.badgeColor || 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              );
            })}
        </div>

        {/* ========================================================
            FOOTER: User Profile & Quick Actions
            ======================================================== */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/60 shadow-2xs">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 relative">
                {getInitials(user?.fullName)}
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-slate-900 truncate">
                  {user?.fullName || 'Administrator'}
                </span>
                <span className="text-[10px] text-slate-500 truncate capitalize">
                  {user?.role?.replace('_', ' ').toLowerCase() || 'Super Admin'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-0.5 shrink-0 ml-1">
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                title="Ganti Kata Sandi"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <KeyRound className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={logout}
                title="Keluar dari Sistem"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
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
