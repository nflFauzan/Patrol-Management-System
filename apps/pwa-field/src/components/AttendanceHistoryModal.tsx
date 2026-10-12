import React, { useEffect, useState } from 'react';
import { X, Calendar, Clock, MapPin, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { Attendance, AttendanceStatus } from '@patrol/types';
import { attendanceApi } from '../services/api';

interface AttendanceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AttendanceHistoryModal: React.FC<AttendanceHistoryModalProps> = ({ isOpen, onClose }) => {
  const [history, setHistory] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const data = await attendanceApi.getHistory(30);
      setHistory(data || []);
    } catch (err) {
      // Fallback demo data
      setHistory([
        {
          id: 'att-1',
          userId: 'u1',
          siteId: 's1',
          division: 'SECURITY' as any,
          date: new Date().toISOString().split('T')[0],
          clockInTime: '06:55:12',
          clockInWithinGeofence: true,
          clockInDistanceMeters: 14,
          clockOutTime: '15:02:40',
          clockOutWithinGeofence: true,
          clockOutDistanceMeters: 19,
          status: AttendanceStatus.OUT,
          lateMinutes: 0,
          earlyDepartureMinutes: 0,
          effectiveWorkingMinutes: 480,
          isOvertime: false,
          overtimeMinutes: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'att-2',
          userId: 'u1',
          siteId: 's1',
          division: 'SECURITY' as any,
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          clockInTime: '07:05:00',
          clockInWithinGeofence: true,
          clockInDistanceMeters: 25,
          clockOutTime: '15:00:10',
          clockOutWithinGeofence: true,
          clockOutDistanceMeters: 30,
          status: AttendanceStatus.OUT,
          lateMinutes: 0,
          earlyDepartureMinutes: 0,
          effectiveWorkingMinutes: 475,
          isOvertime: false,
          overtimeMinutes: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Riwayat Absensi</h2>
              <p className="text-xs text-slate-400">Log kehadiran 30 hari terakhir</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center">
              <RefreshCw className="w-6 h-6 animate-spin mb-2 text-purple-400" />
              <span>Memuat data riwayat...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              Belum ada riwayat absensi tercatat.
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3 text-xs space-y-2 hover:border-purple-500/40 transition"
              >
                <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                  <span className="font-semibold text-white flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    <span>{item.date}</span>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      item.status === AttendanceStatus.OUT
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : item.status === AttendanceStatus.IN
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-blue-950 text-blue-400 border border-blue-800'
                    }`}
                  >
                    {item.status === AttendanceStatus.OUT ? 'SELESAI (P)' : item.status === AttendanceStatus.IN ? 'AKTIF (M)' : item.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div className="bg-slate-900/60 p-2 rounded-lg">
                    <p className="text-[10px] text-slate-500 font-medium">JAM MASUK</p>
                    <p className="font-bold text-white mt-0.5">{item.clockInTime || '-'}</p>
                    <p className="text-[10px] text-emerald-400 flex items-center mt-1">
                      <MapPin className="w-3 h-3 mr-0.5" />
                      {item.clockInWithinGeofence ? 'Radius Sesuai' : 'Luar Geofence'}
                    </p>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-lg">
                    <p className="text-[10px] text-slate-500 font-medium">JAM PULANG</p>
                    <p className="font-bold text-white mt-0.5">{item.clockOutTime || '-'}</p>
                    <p className="text-[10px] text-emerald-400 flex items-center mt-1">
                      <MapPin className="w-3 h-3 mr-0.5" />
                      {item.clockOutTime ? (item.clockOutWithinGeofence ? 'Radius Sesuai' : 'Luar Geofence') : '-'}
                    </p>
                  </div>
                </div>

                {item.effectiveWorkingMinutes > 0 && (
                  <div className="text-[11px] text-slate-400 flex justify-between pt-1">
                    <span>Durasi Kerja:</span>
                    <span className="font-semibold text-white">
                      {Math.floor(item.effectiveWorkingMinutes / 60)} Jam {item.effectiveWorkingMinutes % 60} Menit
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium text-xs transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
