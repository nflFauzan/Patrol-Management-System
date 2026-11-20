import React from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useOfflineSync } from '../services/syncManager';

export const OfflineStatusBar: React.FC = () => {
  const { isOnline, isSyncing, pendingCount, syncNow } = useOfflineSync();

  // If online and no pending offline transactions, keep the bar subtle or hidden
  if (isOnline && pendingCount === 0 && !isSyncing) {
    return null;
  }

  return (
    <div
      className={`px-3 py-2 text-xs font-semibold flex items-center justify-between border-b shadow-2xs transition-colors duration-200 z-40 ${
        !isOnline
          ? 'bg-amber-500 text-white border-amber-600'
          : isSyncing
          ? 'bg-sky-800 text-white border-sky-900'
          : 'bg-sky-50 text-sky-900 border-sky-200'
      }`}
    >
      <div className="flex items-center space-x-2 truncate">
        {!isOnline ? (
          <>
            <WifiOff className="w-4 h-4 shrink-0 animate-pulse text-amber-100" />
            <span className="truncate">
              Mode Offline Aktif {pendingCount > 0 ? `(${pendingCount} tersimpan di perangkat)` : '• Data tersimpan lokal'}
            </span>
          </>
        ) : isSyncing ? (
          <>
            <RefreshCw className="w-4 h-4 shrink-0 animate-spin text-sky-100" />
            <span>Menyinkronkan {pendingCount} transaksi ke server...</span>
          </>
        ) : (
          <>
            <Wifi className="w-4 h-4 shrink-0 text-sky-600" />
            <span>{pendingCount} transaksi siap disinkronkan</span>
          </>
        )}
      </div>

      {isOnline && !isSyncing && pendingCount > 0 && (
        <button
          type="button"
          onClick={() => syncNow()}
          className="ml-2 px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-[11px] font-bold shadow-2xs shrink-0 flex items-center gap-1 active:scale-95 transition"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Kirim Sekarang</span>
        </button>
      )}
    </div>
  );
};
