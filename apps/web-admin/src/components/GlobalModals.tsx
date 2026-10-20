'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useData } from '../lib/DataContext';

const BulkImportModal = dynamic(
  () => import('./BulkImportModal').then((m) => m.BulkImportModal),
  { ssr: false },
);
const PrintQrModal = dynamic(
  () => import('./PrintQrModal').then((m) => m.PrintQrModal),
  { ssr: false },
);
const BatchPrintQrModal = dynamic(
  () => import('./BatchPrintQrModal').then((m) => m.BatchPrintQrModal),
  { ssr: false },
);
const PrintIdCardModal = dynamic(
  () => import('./PrintIdCardModal').then((m) => m.PrintIdCardModal),
  { ssr: false },
);

export const GlobalModals: React.FC = () => {
  const {
    bulkImportType,
    setBulkImportType,
    printQrTarget,
    setPrintQrTarget,
    batchPrintConfig,
    setBatchPrintConfig,
    printIdCardTarget,
    setPrintIdCardTarget,
  } = useData();

  return (
    <>
      {bulkImportType && (
        <BulkImportModal
          isOpen={!!bulkImportType}
          onClose={() => setBulkImportType(null)}
          type={bulkImportType}
          onSuccess={(msg) => {
            alert(msg);
            setBulkImportType(null);
          }}
        />
      )}

      {printQrTarget && (
        <PrintQrModal
          isOpen={!!printQrTarget}
          onClose={() => setPrintQrTarget(null)}
          checkpoint={printQrTarget}
        />
      )}

      {batchPrintConfig && (
        <BatchPrintQrModal
          isOpen={!!batchPrintConfig}
          onClose={() => setBatchPrintConfig(null)}
          config={batchPrintConfig}
        />
      )}

      {printIdCardTarget && (
        <PrintIdCardModal
          isOpen={!!printIdCardTarget}
          onClose={() => setPrintIdCardTarget(null)}
          user={printIdCardTarget}
        />
      )}
    </>
  );
};
