'use client';

import React from 'react';
import { ShieldAlert, ExternalLink, MapPin, CheckCircle2, Phone, Volume2, VolumeX } from 'lucide-react';
import { useData } from '../../lib/DataContext';

export default function EmergencyPage() {
  const { activeSosAlert, setActiveSosAlert, isSirenMuted, setIsSirenMuted } = useData();

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-rose-700 flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <span>Emergency SOS Command Center (Panic Button)</span>
          </h1>
          <p className="text-xs text-slate-500">
            Monitoring darurat panik Satpam, CS, dan Driver dengan integrasi WhatsApp Gateway & Google Maps
          </p>
        </div>

        <button
          onClick={() => setIsSirenMuted(!isSirenMuted)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
            isSirenMuted
              ? 'bg-slate-100 text-slate-600 border-slate-300'
              : 'bg-rose-50 text-rose-700 border-rose-300'
          }`}
        >
          {isSirenMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-pulse" />}
          <span>{isSirenMuted ? 'Sirine Dinonaktifkan' : 'Sirine Audio Aktif'}</span>
        </button>
      </div>

      {activeSosAlert ? (
        <div className="bg-white border-2 border-rose-500 rounded-2xl p-6 shadow-xl space-y-4 animate-pulse">
          <div className="flex items-center justify-between border-b border-rose-200 pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-rose-600 text-white rounded-xl shadow-md">
                <ShieldAlert className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <span className="bg-rose-100 text-rose-800 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded">
                  ALARM AKTIF DARURAT
                </span>
                <h2 className="text-lg font-black text-slate-900 mt-0.5">
                  {activeSosAlert.officerName} ({activeSosAlert.division})
                </h2>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-500">{activeSosAlert.triggeredAt}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block mb-0.5">Lokasi Fasilitas:</span>
              <strong className="text-slate-900 text-sm">{activeSosAlert.siteName}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block mb-0.5">Kontak WhatsApp Petugas:</span>
              <strong className="text-slate-900 text-sm flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>{activeSosAlert.officerPhone || '0812-3456-7890'}</span>
              </strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block mb-0.5">Koordinat Satelit PostGIS:</span>
              <strong className="text-slate-900 text-sm font-mono">
                {activeSosAlert.latitude.toFixed(6)}, {activeSosAlert.longitude.toFixed(6)}
              </strong>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
            <a
              href={activeSosAlert.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center space-x-1 shadow-sm transition"
            >
              <span>Buka Google Maps Presisi</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => setActiveSosAlert(null)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center space-x-1 shadow-sm transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Tandai Selesai / Teratasi</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Situasi Aman Terkendali (Kondisi Hijau)</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Tidak ada panggilan darurat aktif saat ini. Tombol SOS di PWA Petugas akan memicu alarm di
            sini dan mendispatch pesan darurat otomatis ke WhatsApp supervisor secara real-time.
          </p>
        </div>
      )}
    </div>
  );
}
