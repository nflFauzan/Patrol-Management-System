'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { SurfaceCard } from '../ui/SurfaceCard';

interface DashboardHeroBannerProps {
  userName?: string;
  userRole?: string;
}

export const DashboardHeroBanner: React.FC<DashboardHeroBannerProps> = ({
  userName = 'Muhamad Naufal',
}) => {
  const [timeString, setTimeString] = useState<string>('09:24 WIB');
  const [dateString, setDateString] = useState<string>('Senin, 10 November 2025');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      // Format WIB
      const optionsDate: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Jakarta',
      };
      setDateString(new Intl.DateTimeFormat('id-ID', optionsDate).format(now));

      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta',
        hour12: false,
      };
      setTimeString(new Intl.DateTimeFormat('id-ID', timeOptions).format(now) + ' WIB');
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <SurfaceCard
      variant="elevated"
      padding="none"
      className="relative overflow-hidden bg-gradient-to-r from-[#F0F5FA] via-[#F8FAFC] to-[#EFF6FF] border border-slate-200/90 shadow-skeuo-card"
    >
      <div className="relative z-10 px-6 py-6 sm:px-8 sm:py-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left: Greeting */}
        <div className="max-w-md">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            Selamat Datang, <br className="hidden sm:inline" />
            <span className="text-sky-700">{userName}!</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-medium">
            Semoga hari ini operasional berjalan dengan lancar.
          </p>
        </div>

        {/* Center: Visual Artwork Silhouette */}
        <div className="hidden lg:flex items-center justify-center relative w-72 h-28">
          {/* Facility background silhouette */}
          <svg
            viewBox="0 0 260 100"
            className="w-full h-full opacity-35"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Corporate glass building architecture */}
            <rect x="20" y="20" width="90" height="80" rx="3" fill="#94A3B8" />
            <rect x="25" y="25" width="20" height="12" rx="1" fill="#E2E8F0" />
            <rect x="55" y="25" width="20" height="12" rx="1" fill="#E2E8F0" />
            <rect x="85" y="25" width="20" height="12" rx="1" fill="#E2E8F0" />
            <rect x="25" y="42" width="20" height="12" rx="1" fill="#E2E8F0" />
            <rect x="55" y="42" width="20" height="12" rx="1" fill="#E2E8F0" />
            <rect x="85" y="42" width="20" height="12" rx="1" fill="#E2E8F0" />
            <rect x="25" y="60" width="20" height="12" rx="1" fill="#E2E8F0" />
            <rect x="55" y="60" width="20" height="12" rx="1" fill="#E2E8F0" />
            <rect x="85" y="60" width="20" height="12" rx="1" fill="#E2E8F0" />

            <rect x="120" y="10" width="120" height="90" rx="4" fill="#64748B" />
            <line x1="140" y1="10" x2="140" y2="100" stroke="#CBD5E1" strokeWidth="2" />
            <line x1="170" y1="10" x2="170" y2="100" stroke="#CBD5E1" strokeWidth="2" />
            <line x1="200" y1="10" x2="200" y2="100" stroke="#CBD5E1" strokeWidth="2" />
          </svg>

          {/* Security Officer Silhouette */}
          <div className="absolute bottom-0 flex flex-col items-center">
            {/* Cap */}
            <div className="w-10 h-3.5 bg-slate-900 rounded-t-full shadow-xs" />
            {/* Head */}
            <div className="w-6 h-6 bg-slate-800 rounded-full -mt-1 shadow-xs" />
            {/* Torso with SECURITY vest badge */}
            <div className="w-20 h-14 bg-slate-900 rounded-t-2xl flex flex-col items-center pt-2 px-1 shadow-md border-t border-slate-700">
              <span className="text-[7px] font-black tracking-widest text-amber-400 bg-slate-950 px-1 py-0.2 rounded-xs border border-amber-400/40 uppercase">
                SECURITY
              </span>
            </div>
          </div>
        </div>

        {/* Right: Live Clock & Date */}
        <div className="text-left md:text-right shrink-0 bg-white/70 backdrop-blur-xs px-4 py-3 rounded-2xl border border-white/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">
            {dateString}
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums flex items-center md:justify-end space-x-1.5 mt-0.5">
            <Clock className="w-5 h-5 text-sky-600 animate-pulse" />
            <span>{timeString}</span>
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
};
