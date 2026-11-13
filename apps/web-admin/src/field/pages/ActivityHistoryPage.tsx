'use client';
import React, { useState } from 'react';
import { useNavigate } from '../utils/navigation';

interface ChiefActivityRow {
  id: string;
  komandanName: string;
  disiplin: string;
  koordinasi: string;
  kehadiran: string;
  insiden: string;
  reguHadir: string;
  reguIzin: string;
  detailInsiden: string;
  catatan: string;
  tanggalLapor: string;
}

export const ActivityHistoryPage: React.FC = () => {
  const navigate = useNavigate();

  // Seeded / captured rows matching patroli.site xxxxx_xxxxxx.php
  const [activities] = useState<ChiefActivityRow[]>([
    {
      id: '1',
      komandanName: 'budi santoso',
      disiplin: 'Baik',
      koordinasi: 'Baik',
      kehadiran: 'Lengkap',
      insiden: 'Tidak Ada',
      reguHadir: 'Lengkap',
      reguIzin: 'Lengkap',
      detailInsiden: '',
      catatan: 'Patroli berjalan lancar, semua pos terpantau aman.',
      tanggalLapor: '2026-11-05 22:26:50',
    },
    {
      id: '2',
      komandanName: 'SINGGIH PRASIWIJAYA',
      disiplin: 'Baik',
      koordinasi: 'Baik',
      kehadiran: 'Lengkap',
      insiden: 'Tidak Ada',
      reguHadir: '12',
      reguIzin: '0',
      detailInsiden: '',
      catatan: 'Serah terima inventaris dan senjata lengkap.',
      tanggalLapor: '2026-11-05 22:30:15',
    },
  ]);

  const [selectedActivity, setSelectedActivity] = useState<ChiefActivityRow | null>(null);

  return (
    <div className="min-h-screen bg-[#f4f7fa] font-sans pb-10">
      {/* Header Blue matching patroli.site xxxxx_xxxxxx.php */}
      <div className="bg-[#0d6efd] text-white px-4 py-3 flex justify-between items-center shadow-md font-bold">
        <span className="text-sm tracking-wide">DATA KEGIATAN</span>
        <button
          onClick={() => navigate('/validasi-patroli/')}
          className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded font-semibold transition"
        >
          Kembali
        </button>
      </div>

      <div className="p-3 max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow overflow-hidden border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3">NAMA KOMANDAN</th>
                  <th className="p-3">KEDISIPLINAN</th>
                  <th className="p-3">KOORDINASI</th>
                  <th className="p-3">KEHADIRAN</th>
                  <th className="p-3">INSIDEN</th>
                  <th className="p-3 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activities.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-800 uppercase">{act.komandanName}</td>
                    <td className="p-3">
                      <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        {act.disiplin}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        {act.koordinasi}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700">{act.kehadiran}</td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        act.insiden === 'Ada' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {act.insiden}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setSelectedActivity(act)}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold shadow-sm transition"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Detail Chief matching detail-chief.php */}
      {selectedActivity && (
        <div className="custom-modal show">
          <div className="custom-modal-box max-w-lg">
            <div className="custom-modal-header flex justify-between items-center">
              <span>Detail Evaluasi Chief</span>
              <span className="close-btn" onClick={() => setSelectedActivity(null)}>Ã—</span>
            </div>

            <div className="custom-modal-body space-y-3">
              <table className="w-full text-xs border border-slate-200">
                <tbody>
                  <tr className="border-b">
                    <th className="w-1/3 p-2 bg-slate-50 text-slate-700 text-left">Nama Komandan</th>
                    <td className="p-2 font-semibold text-slate-900 uppercase">{selectedActivity.komandanName}</td>
                  </tr>
                  <tr className="border-b">
                    <th className="p-2 bg-slate-50 text-slate-700 text-left">Kedisiplinan</th>
                    <td className="p-2 text-green-700 font-semibold">{selectedActivity.disiplin}</td>
                  </tr>
                  <tr className="border-b">
                    <th className="p-2 bg-slate-50 text-slate-700 text-left">Koordinasi</th>
                    <td className="p-2 text-green-700 font-semibold">{selectedActivity.koordinasi}</td>
                  </tr>
                  <tr className="border-b">
                    <th className="p-2 bg-slate-50 text-slate-700 text-left">Kehadiran Regu</th>
                    <td className="p-2">{selectedActivity.kehadiran}</td>
                  </tr>
                  <tr>
                    <th className="p-2 bg-slate-50 text-slate-700 text-left">Insiden</th>
                    <td className="p-2">{selectedActivity.insiden}</td>
                  </tr>
                </tbody>
              </table>

              <h6 className="font-bold text-xs text-slate-800 pt-1">Detail Tambahan</h6>

              <table className="w-full text-xs border border-slate-200">
                <tbody>
                  <tr className="border-b">
                    <th className="w-1/3 p-2 bg-slate-50 text-slate-700 text-left">Regu Hadir</th>
                    <td className="p-2">{selectedActivity.reguHadir}</td>
                  </tr>
                  <tr className="border-b">
                    <th className="p-2 bg-slate-50 text-slate-700 text-left">Regu Izin</th>
                    <td className="p-2">{selectedActivity.reguIzin}</td>
                  </tr>
                  <tr className="border-b">
                    <th className="p-2 bg-slate-50 text-slate-700 text-left">Detail Insiden</th>
                    <td className="p-2">{selectedActivity.detailInsiden || '-'}</td>
                  </tr>
                  <tr className="border-b">
                    <th className="p-2 bg-slate-50 text-slate-700 text-left">Catatan</th>
                    <td className="p-2 text-slate-700">{selectedActivity.catatan || '-'}</td>
                  </tr>
                  <tr>
                    <th className="p-2 bg-slate-50 text-slate-700 text-left">Tanggal Lapor</th>
                    <td className="p-2 font-mono text-[11px] text-slate-600">{selectedActivity.tanggalLapor}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="custom-modal-footer">
              <button onClick={() => setSelectedActivity(null)}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


