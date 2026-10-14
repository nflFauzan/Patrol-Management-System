'use client';

import React from 'react';
import { useData } from '../lib/DataContext';
import { BulkImportModal } from './BulkImportModal';
import { PrintQrModal } from './PrintQrModal';
import { BatchPrintQrModal } from './BatchPrintQrModal';
import { PrintIdCardModal } from './PrintIdCardModal';

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
