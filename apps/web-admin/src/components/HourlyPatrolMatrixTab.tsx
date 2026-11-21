'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Download, CheckCircle2, RefreshCw, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import { HourlyPatrolMatrixResponse, Division } from '@patrol/types';
import { API_BASE_URL } from '@/lib/api';

interface HourlyPatrolMatrixTabProps {
  selectedSiteId: string;
}

export const HourlyPatrolMatrixTab: React.FC<HourlyPatrolMatrixTabProps> = ({ selectedSiteId }) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [matrixData, setMatrixData] = useState<HourlyPatrolMatrixResponse | null>(null);

  useEffect(() => {
    fetchHourlyMatrix();
  }, [selectedDate, selectedSiteId]);

  const fetchHourlyMatrix = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/patrol/hourly-monitoring?date=${selectedDate}&siteId=${selectedSiteId}`, {
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
      const mockHours1 = Array(24).fill(false);
      mockHours1[7] = true; mockHours1[9] = true; mockHours1[11] = true; mockHours1[13] = true; mockHours1[15] = true;
      const mockHours2 = Array(24).fill(false);
      mockHours2[8] = true; mockHours2[10] = true; mockHours2[12] = true; mockHours2[14] = true;
      const mockHours3 = Array(24).fill(false);
      mockHours3[7] = true; mockHours3[11] = true; mockHours3[15] = true;

      const toHoursMap = (arr: boolean[]) => {
        const m: Record<number, boolean> = {};
        arr.forEach((v, idx) => { m[idx] = v; });
        return m;
      };

      setMatrixData({
        date: selectedDate,
        siteId: selectedSiteId,
        siteName: 'Head Office Sudirman',
        hours: Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`),
        rows: [
          {
            checkpointId: 'c1',
            assetName: 'Pos Utama Gerbang Masuk',
            checkpointName: 'Pos Utama Gerbang Masuk',
            locationDescription: 'Gate A Pintu Barat',
            locationDetail: 'Gate A Pintu Barat',
            category: 'Security',
            hours: toHoursMap(mockHours1),
            hourlyStatus: mockHours1,
            totalScanned: 5,
            totalScans: 5,
          },
          {
            checkpointId: 'c2',
            assetName: 'Lobby & Resepsionis Lt 1',
            checkpointName: 'Lobby & Resepsionis Lt 1',
            locationDescription: 'Main Hall',
            locationDetail: 'Main Hall',
            category: 'Security',
            hours: toHoursMap(mockHours2),
            hourlyStatus: mockHours2,
            totalScanned: 4,
            totalScans: 4,
          },
          {
            checkpointId: 'c3',
            assetName: 'Ruang Server IT Lt 3',
            checkpointName: 'Ruang Server IT Lt 3',
            locationDescription: 'Lt 3 Ruang 304',
            locationDetail: 'Lt 3 Ruang 304',
            category: 'Security',
            hours: toHoursMap(mockHours3),
            hourlyStatus: mockHours3,
            totalScanned: 3,
            totalScans: 3,
          },
          {
            checkpointId: 'c4',
            assetName: 'Restroom Eksekutif Lt 2',
            checkpointName: 'Restroom Eksekutif Lt 2',
            locationDescription: 'Lt 2 Sayap Timur',
            locationDetail: 'Lt 2 Sayap Timur',
            category: 'Cleaning',
            hours: toHoursMap(mockHours1),
            hourlyStatus: mockHours1,
            totalScanned: 5,
            totalScans: 5,
          },
          {
            checkpointId: 'c5',
            assetName: 'Area Parkir Basement B2',
            checkpointName: 'Area Parkir Basement B2',
            locationDescription: 'Zona B2 Selatan',
            locationDetail: 'Zona B2 Selatan',
            category: 'Security',
            hours: toHoursMap(mockHours2),
            hourlyStatus: mockHours2,
            totalScanned: 4,
            totalScans: 4,
          },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCsv = () => {
    if (!matrixData) return;
    const hoursHeader = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`).join(',');
    const header = `Nama Checkpoint,Kategori,Lokasi,${hoursHeader},Total Scan\n`;
    const rows = matrixData.rows.map((r) => {
      const hoursStr = Array.from({ length: 24 }, (_, i) => ((r.hourlyStatus && r.hourlyStatus[i]) || (r.hours && r.hours[i])) ? '1' : '0').join(',');
      return `"${r.checkpointName || r.assetName}","${r.category}","${r.locationDetail || r.locationDescription}",${hoursStr},${r.totalScans ?? r.totalScanned}`;
    }).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `monitoring_patroli_24jam_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hoursList = Array.from({ length: 24 }, (_, i) => i);

  const filteredRows = matrixData?.rows.filter((r) => {
    if (selectedCategory === 'ALL') return true;
    return r.category.toLowerCase() === selectedCategory.toLowerCase();
  }) || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Title & Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <span>Monitoring Patroli Matriks 24 Jam (Per Jam 00:00 s/d 23:00)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verifikasi scanning per pos checkpoint setiap jam untuk memastikan kepatuhan rute patroli berkala
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:border-indigo-500"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="Security">Satpam (Security)</option>
            <option value="Cleaning">Cleaning Service</option>
          </select>

          <button
            onClick={fetchHourlyMatrix}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export Matriks 24H (CSV)</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <th className="py-2.5 px-3 sticky left-0 bg-slate-100 z-10 min-w-[180px] border-r border-slate-200">
                Pos Checkpoint / Aset
              </th>
              <th className="py-2.5 px-2 min-w-[85px] border-r border-slate-200">Kategori</th>
              {hoursList.map((hour) => (
                <th key={hour} className="py-2.5 px-1 text-center min-w-[28px] border-r border-slate-200">
                  {hour.toString().padStart(2, '0')}
                </th>
              ))}
              <th className="py-2.5 px-3 text-center bg-indigo-50 text-indigo-800">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {isLoading ? (
              <tr>
                <td colSpan={27} className="py-12 text-center text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                  <span>Memuat checklist 24 jam...</span>
                </td>
              </tr>
            ) : filteredRows.length > 0 ? (
              filteredRows.map((row) => (
                <tr key={row.checkpointId} className="hover:bg-slate-50 transition">
                  <td className="py-2 px-3 sticky left-0 bg-white border-r border-slate-200 shadow-sm">
                    <span className="font-semibold text-slate-900 block">{row.checkpointName || row.assetName}</span>
                    <span className="text-[10px] text-slate-400 flex items-center mt-0.5">
                      <MapPin className="w-3 h-3 mr-0.5" />
                      {row.locationDetail || row.locationDescription}
                    </span>
                  </td>
                  <td className="py-2 px-2 border-r border-slate-200">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${String(row.category).toLowerCase().includes('sec') ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                      {row.category}
                    </span>
                  </td>
                  {hoursList.map((h) => {
                    const isScanned = (row.hourlyStatus && row.hourlyStatus[h]) || (row.hours && row.hours[h]);
                    return (
                      <td key={h} className="py-1.5 px-0.5 text-center border-r border-slate-200">
                        {isScanned ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white font-bold text-[10px] shadow-sm" title={`Scanned jam ${h}:00`}>
                            ✓
                          </span>
                        ) : (
                          <span className="inline-block w-5 h-5 text-slate-300 font-medium leading-5">-</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="py-2 px-3 text-center font-extrabold text-indigo-700 bg-indigo-50/50">
                    {row.totalScans ?? row.totalScanned ?? 0} Scan
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={27} className="py-8 text-center text-slate-400">
                  Tidak ada data checkpoint pada kategori yang dipilih.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
