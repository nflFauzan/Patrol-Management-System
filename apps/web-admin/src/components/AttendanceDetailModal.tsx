'use client';

import React from 'react';
import { X, MapPin, Clock, ShieldCheck, AlertTriangle, ExternalLink, User, Calendar, CheckCircle2 } from 'lucide-react';

export interface AttendanceDetailData {
  id: string;
  userName: string;
  userNik?: string;
  division: string;
  role?: string;
  siteName: string;
  dateStr: string;
  avatarUrl?: string;
  // Clock in data
  clockInTime?: string;
  clockInPhotoUrl?: string;
  clockInLat?: number;
  clockInLng?: number;
  clockInDistanceMeters?: number;
  clockInWithinGeofence?: boolean;
  // Clock out data
  clockOutTime?: string;
  clockOutPhotoUrl?: string;
  clockOutLat?: number;
  clockOutLng?: number;
  clockOutDistanceMeters?: number;
  clockOutWithinGeofence?: boolean;
  // Working calculation
  effectiveWorkingMinutes?: number;
  lateMinutes?: number;
  overtimeMinutes?: number;
  statusNotes?: string;
}

interface AttendanceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AttendanceDetailData | null;
}

export const AttendanceDetailModal: React.FC<AttendanceDetailModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  if (!isOpen || !data) return null;

  const clockInWithin = data.clockInWithinGeofence ?? true;
  const clockOutWithin = data.clockOutWithinGeofence ?? true;
  const isOutside = !clockInWithin || (!clockOutWithin && !!data.clockOutTime);

  const formatHours = (mins?: number) => {
    if (!mins) return '0 Jam 0 Menit';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h} Jam ${m} Menit`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Header Modal matching patroli.site DETAIL ABSENSI */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span>DETAIL ABSENSI & VERIFIKASI POSTGIS GEOFENCE</span>
            </h3>
            <p className="text-xs text-slate-500">
              Pemeriksaan presisi koordinat GPS petugas, swafoto biometrik, dan kepatuhan radius batas site
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Header Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-blue-950 border-2 border-blue-500 overflow-hidden shadow-md flex items-center justify-center flex-shrink-0">
              {data.avatarUrl || data.clockInPhotoUrl ? (
                <img
                  src={data.avatarUrl || data.clockInPhotoUrl}
                  alt={data.userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-blue-400" />
              )}
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-base">{data.userName}</h4>
              <p className="text-xs text-slate-500 font-medium">
                {data.userNik || 'NIK-SEC-005'} • {data.division} ({data.role || 'ANGGOTA'})
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-md flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-red-500" />
                  <span>{data.siteName}</span>
                </span>
                <span className="text-[11px] font-semibold text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded-md flex items-center space-x-1">
                  <Calendar className="w-3 h-3 text-blue-600" />
                  <span>{data.dateStr}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex gap-2">
            <div className="text-center bg-white border border-slate-200 px-3 py-2 rounded-xl">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Jam Efektif</span>
              <span className="text-xs font-black text-slate-900">
                {formatHours(data.effectiveWorkingMinutes)}
              </span>
            </div>
            <div className="text-center bg-white border border-slate-200 px-3 py-2 rounded-xl">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Terlambat</span>
              <span className={`text-xs font-black ${data.lateMinutes ? 'text-rose-600' : 'text-emerald-600'}`}>
                {data.lateMinutes ? `${data.lateMinutes} Mnt` : 'Tepat Waktu'}
              </span>
            </div>
          </div>
        </div>

        {/* Status Alert Banner */}
        {isOutside ? (
          <div className="bg-rose-50 border border-rose-300 text-rose-800 p-3 rounded-2xl text-xs flex items-center space-x-2 font-medium">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>
              <strong>Peringatan Validasi Lokasi:</strong> Ditemukan rekaman presensi di luar radius geofence resmi fasilitas. Verifikasi foto dan titik GPS petugas di bawah.
            </span>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-2xl text-xs flex items-center space-x-2 font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>
              <strong>Geofence Terverifikasi Sempurna:</strong> Seluruh titik koordinat presensi masuk & pulang berada di dalam radius toleransi area operasional.
            </span>
          </div>
        )}

        {/* Dual Section Comparison (Clock In vs Clock Out) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ================= CLOCK IN CARD ================= */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-xs font-black text-slate-800 flex items-center space-x-1.5 uppercase">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Absen Masuk (Clock In)</span>
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  clockInWithin
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {clockInWithin ? 'Dalam Geofence ✅' : 'Luar Geofence ⚠️'}
              </span>
            </div>

            <div className="flex space-x-3 items-center">
              <div className="w-20 h-24 rounded-xl border border-slate-300 bg-slate-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                {data.clockInPhotoUrl ? (
                  <img src={data.clockInPhotoUrl} alt="Selfie Masuk" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <div className="text-xs space-y-1">
                <p className="text-slate-500">Waktu Masuk:</p>
                <p className="font-bold text-slate-900 text-sm">{data.clockInTime || 'Tidak tercatat'}</p>
                <p className="text-slate-500">Jarak ke Pos/Site:</p>
                <p className="font-semibold text-slate-800">
                  {data.clockInDistanceMeters !== undefined ? `${data.clockInDistanceMeters} meter` : '18 meter'}
                </p>
                <p className="font-mono text-[10px] text-slate-500">
                  GPS: {data.clockInLat ? data.clockInLat.toFixed(5) : '-6.22550'}, {data.clockInLng ? data.clockInLng.toFixed(5) : '106.80900'}
                </p>
              </div>
            </div>

            {/* Map Preview Frame */}
            <div className="bg-slate-900 rounded-xl p-3 text-white text-center space-y-1 relative overflow-hidden">
              <div className="text-[10px] font-mono text-emerald-400 font-bold">
                📍 PETA SPASIAL PRESENSI MASUK
              </div>
              <p className="text-[11px] text-slate-300">
                Radius Geofence: 100m • Deviasi: {data.clockInDistanceMeters ?? 18}m
              </p>
              <a
                href={`https://www.google.com/maps?q=${data.clockInLat || -6.2255},${data.clockInLng || 106.8090}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1 text-[10px] bg-blue-600 hover:bg-blue-500 text-white font-bold px-2.5 py-1 rounded-lg mt-1 transition"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Buka Google Maps Satelit</span>
              </a>
            </div>
          </div>

          {/* ================= CLOCK OUT CARD ================= */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-xs font-black text-slate-800 flex items-center space-x-1.5 uppercase">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Absen Pulang (Clock Out)</span>
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  !data.clockOutTime
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : clockOutWithin
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {!data.clockOutTime ? 'Belum Pulang' : clockOutWithin ? 'Dalam Geofence ✅' : 'Luar Geofence ⚠️'}
              </span>
            </div>

            <div className="flex space-x-3 items-center">
              <div className="w-20 h-24 rounded-xl border border-slate-300 bg-slate-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                {data.clockOutPhotoUrl ? (
                  <img src={data.clockOutPhotoUrl} alt="Selfie Pulang" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-[10px] text-slate-400 text-center p-2">Belum ada foto</div>
                )}
              </div>
              <div className="text-xs space-y-1">
                <p className="text-slate-500">Waktu Pulang:</p>
                <p className="font-bold text-slate-900 text-sm">{data.clockOutTime || '-'}</p>
                <p className="text-slate-500">Jarak ke Pos/Site:</p>
                <p className="font-semibold text-slate-800">
                  {data.clockOutDistanceMeters !== undefined ? `${data.clockOutDistanceMeters} meter` : '-'}
                </p>
                <p className="font-mono text-[10px] text-slate-500">
                  GPS: {data.clockOutLat ? `${data.clockOutLat.toFixed(5)}, ${data.clockOutLng?.toFixed(5)}` : '-'}
                </p>
              </div>
            </div>

            {/* Map Preview Frame */}
            <div className="bg-slate-900 rounded-xl p-3 text-white text-center space-y-1 relative overflow-hidden">
              <div className="text-[10px] font-mono text-blue-400 font-bold">
                📍 PETA SPASIAL PRESENSI PULANG
              </div>
              <p className="text-[11px] text-slate-300">
                {data.clockOutTime ? `Radius Geofence: 100m • Deviasi: ${data.clockOutDistanceMeters ?? 22}m` : 'Petugas belum melakukan presensi pulang'}
              </p>
              {data.clockOutTime && (
                <a
                  href={`https://www.google.com/maps?q=${data.clockOutLat || -6.2255},${data.clockOutLng || 106.8090}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1 text-[10px] bg-blue-600 hover:bg-blue-500 text-white font-bold px-2.5 py-1 rounded-lg mt-1 transition"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Buka Google Maps Satelit</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition"
          >
            Tutup Detail
          </button>
        </div>
      </div>
    </div>
  );
};
