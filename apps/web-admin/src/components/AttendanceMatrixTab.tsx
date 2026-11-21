'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Download, Filter, RefreshCw, CheckCircle2, AlertCircle, Eye } from 'lucide-react';
import { AttendanceMatrixResponse, AttendanceMatrixStatusCode, Division } from '@patrol/types';
import { AttendanceDetailModal, AttendanceDetailData } from './AttendanceDetailModal';
import { API_BASE_URL } from '@/lib/api';

interface AttendanceMatrixTabProps {
  selectedSiteId: string;
}

export const AttendanceMatrixTab: React.FC<AttendanceMatrixTabProps> = ({ selectedSiteId }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [matrixData, setMatrixData] = useState<AttendanceMatrixResponse | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<AttendanceDetailData | null>(null);

  useEffect(() => {
    fetchMatrix();
  }, [selectedMonth, selectedDivision, selectedSiteId]);

  const fetchMatrix = async () => {
    setIsLoading(true);
    try {
      const divisionParam = selectedDivision !== 'ALL' ? `&division=${selectedDivision}` : '';
      const res = await fetch(`${API_BASE_URL}/attendance/monitoring-matrix?month=${selectedMonth}&siteId=${selectedSiteId}${divisionParam}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('patrol_auth_token') || ''}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setMatrixData(data);
      } else {
        throw new Error('API offline');
      }
    } catch (e) {
      // Mock data for demo preview matching patroli.site
      const totalDays = 31;
      const daysObj: Record<number, any> = {};
      for (let i = 1; i <= totalDays; i++) {
        if (i % 7 === 0) daysObj[i] = { day: i, status: AttendanceMatrixStatusCode.OFF };
        else if (i === 12) daysObj[i] = { day: i, status: AttendanceMatrixStatusCode.LUPA_ABSEN };
        else if (i % 2 === 0) daysObj[i] = { day: i, status: AttendanceMatrixStatusCode.PULANG_NEXT_DAY };
        else daysObj[i] = { day: i, status: AttendanceMatrixStatusCode.PULANG };
      }

      setMatrixData({
        month: selectedMonth,
        siteId: selectedSiteId,
        totalDays: 31,
        rows: [
          {
            userId: 'u1',
            fullName: 'Ahmad Fauzi',
            siteName: 'Head Office Sudirman',
            division: Division.SECURITY,
            role: 'SECURITY_OFFICER' as any,
            days: daysObj,
            totalHadir: 26,
            totalLupaAbsen: 1,
            totalIzin: 0,
          },
          {
            userId: 'u2',
            fullName: 'Budi Santoso',
            siteName: 'Head Office Sudirman',
            division: Division.DRIVER,
            role: 'DRIVER' as any,
            days: daysObj,
            totalHadir: 25,
            totalLupaAbsen: 0,
            totalIzin: 2,
          },
          {
            userId: 'u3',
            fullName: 'Siti Rahma',
            siteName: 'Head Office Sudirman',
            division: Division.CLEANING,
            role: 'CLEANING_STAFF' as any,
            days: daysObj,
            totalHadir: 27,
            totalLupaAbsen: 0,
            totalIzin: 0,
          },
          {
            userId: 'u4',
            fullName: 'Doni Pratama',
            siteName: 'Head Office Sudirman',
            division: Division.SECURITY,
            role: 'SECURITY_OFFICER' as any,
            days: daysObj,
            totalHadir: 24,
            totalLupaAbsen: 2,
            totalIzin: 1,
          },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCsv = () => {
    if (!matrixData) return;
    const daysHeader = Array.from({ length: matrixData.totalDays }, (_, i) => `Tgl ${i + 1}`).join(',');
    const header = `Nama Personil,Divisi,Fasilitas,${daysHeader},Total Hadir,Lupa Absen,Izin\n`;
    const rows = matrixData.rows.map((r) => {
      const daysStr = Array.from({ length: matrixData.totalDays }, (_, i) => r.days[i + 1]?.status || '-').join(',');
      return `"${r.fullName}","${r.division}","${r.siteName}",${daysStr},${r.totalHadir},${r.totalLupaAbsen},${r.totalIzin}`;
    }).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `monitoring_absensi_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: AttendanceMatrixStatusCode) => {
    switch (status) {
      case AttendanceMatrixStatusCode.MASUK:
        return <span className="inline-block w-5 h-5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 leading-5 text-center" title="Masuk (M)">M</span>;
      case AttendanceMatrixStatusCode.PULANG:
        return <span className="inline-block w-5 h-5 rounded text-[10px] font-black bg-blue-100 text-blue-800 leading-5 text-center" title="Masuk & Pulang (P)">P</span>;
      case AttendanceMatrixStatusCode.PULANG_NEXT_DAY:
        return <span className="inline-block w-5 h-5 rounded text-[10px] font-black bg-purple-100 text-purple-800 leading-5 text-center" title="Shift Malam Pulang Esok Hari (P+)">P+</span>;
      case AttendanceMatrixStatusCode.LUPA_ABSEN:
        return <span className="inline-block w-5 h-5 rounded text-[10px] font-black bg-rose-500 text-white leading-5 text-center" title="Lupa Absen Pulang (X)">X</span>;
      case AttendanceMatrixStatusCode.IZIN:
        return <span className="inline-block w-5 h-5 rounded text-[10px] font-black bg-amber-100 text-amber-800 leading-5 text-center" title="Izin / Sakit (I)">I</span>;
      default:
        return <span className="inline-block w-5 h-5 rounded text-[10px] font-medium text-slate-300 leading-5 text-center">-</span>;
    }
  };

  const daysArray = Array.from({ length: matrixData?.totalDays || 31 }, (_, i) => i + 1);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Title & Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>Monitoring Absensi Kalender Matriks (1–31 Hari)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Format resmi evaluasi kehadiran personil per tanggal dengan kode M (Masuk), P (Pulang), P+ (Lintas Hari), X (Lupa Absen)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Month selector */}
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:border-blue-500"
          />

          {/* Division Filter */}
          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Semua Divisi</option>
            <option value="SECURITY">Satpam (Security)</option>
            <option value="CLEANING">Cleaning Service</option>
            <option value="DRIVER">Driver Armada</option>
          </select>

          <button
            onClick={fetchMatrix}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel (CSV)</span>
          </button>
        </div>
      </div>

      {/* Legend Badges */}
      <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
        <span className="font-bold text-slate-600 mr-1">Petunjuk Status:</span>
        <div className="flex items-center space-x-1">
          <span className="w-5 h-5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 flex items-center justify-center">M</span>
          <span className="text-slate-600">Absen Masuk</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-5 h-5 rounded text-[10px] font-black bg-blue-100 text-blue-800 flex items-center justify-center">P</span>
          <span className="text-slate-600">Masuk & Pulang</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-5 h-5 rounded text-[10px] font-black bg-purple-100 text-purple-800 flex items-center justify-center">P+</span>
          <span className="text-slate-600">Shift Malam (Lintas Hari)</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-5 h-5 rounded text-[10px] font-black bg-rose-500 text-white flex items-center justify-center">X</span>
          <span className="text-slate-600">Lupa Absen Pulang</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-5 h-5 rounded text-[10px] font-black bg-amber-100 text-amber-800 flex items-center justify-center">I</span>
          <span className="text-slate-600">Izin/Sakit</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-5 h-5 rounded text-[10px] font-medium text-slate-400 bg-slate-200 flex items-center justify-center">-</span>
          <span className="text-slate-600">Libur / Off</span>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <th className="py-2.5 px-3 sticky left-0 bg-slate-100 z-10 min-w-[160px] border-r border-slate-200">
                Nama Personil
              </th>
              <th className="py-2.5 px-2 min-w-[90px] border-r border-slate-200">Divisi</th>
              {daysArray.map((day) => (
                <th key={day} className="py-2.5 px-1 text-center min-w-[28px] border-r border-slate-200">
                  {day}
                </th>
              ))}
              <th className="py-2.5 px-2 text-center bg-emerald-50 text-emerald-800 border-r border-slate-200">Hadir</th>
              <th className="py-2.5 px-2 text-center bg-rose-50 text-rose-800 border-r border-slate-200">Lupa</th>
              <th className="py-2.5 px-2 text-center bg-amber-50 text-amber-800 border-r border-slate-200">Izin</th>
              <th className="py-2.5 px-2 text-center bg-slate-100 text-slate-700">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {isLoading ? (
              <tr>
                <td colSpan={daysArray.length + 6} className="py-12 text-center text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                  <span>Memuat matriks monitoring bulanan...</span>
                </td>
              </tr>
            ) : matrixData && matrixData.rows.length > 0 ? (
              matrixData.rows.map((row) => (
                <tr key={row.userId} className="hover:bg-slate-50 transition">
                  <td className="py-2 px-3 sticky left-0 bg-white font-semibold text-slate-900 border-r border-slate-200 shadow-sm">
                    {row.fullName}
                  </td>
                  <td className="py-2 px-2 border-r border-slate-200">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${row.division === 'SECURITY' ? 'bg-blue-100 text-blue-700' :
                        row.division === 'CLEANING' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-purple-100 text-purple-700'
                      }`}>
                      {row.division}
                    </span>
                  </td>
                  {daysArray.map((day) => (
                    <td key={day} className="py-1.5 px-0.5 text-center border-r border-slate-200">
                      {getStatusBadge(row.days[day]?.status || AttendanceMatrixStatusCode.OFF)}
                    </td>
                  ))}
                  <td className="py-2 px-2 text-center font-bold text-emerald-700 bg-emerald-50/50 border-r border-slate-200">
                    {row.totalHadir}
                  </td>
                  <td className="py-2 px-2 text-center font-bold text-rose-700 bg-rose-50/50 border-r border-slate-200">
                    {row.totalLupaAbsen}
                  </td>
                  <td className="py-2 px-2 text-center font-bold text-amber-700 bg-amber-50/50 border-r border-slate-200">
                    {row.totalIzin}
                  </td>
                  <td className="py-2 px-2 text-center">
                    <button
                      onClick={() =>
                        setSelectedDetail({
                          id: `att-${row.userId}`,
                          userName: row.fullName,
                          userNik: `NIK-${row.division.slice(0, 3)}-${row.userId.replace(/\D/g, '').padEnd(3, '0') || '101'}`,
                          division: row.division,
                          role: String(row.role || 'ANGGOTA'),
                          siteName: row.siteName,
                          dateStr: `${selectedMonth}-12`,
                          clockInTime: '07:02:15 WIB',
                          clockInLat: -6.22554,
                          clockInLng: 106.80908,
                          clockInDistanceMeters: 14,
                          clockInWithinGeofence: true,
                          clockOutTime: '15:10:30 WIB',
                          clockOutLat: -6.22562,
                          clockOutLng: 106.80892,
                          clockOutDistanceMeters: 19,
                          clockOutWithinGeofence: true,
                          effectiveWorkingMinutes: 480,
                          lateMinutes: 0,
                          overtimeMinutes: 0,
                        })
                      }
                      className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition"
                      title="Lihat Detail Absensi & Peta Spasial"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={daysArray.length + 6} className="py-8 text-center text-slate-400">
                  Tidak ada data personil pada filter yang dipilih.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Attendance Detail Modal with Dual Map Spatials */}
      {selectedDetail && (
        <AttendanceDetailModal
          isOpen={!!selectedDetail}
          onClose={() => setSelectedDetail(null)}
          data={selectedDetail}
        />
      )}
    </div>
  );
};
