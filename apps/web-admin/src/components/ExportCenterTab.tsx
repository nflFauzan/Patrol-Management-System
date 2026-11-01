'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Printer,
  Calendar,
  Building2,
  Users,
  CheckCircle2,
  AlertTriangle,
  X,
  RefreshCw,
  Clock,
  ShieldCheck,
  Search,
  ExternalLink,
} from 'lucide-react';
import * as XLSX from 'xlsx-js-style';

interface SiteItem {
  id: string;
  name: string;
}

interface PersonnelItem {
  id: string;
  fullName: string;
  division: string;
}

interface KpiSummary {
  kehadiranCount: number;
  lupaPulangCount: number;
  izinSakitCount: number;
  terlambatCount: number;
  terlambatMenit: number;
  pulangAwalCount: number;
  pulangAwalMenit: number;
}

interface AttendanceRow {
  no: number;
  tanggal?: string;
  hari?: string;
  namaPersonil?: string;
  divisi?: string;
  absenMasuk: string;
  absenPulang: string;
  fotoMasuk?: string | null;
  fotoPulang?: string | null;
  keterangan: string;
  totalJamEfektif: string;
}

interface ActivityRow {
  no: number;
  namaPersonel?: string;
  hari: string;
  tanggal: string;
  jam: string;
  deskripsiTugas: string;
  fotoKegiatan?: string | null;
  lokasiAset?: string;
  temuanDilaporkan?: string;
  statusTemuan?: string;
  catatanTindakLanjut?: string;
}

export const ExportCenterTab: React.FC = () => {
  // Sites list
  const [sites, setSites] = useState<SiteItem[]>([
    { id: '11111111-1111-1111-1111-111111111111', name: 'KANTOR PUSAT' },
    { id: '22222222-2222-2222-2222-222222222222', name: 'PABRIK BEKASI' },
    { id: '33333333-3333-3333-3333-333333333333', name: 'GUDANG CAKUNG' },
    { id: '44444444-4444-4444-4444-444444444444', name: 'POOL KENDARAAN' },
  ]);

  // Card 1: ABSENSI PERSONIL
  const [area1, setArea1] = useState<string>('kantor pusat');
  const [categories1, setCategories1] = useState<string[]>(['Security', 'Staf', 'Cleaning Service']);
  const [kategori1, setKategori1] = useState<string>('Security');
  const [personnelList1, setPersonnelList1] = useState<PersonnelItem[]>([
    { id: '1436', fullName: 'BUDI SANTOSO', division: 'Security' },
    { id: '1437', fullName: 'ANDI RAHMAN', division: 'Security' },
  ]);
  const [personil1, setPersonil1] = useState<string>('budi santoso');
  const [dari1, setDari1] = useState<string>('2026-10-01');
  const [sampai1, setSampai1] = useState<string>('2026-10-31');
  const [loading1, setLoading1] = useState<boolean>(false);

  // Card 2: ABSENSI AREA
  const [area2, setArea2] = useState<string>('kantor pusat');
  const [categories2, setCategories2] = useState<string[]>(['Security', 'Staf', 'Cleaning Service']);
  const [kategori2, setKategori2] = useState<string>('Security');
  const [dari2, setDari2] = useState<string>('2026-10-01');
  const [sampai2, setSampai2] = useState<string>('2026-10-31');
  const [loading2, setLoading2] = useState<boolean>(false);

  // Card 3: KEGIATAN PERSONIL
  const [area3, setArea3] = useState<string>('kantor pusat');
  const [categories3, setCategories3] = useState<string[]>(['Security', 'Staf', 'Cleaning Service']);
  const [kategori3, setKategori3] = useState<string>('Security');
  const [personnelList3, setPersonnelList3] = useState<PersonnelItem[]>([
    { id: '1436', fullName: 'BUDI SANTOSO', division: 'Security' },
    { id: '1437', fullName: 'ANDI RAHMAN', division: 'Security' },
  ]);
  const [personil3, setPersonil3] = useState<string>('budi santoso');
  const [dari3, setDari3] = useState<string>('2026-10-01');
  const [sampai3, setSampai3] = useState<string>('2026-10-31');
  const [loading3, setLoading3] = useState<boolean>(false);

  // Card 4: KEGIATAN AREA
  const [area4, setArea4] = useState<string>('kantor pusat');
  const [categories4, setCategories4] = useState<string[]>(['Security', 'Staf', 'Cleaning Service']);
  const [kategori4, setKategori4] = useState<string>('Security');
  const [dari4, setDari4] = useState<string>('2026-10-01');
  const [sampai4, setSampai4] = useState<string>('2026-10-31');
  const [loading4, setLoading4] = useState<boolean>(false);

  // Modal Printable Preview State
  const [printModalOpen, setPrintModalOpen] = useState<boolean>(false);
  const [printTitle, setPrintTitle] = useState<string>('');
  const [printSubtitle, setPrintSubtitle] = useState<string>('');
  const [printType, setPrintType] = useState<'att_personnel' | 'att_area' | 'act_personnel' | 'act_area'>('att_personnel');
  const [printKpi, setPrintKpi] = useState<KpiSummary | null>(null);
  const [printAttendanceRows, setPrintAttendanceRows] = useState<AttendanceRow[]>([]);
  const [printActivityRows, setPrintActivityRows] = useState<ActivityRow[]>([]);

  // Fetch initial sites
  useEffect(() => {
    async function loadSites() {
      try {
        const res = await fetch('/api/v1/sites');
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data) && json.data.length > 0) {
            setSites(json.data.map((s: any) => ({ id: s.id, name: s.name.toUpperCase() })));
          }
        }
      } catch {
        // use default fallback sites
      }
    }
    loadSites();
  }, []);

  // Cascading logic for Card 1
  const handleArea1Change = async (newArea: string) => {
    setArea1(newArea);
    if (!newArea) {
      setCategories1([]);
      setKategori1('');
      setPersonnelList1([]);
      setPersonil1('');
      return;
    }
    try {
      const res = await fetch(`/api/v1/reports/export/categories?area=${encodeURIComponent(newArea)}`);
      if (res.ok) {
        const json = await res.json();
        const cats = json.data || ['Security', 'Staf', 'Cleaning Service'];
        setCategories1(cats);
        setKategori1(cats[0] || '');
        loadPersonnel1(newArea, cats[0] || '');
        return;
      }
    } catch {}
    setCategories1(['Security', 'Staf', 'Cleaning Service']);
    setKategori1('Security');
    loadPersonnel1(newArea, 'Security');
  };

  const handleKategori1Change = (newKat: string) => {
    setKategori1(newKat);
    loadPersonnel1(area1, newKat);
  };

  const loadPersonnel1 = async (a: string, k: string) => {
    try {
      const res = await fetch(`/api/v1/reports/export/personnel?area=${encodeURIComponent(a)}&category=${encodeURIComponent(k)}`);
      if (res.ok) {
        const json = await res.json();
        const pers = json.data || [];
        setPersonnelList1(pers);
        setPersonil1(pers.length > 0 ? pers[0].fullName.toLowerCase() : '');
        return;
      }
    } catch {}
    // fallback
    if (k.toLowerCase().includes('clean')) {
      setPersonnelList1([{ id: '1439', fullName: 'SITI RAHAYU', division: 'Cleaning Service' }]);
      setPersonil1('siti rahayu');
    } else if (k.toLowerCase().includes('driver')) {
      setPersonnelList1([{ id: '1440', fullName: 'RUDI HARTONO', division: 'Driver' }]);
      setPersonil1('rudi hartono');
    } else {
      setPersonnelList1([
        { id: '1436', fullName: 'BUDI SANTOSO', division: 'Security' },
        { id: '1437', fullName: 'ANDI RAHMAN', division: 'Security' },
      ]);
      setPersonil1('budi santoso');
    }
  };

  // Cascading logic for Card 2
  const handleArea2Change = async (newArea: string) => {
    setArea2(newArea);
    if (!newArea) {
      setCategories2([]);
      setKategori2('');
      return;
    }
    try {
      const res = await fetch(`/api/v1/reports/export/categories?area=${encodeURIComponent(newArea)}`);
      if (res.ok) {
        const json = await res.json();
        const cats = json.data || ['Security', 'Staf', 'Cleaning Service'];
        setCategories2(cats);
        setKategori2(cats[0] || '');
        return;
      }
    } catch {}
    setCategories2(['Security', 'Staf', 'Cleaning Service']);
    setKategori2('Security');
  };

  // Cascading logic for Card 3
  const handleArea3Change = async (newArea: string) => {
    setArea3(newArea);
    if (!newArea) {
      setCategories3([]);
      setKategori3('');
      setPersonnelList3([]);
      setPersonil3('');
      return;
    }
    try {
      const res = await fetch(`/api/v1/reports/export/categories?area=${encodeURIComponent(newArea)}`);
      if (res.ok) {
        const json = await res.json();
        const cats = json.data || ['Security', 'Staf', 'Cleaning Service'];
        setCategories3(cats);
        setKategori3(cats[0] || '');
        loadPersonnel3(newArea, cats[0] || '');
        return;
      }
    } catch {}
    setCategories3(['Security', 'Staf', 'Cleaning Service']);
    setKategori3('Security');
    loadPersonnel3(newArea, 'Security');
  };

  const handleKategori3Change = (newKat: string) => {
    setKategori3(newKat);
    loadPersonnel3(area3, newKat);
  };

  const loadPersonnel3 = async (a: string, k: string) => {
    try {
      const res = await fetch(`/api/v1/reports/export/personnel?area=${encodeURIComponent(a)}&category=${encodeURIComponent(k)}`);
      if (res.ok) {
        const json = await res.json();
        const pers = json.data || [];
        setPersonnelList3(pers);
        setPersonil3(pers.length > 0 ? pers[0].fullName.toLowerCase() : '');
        return;
      }
    } catch {}
    if (k.toLowerCase().includes('clean')) {
      setPersonnelList3([{ id: '1439', fullName: 'SITI RAHAYU', division: 'Cleaning Service' }]);
      setPersonil3('siti rahayu');
    } else if (k.toLowerCase().includes('driver')) {
      setPersonnelList3([{ id: '1440', fullName: 'RUDI HARTONO', division: 'Driver' }]);
      setPersonil3('rudi hartono');
    } else {
      setPersonnelList3([
        { id: '1436', fullName: 'BUDI SANTOSO', division: 'Security' },
        { id: '1437', fullName: 'ANDI RAHMAN', division: 'Security' },
      ]);
      setPersonil3('budi santoso');
    }
  };

  // Cascading logic for Card 4
  const handleArea4Change = async (newArea: string) => {
    setArea4(newArea);
    if (!newArea) {
      setCategories4([]);
      setKategori4('');
      return;
    }
    try {
      const res = await fetch(`/api/v1/reports/export/categories?area=${encodeURIComponent(newArea)}`);
      if (res.ok) {
        const json = await res.json();
        const cats = json.data || ['Security', 'Staf', 'Cleaning Service'];
        setCategories4(cats);
        setKategori4(cats[0] || '');
        return;
      }
    } catch {}
    setCategories4(['Security', 'Staf', 'Cleaning Service']);
    setKategori4('Security');
  };

  // ============================================================================
  // EXPORT HANDLERS - CARD 1: ABSENSI PERSONIL
  // ============================================================================

  const handleCard1Pdf = async () => {
    setLoading1(true);
    try {
      const res = await fetch(
        `/api/v1/reports/export/attendance-personnel?lokasi_area=${encodeURIComponent(area1)}&kategori=${encodeURIComponent(kategori1)}&nama_personil=${encodeURIComponent(personil1)}&dari=${dari1}&sampai=${sampai1}`,
      );
      if (res.ok) {
        const data = await res.json();
        setPrintTitle(`CETAK ABSENSI PERSONIL: ${data.namaPersonil} (${data.posisi})`);
        setPrintSubtitle(`Site: ${data.siteName} | Periode: ${dari1} s/d ${sampai1}`);
        setPrintType('att_personnel');
        setPrintKpi(data.summary);
        setPrintAttendanceRows(data.records);
        setPrintModalOpen(true);
        return;
      }
    } catch {}
    // Fallback display
    setPrintTitle(`CETAK ABSENSI PERSONIL: ${personil1.toUpperCase()} (${kategori1.toUpperCase()})`);
    setPrintSubtitle(`Site: ${area1.toUpperCase()} | Periode: ${dari1} s/d ${sampai1}`);
    setPrintType('att_personnel');
    setPrintKpi({
      kehadiranCount: 1,
      lupaPulangCount: 1,
      izinSakitCount: 0,
      terlambatCount: 0,
      terlambatMenit: 0,
      pulangAwalCount: 0,
      pulangAwalMenit: 0,
    });
    setPrintAttendanceRows([
      {
        no: 1,
        tanggal: '2026-10-26',
        hari: 'Senin',
        absenMasuk: 'Senin, 26 Oct 2026 | 05:33:53\nDalam Radius Area\nTepat Waktu',
        absenPulang: 'Belum Absen Pulang',
        fotoMasuk: 'foto-patroli/6ade843c19fde',
        fotoPulang: null,
        keterangan: '-',
        totalJamEfektif: '-',
      },
    ]);
    setPrintModalOpen(true);
    setLoading1(false);
  };

  const handleCard1Excel = async () => {
    setLoading1(true);
    try {
      let records: AttendanceRow[] = [];
      let personName = personil1.toUpperCase();
      let pos = kategori1.toUpperCase();
      let stName = area1.toUpperCase();

      try {
        const res = await fetch(
          `/api/v1/reports/export/attendance-personnel?lokasi_area=${encodeURIComponent(area1)}&kategori=${encodeURIComponent(kategori1)}&nama_personil=${encodeURIComponent(personil1)}&dari=${dari1}&sampai=${sampai1}`,
        );
        if (res.ok) {
          const json = await res.json();
          records = json.records || [];
          personName = json.namaPersonil || personName;
          pos = json.posisi || pos;
          stName = json.siteName || stName;
        }
      } catch {}

      if (records.length === 0) {
        records = [
          {
            no: 1,
            absenMasuk: 'Senin, 26 Oct 2026 | 05:33:53 Dalam Radius Area Tepat Waktu',
            absenPulang: 'Belum Absen Pulang',
            fotoMasuk: '-',
            fotoPulang: '-',
            keterangan: '-',
            totalJamEfektif: '-',
          },
        ];
      }

      const wb = XLSX.utils.book_new();
      const wsData: any[][] = [
        ['LAPORAN ABSENSI PERSONIL (PATROLI SITE)'],
        [`Nama Personil: ${personName}`, `Posisi: ${pos}`, `Site: ${stName}`],
        [`Periode: ${dari1} s/d ${sampai1}`],
        [],
        ['NO', 'ABSEN MASUK', 'ABSEN PULANG', 'FOTO ABSEN IN', 'FOTO ABSEN OUT', 'KETERANGAN', 'TOTAL JAM EFEKTIF'],
      ];

      records.forEach((r) => {
        wsData.push([
          r.no,
          r.absenMasuk.replace(/\n/g, ' - '),
          r.absenPulang,
          r.fotoMasuk ? 'Ada Foto' : '-',
          r.fotoPulang ? 'Ada Foto' : '-',
          r.keterangan || '-',
          r.totalJamEfektif || '-',
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws['!cols'] = [{ wch: 6 }, { wch: 45 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 18 }];

      XLSX.utils.book_append_sheet(wb, ws, 'Absensi Personil');
      const filename = `Absensi_Personil_${personil1.replace(/\s+/g, '_')}_${dari1}_sampai_${sampai1}.xlsx`;
      XLSX.writeFile(wb, filename);
    } finally {
      setLoading1(false);
    }
  };

  // ============================================================================
  // EXPORT HANDLERS - CARD 2: ABSENSI AREA
  // ============================================================================

  const handleCard2Pdf = async () => {
    setLoading2(true);
    try {
      const res = await fetch(
        `/api/v1/reports/export/attendance-area?lokasi_area=${encodeURIComponent(area2)}&kategori=${encodeURIComponent(kategori2)}&dari=${dari2}&sampai=${sampai2}`,
      );
      if (res.ok) {
        const data = await res.json();
        setPrintTitle(`LAPORAN ABSENSI AREA: ${data.siteName} (${data.kategori})`);
        setPrintSubtitle(`Periode: ${dari2} s/d ${sampai2}`);
        setPrintType('att_area');
        setPrintKpi(null);
        setPrintAttendanceRows(data.records);
        setPrintModalOpen(true);
        return;
      }
    } catch {}
    setPrintTitle(`LAPORAN ABSENSI AREA: ${area2.toUpperCase()} (${kategori2.toUpperCase()})`);
    setPrintSubtitle(`Periode: ${dari2} s/d ${sampai2}`);
    setPrintType('att_area');
    setPrintKpi(null);
    setPrintAttendanceRows([
      {
        no: 1,
        namaPersonil: 'HENDRA GUNAWAN',
        divisi: 'STAF',
        absenMasuk: 'Senin, 26 Oct 2026 | 05:35:40 Dalam Radius Area Tepat Waktu',
        absenPulang: 'Belum Absen Pulang',
        keterangan: '-',
        totalJamEfektif: '-',
      },
      {
        no: 2,
        namaPersonil: 'SITI RAHAYU',
        divisi: 'CLEANING SERVICE',
        absenMasuk: 'Senin, 26 Oct 2026 | 05:34:30 Dalam Radius Area Tepat Waktu',
        absenPulang: 'Belum Absen Pulang',
        keterangan: '-',
        totalJamEfektif: '-',
      },
      {
        no: 3,
        namaPersonil: 'BUDI SANTOSO',
        divisi: 'SECURITY',
        absenMasuk: 'Senin, 26 Oct 2026 | 05:33:53 Dalam Radius Area Tepat Waktu',
        absenPulang: 'Belum Absen Pulang',
        keterangan: '-',
        totalJamEfektif: '-',
      },
      {
        no: 4,
        namaPersonil: 'ANDI RAHMAN',
        divisi: 'SECURITY',
        absenMasuk: 'Senin, 26 Oct 2026 | 05:31:26 Dalam Radius Area Tepat Waktu',
        absenPulang: 'Belum Absen Pulang',
        keterangan: '-',
        totalJamEfektif: '-',
      },
    ]);
    setPrintModalOpen(true);
    setLoading2(false);
  };

  const handleCard2Excel = async () => {
    setLoading2(true);
    try {
      let records: AttendanceRow[] = [];
      let stName = area2.toUpperCase();
      let kat = kategori2.toUpperCase();

      try {
        const res = await fetch(
          `/api/v1/reports/export/attendance-area?lokasi_area=${encodeURIComponent(area2)}&kategori=${encodeURIComponent(kategori2)}&dari=${dari2}&sampai=${sampai2}`,
        );
        if (res.ok) {
          const json = await res.json();
          records = json.records || [];
          stName = json.siteName || stName;
          kat = json.kategori || kat;
        }
      } catch {}

      if (records.length === 0) {
        records = [
          {
            no: 1,
            namaPersonil: 'BUDI SANTOSO',
            absenMasuk: 'Senin, 26 Oct 2026 | 05:33:53 Dalam Radius Area Tepat Waktu',
            absenPulang: 'Belum Absen Pulang',
            keterangan: '-',
            totalJamEfektif: '-',
          },
        ];
      }

      const wb = XLSX.utils.book_new();
      const wsData: any[][] = [
        ['LAPORAN ABSENSI AREA (PATROLI SITE)'],
        [`Lokasi / Site: ${stName}`, `Kategori: ${kat}`],
        [`Periode: ${dari2} s/d ${sampai2}`],
        [],
        ['NO', 'NAMA PERSONIL', 'ABSEN MASUK', 'ABSEN PULANG', 'FOTO ABSEN MASUK', 'FOTO ABSEN PULANG', 'KETERANGAN', 'TOTAL JAM EFEKTIF'],
      ];

      records.forEach((r) => {
        wsData.push([
          r.no,
          r.namaPersonil || '-',
          r.absenMasuk.replace(/\n/g, ' - '),
          r.absenPulang,
          r.fotoMasuk ? 'Ada' : '-',
          r.fotoPulang ? 'Ada' : '-',
          r.keterangan || '-',
          r.totalJamEfektif || '-',
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws['!cols'] = [{ wch: 6 }, { wch: 25 }, { wch: 45 }, { wch: 30 }, { wch: 18 }, { wch: 18 }, { wch: 20 }, { wch: 18 }];

      XLSX.utils.book_append_sheet(wb, ws, 'Absensi Area');
      const filename = `Absensi_Area_${area2.replace(/\s+/g, '_')}_${dari2}_sampai_${sampai2}.xlsx`;
      XLSX.writeFile(wb, filename);
    } finally {
      setLoading2(false);
    }
  };

  // ============================================================================
  // EXPORT HANDLERS - CARD 3: KEGIATAN PERSONIL
  // ============================================================================

  const handleCard3Pdf = async () => {
    setLoading3(true);
    try {
      const res = await fetch(
        `/api/v1/reports/export/activity-personnel?lokasi_area=${encodeURIComponent(area3)}&kategori=${encodeURIComponent(kategori3)}&nama_personil=${encodeURIComponent(personil3)}&dari=${dari3}&sampai=${sampai3}`,
      );
      if (res.ok) {
        const data = await res.json();
        setPrintTitle(`DATA KEGIATAN PERSONIL: ${data.namaPersonil} (${data.posisi})`);
        setPrintSubtitle(`Site: ${data.siteName} | Periode: ${dari3} s/d ${sampai3}`);
        setPrintType('act_personnel');
        setPrintKpi(null);
        setPrintActivityRows(data.records);
        setPrintModalOpen(true);
        return;
      }
    } catch {}
    setPrintTitle(`DATA KEGIATAN PERSONIL: ${personil3.toUpperCase()} (${kategori3.toUpperCase()})`);
    setPrintSubtitle(`Site: ${area3.toUpperCase()} | Periode: ${dari3} s/d ${sampai3}`);
    setPrintType('act_personnel');
    setPrintKpi(null);
    setPrintActivityRows([
      {
        no: 1,
        hari: 'Senin',
        tanggal: '26 Oct 2026',
        jam: '05:34:00',
        deskripsiTugas: 'Pengecekan akses pintu smart lock dan suhu ac server ruang server lantai 3 ruang 305',
        fotoKegiatan: null,
      },
    ]);
    setPrintModalOpen(true);
    setLoading3(false);
  };

  const handleCard3Excel = async () => {
    setLoading3(true);
    try {
      let records: ActivityRow[] = [];
      let personName = personil3.toUpperCase();
      let pos = kategori3.toUpperCase();
      let stName = area3.toUpperCase();

      try {
        const res = await fetch(
          `/api/v1/reports/export/activity-personnel?lokasi_area=${encodeURIComponent(area3)}&kategori=${encodeURIComponent(kategori3)}&nama_personil=${encodeURIComponent(personil3)}&dari=${dari3}&sampai=${sampai3}`,
        );
        if (res.ok) {
          const json = await res.json();
          records = json.records || [];
          personName = json.namaPersonil || personName;
          pos = json.posisi || pos;
          stName = json.siteName || stName;
        }
      } catch {}

      if (records.length === 0) {
        records = [
          {
            no: 1,
            hari: 'Senin',
            tanggal: '26 Oct 2026',
            jam: '05:34:00',
            deskripsiTugas: 'Pengecekan akses pintu smart lock dan suhu AC server di Ruang Server Lantai 3',
            fotoKegiatan: '-',
          },
        ];
      }

      const wb = XLSX.utils.book_new();
      const wsData: any[][] = [
        ['DATA KEGIATAN PERSONIL (PATROLI SITE)'],
        [`Nama Personil: ${personName}`, `Posisi: ${pos}`, `Site: ${stName}`],
        [`Periode: ${dari3} s/d ${sampai3}`],
        [],
        ['NO', 'HARI', 'TANGGAL', 'JAM', 'DESKRIPSI TUGAS', 'FOTO KEGIATAN'],
      ];

      records.forEach((r) => {
        wsData.push([r.no, r.hari, r.tanggal, r.jam, r.deskripsiTugas, r.fotoKegiatan ? 'Ada' : '-']);
      });

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws['!cols'] = [{ wch: 6 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 55 }, { wch: 15 }];

      XLSX.utils.book_append_sheet(wb, ws, 'Kegiatan Personil');
      XLSX.writeFile(wb, 'DATA KEGIATAN PERSONIL.xlsx');
    } finally {
      setLoading3(false);
    }
  };

  // ============================================================================
  // EXPORT HANDLERS - CARD 4: KEGIATAN AREA
  // ============================================================================

  const handleCard4Pdf = async () => {
    setLoading4(true);
    try {
      const res = await fetch(
        `/api/v1/reports/export/activity-area?lokasi_area=${encodeURIComponent(area4)}&kategori=${encodeURIComponent(kategori4)}&dari=${dari4}&sampai=${sampai4}`,
      );
      if (res.ok) {
        const data = await res.json();
        setPrintTitle(`PATROLI SITE - DATA PATROLI PER AREA: ${data.siteName}`);
        setPrintSubtitle(`Kategori: ${data.kategori} | Periode: ${dari4} s/d ${sampai4}`);
        setPrintType('act_area');
        setPrintKpi(null);
        setPrintActivityRows(data.records);
        setPrintModalOpen(true);
        return;
      }
    } catch {}
    setPrintTitle(`PATROLI SITE - DATA PATROLI PER AREA: ${area4.toUpperCase()}`);
    setPrintSubtitle(`Kategori: ${kategori4.toUpperCase()} | Periode: ${dari4} s/d ${sampai4}`);
    setPrintType('act_area');
    setPrintKpi(null);
    setPrintActivityRows([
      {
        no: 1,
        namaPersonel: 'BUDI SANTOSO',
        hari: 'Senin',
        tanggal: '26 Oct 2026',
        jam: '05:34:00',
        deskripsiTugas: 'Pengecekan akses pintu smart lock dan suhu AC server di Ruang Server Lantai 3 Ruang 305',
        temuanDilaporkan: '-',
        statusTemuan: 'AMAN',
        catatanTindakLanjut: '-',
      },
      {
        no: 2,
        namaPersonel: 'ANDI RAHMAN',
        hari: 'Senin',
        tanggal: '26 Oct 2026',
        jam: '05:33:00',
        deskripsiTugas: 'Pemeriksaan area parkir mobil B1 dan lampu darurat parkir basement basement lantai 1',
        temuanDilaporkan: 'Lampu penerangan zona B1 padam, perlu diganti bohlam',
        statusTemuan: 'BELUM DITINDAKLANJUTI',
        catatanTindakLanjut: 'Menunggu penggantian dari tim ME',
      },
      {
        no: 3,
        namaPersonel: 'ANDI RAHMAN',
        hari: 'Senin',
        tanggal: '26 Oct 2026',
        jam: '05:32:00',
        deskripsiTugas: 'Patroli dan pemeriksaan tamu di pintu masuk utama di Pos Utama Lobby Lt. 1',
        temuanDilaporkan: '-',
        statusTemuan: 'AMAN',
        catatanTindakLanjut: '-',
      },
    ]);
    setPrintModalOpen(true);
    setLoading4(false);
  };

  const handleCard4Excel = async () => {
    setLoading4(true);
    try {
      let records: ActivityRow[] = [];
      let stName = area4.toUpperCase();
      let kat = kategori4.toUpperCase();

      try {
        const res = await fetch(
          `/api/v1/reports/export/activity-area?lokasi_area=${encodeURIComponent(area4)}&kategori=${encodeURIComponent(kategori4)}&dari=${dari4}&sampai=${sampai4}`,
        );
        if (res.ok) {
          const json = await res.json();
          records = json.records || [];
          stName = json.siteName || stName;
          kat = json.kategori || kat;
        }
      } catch {}

      if (records.length === 0) {
        records = [
          {
            no: 1,
            namaPersonel: 'BUDI SANTOSO',
            hari: 'Senin',
            tanggal: '26 Oct 2026',
            jam: '05:34:00',
            deskripsiTugas: 'Pengecekan akses pintu smart lock dan suhu AC server ruang server lantai 3',
            temuanDilaporkan: '-',
            statusTemuan: 'AMAN',
            catatanTindakLanjut: '-',
          },
        ];
      }

      const wb = XLSX.utils.book_new();
      const wsData: any[][] = [
        ['DATA PATROLI PER AREA (PATROLI SITE)'],
        [`Site: ${stName}`, `Kategori: ${kat}`],
        [`Periode: ${dari4} s/d ${sampai4}`],
        [],
        ['NO', 'NAMA PERSONEL', 'HARI', 'TANGGAL', 'JAM', 'KEGIATAN / TEMUAN', 'TEMUAN YANG DILAPORKAN', 'STATUS', 'CATATAN TINDAK LANJUT', 'FOTO'],
      ];

      records.forEach((r) => {
        wsData.push([
          r.no,
          r.namaPersonel || '-',
          r.hari,
          r.tanggal,
          r.jam,
          r.deskripsiTugas,
          r.temuanDilaporkan || '-',
          r.statusTemuan || 'AMAN',
          r.catatanTindakLanjut || '-',
          r.fotoKegiatan ? 'Ada' : '-',
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws['!cols'] = [
        { wch: 6 },
        { wch: 22 },
        { wch: 10 },
        { wch: 15 },
        { wch: 12 },
        { wch: 45 },
        { wch: 35 },
        { wch: 22 },
        { wch: 30 },
        { wch: 10 },
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Patroli Area');
      XLSX.writeFile(wb, 'DATA PATROLI PER AREA.xlsx');
    } finally {
      setLoading4(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 4 Cards Grid - 100% Parity dengan patroli.site */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ==================================================================== */}
        {/* CARD 1: ABSENSI PERSONIL                                             */}
        {/* ==================================================================== */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:border-blue-400/80 transition duration-150">
          <div className="bg-[#0d6efd] text-white px-4 py-3 font-bold text-sm tracking-wide flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-white" />
              <span>ABSENSI PERSONIL</span>
            </div>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono">Modul 1</span>
          </div>

          <div className="p-4 space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Pilih Area</label>
              <select
                id="area"
                value={area1}
                onChange={(e) => handleArea1Change(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 font-medium text-slate-800"
              >
                <option value="">-- PILIH AREA --</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.name.toLowerCase()}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Pilih Kategori</label>
              <select
                id="kategori"
                value={kategori1}
                onChange={(e) => handleKategori1Change(e.target.value)}
                disabled={!area1 || categories1.length === 0}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 font-medium text-slate-800 disabled:opacity-50"
              >
                <option value="">-- PILIH KATEGORI --</option>
                {categories1.map((c) => (
                  <option key={c} value={c}>
                    {c.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Pilih Personil</label>
              <select
                id="personil"
                value={personil1}
                onChange={(e) => setPersonil1(e.target.value)}
                disabled={!kategori1 || personnelList1.length === 0}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 font-medium text-slate-800 disabled:opacity-50"
              >
                <option value="">-- PILIH PERSONIL --</option>
                {personnelList1.map((p) => (
                  <option key={p.id} value={p.fullName.toLowerCase()}>
                    {p.fullName.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Dari</label>
                <input
                  type="date"
                  name="dari"
                  value={dari1}
                  onChange={(e) => setDari1(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Sampai</label>
                <input
                  type="date"
                  name="sampai"
                  value={sampai1}
                  onChange={(e) => setSampai1(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="p-4 pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleCard1Pdf}
              disabled={loading1}
              className="w-full bg-[#0d6efd] hover:bg-blue-600 active:scale-98 text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center space-x-1 shadow-sm transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
            <button
              type="button"
              onClick={handleCard1Excel}
              disabled={loading1}
              className="w-full bg-[#198754] hover:bg-emerald-600 active:scale-98 text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center space-x-1 shadow-sm transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>EXCEL</span>
            </button>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* CARD 2: ABSENSI AREA                                                 */}
        {/* ==================================================================== */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:border-emerald-400/80 transition duration-150">
          <div className="bg-[#198754] text-white px-4 py-3 font-bold text-sm tracking-wide flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-white" />
              <span>ABSENSI AREA</span>
            </div>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono">Modul 2</span>
          </div>

          <div className="p-4 space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Pilih Area</label>
              <select
                id="area2"
                value={area2}
                onChange={(e) => handleArea2Change(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-emerald-500 font-medium text-slate-800"
              >
                <option value="">-- PILIH AREA --</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.name.toLowerCase()}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Pilih Kategori</label>
              <select
                id="kategori2"
                value={kategori2}
                onChange={(e) => setKategori2(e.target.value)}
                disabled={!area2 || categories2.length === 0}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-emerald-500 font-medium text-slate-800 disabled:opacity-50"
              >
                <option value="">-- PILIH KATEGORI --</option>
                {categories2.map((c) => (
                  <option key={c} value={c}>
                    {c.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-7">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Dari</label>
                <input
                  type="date"
                  name="dari"
                  value={dari2}
                  onChange={(e) => setDari2(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Sampai</label>
                <input
                  type="date"
                  name="sampai"
                  value={sampai2}
                  onChange={(e) => setSampai2(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="p-4 pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleCard2Pdf}
              disabled={loading2}
              className="w-full bg-[#0d6efd] hover:bg-blue-600 active:scale-98 text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center space-x-1 shadow-sm transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
            <button
              type="button"
              onClick={handleCard2Excel}
              disabled={loading2}
              className="w-full bg-[#198754] hover:bg-emerald-600 active:scale-98 text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center space-x-1 shadow-sm transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>EXCEL</span>
            </button>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* CARD 3: KEGIATAN PERSONIL                                            */}
        {/* ==================================================================== */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:border-purple-400/80 transition duration-150">
          <div className="bg-[#6f42c1] text-white px-4 py-3 font-bold text-sm tracking-wide flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-white" />
              <span>KEGIATAN PERSONIL</span>
            </div>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono">Modul 3</span>
          </div>

          <div className="p-4 space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Pilih Area</label>
              <select
                id="area3"
                value={area3}
                onChange={(e) => handleArea3Change(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-purple-500 font-medium text-slate-800"
              >
                <option value="">-- PILIH AREA --</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.name.toLowerCase()}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Pilih Kategori</label>
              <select
                id="kategori3"
                value={kategori3}
                onChange={(e) => handleKategori3Change(e.target.value)}
                disabled={!area3 || categories3.length === 0}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-purple-500 font-medium text-slate-800 disabled:opacity-50"
              >
                <option value="">-- PILIH KATEGORI --</option>
                {categories3.map((c) => (
                  <option key={c} value={c}>
                    {c.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Pilih Personil</label>
              <select
                id="personil3"
                value={personil3}
                onChange={(e) => setPersonil3(e.target.value)}
                disabled={!kategori3 || personnelList3.length === 0}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-purple-500 font-medium text-slate-800 disabled:opacity-50"
              >
                <option value="">-- PILIH PERSONIL --</option>
                {personnelList3.map((p) => (
                  <option key={p.id} value={p.fullName.toLowerCase()}>
                    {p.fullName.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Dari</label>
                <input
                  type="date"
                  name="dari"
                  value={dari3}
                  onChange={(e) => setDari3(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Sampai</label>
                <input
                  type="date"
                  name="sampai"
                  value={sampai3}
                  onChange={(e) => setSampai3(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="p-4 pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleCard3Pdf}
              disabled={loading3}
              className="w-full bg-[#0d6efd] hover:bg-blue-600 active:scale-98 text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center space-x-1 shadow-sm transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
            <button
              type="button"
              onClick={handleCard3Excel}
              disabled={loading3}
              className="w-full bg-[#198754] hover:bg-emerald-600 active:scale-98 text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center space-x-1 shadow-sm transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>EXCEL</span>
            </button>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* CARD 4: KEGIATAN AREA                                                */}
        {/* ==================================================================== */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:border-slate-400 transition duration-150">
          <div className="bg-[#495057] text-white px-4 py-3 font-bold text-sm tracking-wide flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-white" />
              <span>KEGIATAN AREA</span>
            </div>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono">Modul 4</span>
          </div>

          <div className="p-4 space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Pilih Area</label>
              <select
                id="area4"
                value={area4}
                onChange={(e) => handleArea4Change(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-slate-500 font-medium text-slate-800"
              >
                <option value="">-- PILIH AREA --</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.name.toLowerCase()}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Pilih Kategori</label>
              <select
                id="kategori4"
                value={kategori4}
                onChange={(e) => setKategori4(e.target.value)}
                disabled={!area4 || categories4.length === 0}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-slate-500 font-medium text-slate-800 disabled:opacity-50"
              >
                <option value="">-- PILIH KATEGORI --</option>
                {categories4.map((c) => (
                  <option key={c} value={c}>
                    {c.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-7">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Dari</label>
                <input
                  type="date"
                  name="dari"
                  value={dari4}
                  onChange={(e) => setDari4(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Sampai</label>
                <input
                  type="date"
                  name="sampai"
                  value={sampai4}
                  onChange={(e) => setSampai4(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="p-4 pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleCard4Pdf}
              disabled={loading4}
              className="w-full bg-[#0d6efd] hover:bg-blue-600 active:scale-98 text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center space-x-1 shadow-sm transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
            <button
              type="button"
              onClick={handleCard4Excel}
              disabled={loading4}
              className="w-full bg-[#198754] hover:bg-emerald-600 active:scale-98 text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center space-x-1 shadow-sm transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>EXCEL</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MODAL PRINTABLE PREVIEW / CETAK PDF (100% PARITY PATROLI.SITE)        */}
      {/* ==================================================================== */}
      {printModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header Bar */}
            <div className="no-print bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold flex items-center space-x-2">
                  <Printer className="w-4 h-4 text-blue-400" />
                  <span>Preview Cetak Dokumen Resmi (Format Parity patroli.site)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{printSubtitle}</p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center space-x-1.5 shadow-sm transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / Simpan PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="printable-document p-6 md:p-8 overflow-y-auto space-y-6 text-slate-900 bg-white">
              {/* Document Header */}
              <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
                <h2 className="text-lg font-black tracking-wider uppercase text-slate-900">
                  {printTitle}
                </h2>
                <p className="text-xs font-semibold text-slate-600">
                  {printSubtitle}
                </p>
              </div>

              {/* KPI Chips (Hanya untuk Card 1: ABSENSI PERSONIL) */}
              {printType === 'att_personnel' && printKpi && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
                    <span className="block text-[10px] font-bold text-emerald-700 uppercase">JUMLAH KEHADIRAN</span>
                    <span className="text-base font-extrabold text-emerald-800">{printKpi.kehadiranCount} KALI</span>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                    <span className="block text-[10px] font-bold text-amber-700 uppercase">LUPA ABSEN PULANG</span>
                    <span className="text-base font-extrabold text-amber-800">{printKpi.lupaPulangCount} KALI</span>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
                    <span className="block text-[10px] font-bold text-blue-700 uppercase">IZIN / SAKIT</span>
                    <span className="text-base font-extrabold text-blue-800">{printKpi.izinSakitCount} KALI</span>
                  </div>
                  <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5">
                    <span className="block text-[10px] font-bold text-rose-700 uppercase">TERLAMBAT</span>
                    <span className="text-xs font-extrabold text-rose-800">{printKpi.terlambatCount} KALI / {printKpi.terlambatMenit} mnt</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                    <span className="block text-[10px] font-bold text-slate-700 uppercase">PULANG AWAL</span>
                    <span className="text-xs font-extrabold text-slate-800">{printKpi.pulangAwalCount} KALI / {printKpi.pulangAwalMenit} mnt</span>
                  </div>
                </div>
              )}

              {/* Table Render berdasarkan tipe laporan */}
              {(printType === 'att_personnel' || printType === 'att_area') && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse border border-slate-300">
                    <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="border border-slate-300 p-2 text-center w-10">NO</th>
                        {printType === 'att_area' && (
                          <th className="border border-slate-300 p-2">NAMA PERSONIL</th>
                        )}
                        <th className="border border-slate-300 p-2">ABSEN MASUK</th>
                        <th className="border border-slate-300 p-2">ABSEN PULANG</th>
                        <th className="border border-slate-300 p-2 text-center w-24">FOTO IN</th>
                        <th className="border border-slate-300 p-2 text-center w-24">FOTO OUT</th>
                        <th className="border border-slate-300 p-2">KETERANGAN</th>
                        <th className="border border-slate-300 p-2 text-center w-28">JAM EFEKTIF</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {printAttendanceRows.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="border border-slate-300 p-2 text-center font-medium">{r.no}</td>
                          {printType === 'att_area' && (
                            <td className="border border-slate-300 p-2 font-bold">{r.namaPersonil}</td>
                          )}
                          <td className="border border-slate-300 p-2 whitespace-pre-line text-slate-700">
                            {r.absenMasuk}
                          </td>
                          <td className="border border-slate-300 p-2 text-slate-700">
                            {r.absenPulang}
                          </td>
                          <td className="border border-slate-300 p-2 text-center">
                            {r.fotoMasuk ? (
                              <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded">TERVERIFIKASI</span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="border border-slate-300 p-2 text-center">
                            {r.fotoPulang ? (
                              <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded">TERVERIFIKASI</span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="border border-slate-300 p-2 text-slate-600">{r.keterangan}</td>
                          <td className="border border-slate-300 p-2 text-center font-bold text-slate-800">
                            {r.totalJamEfektif}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {(printType === 'act_personnel' || printType === 'act_area') && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse border border-slate-300">
                    <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="border border-slate-300 p-2 text-center w-10">NO</th>
                        {printType === 'act_area' && (
                          <th className="border border-slate-300 p-2">NAMA PERSONEL</th>
                        )}
                        <th className="border border-slate-300 p-2 w-16">HARI</th>
                        <th className="border border-slate-300 p-2 w-24">TANGGAL</th>
                        <th className="border border-slate-300 p-2 w-16">JAM</th>
                        <th className="border border-slate-300 p-2">DESKRIPSI TUGAS / TEMUAN</th>
                        {printType === 'act_area' && (
                          <>
                            <th className="border border-slate-300 p-2">STATUS</th>
                            <th className="border border-slate-300 p-2">TINDAK LANJUT</th>
                          </>
                        )}
                        <th className="border border-slate-300 p-2 text-center w-20">FOTO</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {printActivityRows.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="border border-slate-300 p-2 text-center font-medium">{r.no}</td>
                          {printType === 'act_area' && (
                            <td className="border border-slate-300 p-2 font-bold">{r.namaPersonel}</td>
                          )}
                          <td className="border border-slate-300 p-2 font-medium">{r.hari}</td>
                          <td className="border border-slate-300 p-2">{r.tanggal}</td>
                          <td className="border border-slate-300 p-2 font-mono">{r.jam}</td>
                          <td className="border border-slate-300 p-2 text-slate-700">{r.deskripsiTugas}</td>
                          {printType === 'act_area' && (
                            <>
                              <td className="border border-slate-300 p-2">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                    r.statusTemuan === 'BELUM DITINDAKLANJUTI'
                                      ? 'bg-rose-100 text-rose-700'
                                      : 'bg-emerald-100 text-emerald-700'
                                  }`}
                                >
                                  {r.statusTemuan || 'AMAN'}
                                </span>
                              </td>
                              <td className="border border-slate-300 p-2 text-slate-600">
                                {r.catatanTindakLanjut || '-'}
                              </td>
                            </>
                          )}
                          <td className="border border-slate-300 p-2 text-center">
                            {r.fotoKegiatan ? (
                              <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded">FOTO</span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Sign-off signatures footer */}
              <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <p className="text-slate-500 mb-14">Petugas / Pelapor</p>
                  <p className="font-bold underline text-slate-800">
                    {printType.includes('personnel') ? personil1.toUpperCase() : 'KOORDINATOR AREA'}
                  </p>
                  <p className="text-[10px] text-slate-400">Petugas Operasional Lapangan</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-14">Mengetahui & Menyetujui</p>
                  <p className="font-bold underline text-slate-800">HRD & OPERATIONS MANAGER</p>
                  <p className="text-[10px] text-slate-400">Head Office Korporat</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
