import React, { useEffect, useState } from 'react';
import { X, ShieldCheck, AlertTriangle, Calendar, Clock, MapPin, RefreshCw, CheckCircle2 } from 'lucide-react';
import { patrolApi } from '../services/api';

interface ActivityHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteId?: string;
}

export const ActivityHistoryModal: React.FC<ActivityHistoryModalProps> = ({ isOpen, onClose, siteId }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await patrolApi.getLogs(siteId, 30);
      setLogs(data || []);
    } catch (err) {
      // Fallback demo data
      setLogs([
        {
          id: 'log-1',
          checkpointName: 'Pos Utama Gerbang Masuk',
          areaLocation: 'Gate A Pintu Barat',
          statusResult: 'Situasi Aman Terkendali',
          notes: 'Pintu gerbang terkunci rapat, situasi normal',
          scannedAt: new Date().toLocaleTimeString('id-ID'),
          date: new Date().toISOString().split('T')[0],
          isAbnormal: false,
        },
        {
          id: 'log-2',
          checkpointName: 'Ruang Server IT Lt 3',
          areaLocation: 'Lt 3 Ruang 304',
          statusResult: 'Perlu Tindak Lanjut',
          notes: 'Suhu AC terasa hangat, indikator warning',
          scannedAt: new Date(Date.now() - 3600000).toLocaleTimeString('id-ID'),
          date: new Date().toISOString().split('T')[0],
          isAbnormal: true,
        },
        {
          id: 'log-3',
          checkpointName: 'Lobby & Resepsionis Lt 1',
          areaLocation: 'Main Hall',
          statusResult: 'Situasi Aman Terkendali',
          notes: 'Lampu menyala, tidak ada kendala',
          scannedAt: new Date(Date.now() - 7200000).toLocaleTimeString('id-ID'),
          date: new Date().toISOString().split('T')[0],
          isAbnormal: false,
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
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Riwayat Kegiatan & Patroli</h2>
              <p className="text-xs text-slate-400">Log pemindaian checkpoint dan temuan</p>
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
              <span>Memuat data kegiatan...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              Belum ada riwayat kegiatan hari ini.
            </div>
          ) : (
            logs.map((item) => (
              <div
                key={item.id}
                className={`bg-slate-800/80 border rounded-xl p-3 text-xs space-y-2 transition ${
                  item.isAbnormal || item.statusResult === 'Perlu Tindak Lanjut'
                    ? 'border-amber-600/50 bg-amber-950/10'
                    : 'border-slate-700/60 hover:border-purple-500/40'
                }`}
              >
                <div className="flex justify-between items-start border-b border-slate-700/50 pb-2">
                  <div>
                    <h3 className="font-bold text-white text-sm">{item.checkpointName || 'Checkpoint'}</h3>
                    <p className="text-[11px] text-slate-400 flex items-center mt-0.5">
                      <MapPin className="w-3 h-3 mr-1 text-slate-500" />
                      {item.areaLocation || 'Lokasi Checkpoint'}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded font-bold text-[10px] flex items-center space-x-1 ${
                      item.isAbnormal || item.statusResult === 'Perlu Tindak Lanjut'
                        ? 'bg-amber-950 text-amber-300 border border-amber-700'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {item.isAbnormal || item.statusResult === 'Perlu Tindak Lanjut' ? (
                      <>
                        <AlertTriangle className="w-3 h-3 mr-0.5" />
                        <span>TEMUAN</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3 mr-0.5" />
                        <span>AMAN</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="text-slate-300">
                  <p className="text-[11px] bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-slate-400 font-medium">Keterangan: </span>
                    {item.notes || 'Situasi aman terkendali'}
                  </p>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-purple-400" />
                    <span>{item.date || 'Hari Ini'}</span>
                  </span>
                  <span className="flex items-center space-x-1 font-semibold text-slate-300">
                    <Clock className="w-3 h-3 text-blue-400" />
                    <span>{item.scannedAt || '-'}</span>
                  </span>
                </div>
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
