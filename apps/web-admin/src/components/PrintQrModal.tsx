'use client';

import React from 'react';
import { X, Printer, Shield } from 'lucide-react';
import { QrCodeSvg } from '../lib/qrGenerator';
import { CheckpointItem } from '../lib/DataContext';

interface PrintQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkpoint: CheckpointItem | null;
}

export const PrintQrModal: React.FC<PrintQrModalProps> = ({
  isOpen,
  onClose,
  checkpoint,
}) => {
  if (!isOpen || !checkpoint) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Print Specific CSS to only print the single QR card */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-single-qr,
          #printable-single-qr * {
            visibility: visible;
          }
          #printable-single-qr {
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            margin: 0 !important;
            padding: 16px !important;
            border: 3px solid #000 !important;
            background-color: #f4e5dd !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center border-b pb-3 no-print">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Cetak Barcode QR Checkpoint</h3>
            <p className="text-[11px] text-slate-500">Format stiker cetak label aset / pos checkpoint</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================================
            EXACT PARITY CARD: cetak-aset?kode_aset=...
            Kotak solid border, 350px width, #f4e5dd background
            ======================================================== */}
        <div className="flex justify-center items-center py-2">
          <div
            id="printable-single-qr"
            className="w-[350px] border-2 border-black bg-[#f4e5dd] p-4 text-center text-uppercase flex flex-col items-center shadow-md rounded-sm"
            style={{ backgroundColor: '#f4e5dd' }}
          >
            {/* Scannable ISO QR Code */}
            <div className="bg-white p-2 border border-black/30 rounded-xs flex items-center justify-center">
              <QrCodeSvg
                value={checkpoint.qrCodeToken || checkpoint.id}
                size={270}
                className="mx-auto"
              />
            </div>

            <hr className="w-full my-3 border-t-2 border-black" />

            {/* Label Information */}
            <div className="text-[12px] font-bold text-slate-900 space-y-1 uppercase leading-tight">
              <div className="flex justify-center mb-1">
                <div className="w-10 h-10 rounded-full bg-[#007bff] text-white flex items-center justify-center font-black text-xs shadow-xs">
                  <Shield className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-sm font-extrabold text-black tracking-wide">
                {checkpoint.name}
              </div>
              <div className="text-xs font-semibold text-slate-800">
                {checkpoint.category}
              </div>
              <div className="text-xs font-normal text-slate-700">
                {checkpoint.locationDetail}
              </div>
              <div className="text-xs font-bold text-emerald-800">
                {checkpoint.siteName}
              </div>
              <div className="text-[10px] font-mono text-slate-500 tracking-wider pt-1">
                TOKEN: {checkpoint.qrCodeToken || checkpoint.id}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex space-x-2 pt-2 border-t no-print">
          <button
            onClick={handlePrint}
            className="flex-1 bg-[#28a745] hover:bg-[#218838] text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-sm transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span className="uppercase tracking-wide">Cetak QR Code</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
