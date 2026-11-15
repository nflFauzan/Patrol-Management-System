'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

interface SkeuomorphicButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode | React.ComponentType<{ className?: string }>;
  iconPosition?: 'left' | 'right';
}

export const SkeuomorphicButton: React.FC<SkeuomorphicButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  iconPosition = 'left',
  disabled,
  className,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold transition-all duration-150 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';

  const variantStyles = {
    primary:
      'bg-gradient-to-b from-[#38BDF8] via-[#0284C7] to-[#0369A1] text-white border-t border-white/40 border-b-2 border-[#075985] shadow-skeuo-button-primary hover:brightness-105 hover:translate-y-[-1px] active:translate-y-[1px] active:shadow-skeuo-button-pressed',
    secondary:
      'bg-gradient-to-b from-[#FFFFFF] to-[#F1F5F9] text-slate-700 border border-slate-300/90 border-b-2 border-slate-300 shadow-skeuo-button-secondary hover:bg-slate-50 hover:translate-y-[-1px] active:translate-y-[1px] active:shadow-skeuo-button-pressed',
    danger:
      'bg-gradient-to-b from-[#EF4444] to-[#B91C1C] text-white border-t border-white/30 border-b-2 border-[#7F1D1D] shadow-sm hover:brightness-105 hover:translate-y-[-1px] active:translate-y-[1px] active:shadow-skeuo-button-pressed',
    ghost:
      'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 active:bg-slate-200/80',
    icon:
      'p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 active:translate-y-[1px]',
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 rounded-lg gap-1.5',
    md: 'text-xs sm:text-sm px-3.5 py-2 rounded-xl gap-2',
    lg: 'text-sm sm:text-base px-5 py-2.5 rounded-xl gap-2.5',
  };

  const renderIcon = (iconProp?: React.ReactNode | React.ComponentType<{ className?: string }>) => {
    if (!iconProp) return null;
    if (React.isValidElement(iconProp)) return iconProp;
    const IconComponent = iconProp as React.ComponentType<{ className?: string }>;
    return <IconComponent className="w-4 h-4 shrink-0" />;
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={twMerge(
        clsx(
          baseStyles,
          variantStyles[variant],
          variant !== 'icon' && sizeStyles[size],
          className
        )
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        <>
          {icon && iconPosition === 'left' && renderIcon(icon)}
          {children}
          {icon && iconPosition === 'right' && renderIcon(icon)}
        </>
      )}
    </button>
  );
};
