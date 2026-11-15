'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SurfaceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'elevated' | 'inset' | 'flat' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const SurfaceCard: React.FC<SurfaceCardProps> = ({
  children,
  variant = 'elevated',
  padding = 'md',
  className,
  ...props
}) => {
  const baseStyles = 'transition-all duration-150 select-none';

  const variantStyles = {
    elevated:
      'bg-white rounded-2xl shadow-skeuo-card border border-slate-200/80 border-t-white/90',
    inset:
      'bg-[#F8FAFC] rounded-xl shadow-skeuo-inset border border-slate-300/80',
    flat:
      'bg-white rounded-xl border border-slate-200/80',
    interactive:
      'bg-white rounded-2xl shadow-skeuo-card border border-slate-200/80 hover:shadow-skeuo-elevated hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer',
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4 sm:p-5',
    lg: 'p-6 sm:p-8',
  };

  return (
    <div
      className={twMerge(
        clsx(baseStyles, variantStyles[variant], paddingStyles[padding], className)
      )}
      {...props}
    >
      {children}
    </div>
  );
};
