'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, FileText, CheckCircle2, Radio, Bell } from 'lucide-react';
import { SurfaceCard } from '../ui/SurfaceCard';
import type { DashboardNotificationItem } from '@patrol/types';

export interface NotificationItem {
  id: string;
  type: 'PANIC' | 'PATROL' | 'ATTENDANCE' | 'BROADCAST';
  title: string;
  subtitle: string;
  time: string;
  link?: string;
}

export const NotificationPanel: React.FC<{ items?: (NotificationItem | DashboardNotificationItem)[] }> = ({
  items = [],
}) => {
  const getIconConfig = (type: NotificationItem['type']) => {
    switch (type) {
      case 'PANIC':
        return {
          icon: AlertTriangle,
          container: 'bg-rose-50 text-rose-600 border border-rose-200/80 shadow-xs',
        };
      case 'PATROL':
        return {
          icon: FileText,
          container: 'bg-sky-50 text-sky-600 border border-sky-200/80 shadow-xs',
        };
      case 'ATTENDANCE':
        return {
          icon: CheckCircle2,
          container: 'bg-emerald-50 text-emerald-600 border border-emerald-200/80 shadow-xs',
        };
      case 'BROADCAST':
        return {
          icon: Radio,
          container: 'bg-blue-50 text-blue-600 border border-blue-200/80 shadow-xs',
        };
    }
  };

  return (
    <SurfaceCard variant="elevated" padding="md" className="flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            Notifikasi Terbaru
          </h2>
          <p className="text-[11px] text-slate-500">
            Pemberitahuan darurat dan log aktivitas real-time
          </p>
        </div>
        <Link
          href="/emergency"
          className="text-xs font-semibold text-sky-600 hover:text-sky-700 transition"
        >
          Lihat Semua
        </Link>
      </div>

      {/* List or Empty State */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-slate-400">
          <Bell className="w-7 h-7 text-slate-300 mb-2" />
          <p className="text-xs font-semibold text-slate-600">Belum ada notifikasi hari ini</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Aktivitas real-time akan muncul di sini</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 mt-2">
          {items.map((item) => {
            const config = getIconConfig(item.type);
            const Icon = config.icon;

            return (
              <Link
                key={item.id}
                href={item.link || '#'}
                className="py-2.5 first:pt-1 last:pb-1 -mx-2 px-2 rounded-xl flex items-center justify-between hover:bg-slate-50/90 transition group select-none"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${config.container}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 truncate group-hover:text-sky-700 transition">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {item.subtitle}
                    </div>
                  </div>
                </div>
                <div className="text-[11px] font-mono text-slate-400 shrink-0 ml-2">
                  {item.time}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </SurfaceCard>
  );
};
