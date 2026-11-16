import { getFieldDB } from './db';
import { OfflineTransaction, OfflineTransactionType, OfflineTransactionStatus } from '@patrol/types';

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function enqueueOfflineTransaction(
  type: OfflineTransactionType,
  payload: any,
): Promise<OfflineTransaction> {
  const db = await getFieldDB();
  const id = generateUUID();
  const timestamp = new Date().toISOString();

  const transaction: OfflineTransaction = {
    id,
    type,
    payload: {
      ...payload,
      id,
      deviceTimestamp: timestamp,
    },
    deviceTimestamp: timestamp,
    createdAt: timestamp,
    status: 'PENDING_OFFLINE',
    retryCount: 0,
    lastError: null,
    serverSyncedAt: null,
  };

  await db.put('offline_queue', transaction);
  notifyQueueChanged();
  return transaction;
}

export async function getPendingTransactions(): Promise<OfflineTransaction[]> {
  const db = await getFieldDB();
  const all = await db.getAll('offline_queue');
  return all
    .filter((tx) => tx.status === 'PENDING_OFFLINE' || tx.status === 'SYNCING')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export async function getAllTransactions(): Promise<OfflineTransaction[]> {
  const db = await getFieldDB();
  const all = await db.getAll('offline_queue');
  return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getPendingCount(): Promise<number> {
  const pending = await getPendingTransactions();
  return pending.length;
}

export async function updateTransactionStatus(
  id: string,
  status: OfflineTransactionStatus,
  error?: string | null,
  serverSyncedAt?: string | null,
): Promise<void> {
  const db = await getFieldDB();
  const tx = await db.get('offline_queue', id);
  if (tx) {
    tx.status = status;
    if (error !== undefined) {
      tx.lastError = error;
    }
    if (serverSyncedAt !== undefined) {
      tx.serverSyncedAt = serverSyncedAt;
    }
    if (status === 'REJECTED' || status === 'NEEDS_REVIEW') {
      tx.retryCount += 1;
    }
    await db.put('offline_queue', tx);
    notifyQueueChanged();
  }
}

export async function deleteTransaction(id: string): Promise<void> {
  const db = await getFieldDB();
  await db.delete('offline_queue', id);
  notifyQueueChanged();
}

export async function clearOldSyncedTransactions(daysRetention = 7): Promise<number> {
  const db = await getFieldDB();
  const all = await db.getAll('offline_queue');
  const cutoff = Date.now() - daysRetention * 24 * 60 * 60 * 1000;
  let deletedCount = 0;

  for (const tx of all) {
    if (tx.status === 'SYNCED' && new Date(tx.createdAt).getTime() < cutoff) {
      await db.delete('offline_queue', tx.id);
      deletedCount++;
    }
  }

  if (deletedCount > 0) {
    notifyQueueChanged();
  }
  return deletedCount;
}

function notifyQueueChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('patrol:offline-queue-changed'));
  }
}
