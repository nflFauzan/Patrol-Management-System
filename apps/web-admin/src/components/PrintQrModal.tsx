'use client';

import React from 'react';
import { X, Printer, QrCode } from 'lucide-react';

interface PrintQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkpoint: any;
}

export const PrintQrModal: React.FC<PrintQrModalProps> = ({
  isOpen,
  onClose,
  checkpoint,
}) => {
  if (!isOpen || !checkpoint) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="font-bold text-slate-900 text-sm">Label Barcode QR Checkpoint</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Label Card */}
        <div id="printable-qr-card" className="border-2 border-slate-900 rounded-2xl p-5 text-center space-y-3 bg-white">
          <div className="border-b-2 border-slate-900 pb-2">
            <h4 className="font-black text-sm uppercase text-slate-900 tracking-wider">PATROL MANAGEMENT SYSTEM</h4>
            <p className="text-[10px] text-slate-500 font-bold uppercase">{checkpoint.siteName || 'HEAD OFFICE SUDIRMAN'}</p>
          </div>

          <div className="p-3 bg-slate-100 rounded-xl inline-block border border-slate-300">
            {/* High visual QR placeholder with token */}
            <div className="w-36 h-36 mx-auto bg-white border-2 border-slate-900 p-2 flex flex-col items-center justify-center relative">
              <QrCode className="w-28 h-28 text-slate-950" />
            </div>
            <p className="font-mono font-black text-xs text-slate-900 mt-1 tracking-widest">{checkpoint.qrCodeToken}</p>
          </div>

          <div>
            <h5 className="font-extrabold text-sm text-slate-950 uppercase">{checkpoint.name}</h5>
            <p className="text-xs text-slate-600 mt-0.5">{checkpoint.locationDetail}</p>
            <p className="text-[10px] text-slate-400 mt-1 italic">Kategori: {checkpoint.category} • {checkpoint.assetType}</p>
          </div>

          <div className="border-t border-dashed border-slate-300 pt-2 text-[9px] text-slate-400 font-mono">
            TEMPEL DI AREA PERIMETER • SCAN VIA APLIKASI SATPAM
          </div>
        </div>

        <div className="flex space-x-2 pt-2">
          <button
            onClick={() => window.print()}
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Thermal / PDF</span>
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
