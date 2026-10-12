'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, Download, FileText, X, Printer, RefreshCw, CheckCircle2 } from 'lucide-react';
import { PayrollReportRow, Division } from '@patrol/types';

interface PayrollTabProps {
  selectedSiteId: string;
}

export const PayrollTab: React.FC<PayrollTabProps> = ({ selectedSiteId }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [payrollRows, setPayrollRows] = useState<PayrollReportRow[]>([]);
  const [selectedSlip, setSelectedSlip] = useState<PayrollReportRow | null>(null);

  useEffect(() => {
    fetchPayroll();
  }, [selectedMonth, selectedSiteId]);

  const fetchPayroll = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/v1/reports/payroll?month=${selectedMonth}&siteId=${selectedSiteId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('patrol_auth_token') || ''}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setPayrollRows(data.rows || []);
      } else {
        throw new Error('API offline');
      }
    } catch (e) {
      // Mock data for demo preview matching patroli.site
      setPayrollRows([
        {
          userId: 'u1',
          nik: 'SEC-2024-001',
          fullName: 'Ahmad Fauzi',
          division: Division.SECURITY,
          siteName: 'Head Office Sudirman',
          hadirCount: 26,
          lupaAbsenCount: 1,
          izinCount: 0,
          alpaCount: 0,
          gajiPokok: 5200000,
          tunjangan: 800000,
          lemburHours: 4.5,
          lemburNominal: 135000,
          potonganBpjs: 150000,
          potonganAlpa: 0,
          potonganLupaAbsen: 50000,
          totalPotongan: 200000,
          gajiKotor: 6135000,
          gajiDiterima: 5935000,
        },
        {
          userId: 'u2',
          nik: 'DRV-2024-002',
          fullName: 'Budi Santoso',
          division: Division.DRIVER,
          siteName: 'Head Office Sudirman',
          hadirCount: 25,
          lupaAbsenCount: 0,
          izinCount: 2,
          alpaCount: 0,
          gajiPokok: 5000000,
          tunjangan: 750000,
          lemburHours: 12.0,
          lemburNominal: 360000,
          potonganBpjs: 150000,
          potonganAlpa: 0,
          potonganLupaAbsen: 0,
          totalPotongan: 150000,
          gajiKotor: 6110000,
          gajiDiterima: 5960000,
        },
        {
          userId: 'u3',
          nik: 'CLN-2024-004',
          fullName: 'Siti Rahma',
          division: Division.CLEANING,
          siteName: 'Head Office Sudirman',
          hadirCount: 27,
          lupaAbsenCount: 0,
          izinCount: 0,
          alpaCount: 0,
          gajiPokok: 4800000,
          tunjangan: 500000,
          lemburHours: 0,
          lemburNominal: 0,
          potonganBpjs: 120000,
          potonganAlpa: 0,
          potonganLupaAbsen: 0,
          totalPotongan: 120000,
          gajiKotor: 5300000,
          gajiDiterima: 5180000,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'NIK', 'Nama Karyawan', 'Divisi', 'Fasilitas', 'Hadir (H)', 'Lupa (L)', 'Izin (I)', 'Alpa',
      'Gaji Pokok', 'Tunjangan', 'Jam Lembur', 'Uang Lembur', 'Potongan BPJS', 'Potongan Lupa Absen',
      'Total Potongan', 'Gaji Bersih Diterima'
    ].join(',');

    const rows = payrollRows.map((r) => [
      `"${r.nik}"`, `"${r.fullName}"`, `"${r.division}"`, `"${r.siteName}"`,
      r.hadirCount, r.lupaAbsenCount, r.izinCount, r.alpaCount,
      r.gajiPokok, r.tunjangan, r.lemburHours, r.lemburNominal,
      r.potonganBpjs, r.potonganLupaAbsen, r.totalPotongan, r.gajiDiterima
    ].join(',')).join('\n');

    const blob = new Blob([headers + '\n' + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rekap_penggajian_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatRupiah = (val?: number) => {
    return 'Rp ' + (val || 0).toLocaleString('id-ID');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Title & Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <span>Rekapitulasi Gaji & Kompensasi Bulanan (H/L/I Engine)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Perhitungan payroll otomatis: Gaji Pokok + Tunjangan + Lembur - (Potongan BPJS + Potongan Lupa Absen + Potongan Alpa)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:border-emerald-500"
          />

          <button
            onClick={fetchPayroll}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export Rekap Gaji (CSV)</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <th className="py-2.5 px-3">NIK</th>
              <th className="py-2.5 px-3">Nama Lengkap</th>
              <th className="py-2.5 px-2">Divisi</th>
              <th className="py-2.5 px-2 text-center bg-emerald-50 text-emerald-800">Hadir (H)</th>
              <th className="py-2.5 px-2 text-center bg-rose-50 text-rose-800">Lupa (L)</th>
              <th className="py-2.5 px-2 text-center bg-amber-50 text-amber-800">Izin (I)</th>
              <th className="py-2.5 px-3">Gaji Pokok</th>
              <th className="py-2.5 px-3">Tunjangan</th>
              <th className="py-2.5 px-3">Lembur</th>
              <th className="py-2.5 px-3 text-rose-700">Potongan</th>
              <th className="py-2.5 px-3 font-extrabold text-emerald-700 bg-emerald-50/50">Gaji Bersih</th>
              <th className="py-2.5 px-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {isLoading ? (
              <tr>
                <td colSpan={12} className="py-12 text-center text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                  <span>Menghitung rekap payroll...</span>
                </td>
              </tr>
            ) : payrollRows.length > 0 ? (
              payrollRows.map((r) => (
                <tr key={r.userId} className="hover:bg-slate-50 transition">
                  <td className="py-2.5 px-3 font-mono text-slate-500">{r.nik}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{r.fullName}</td>
                  <td className="py-2.5 px-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      r.division === 'SECURITY' ? 'bg-blue-100 text-blue-700' :
                      r.division === 'CLEANING' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {r.division}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-center font-bold text-emerald-700 bg-emerald-50/40">{r.hadirCount}</td>
                  <td className="py-2.5 px-2 text-center font-bold text-rose-700 bg-rose-50/40">{r.lupaAbsenCount}</td>
                  <td className="py-2.5 px-2 text-center font-bold text-amber-700 bg-amber-50/40">{r.izinCount}</td>
                  <td className="py-2.5 px-3">{formatRupiah(r.gajiPokok)}</td>
                  <td className="py-2.5 px-3">{formatRupiah(r.tunjangan)}</td>
                  <td className="py-2.5 px-3">
                    <span className="block font-semibold">{formatRupiah(r.lemburNominal)}</span>
                    <span className="text-[10px] text-slate-400">({r.lemburHours} jam)</span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-rose-600">-{formatRupiah(r.totalPotongan)}</td>
                  <td className="py-2.5 px-3 font-extrabold text-emerald-700 bg-emerald-50/40 text-sm">
                    {formatRupiah(r.gajiDiterima)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => setSelectedSlip(r)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                      title="Lihat Slip Gaji Resmi"
                    >
                      <FileText className="w-4 h-4 text-blue-600" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={12} className="py-8 text-center text-slate-400">
                  Tidak ada data kehadiran pada periode bulan ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Slip Gaji Modal */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase">SLIP GAJI RESMI KARYAWAN</h3>
                <p className="text-xs text-slate-500">Periode: {selectedMonth} • {selectedSlip.siteName}</p>
              </div>
              <button
                onClick={() => setSelectedSlip(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Lengkap:</span>
                <span className="font-bold text-slate-900">{selectedSlip.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">NIK:</span>
                <span className="font-mono text-slate-700">{selectedSlip.nik}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Divisi:</span>
                <span className="font-semibold text-slate-900">{selectedSlip.division}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Rekap Kehadiran:</span>
                <span className="font-semibold text-slate-900">
                  {selectedSlip.hadirCount} Hadir | {selectedSlip.lupaAbsenCount} Lupa | {selectedSlip.izinCount} Izin
                </span>
              </div>
            </div>

            {/* Breakdown Income */}
            <div className="space-y-1.5 text-xs">
              <h4 className="font-bold text-slate-900 uppercase text-[11px] border-b pb-1">Penghasilan (Penerimaan)</h4>
              <div className="flex justify-between text-slate-600">
                <span>Gaji Pokok:</span>
                <span className="font-semibold text-slate-900">{formatRupiah(selectedSlip.gajiPokok)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tunjangan Operasional:</span>
                <span className="font-semibold text-slate-900">{formatRupiah(selectedSlip.tunjangan)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Lembur ({selectedSlip.lemburHours} Jam):</span>
                <span className="font-semibold text-slate-900">{formatRupiah(selectedSlip.lemburNominal)}</span>
              </div>
            </div>

            {/* Breakdown Deductions */}
            <div className="space-y-1.5 text-xs">
              <h4 className="font-bold text-rose-700 uppercase text-[11px] border-b pb-1">Potongan</h4>
              <div className="flex justify-between text-slate-600">
                <span>Potongan BPJS Ketenagakerjaan/Kesehatan:</span>
                <span className="font-semibold text-rose-600">-{formatRupiah(selectedSlip.potonganBpjs)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Potongan Lupa Absen ({selectedSlip.lupaAbsenCount}x):</span>
                <span className="font-semibold text-rose-600">-{formatRupiah(selectedSlip.potonganLupaAbsen)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Potongan Alpa ({selectedSlip.alpaCount}x):</span>
                <span className="font-semibold text-rose-600">-{formatRupiah(selectedSlip.potonganAlpa)}</span>
              </div>
            </div>

            {/* Total Net */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex justify-between items-center text-sm">
              <span className="font-black text-emerald-950 uppercase">Gaji Bersih Diterima:</span>
              <span className="font-black text-emerald-700 text-lg">{formatRupiah(selectedSlip.gajiDiterima)}</span>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Slip Gaji</span>
              </button>
              <button
                onClick={() => setSelectedSlip(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
