'use client';

import React from 'react';
import { X, Printer, Shield } from 'lucide-react';
import { QrCodeSvg } from '../lib/qrGenerator';
import { CheckpointItem } from '../lib/DataContext';

interface BatchPrintQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: {
    siteName: string;
    category: string;
    items: CheckpointItem[];
  } | null;
}

export const BatchPrintQrModal: React.FC<BatchPrintQrModalProps> = ({
  isOpen,
  onClose,
  config,
}) => {
  if (!isOpen || !config) return null;

  const { siteName, category, items } = config;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
      {/* Exact print CSS from cetak_qrcode.php */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #batch-print-container,
          #batch-print-container * {
            visibility: visible;
          }
          #batch-print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            margin: 0 !important;
            padding: 10mm !important;
            background: #fff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @page {
            size: auto;
            margin: 10mm;
          }
          .no-print {
            display: none !important;
          }
          .batch-row {
            display: flex !important;
            flex-wrap: wrap !important;
            margin: 0 -5px !important;
          }
          .batch-col {
            width: 25% !important;
            padding: 5px !important;
            box-sizing: border-box !important;
          }
          .batch-kotak {
            min-height: 225px !important;
            margin-bottom: 8px !important;
            padding: 8px 5px !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            border: 1px solid #ccc !important;
            text-align: center !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
          }
          .batch-info {
            font-size: 9px !important;
            line-height: 1.4 !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in duration-150">
        {/* Modal Topbar (Screen only) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Printer className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold tracking-wide">
              Pratinjau Lembar Cetak QR Code Checkpoint (Batch Print)
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-[#198754] hover:bg-[#157347] text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-sm transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang (Print)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body matching cetak_qrcode.php */}
        <div id="batch-print-container" className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white text-slate-900">
          {/* Judul & Header Info */}
          <div className="text-center mb-6 border-b border-slate-200 pb-4">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-slate-900 mb-2">
              QR CODE CHECKPOINT
            </h2>
            <div className="text-xs sm:text-sm text-slate-600 space-y-1">
              <p>
                Area / Site: <strong className="text-slate-900 uppercase">{siteName || 'Semua Area'}</strong>
              </p>
              <p>
                Kategori: <strong className="text-slate-900 uppercase">{category || 'Semua Kategori'}</strong>
              </p>
              <p>
                Jumlah checkpoint: <strong className="text-emerald-700">{items.length}</strong>
              </p>
            </div>
            <div className="mt-4 no-print">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-block px-5 py-2 bg-[#198754] hover:bg-[#157347] text-white font-bold text-xs rounded-md shadow-sm transition cursor-pointer"
              >
                Cetak QR Code
              </button>
            </div>
          </div>

          {/* Grid Layout of Checkpoint Cards */}
          {items.length === 0 ? (
            <div className="py-12 text-center text-slate-400 italic">
              Tidak ada titik checkpoint untuk kriteria area dan kategori yang dipilih.
            </div>
          ) : (
            <div className="batch-row grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item) => (
                <div key={item.id} className="batch-col w-full">
                  <div className="batch-kotak border border-slate-300 rounded-lg p-3 text-center flex flex-col items-center justify-between min-h-[260px] bg-slate-50/30 hover:bg-slate-50 transition">
                    {/* QR Code */}
                    <div className="bg-white p-2 border border-slate-200 rounded shadow-2xs flex items-center justify-center">
                      <QrCodeSvg
                        value={item.qrCodeToken || item.id}
                        size={140}
                        className="mx-auto"
                      />
                    </div>

                    <hr className="w-full my-2 border-t border-slate-200" />

                    {/* Metadata Card Info */}
                    <div className="batch-info text-[11px] leading-tight text-slate-700 space-y-0.5 uppercase overflow-hidden">
                      <div className="flex justify-center mb-1">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                          <Shield className="w-3.5 h-3.5 text-white" />
                        </div>
                      </div>
                      <strong className="block text-xs font-black text-slate-900 truncate">
                        {item.name}
                      </strong>
                      <div className="text-[10px] font-semibold text-slate-600">
                        {item.category}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {item.locationDetail}
                      </div>
                      <div className="text-[10px] font-bold text-emerald-700 truncate">
                        {item.siteName}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
