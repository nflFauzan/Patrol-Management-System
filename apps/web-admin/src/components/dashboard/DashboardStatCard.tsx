'use client';

import React from 'react';
import { clsx } from 'clsx';
import { SurfaceCard } from '../ui/SurfaceCard';

export interface DashboardStatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  iconVariant?: 'sky' | 'emerald' | 'amber' | 'rose';
  className?: string;
}

export const DashboardStatCard: React.FC<DashboardStatCardProps> = ({
  title,
  value,
  trend,
  trendDirection = 'up',
  icon: Icon,
  iconVariant = 'sky',
  className,
}) => {
  const iconTheme = {
    sky: {
      container: 'bg-sky-50 text-sky-600 border border-sky-100 shadow-inner',
      trend: 'text-sky-600 bg-sky-50',
    },
    emerald: {
      container: 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-inner',
      trend: 'text-emerald-700 bg-emerald-50',
    },
    amber: {
      container: 'bg-amber-50 text-amber-600 border border-amber-100 shadow-inner',
      trend: 'text-amber-700 bg-amber-50',
    },
    rose: {
      container: 'bg-rose-50 text-rose-600 border border-rose-100 shadow-inner',
      trend: 'text-rose-700 bg-rose-50',
    },
  }[iconVariant];

  return (
    <SurfaceCard
      variant="elevated"
      padding="none"
      className={clsx(
        'p-4 sm:p-5 flex items-center justify-between transition-transform duration-150 hover:-translate-y-0.5',
        className
      )}
    >
      <div className="flex items-center space-x-3.5">
        <div
          className={clsx(
            'w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-all',
            iconTheme.container
          )}
        >
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div>
          <div className="text-[11px] sm:text-xs font-semibold text-slate-500 tracking-tight">
            {title}
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight tabular-nums mt-0.5">
            {value}
          </div>
          {trend && (
            <div className="flex items-center space-x-1 mt-1">
              <span
                className={clsx(
                  'text-[10px] font-bold px-1.5 py-0.5 rounded-full inline-flex items-center',
                  trendDirection === 'up'
                    ? 'text-emerald-700 bg-emerald-50'
                    : trendDirection === 'down'
                    ? 'text-rose-700 bg-rose-50'
                    : 'text-slate-500 bg-slate-100'
                )}
              >
                {trend}
              </span>
            </div>
          )}
        </div>
      </div>
    </SurfaceCard>
  );
};
