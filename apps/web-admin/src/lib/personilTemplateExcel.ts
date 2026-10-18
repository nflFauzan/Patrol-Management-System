import ExcelJS from 'exceljs';

export interface PersonilExcelRow {
  namaAnggota: string;
  username: string;
  password?: string;
  jamKerja: number;
  posisi: string;
  area: string;
  gajiPokok: number;
  tunjangan: number;
  lembur: number;
  potBpjs: number;
  potTidakMasuk: number;
  potLupaAbsensi: number;
}

/**
 * Standard positions for patrol & facility operations
 */
export const STANDARD_POSITIONS = [
  'Security',
  'Cleaning Service',
  'Driver',
  'Staf',
];

/**
 * Generates an Excel Template Workbook identical to Template_Personil_tes-pt.xlsx
 * with Sheet 1 (PERSONIL) + Sheet 2 (DAFTAR_AREA), data validations, formulas, and exact styling.
 */
export async function createPersonilWorkbook(sites: { name: string }[]): Promise<ExcelJS.Workbook> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Patrol & Facility Management System';
  wb.lastModifiedBy = 'Admin Korporat';
  wb.created = new Date();
  wb.modified = new Date();

  const siteList = sites && sites.length > 0 ? sites : [{ name: 'Site Proyek Demo' }];

  // =========================================================================
  // SHEET 1: PERSONIL
  // =========================================================================
  const ws1 = wb.addWorksheet('PERSONIL', {
    views: [{ state: 'frozen', ySplit: 1, topLeftCell: 'A2' }],
  });

  ws1.columns = [
    { header: 'NAMA_ANGGOTA', key: 'nama_anggota', width: 25 },
    { header: 'USERNAME', key: 'username', width: 22 },
    { header: 'PASSWORD', key: 'password', width: 22 },
    { header: 'JAM_KERJA', key: 'jam_kerja', width: 12 },
    { header: 'POSISI', key: 'posisi', width: 22 },
    { header: 'AREA', key: 'area', width: 38 },
    { header: 'GAJI_POKOK', key: 'gaji_pokok', width: 18 },
    { header: 'TUNJANGAN', key: 'tunjangan', width: 18 },
    { header: 'LEMBUR', key: 'lembur', width: 18 },
    { header: 'POT_BPJS', key: 'pot_bpjs', width: 18 },
    { header: 'POT_TIDAK_MASUK', key: 'pot_tidak_masuk', width: 18 },
    { header: 'POT_LUPA_ABSENSI', key: 'pot_lupa_absensi', width: 18 },
  ];

  const headerFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD9EAF7' },
  };

  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FFB7B7B7' } },
    left: { style: 'thin', color: { argb: 'FFB7B7B7' } },
    bottom: { style: 'thin', color: { argb: 'FFB7B7B7' } },
    right: { style: 'thin', color: { argb: 'FFB7B7B7' } },
  };

  // Header Row 1
  const headerRow = ws1.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell({ includeEmpty: true }, (cell) => {
    cell.fill = headerFill;
    cell.border = thinBorder;
    cell.font = { name: 'Calibri', size: 11, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // Sample Row 2
  const sampleRow = ws1.addRow({
    nama_anggota: 'Contoh Nama',
    username: 'contohuser',
    password: 'Password123',
    jam_kerja: 16,
    posisi: 'Security',
    area: siteList[0].name,
    gaji_pokok: 0,
    tunjangan: 0,
    lembur: 0,
    pot_bpjs: 0,
    pot_tidak_masuk: 0,
    pot_lupa_absensi: 0,
  });
  sampleRow.height = 22;
  sampleRow.eachCell({ includeEmpty: true }, (cell) => {
    cell.fill = headerFill;
    cell.border = thinBorder;
    cell.font = { name: 'Calibri', size: 11, bold: false };
    cell.alignment = { vertical: 'middle' };
  });

  // Pre-formatted grid lines from row 3 to 501
  for (let r = 3; r <= 501; r++) {
    const row = ws1.getRow(r);
    for (let c = 1; c <= 12; c++) {
      const cell = row.getCell(c);
      cell.border = thinBorder;
      cell.font = { name: 'Calibri', size: 11 };
    }
  }

  // Data validations for dropdown selection on Row 2 to 501
  for (let r = 2; r <= 501; r++) {
    ws1.getCell(`E${r}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['=PosisiList'],
      showErrorMessage: true,
      showInputMessage: true,
      errorTitle: 'Posisi Tidak Sesuai',
      error: 'Silakan pilih posisi operasional dari daftar dropdown.',
    };

    ws1.getCell(`F${r}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['=AreaList'],
      showErrorMessage: true,
      showInputMessage: true,
      errorTitle: 'Area / Site Tidak Sesuai',
      error: 'Silakan pilih area penempatan yang terdaftar dari dropdown.',
    };
  }

  // =========================================================================
  // SHEET 2: DAFTAR_AREA
  // =========================================================================
  const ws2 = wb.addWorksheet('DAFTAR_AREA');
  ws2.columns = [
    { header: 'DAFTAR AREA', key: 'area', width: 45 },
    { header: 'DAFTAR POSISI', key: 'posisi', width: 25 },
  ];

  const ws2Header = ws2.getRow(1);
  ws2Header.height = 28;
  ws2Header.eachCell({ includeEmpty: true }, (cell) => {
    cell.fill = headerFill;
    cell.border = thinBorder;
    cell.font = { name: 'Calibri', size: 11, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  const maxRows = Math.max(siteList.length, STANDARD_POSITIONS.length);
  for (let i = 0; i < maxRows; i++) {
    const rowNumber = i + 2;
    const r = ws2.getRow(rowNumber);
    const siteVal = siteList[i]?.name || '';
    const posVal = STANDARD_POSITIONS[i] || '';

    const cellA = r.getCell(1);
    const cellB = r.getCell(2);

    cellA.value = siteVal;
    cellB.value = posVal;

    cellA.border = thinBorder;
    cellB.border = thinBorder;
    cellA.font = { name: 'Calibri', size: 11 };
    cellB.font = { name: 'Calibri', size: 11 };
  }

  // Defined Names for dropdown formulas (=AreaList, =PosisiList)
  const lastAreaRow = Math.max(2, siteList.length + 1);
  const lastPosRow = Math.max(2, STANDARD_POSITIONS.length + 1);
  wb.definedNames.add(`'DAFTAR_AREA'!$A$2:$A$${lastAreaRow}`, 'AreaList');
  wb.definedNames.add(`'DAFTAR_AREA'!$B$2:$B$${lastPosRow}`, 'PosisiList');

  return wb;
}

/**
 * Downloads the Personil Excel template in the browser as Template_Personil.xlsx
 */
export async function downloadPersonilExcelTemplate(
  sites: { name: string }[],
  filename: string = 'Template_Personil.xlsx'
): Promise<void> {
  const wb = await createPersonilWorkbook(sites);
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parses an uploaded .xlsx or .xls file into clean PersonilExcelRow items.
 */
export async function parsePersonilExcel(
  fileOrBuffer: File | ArrayBuffer
): Promise<PersonilExcelRow[]> {
  const wb = new ExcelJS.Workbook();
  let arrayBuffer: ArrayBuffer;

  if (fileOrBuffer instanceof ArrayBuffer) {
    arrayBuffer = fileOrBuffer;
  } else {
    arrayBuffer = await fileOrBuffer.arrayBuffer();
  }

  await wb.xlsx.load(arrayBuffer);

  // Read Sheet 'PERSONIL' or first sheet
  const ws = wb.getWorksheet('PERSONIL') || wb.worksheets[0];
  if (!ws) {
    throw new Error('Lembar kerja (Sheet) tidak ditemukan di dalam file Excel.');
  }

  // Detect header positions from row 1
  const headerMap = new Map<string, number>();
  const headerRow = ws.getRow(1);
  headerRow.eachCell((cell, colNumber) => {
    const text = (cell.text || cell.value?.toString() || '').trim().toUpperCase();
    headerMap.set(text, colNumber);
  });

  const getCol = (...names: string[]): number | undefined => {
    for (const n of names) {
      const idx = headerMap.get(n.toUpperCase());
      if (idx !== undefined) return idx;
    }
    return undefined;
  };

  const colNama = getCol('NAMA_ANGGOTA', 'NAMA', 'FULLNAME', 'NAMA LENGKAP');
  const colUser = getCol('USERNAME', 'USER');
  const colPass = getCol('PASSWORD', 'PASS');
  const colJam = getCol('JAM_KERJA', 'JAM KERJA', 'WORKING_HOURS');
  const colPos = getCol('POSISI', 'POSITION', 'ROLE');
  const colArea = getCol('AREA', 'SITE', 'LOKASI');
  const colGaji = getCol('GAJI_POKOK', 'GAJI', 'BASIC_SALARY');
  const colTunj = getCol('TUNJANGAN', 'ALLOWANCE');
  const colLemb = getCol('LEMBUR', 'OVERTIME');
  const colBpjs = getCol('POT_BPJS', 'BPJS');
  const colAlpa = getCol('POT_TIDAK_MASUK', 'POTONGAN_ALPA', 'ALPA');
  const colLupa = getCol('POT_LUPA_ABSENSI', 'POTONGAN_LUPA_ABSEN', 'LUPA_ABSEN');

  const rows: PersonilExcelRow[] = [];

  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header

    const getVal = (colIdx: number | undefined): any => {
      if (!colIdx) return '';
      const cell = row.getCell(colIdx);
      if (cell.value && typeof cell.value === 'object' && 'result' in cell.value) {
        return cell.value.result;
      }
      return cell.value ?? '';
    };

    const nama = (getVal(colNama) || '').toString().trim();
    const user = (getVal(colUser) || '').toString().trim();

    // Skip empty rows or the default sample row if left unchanged
    if (!nama && !user) return;
    if (nama.toLowerCase() === 'contoh nama' && user.toLowerCase() === 'contohuser') {
      // If there are other rows, skip sample row. If it's the only row, the user might be testing, but usually it's placeholder.
      return;
    }

    const cleanNum = (val: any, fallback: number = 0): number => {
      if (typeof val === 'number') return isNaN(val) ? fallback : val;
      if (!val) return fallback;
      const parsed = parseFloat(val.toString().replace(/[^0-9.-]/g, ''));
      return isNaN(parsed) ? fallback : parsed;
    };

    rows.push({
      namaAnggota: nama,
      username: user || `user_${Date.now()}_${rowNumber}`,
      password: (getVal(colPass) || '').toString().trim() || 'password123',
      jamKerja: cleanNum(getVal(colJam), 8) || 8,
      posisi: (getVal(colPos) || 'Security').toString().trim(),
      area: (getVal(colArea) || '').toString().trim(),
      gajiPokok: cleanNum(getVal(colGaji), 0),
      tunjangan: cleanNum(getVal(colTunj), 0),
      lembur: cleanNum(getVal(colLemb), 0),
      potBpjs: cleanNum(getVal(colBpjs), 0),
      potTidakMasuk: cleanNum(getVal(colAlpa), 0),
      potLupaAbsensi: cleanNum(getVal(colLupa), 0),
    });
  });

  return rows;
}
