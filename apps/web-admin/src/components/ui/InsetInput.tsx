'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InsetInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode | React.ComponentType<{ className?: string }>;
  iconPosition?: 'left' | 'right';
}

export const InsetInput = React.forwardRef<HTMLInputElement, InsetInputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      iconPosition = 'left',
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const renderIcon = (iconProp?: React.ReactNode | React.ComponentType<{ className?: string }>) => {
      if (!iconProp) return null;
      if (React.isValidElement(iconProp)) return iconProp;
      const IconComponent = iconProp as React.ComponentType<{ className?: string }>;
      return <IconComponent className="w-4 h-4" />;
    };

    return (
      <div className="w-full space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-bold text-slate-700 tracking-wide"
          >
            {label}
            {props.required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3 pointer-events-none text-slate-400">
              {renderIcon(icon)}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            className={twMerge(
              clsx(
                'w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400',
                'shadow-[inset_0_2px_4px_rgba(15,23,42,0.06)] transition-all duration-150',
                'focus:bg-white focus:border-[#38BDF8] focus:ring-2 focus:ring-[#38BDF8]/20 focus:outline-none',
                'disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed',
                icon && iconPosition === 'left' && 'pl-9',
                icon && iconPosition === 'right' && 'pr-9',
                error && 'border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-200',
                className
              )
            )}
            {...props}
          />

          {icon && iconPosition === 'right' && (
            <div className="absolute right-3 pointer-events-none text-slate-400">
              {renderIcon(icon)}
            </div>
          )}
        </div>

        {error && (
          <p className="text-[11px] font-semibold text-rose-600 tracking-tight">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p className="text-[11px] text-slate-500 tracking-tight">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

InsetInput.displayName = 'InsetInput';
