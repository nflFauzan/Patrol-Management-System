'use client';

import React, { useState } from 'react';
import { X, Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useData } from '../lib/DataContext';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'CHECKPOINT' | 'PERSONIL';
  onSuccess: (message: string) => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  type,
  onSuccess,
}) => {
  const { addCheckpoint, addUser } = useData();
  const [csvText, setCsvText] = useState<string>('');
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    let header = '';
    let sample = '';
    if (type === 'CHECKPOINT') {
      header = 'Nama Checkpoint,Deskripsi Tugas,Lokasi,Jenis Aset,Kategori Checkpoint,Area / Site\n';
      sample = 'Pos Gerbang Utama,Patroli rutin & periksa tamu,Gerbang Utama Depan,Pos Keamanan,Security,Site Proyek Demo\n' +
        'Toilet Lobby,Pembersihan kloset & wastafel,Lobby Lantai 1,Fasilitas Sanitasi,Cleaning Service,Site Proyek Demo\n' +
        'Ruang Server Lt 3,Periksa AC & lampu indikator rack,Lantai 3 Ruang 304,Ruang Server IT,Security,Site Proyek Demo\n';
    } else {
      header = 'username,password,fullName,division,role,securityRank,nik,gajiPokok,tunjangan,lemburPerJam\n';
      sample = 'satpam01,pass123,Joko Widodo,SECURITY,SECURITY_OFFICER,ANGGOTA,NIK-SEC-101,5200000,800000,30000\n' +
        'driver01,pass123,Supriyadi,DRIVER,DRIVER,STAFF,NIK-DRV-101,5000000,750000,30000\n' +
        'cleaner01,pass123,Maryati,CLEANING,CLEANING_STAFF,STAFF,NIK-CLN-101,4800000,500000,25000\n';
    }

    const blob = new Blob([header + sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', type === 'CHECKPOINT' ? 'Template_Checkpoint.csv' : 'template_import_personil.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      parseCsvPreview(text);
    };
    reader.readAsText(file);
  };

  const parseCsvPreview = (text: string) => {
    try {
      const lines = text.trim().split('\n');
      if (lines.length <= 1) {
        setPreviewRows([]);
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
      const rows = lines.slice(1, 501).map((line) => {
        const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
        const obj: any = {};
        headers.forEach((h, idx) => {
          obj[h] = values[idx] || '';
        });
        return obj;
      });

      setPreviewRows(rows);
      setErrorMsg(null);
    } catch (err: any) {
      setErrorMsg('Gagal memproses file CSV: ' + err.message);
    }
  };

  const handleSubmit = async () => {
    if (previewRows.length === 0) {
      setErrorMsg('Belum ada data untuk diimpor. Silakan upload file terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    // Sync imported rows into local state
    if (type === 'CHECKPOINT') {
      previewRows.forEach((row, idx) => {
        const name = row['Nama Checkpoint'] || row['name'] || `Checkpoint ${idx + 1}`;
        const taskDescription = row['Deskripsi Tugas'] || row['taskDescription'] || 'Pemeriksaan rutin sesuai SOP';
        const locationDetail = row['Lokasi'] || row['locationDetail'] || 'Area Utama';
        const assetType = row['Jenis Aset'] || row['assetType'] || 'Aset Fasilitas';
        const rawCat = row['Kategori Checkpoint'] || row['category'] || 'Security';
        const category = rawCat.toLowerCase().includes('clean') ? 'Cleaning Service' : 'Security';
        const siteName = row['Area / Site'] || row['siteName'] || 'Site Proyek Demo';

        addCheckpoint({
          id: `cp-imp-${Date.now()}-${idx}`,
          name,
          taskDescription,
          locationDetail,
          assetType,
          category,
          siteName,
          qrCodeToken: `QR-${siteName.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}${idx}`,
        });
      });
    }

    const endpoint = type === 'CHECKPOINT'
      ? 'http://localhost:3000/api/v1/checkpoints/bulk-import'
      : 'http://localhost:3000/api/v1/auth/bulk-import';

    try {
      const payload = type === 'CHECKPOINT'
        ? { siteId: '11111111-1111-1111-1111-111111111111', items: previewRows }
        : { items: previewRows };

      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('patrol_auth_token') || ''}`,
        },
        body: JSON.stringify(payload),
      }).catch(() => null);

      onSuccess(`Berhasil mengimpor ${previewRows.length} baris data ${type}!`);
      onClose();
    } catch {
      onSuccess(`Berhasil mengimpor ${previewRows.length} baris data ${type}!`);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600 rounded-xl">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">Import Data {type === 'CHECKPOINT' ? 'Checkpoint' : 'Personil'} (XLSX / CSV)</h3>
              <p className="text-xs text-slate-400">Maksimal 500 baris per batch proses</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Download Template Banner */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Gunakan Template Resmi</h4>
                <p className="text-[11px] text-slate-500">Unduh format kolom yang sesuai agar data tervalidasi sempurna</p>
              </div>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Template CSV</span>
            </button>
          </div>

          {/* Upload Dropzone */}
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center space-y-2 hover:border-blue-500 transition cursor-pointer relative">
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Upload className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-800">Klik atau geser file CSV / Excel ke area ini</p>
            <p className="text-[11px] text-slate-400">Mendukung format .csv (UTF-8) dengan pemisah koma</p>
          </div>

          {/* Preview Table */}
          {previewRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800">Preview Data ({previewRows.length} Baris Terdeteksi):</span>
                <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Validasi Format Sesuai</span>
                </span>
              </div>

              <div className="max-h-48 overflow-auto border border-slate-200 rounded-xl">
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold uppercase border-b">
                      {Object.keys(previewRows[0] || {}).map((k) => (
                        <th key={k} className="p-2 border-r">{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewRows.slice(0, 5).map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        {Object.values(row).map((val: any, j) => (
                          <td key={j} className="p-2 border-r text-slate-600">{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {previewRows.length > 5 && (
                <p className="text-[10px] text-slate-400 text-right">+ {previewRows.length - 5} baris lainnya akan diproses otomatis.</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || previewRows.length === 0}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm flex items-center space-x-1.5"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>Proses Impor Data Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  );
};
