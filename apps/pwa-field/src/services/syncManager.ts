import { useState, useEffect, useCallback } from 'react';
import {
  getPendingTransactions,
  getPendingCount,
  updateTransactionStatus,
  clearOldSyncedTransactions,
} from './offlineQueue';
import { attendanceApi, patrolApi } from './api';
import { OfflineTransaction } from '@patrol/types';

export interface SyncResult {
  processed: number;
  succeeded: number;
  failed: number;
  timestamp: string;
}

let isSyncInProgress = false;

export async function processOfflineQueue(): Promise<SyncResult> {
  if (isSyncInProgress) {
    return { processed: 0, succeeded: 0, failed: 0, timestamp: new Date().toISOString() };
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { processed: 0, succeeded: 0, failed: 0, timestamp: new Date().toISOString() };
  }

  isSyncInProgress = true;
  let succeeded = 0;
  let failed = 0;
  let processed = 0;

  try {
    const queue = await getPendingTransactions();
    processed = queue.length;

    for (const item of queue) {
      // Re-verify network state before each item
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        await updateTransactionStatus(item.id, 'PENDING_OFFLINE');
        break;
      }

      await updateTransactionStatus(item.id, 'SYNCING');

      try {
        await executeSyncItem(item);
        await updateTransactionStatus(item.id, 'SYNCED', null, new Date().toISOString());
        succeeded++;
      } catch (err: any) {
        // Distinguish between connectivity errors and business rejection
        const isNetworkErr = !err.response || err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED';

        if (isNetworkErr) {
          // Revert to pending so it can be retried when connection stabilizes
          await updateTransactionStatus(item.id, 'PENDING_OFFLINE', 'Koneksi terputus saat sinkronisasi');
          failed++;
          break; // Stop loop, wait for connection
        } else {
          // Business logic rejection (e.g. 400 Bad Request, invalid checkpoint)
          const errorMsg = err.response?.data?.message || err.message || 'Ditolak oleh server';
          await updateTransactionStatus(item.id, 'NEEDS_REVIEW', errorMsg);
          failed++;
        }
      }
    }

    // Periodically clean up old synced transactions
    await clearOldSyncedTransactions(7);
  } finally {
    isSyncInProgress = false;
  }

  return {
    processed,
    succeeded,
    failed,
    timestamp: new Date().toISOString(),
  };
}

async function executeSyncItem(item: OfflineTransaction): Promise<any> {
  const payload = item.payload;

  switch (item.type) {
    case 'ATTENDANCE_CLOCK_IN':
      return attendanceApi.clockIn({
        id: item.id,
        deviceTimestamp: item.deviceTimestamp,
        siteId: payload.siteId,
        latitude: payload.latitude,
        longitude: payload.longitude,
        photoBase64: payload.photoBase64,
        notes: payload.notes,
      });

    case 'ATTENDANCE_CLOCK_OUT':
      return attendanceApi.clockOut({
        id: item.id,
        deviceTimestamp: item.deviceTimestamp,
        attendanceId: payload.attendanceId,
        siteId: payload.siteId,
        latitude: payload.latitude,
        longitude: payload.longitude,
        photoBase64: payload.photoBase64,
        notes: payload.notes,
      });

    case 'PATROL_SCAN':
      return patrolApi.recordScan({
        id: item.id,
        deviceTimestamp: item.deviceTimestamp,
        siteId: payload.siteId,
        checkpointId: payload.checkpointId,
        qrPayload: payload.qrPayload,
        latitude: payload.latitude,
        longitude: payload.longitude,
        statusResult: payload.statusResult,
        notes: payload.notes,
        photoKey: payload.photoKey || payload.photoBase64,
      });

    case 'LEAVE_REQUEST':
      return attendanceApi.leaveRequest({
        siteId: payload.siteId,
        status: payload.status,
        date: payload.date,
        leaveReason: payload.leaveReason,
        attachmentBase64: payload.attachmentBase64,
      });

    default:
      throw new Error(`Tipe transaksi tidak dikenal: ${item.type}`);
  }
}

/**
 * React Hook for consuming offline sync state in UI components
 */
export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);

  const refreshCount = useCallback(async () => {
    try {
      const count = await getPendingCount();
      setPendingCount(count);
    } catch {
      setPendingCount(0);
    }
  }, []);

  const triggerSync = useCallback(async () => {
    if (isSyncing || !isOnline) return;
    setIsSyncing(true);
    try {
      const result = await processOfflineQueue();
      setLastSyncResult(result);
      await refreshCount();
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, isOnline, refreshCount]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-trigger sync when back online
      triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const handleQueueChange = () => {
      refreshCount();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('patrol:offline-queue-changed', handleQueueChange);

    // Initial check
    refreshCount();

    // If online on mount and has pending items, attempt sync
    if (navigator.onLine) {
      triggerSync();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('patrol:offline-queue-changed', handleQueueChange);
    };
  }, [refreshCount, triggerSync]);

  return {
    isOnline,
    isSyncing,
    pendingCount,
    syncNow: triggerSync,
    lastSyncResult,
  };
}
