'use client';

import React from 'react';
import { AlertTriangle, Radio, Check, X } from 'lucide-react';
import { SkeuomorphicButton } from './ui/SkeuomorphicButton';

export interface PanicAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAcknowledge?: () => void;
  areaName?: string;
  timeString?: string;
  reporterName?: string;
  coords?: string;
}

export const PanicAlertModal: React.FC<PanicAlertModalProps> = ({
  isOpen,
  onClose,
  onAcknowledge,
  areaName = 'Area Gudang',
  timeString = '09:12 WIB',
  reporterName = 'Budi Santoso',
  coords,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in select-none">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-rose-200 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Red Header Bar matching visual reference image */}
        <div className="bg-gradient-to-r from-rose-600 to-rose-700 text-white px-5 py-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2 font-black text-sm tracking-wide">
            <span className="p-1 rounded-lg bg-white/20 text-white">
              <Radio className="w-4 h-4 animate-pulse" />
            </span>
            <span>Panic Alert</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white hover:text-white/80 font-bold text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 text-center space-y-5">
          {/* 3D Glowing Red Emergency Siren Beacon with Concentric Rings matching visual reference */}
          <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
            {/* Concentric radiant pulse rings */}
            <div className="absolute inset-0 rounded-full bg-rose-500/10 animate-ping duration-1000" />
            <div className="absolute inset-2 rounded-full bg-rose-500/15 animate-pulse" />
            <div className="absolute inset-4 rounded-full bg-rose-500/20" />

            {/* 3D Siren Beacon */}
            <div className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-b from-rose-500 via-rose-600 to-rose-800 p-2 shadow-2xl border-t-2 border-white/40 flex flex-col items-center justify-center shadow-rose-500/50">
              {/* Siren Glass Dome with Highlights */}
              <div className="w-12 h-10 rounded-t-full bg-gradient-to-t from-rose-700 via-rose-500 to-white/60 border border-white/50 relative overflow-hidden flex items-center justify-center">
                {/* Rotating beam line */}
                <div className="w-full h-1 bg-white/90 blur-[1px] animate-spin" />
              </div>
              {/* Metallic Base */}
              <div className="w-16 h-3 bg-gradient-to-r from-slate-700 via-slate-500 to-slate-800 rounded-b-md border-t border-slate-600 shadow-xs" />
            </div>
          </div>

          {/* Alert Typography matching visual reference */}
          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Peringatan Darurat!
            </h3>
            <p className="text-xs font-semibold text-slate-600">
              {areaName} - {timeString}
            </p>
            <p className="text-[11px] text-slate-500">
              Pelapor: <span className="font-semibold text-slate-800">{reporterName}</span>
            </p>
            {coords && (
              <p className="text-[10px] font-mono text-slate-400 mt-1">
                Koordinat: {coords}
              </p>
            )}
          </div>

          {/* Action Buttons matching visual reference: [Acknowledge (Sky Blue)] [Tutup (Secondary)] */}
          <div className="flex items-center justify-center space-x-3 pt-2">
            <SkeuomorphicButton
              variant="primary"
              size="md"
              onClick={() => {
                if (onAcknowledge) onAcknowledge();
                onClose();
              }}
              className="px-6 font-bold"
            >
              Acknowledge
            </SkeuomorphicButton>

            <SkeuomorphicButton
              variant="secondary"
              size="md"
              onClick={onClose}
              className="px-6 font-semibold"
            >
              Tutup
            </SkeuomorphicButton>
          </div>
        </div>
      </div>
    </div>
  );
};
