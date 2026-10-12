'use client';

import React from 'react';
import { X, Printer, User, ShieldCheck } from 'lucide-react';

interface PrintIdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export const PrintIdCardModal: React.FC<PrintIdCardModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="font-bold text-slate-900 text-sm">Cetak Kartu Tanda Anggota (ID Card)</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Official ID Card */}
        <div id="printable-id-card" className="border-2 border-slate-900 rounded-3xl p-5 text-center space-y-4 bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-xl relative overflow-hidden">
          {/* Top Header Badge */}
          <div className="border-b border-slate-700/80 pb-3 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-left">
              <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center font-black text-xs text-white">
                PMS
              </div>
              <div>
                <h4 className="font-black text-xs uppercase tracking-wider text-white">CORPORATE SECURITY</h4>
                <p className="text-[9px] text-slate-400">{user.siteName || 'HEAD OFFICE SUDIRMAN'}</p>
              </div>
            </div>
            <ShieldCheck className="w-6 h-6 text-blue-400" />
          </div>

          {/* Photo Avatar */}
          <div className="w-24 h-28 mx-auto rounded-xl bg-slate-700 border-2 border-blue-500 overflow-hidden shadow-md flex items-center justify-center">
            {user.photoUrl ? (
              <img src={user.photoUrl} alt="Officer" className="w-full h-full object-cover" />
            ) : (
              <User className="w-14 h-14 text-slate-400" />
            )}
          </div>

          {/* Officer Identity */}
          <div className="space-y-1">
            <h5 className="font-black text-base text-white uppercase tracking-tight">{user.fullName}</h5>
            <div className="inline-block bg-blue-600/40 text-blue-300 border border-blue-400/50 text-[10px] font-bold px-3 py-0.5 rounded-full uppercase">
              {user.division} • {user.securityRank || 'ANGGOTA'}
            </div>
            <p className="font-mono text-xs text-slate-300 font-bold mt-1">NIK: {user.nik}</p>
          </div>

          {/* Barcode Strip */}
          <div className="bg-white p-2 rounded-xl text-slate-900 text-center space-y-0.5">
            <div className="font-mono tracking-widest font-black text-xs">||| | |||| | ||||| |||| |</div>
            <div className="font-mono text-[9px] text-slate-500">{user.nik}</div>
          </div>

          <div className="text-[8px] text-slate-400 uppercase tracking-widest pt-1">
            KARTU TANDA PENGENAL RESMI KORPORAT
          </div>
        </div>

        <div className="flex space-x-2 pt-2">
          <button
            onClick={() => window.print()}
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Kartu ID</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
