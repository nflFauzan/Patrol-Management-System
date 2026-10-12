'use client';

import React, { useState } from 'react';
import { X, Printer, User, ShieldCheck, Check } from 'lucide-react';

export type IdCardDesign = 'b1' | 'b2' | 'b3' | 'b4' | 'b5';

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
  const [selectedDesign, setSelectedDesign] = useState<IdCardDesign>('b1');

  if (!isOpen || !user) return null;

  // Design configuration mapping for 5 theme presets
  const designStyles: Record<
    IdCardDesign,
    {
      name: string;
      btnClass: string;
      frontBg: string;
      frontAccent: string;
      frontBadge: string;
      backBg: string;
      textColor: string;
      subTextColor: string;
      borderColor: string;
    }
  > = {
    b1: {
      name: 'B1 Navy',
      btnClass: 'bg-slate-900 text-white border-slate-700',
      frontBg: 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950',
      frontAccent: 'border-blue-500',
      frontBadge: 'bg-blue-600/30 text-blue-300 border-blue-500/40',
      backBg: 'bg-gradient-to-b from-slate-900 to-slate-950',
      textColor: 'text-white',
      subTextColor: 'text-slate-400',
      borderColor: 'border-slate-800',
    },
    b2: {
      name: 'B2 Blue',
      btnClass: 'bg-blue-600 text-white border-blue-700',
      frontBg: 'bg-gradient-to-b from-blue-950 via-blue-900 to-indigo-950',
      frontAccent: 'border-cyan-400',
      frontBadge: 'bg-cyan-500/30 text-cyan-200 border-cyan-400/50',
      backBg: 'bg-gradient-to-b from-blue-900 to-slate-950',
      textColor: 'text-white',
      subTextColor: 'text-blue-200',
      borderColor: 'border-blue-700',
    },
    b3: {
      name: 'B3 Red',
      btnClass: 'bg-rose-700 text-white border-rose-800',
      frontBg: 'bg-gradient-to-b from-rose-950 via-red-900 to-slate-950',
      frontAccent: 'border-rose-400',
      frontBadge: 'bg-rose-500/30 text-rose-200 border-rose-400/50',
      backBg: 'bg-gradient-to-b from-red-950 to-slate-950',
      textColor: 'text-white',
      subTextColor: 'text-rose-200',
      borderColor: 'border-rose-800',
    },
    b4: {
      name: 'B4 Tech',
      btnClass: 'bg-emerald-700 text-white border-emerald-800',
      frontBg: 'bg-gradient-to-b from-slate-900 via-zinc-900 to-teal-950',
      frontAccent: 'border-emerald-400',
      frontBadge: 'bg-emerald-500/30 text-emerald-200 border-emerald-400/50',
      backBg: 'bg-gradient-to-b from-zinc-900 to-slate-950',
      textColor: 'text-white',
      subTextColor: 'text-emerald-200',
      borderColor: 'border-emerald-800',
    },
    b5: {
      name: 'B5 White',
      btnClass: 'bg-slate-100 text-slate-800 border-slate-300',
      frontBg: 'bg-gradient-to-b from-white via-slate-50 to-slate-100',
      frontAccent: 'border-slate-800',
      frontBadge: 'bg-slate-200 text-slate-800 border-slate-400',
      backBg: 'bg-gradient-to-b from-slate-50 to-slate-100',
      textColor: 'text-slate-900',
      subTextColor: 'text-slate-600',
      borderColor: 'border-slate-300',
    },
  };

  const currentTheme = designStyles[selectedDesign];
  const companyName = 'PT ENTERPRISE CORPORATE';
  const siteAddress = user.siteName || 'Head Office Sudirman (SCBD)';
  const officerNik = user.nik || `ID-${user.id ? user.id.slice(0, 6) : '1422'}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Header Modal */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span>Cetak Kartu Tanda Anggota (ID Card Resmi)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Pilih desain visual sesuai standar operasional korporat (Kartu Depan & Belakang)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5 Theme Selection Ribbon Matching patroli.site (B1 Navy, B2 Blue, B3 Red, B4 Tech, B5 White) */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Pilih Desain:</span>
          <div className="flex flex-wrap gap-1.5">
            {(['b1', 'b2', 'b3', 'b4', 'b5'] as IdCardDesign[]).map((ds) => {
              const theme = designStyles[ds];
              const isSelected = selectedDesign === ds;
              return (
                <button
                  key={ds}
                  onClick={() => setSelectedDesign(ds)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center space-x-1.5 ${
                    isSelected
                      ? 'ring-2 ring-blue-500 ring-offset-1 shadow-md ' + theme.btnClass
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  <span>{theme.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Printable Card Area: Dual Sides (Front & Back) */}
        <div
          id="printable-id-card-area"
          className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-center items-stretch p-4 bg-slate-100 rounded-2xl border border-slate-200"
        >
          {/* ================= FRONT CARD ================= */}
          <div
            className={`w-full max-w-[270px] mx-auto rounded-3xl p-5 text-center space-y-3.5 shadow-xl border-2 ${currentTheme.borderColor} ${currentTheme.frontBg} ${currentTheme.textColor} flex flex-col justify-between`}
          >
            {/* Top Company Header */}
            <div className={`border-b ${currentTheme.borderColor} pb-2.5 flex items-center justify-between`}>
              <div className="flex items-center space-x-2 text-left">
                <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center font-black text-xs text-white shadow">
                  PMS
                </div>
                <div>
                  <h4 className="font-black text-[11px] uppercase tracking-wider leading-tight">
                    {companyName}
                  </h4>
                  <p className={`text-[9px] ${currentTheme.subTextColor} truncate max-w-[150px]`}>
                    {siteAddress}
                  </p>
                </div>
              </div>
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>

            {/* Officer Photo Avatar */}
            <div
              className={`w-24 h-28 mx-auto rounded-2xl border-2 ${currentTheme.frontAccent} overflow-hidden shadow-lg flex items-center justify-center bg-slate-800`}
            >
              {user.photoUrl || user.avatarUrl ? (
                <img
                  src={user.photoUrl || user.avatarUrl}
                  alt={user.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-14 h-14 text-slate-400" />
              )}
            </div>

            {/* Officer Name & Rank */}
            <div className="space-y-1">
              <h5 className="font-black text-sm uppercase tracking-tight line-clamp-1">
                {user.fullName}
              </h5>
              <div
                className={`inline-block border text-[10px] font-bold px-3 py-0.5 rounded-full uppercase ${currentTheme.frontBadge}`}
              >
                {user.division || 'SECURITY'} • {user.securityRank || user.role || 'ANGGOTA'}
              </div>
              <p className={`font-mono text-xs font-bold mt-1 ${currentTheme.subTextColor}`}>
                NIK: {officerNik}
              </p>
            </div>

            {/* Barcode Strip */}
            <div className="bg-white p-2 rounded-xl text-slate-900 text-center space-y-0.5 shadow-sm">
              <div className="font-mono tracking-widest font-black text-xs">||| | |||| | ||||| |||| |</div>
              <div className="font-mono text-[9px] text-slate-500 font-bold">{officerNik}</div>
            </div>

            <div className={`text-[8px] uppercase tracking-widest pt-1 ${currentTheme.subTextColor}`}>
              KARTU IDENTITAS PERSONEL (FRONT)
            </div>
          </div>

          {/* ================= BACK CARD ================= */}
          <div
            className={`w-full max-w-[270px] mx-auto rounded-3xl p-5 text-center space-y-3 shadow-xl border-2 ${currentTheme.borderColor} ${currentTheme.backBg} ${currentTheme.textColor} flex flex-col justify-between`}
          >
            {/* Top Back Header */}
            <div className={`border-b ${currentTheme.borderColor} pb-2 text-center`}>
              <h4 className="font-black text-xs uppercase tracking-wider">{companyName}</h4>
              <p className={`text-[9px] ${currentTheme.subTextColor}`}>{siteAddress}</p>
            </div>

            {/* Title & Terms */}
            <div className="text-left space-y-2">
              <div className="text-center font-extrabold text-[11px] tracking-wider uppercase border-b border-dashed border-slate-700/60 pb-1">
                KETENTUAN KARTU
              </div>
              <ol className={`text-[9px] leading-relaxed space-y-1.5 list-decimal pl-3 ${currentTheme.subTextColor}`}>
                <li>
                  Kartu identitas ini berlaku selama pemilik bertugas dan berstatus sebagai personel resmi korporat.
                </li>
                <li>
                  Kartu ini wajib dikenakan selama jam kerja atau saat menjalankan tugas operasional di site.
                </li>
                <li>
                  Apabila personel berhenti atau mutasi tugas, kartu wajib diserahkan kembali kepada manajemen.
                </li>
                <li>
                  Bila menemukan kartu ini, harap segera mengembalikan ke Pos Komando / Security Command Center.
                </li>
              </ol>
            </div>

            {/* Verification QR / Signature Section */}
            <div className="bg-white/10 rounded-xl p-2.5 border border-white/20 text-center space-y-1">
              <p className={`text-[8px] font-mono uppercase ${currentTheme.subTextColor}`}>
                Tanda Tangan Otoritas / Security Head
              </p>
              <div className="h-6 flex items-center justify-center font-serif italic text-xs tracking-widest opacity-80">
                Validated Official
              </div>
            </div>

            <div className={`text-[8px] uppercase tracking-widest pt-1 font-bold ${currentTheme.subTextColor}`}>
              KARTU IDENTITAS PERSONEL (BACK)
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex space-x-3 pt-2">
          <button
            onClick={() => window.print()}
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg transition active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Kartu ID ({currentTheme.name})</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl text-xs transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
