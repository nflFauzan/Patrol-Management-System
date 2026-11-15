import React, { useState } from 'react';
import { useNavigate } from '../utils/navigation';
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  User, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  X
} from 'lucide-react';
import { SurfaceCard } from '../components/ui/SurfaceCard';
import { SkeuomorphicButton } from '../components/ui/SkeuomorphicButton';
import { StatusBadge } from '../components/ui/StatusBadge';

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

  const [activities] = useState<ChiefActivityRow[]>([
    {
      id: '1',
      komandanName: 'Budi Santoso',
      disiplin: 'Baik',
      koordinasi: 'Baik',
      kehadiran: 'Lengkap',
      insiden: 'Tidak Ada',
      reguHadir: 'Lengkap',
      reguIzin: '0',
      detailInsiden: '',
      catatan: 'Patroli berjalan lancar, seluruh pos dan titik checkpoint aman terkendali.',
      tanggalLapor: '2026-11-05 22:26:50',
    },
    {
      id: '2',
      komandanName: 'Singgih Prasiwijaya',
      disiplin: 'Baik',
      koordinasi: 'Baik',
      kehadiran: 'Lengkap',
      insiden: 'Tidak Ada',
      reguHadir: '12',
      reguIzin: '0',
      detailInsiden: '',
      catatan: 'Serah terima inventaris dan rompi patroli lengkap.',
      tanggalLapor: '2026-11-05 22:30:15',
    },
  ]);

  const [selectedActivity, setSelectedActivity] = useState<ChiefActivityRow | null>(null);

  return (
    <div className="min-h-screen bg-[#E5E9EE] flex flex-col font-sans select-none pb-8 text-slate-800">
      <header className="sticky top-0 z-30 bg-[#E5E9EE]/90 backdrop-blur-md px-4 py-3 border-b border-slate-300/60 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/validasi-patroli/')}
          className="p-1.5 rounded-xl bg-white border border-slate-300 shadow-skeuo-button-secondary text-slate-700 active:scale-95 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="font-extrabold text-sm text-slate-800 tracking-tight">
          Riwayat Kegiatan & Supervisi
        </span>
        <div className="w-8" />
      </header>

      <main className="px-4 pt-4 max-w-md mx-auto w-full flex-1 space-y-3">
        {activities.map((act) => (
          <SurfaceCard key={act.id} className="p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600 font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase">{act.komandanName}</h3>
                  <p className="text-[10px] text-slate-400">{act.tanggalLapor}</p>
                </div>
              </div>
              <StatusBadge variant={act.insiden === 'Ada' ? 'danger' : 'success'}>
                {act.insiden === 'Ada' ? 'Ada Insiden' : 'Aman'}
              </StatusBadge>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/70">
                <p className="text-[10px] text-slate-400">Disiplin</p>
                <p className="font-bold text-emerald-600">{act.disiplin}</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/70">
                <p className="text-[10px] text-slate-400">Koordinasi</p>
                <p className="font-bold text-emerald-600">{act.koordinasi}</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/70">
                <p className="text-[10px] text-slate-400">Hadir</p>
                <p className="font-bold text-slate-700">{act.reguHadir}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
              {act.catatan}
            </p>

            <SkeuomorphicButton
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={() => setSelectedActivity(act)}
              icon={Eye}
            >
              Lihat Rincian Laporan
            </SkeuomorphicButton>
          </SurfaceCard>
        ))}
      </main>

      {selectedActivity && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-soft-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">
                Detail Laporan Supervisi
              </h3>
              <button
                type="button"
                onClick={() => setSelectedActivity(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div>
                <span className="text-slate-400 block text-[10px]">Pelapor:</span>
                <span className="font-bold uppercase">{selectedActivity.komandanName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Waktu:</span>
                <span className="font-semibold">{selectedActivity.tanggalLapor}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Catatan:</span>
                <p className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 leading-relaxed mt-0.5">
                  {selectedActivity.catatan}
                </p>
              </div>
            </div>

            <SkeuomorphicButton
              variant="primary"
              className="w-full"
              onClick={() => setSelectedActivity(null)}
            >
              Tutup
            </SkeuomorphicButton>
          </div>
        </div>
      )}
    </div>
  );
};
