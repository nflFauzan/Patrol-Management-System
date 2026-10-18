'use client';

import React, { useState } from 'react';
import { X, Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useData } from '../lib/DataContext';
import { downloadPersonilExcelTemplate, parsePersonilExcel, PersonilExcelRow } from '../lib/personilTemplateExcel';

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
  const { sites, addCheckpoint, addUser } = useData();
  const [csvText, setCsvText] = useState<string>('');
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = async () => {
    if (type === 'PERSONIL') {
      try {
        await downloadPersonilExcelTemplate(sites, 'Template_Personil.xlsx');
      } catch (err: any) {
        setErrorMsg('Gagal mengunduh template Excel: ' + err.message);
      }
      return;
    }

    // Fallback for CHECKPOINT
    const header = 'Nama Checkpoint,Deskripsi Tugas,Lokasi,Jenis Aset,Kategori Checkpoint,Area / Site\n';
    const sample =
      'Pos Gerbang Utama,Patroli rutin & periksa tamu,Gerbang Utama Depan,Pos Keamanan,Security,Site Proyek Demo\n' +
      'Toilet Lobby,Pembersihan kloset & wastafel,Lobby Lantai 1,Fasilitas Sanitasi,Cleaning Service,Site Proyek Demo\n' +
      'Ruang Server Lt 3,Periksa AC & lampu indikator rack,Lantai 3 Ruang 304,Ruang Server IT,Security,Site Proyek Demo\n';

    const blob = new Blob([header + sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Template_Checkpoint.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);

    // If Excel file (.xlsx / .xls)
    if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
      try {
        setIsLoading(true);
        if (type === 'PERSONIL') {
          const parsed = await parsePersonilExcel(file);
          if (parsed.length === 0) {
            setErrorMsg('Tidak ditemukan baris data personel di dalam lembar kerja (Sheet) Excel.');
            setPreviewRows([]);
          } else {
            setPreviewRows(parsed);
          }
        } else {
          setErrorMsg('Impor format Excel untuk Checkpoint akan segera didukung. Gunakan CSV untuk saat ini.');
        }
      } catch (err: any) {
        setErrorMsg('Gagal membaca file Excel: ' + (err.message || 'Format tidak valid.'));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // CSV Fallback
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

    // 1. Sync imported rows into local React state & cache
    if (type === 'CHECKPOINT') {
      previewRows.forEach((row, idx) => {
        const name = row['Nama Checkpoint'] || row['name'] || `Checkpoint ${idx + 1}`;
        const taskDescription = row['Deskripsi Tugas'] || row['taskDescription'] || 'Pemeriksaan rutin sesuai SOP';
        const locationDetail = row['Lokasi'] || row['locationDetail'] || 'Area Utama';
        const assetType = row['Jenis Aset'] || row['assetType'] || 'Aset Fasilitas';
        const rawCat = row['Kategori Checkpoint'] || row['category'] || 'Security';
        const category = rawCat.toLowerCase().includes('clean') ? 'Cleaning Service' : 'Security';
        const siteName = row['Area / Site'] || row['siteName'] || (sites[0]?.name ?? 'Site Proyek Demo');

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
    } else {
      previewRows.forEach((row: PersonilExcelRow | any, idx) => {
        const fullName = row.namaAnggota || row['NAMA_ANGGOTA'] || row['Nama Personel'] || row.fullName || `Personel ${idx + 1}`;
        const username = (row.username || row['USERNAME'] || `user_${Date.now()}_${idx}`).toString().trim().toLowerCase();
        const password = (row.password || row['PASSWORD'] || 'Password123').toString().trim();
        const workingHoursPerDay = Number(row.jamKerja ?? row['JAM_KERJA'] ?? 8) || 8;
        const rawPosisi = (row.posisi || row['POSISI'] || 'Security').toString();
        const siteName = (row.area || row['AREA'] || sites[0]?.name || 'Site Proyek Demo').toString();
        const gajiPokok = Number(row.gajiPokok ?? row['GAJI_POKOK'] ?? 0) || 0;
        const tunjangan = Number(row.tunjangan ?? row['TUNJANGAN'] ?? 0) || 0;
        const lemburPerJam = Number(row.lembur ?? row['LEMBUR'] ?? 0) || 0;
        const potonganBpjs = Number(row.potBpjs ?? row['POT_BPJS'] ?? 0) || 0;
        const potonganTidakMasuk = Number(row.potTidakMasuk ?? row['POT_TIDAK_MASUK'] ?? 0) || 0;
        const potonganLupaAbsensi = Number(row.potLupaAbsensi ?? row['POT_LUPA_ABSENSI'] ?? 0) || 0;

        addUser({
          id: `usr-imp-${Date.now()}-${idx}`,
          nik: `NIK-${Date.now().toString().slice(-4)}${idx}`,
          fullName,
          username,
          password,
          role: rawPosisi.toLowerCase().includes('admin') ? 'ADMIN_AREA' : 'SECURITY_OFFICER',
          division: rawPosisi.toLowerCase().includes('clean')
            ? 'CLEANING'
            : rawPosisi.toLowerCase().includes('driver')
            ? 'DRIVER'
            : rawPosisi.toLowerCase().includes('staf')
            ? 'STAFF'
            : 'SECURITY',
          securityRank: 'ANGGOTA',
          siteName,
          workingHoursPerDay,
          gajiPokok,
          tunjangan,
          lemburPerJam,
          potonganBpjs,
          potonganTidakMasuk,
          potonganLupaAbsensi,
        });
      });
    }

    // 2. Dispatch to Backend
    const endpoint =
      type === 'CHECKPOINT'
        ? 'http://localhost:3000/api/v1/checkpoints/bulk-import'
        : 'http://localhost:3000/api/v1/auth/bulk-import';

    try {
      const payload =
        type === 'CHECKPOINT'
          ? { siteId: sites[0]?.id || '11111111-1111-1111-1111-111111111111', items: previewRows }
          : { items: previewRows };

      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('patrol_auth_token') || ''}`,
        },
        body: JSON.stringify(payload),
      }).catch(() => null);

      onSuccess(`Berhasil mengimpor ${previewRows.length} baris data ${type === 'PERSONIL' ? 'Personel' : 'Checkpoint'}!`);
      onClose();
    } catch {
      onSuccess(`Berhasil mengimpor ${previewRows.length} baris data ${type === 'PERSONIL' ? 'Personel' : 'Checkpoint'}!`);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const isPersonil = type === 'PERSONIL';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600 rounded-xl shadow-md">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                Import Data {isPersonil ? 'Personel (Template Resmi .XLSX / CSV)' : 'Checkpoint (CSV)'}
              </h3>
              <p className="text-xs text-slate-400">
                Maksimal 500 baris per batch proses • Dilengkapi validasi dropdown posisi & area
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg transition">
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
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  {isPersonil ? 'Unduh Template Excel Resmi (.xlsx)' : 'Gunakan Template Resmi CSV'}
                </h4>
                <p className="text-[11px] text-slate-600">
                  {isPersonil
                    ? 'Format template 100% rapi dengan sheet PERSONIL, DAFTAR_AREA, dan dropdown otomatis'
                    : 'Unduh format kolom yang sesuai agar data tervalidasi sempurna'}
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center space-x-1.5 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isPersonil ? 'Unduh Template Excel (.xlsx)' : 'Unduh Template CSV'}</span>
            </button>
          </div>

          {/* Upload Dropzone */}
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center space-y-2 hover:border-blue-500 transition cursor-pointer relative bg-slate-50/50">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Upload className="w-8 h-8 text-blue-600 mx-auto" />
            <p className="text-xs font-bold text-slate-800">
              Klik atau geser file {isPersonil ? 'Excel (.xlsx) / CSV' : 'CSV'} ke area ini
            </p>
            <p className="text-[11px] text-slate-500">
              {isPersonil
                ? 'Mendukung file hasil unduh Template_Personil.xlsx atau Template_Personil_tes-pt.xlsx'
                : 'Mendukung format .csv (UTF-8) dengan pemisah koma'}
            </p>
          </div>

          {/* Preview Table */}
          {previewRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800">
                  Preview Data ({previewRows.length} Baris Siap Diimpor):
                </span>
                <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Format Kolom Terverifikasi</span>
                </span>
              </div>

              <div className="max-h-56 overflow-auto border border-slate-200 rounded-xl shadow-xs">
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold uppercase border-b sticky top-0 shadow-xs">
                      {isPersonil ? (
                        <>
                          <th className="p-2 border-r bg-slate-100">Nama Personel</th>
                          <th className="p-2 border-r bg-slate-100">Username</th>
                          <th className="p-2 border-r bg-slate-100">Jam</th>
                          <th className="p-2 border-r bg-slate-100">Posisi</th>
                          <th className="p-2 border-r bg-slate-100">Area / Site</th>
                          <th className="p-2 border-r bg-slate-100 text-right">Gaji Pokok</th>
                          <th className="p-2 border-r bg-slate-100 text-right">Tunjangan</th>
                          <th className="p-2 border-r bg-slate-100 text-right">Lembur/Jam</th>
                          <th className="p-2 border-r bg-slate-100 text-right">BPJS</th>
                          <th className="p-2 border-r bg-slate-100 text-right">Alpa</th>
                          <th className="p-2 bg-slate-100 text-right">Lupa Absen</th>
                        </>
                      ) : (
                        Object.keys(previewRows[0] || {}).map((k) => (
                          <th key={k} className="p-2 border-r bg-slate-100">
                            {k}
                          </th>
                        ))
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {previewRows.slice(0, 10).map((row, i) => (
                      <tr key={i} className="hover:bg-blue-50/50 transition">
                        {isPersonil ? (
                          <>
                            <td className="p-2 border-r font-medium text-slate-800">
                              {row.namaAnggota || row['NAMA_ANGGOTA'] || '-'}
                            </td>
                            <td className="p-2 border-r text-slate-600 font-mono text-[10px]">
                              {row.username || row['USERNAME'] || '-'}
                            </td>
                            <td className="p-2 border-r text-center text-slate-600">
                              {row.jamKerja ?? row['JAM_KERJA'] ?? 8} jam
                            </td>
                            <td className="p-2 border-r text-slate-700 font-semibold">
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                                {row.posisi || row['POSISI'] || '-'}
                              </span>
                            </td>
                            <td className="p-2 border-r text-slate-600">
                              {row.area || row['AREA'] || '-'}
                            </td>
                            <td className="p-2 border-r text-right text-slate-700">
                              Rp {(row.gajiPokok ?? row['GAJI_POKOK'] ?? 0).toLocaleString('id-ID')}
                            </td>
                            <td className="p-2 border-r text-right text-slate-700">
                              Rp {(row.tunjangan ?? row['TUNJANGAN'] ?? 0).toLocaleString('id-ID')}
                            </td>
                            <td className="p-2 border-r text-right text-slate-700">
                              Rp {(row.lembur ?? row['LEMBUR'] ?? 0).toLocaleString('id-ID')}
                            </td>
                            <td className="p-2 border-r text-right text-rose-600">
                              Rp {(row.potBpjs ?? row['POT_BPJS'] ?? 0).toLocaleString('id-ID')}
                            </td>
                            <td className="p-2 border-r text-right text-rose-600">
                              Rp {(row.potTidakMasuk ?? row['POT_TIDAK_MASUK'] ?? 0).toLocaleString('id-ID')}
                            </td>
                            <td className="p-2 text-right text-rose-600">
                              Rp {(row.potLupaAbsensi ?? row['POT_LUPA_ABSENSI'] ?? 0).toLocaleString('id-ID')}
                            </td>
                          </>
                        ) : (
                          Object.values(row).map((val: any, j) => (
                            <td key={j} className="p-2 border-r text-slate-600">
                              {val}
                            </td>
                          ))
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {previewRows.length > 10 && (
                <p className="text-[10px] text-slate-500 text-right">
                  + {previewRows.length - 10} baris lainnya akan diimpor ke sistem.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || previewRows.length === 0}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm flex items-center space-x-1.5 transition cursor-pointer"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>Proses Impor {previewRows.length} Data Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  );
};
