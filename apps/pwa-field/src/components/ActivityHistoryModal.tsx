import React, { useEffect, useState } from 'react';
import { X, QrCode, Undo, Search, ShieldCheck, MapPin, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { patrolApi } from '../services/api';

interface ActivityHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteId?: string;
  role?: string;
}

export const ActivityHistoryModal: React.FC<ActivityHistoryModalProps> = ({
  isOpen,
  onClose,
  siteId,
  role = 'SECURITY_OFFICER',
}) => {
  const isChief = role === 'CHIEF' || role === 'CHIEF_SECURITY' || role === 'SUPERVISOR';
  const [activeTab, setActiveTab] = useState<'CHIEF' | 'PATROL'>(isChief ? 'CHIEF' : 'PATROL');
  const [selectedChiefRecord, setSelectedChiefRecord] = useState<any | null>(null);

  // Live samples aligned with patroli.site
  const chiefRecords = [
    {
      id: '7',
      namaKomandan: 'budi santoso',
      kedisiplinan: 'Baik',
      koordinasi: 'Baik',
      kehadiran: 'Lengkap',
      insiden: 'Tidak Ada',
      reguHadir: 'Lengkap',
      reguIzin: 'Lengkap',
      detailInsiden: '-',
      catatan: 'Patroli berjalan lancar, semua pos terpantau aman.',
      tanggalLapor: '2026-11-05 22:26:50',
    },
    {
      id: '8',
      namaKomandan: 'SINGGIH PRASIWIJAYA',
      kedisiplinan: 'Cukup',
      koordinasi: 'Baik',
      kehadiran: 'Tidak Lengkap',
      insiden: 'Ada',
      reguHadir: '8 Orang',
      reguIzin: '1 Orang (Tanpa Keterangan)',
      detailInsiden: 'Ditemukan pintu belakang lantai 1 tidak terkunci saat patroli.',
      catatan: 'Segera koordinasi dengan personil piket terkait pengamanan akses.',
      tanggalLapor: '2026-11-05 22:27:10',
    },
  ];

  const patrolLogs = [
    {
      id: 'p-1',
      checkpointName: 'Pos 1 Lobby Utama',
      areaLocation: 'Lantai 1 Tower A',
      statusResult: 'Situasi Aman',
      notes: 'Pintu akses terkunci rapat, lampu lobi menyala normal.',
      scannedAt: '22:15:30',
      date: '2026-11-05',
      isAbnormal: false,
    },
    {
      id: 'p-2',
      checkpointName: 'Pintu Darurat Lt 2',
      areaLocation: 'Tangga Evakuasi Sayap Barat',
      statusResult: 'Perlu Cek',
      notes: 'Pintu sedikit renggang, sudah dirapatkan kembali.',
      scannedAt: '21:40:12',
      date: '2026-11-05',
      isAbnormal: true,
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="bg-[#f5f5f5] rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-300">
        {/* Blue Header matching patroli.site */}
        <div className="bg-[#0d6efd] text-white px-4 py-3 flex items-center justify-between font-bold text-sm shadow">
          <div className="flex items-center space-x-2">
            <QrCode className="w-5 h-5" />
            <span className="tracking-wide">DATA KEGIATAN</span>
          </div>
          <button
            onClick={onClose}
            className="inline-flex items-center space-x-1 px-3 py-1 bg-[#dc3545] hover:bg-red-700 text-white rounded text-xs font-semibold shadow"
          >
            <Undo className="w-3.5 h-3.5" />
            <span>Kembali</span>
          </button>
        </div>

        {/* Tab switch if role allows */}
        <div className="flex bg-slate-200 p-1 border-b border-slate-300 text-xs font-bold">
          <button
            onClick={() => setActiveTab('CHIEF')}
            className={`flex-1 py-1.5 rounded transition ${
              activeTab === 'CHIEF' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            Evaluasi Komandan (Chief)
          </button>
          <button
            onClick={() => setActiveTab('PATROL')}
            className={`flex-1 py-1.5 rounded transition ${
              activeTab === 'PATROL' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            Log Patroli Checkpoint
          </button>
        </div>

        {/* Content */}
        <div className="p-3 overflow-y-auto flex-1">
          {activeTab === 'CHIEF' ? (
            <div className="overflow-x-auto rounded-lg border border-blue-300 shadow-sm">
              <table className="w-full text-xs text-left bg-white">
                <thead className="bg-[#0d6efd] text-white font-bold text-center">
                  <tr>
                    <th className="p-2">KOMANDAN</th>
                    <th className="p-2">DISIPLIN</th>
                    <th className="p-2">KOORDINASI</th>
                    <th className="p-2">INSIDEN</th>
                    <th className="p-2">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {chiefRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-blue-50/50 transition">
                      <td className="p-2 font-medium text-slate-800">{r.namaKomandan}</td>
                      <td className="p-2 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">
                          {r.kedisiplinan}
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                          {r.koordinasi}
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.insiden === 'Ada'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {r.insiden}
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => setSelectedChiefRecord(r)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 bg-[#17a2b8] hover:bg-cyan-600 text-white rounded text-[11px] font-bold shadow"
                        >
                          <Search className="w-3 h-3" />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-2.5">
              {patrolLogs.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-300 rounded-xl p-3 text-xs space-y-1.5 shadow-sm"
                >
                  <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                    <span className="font-bold text-slate-900">{item.checkpointName}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.isAbnormal
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {item.statusResult}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded">
                    {item.notes}
                  </p>
                  <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                    <span>📍 {item.areaLocation}</span>
                    <span>🕒 {item.scannedAt} WIB</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Detail Chief Report (detail-chief.php) */}
        {selectedChiefRecord && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-300 flex flex-col">
              <div className="bg-[#0d6efd] text-white p-3.5 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm">Detail Laporan Chief</h4>
                  <p className="text-[11px] text-blue-100">Evaluasi komandan regu</p>
                </div>
                <button
                  onClick={() => setSelectedChiefRecord(null)}
                  className="p-1 rounded text-white/80 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 text-xs space-y-2.5">
                <table className="w-full border-collapse border border-slate-300">
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <th className="p-2 bg-slate-50 w-1/3 text-left font-bold text-slate-700">Nama Komandan</th>
                      <td className="p-2 text-slate-900 font-semibold">{selectedChiefRecord.namaKomandan}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <th className="p-2 bg-slate-50 text-left font-bold text-slate-700">Kedisiplinan</th>
                      <td className="p-2 text-slate-800">{selectedChiefRecord.kedisiplinan}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <th className="p-2 bg-slate-50 text-left font-bold text-slate-700">Koordinasi</th>
                      <td className="p-2 text-slate-800">{selectedChiefRecord.koordinasi}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <th className="p-2 bg-slate-50 text-left font-bold text-slate-700">Kehadiran Regu</th>
                      <td className="p-2 text-slate-800">{selectedChiefRecord.kehadiran}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <th className="p-2 bg-slate-50 text-left font-bold text-slate-700">Insiden</th>
                      <td className="p-2 text-slate-800 font-bold">{selectedChiefRecord.insiden}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <th className="p-2 bg-slate-50 text-left font-bold text-slate-700">Detail Insiden</th>
                      <td className="p-2 text-slate-800">{selectedChiefRecord.detailInsiden}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <th className="p-2 bg-slate-50 text-left font-bold text-slate-700">Catatan</th>
                      <td className="p-2 text-slate-800">{selectedChiefRecord.catatan}</td>
                    </tr>
                    <tr>
                      <th className="p-2 bg-slate-50 text-left font-bold text-slate-700">Tanggal Lapor</th>
                      <td className="p-2 text-slate-600">{selectedChiefRecord.tanggalLapor}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-slate-100 border-t border-slate-200">
                <button
                  onClick={() => setSelectedChiefRecord(null)}
                  className="w-full py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-bold"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
