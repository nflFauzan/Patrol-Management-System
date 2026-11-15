import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SurfaceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'subtle' | 'inset' | 'card';
}

export const SurfaceCard: React.FC<SurfaceCardProps> = ({
  children,
  className,
  variant = 'card',
  ...props
}) => {
  const variantStyles = {
    card: 'bg-white border border-slate-200/90 shadow-skeuo-card rounded-2xl',
    elevated: 'bg-white border border-slate-200/80 shadow-skeuo-elevated rounded-2xl',
    subtle: 'bg-[#F5F7FA] border border-slate-200/80 shadow-xs rounded-2xl',
    inset: 'bg-[#F8FAFC] border border-slate-200/90 shadow-skeuo-inset rounded-2xl',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'transition-all duration-150',
          variantStyles[variant],
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
