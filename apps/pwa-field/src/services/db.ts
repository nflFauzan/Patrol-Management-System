import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { OfflineTransaction } from '@patrol/types';

export interface PatrolFieldDBSchema extends DBSchema {
  offline_queue: {
    key: string;
    value: OfflineTransaction;
    indexes: {
      'by-status': string;
      'by-created': string;
      'by-type': string;
    };
  };
  cached_sites: {
    key: string;
    value: any;
  };
  cached_checkpoints: {
    key: string;
    value: any;
    indexes: {
      'by-site': string;
    };
  };
  meta_cache: {
    key: string;
    value: { key: string; data: any; updatedAt: string };
  };
}

const DB_NAME = 'patrol_field_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<PatrolFieldDBSchema>> | null = null;

export function getFieldDB(): Promise<IDBPDatabase<PatrolFieldDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<PatrolFieldDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Offline Transaction Queue
        if (!db.objectStoreNames.contains('offline_queue')) {
          const queueStore = db.createObjectStore('offline_queue', { keyPath: 'id' });
          queueStore.createIndex('by-status', 'status');
          queueStore.createIndex('by-created', 'createdAt');
          queueStore.createIndex('by-type', 'type');
        }

        // Cached Sites
        if (!db.objectStoreNames.contains('cached_sites')) {
          db.createObjectStore('cached_sites', { keyPath: 'id' });
        }

        // Cached Checkpoints
        if (!db.objectStoreNames.contains('cached_checkpoints')) {
          const cpStore = db.createObjectStore('cached_checkpoints', { keyPath: 'id' });
          cpStore.createIndex('by-site', 'siteId');
        }

        // Key-Value metadata store (e.g., last known sync, user profile)
        if (!db.objectStoreNames.contains('meta_cache')) {
          db.createObjectStore('meta_cache', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}
