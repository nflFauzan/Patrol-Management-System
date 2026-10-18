import { AuthService } from './auth.service';
import { DatabaseService } from '../../database/database.service';
import { JwtService } from '@nestjs/jwt';
import * as ExcelJS from 'exceljs';

describe('Personil Template & Import Parity', () => {
  let authService: AuthService;
  let mockDb: any;
  let mockJwt: any;

  beforeEach(() => {
    mockDb = {
      query: jest.fn().mockResolvedValue([
        { id: 'site-1', name: 'Site Proyek Demo' },
        { id: 'site-2', name: 'Warehouse & Factory Cikarang' },
      ]),
      queryOne: jest.fn(),
    };
    mockJwt = {
      sign: jest.fn().mockReturnValue('token'),
    };
    authService = new AuthService(mockDb as DatabaseService, mockJwt as JwtService);
  });

  it('should generate an Excel workbook with 100% parity to Template_Personil_tes-pt.xlsx', async () => {
    const sites = [{ name: 'Site Proyek Demo' }, { name: 'Warehouse & Factory Cikarang' }];
    const buffer = await authService.generatePersonilExcelTemplate(sites);

    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(0);

    const WorkbookClass = (ExcelJS as any).Workbook || (ExcelJS as any).default?.Workbook || (ExcelJS as any).default;
    const wb = new WorkbookClass();
    await wb.xlsx.load(buffer as any);

    // 1. Verify Sheet names
    const s1 = wb.getWorksheet('PERSONIL');
    const s2 = wb.getWorksheet('DAFTAR_AREA');
    expect(s1).toBeDefined();
    expect(s2).toBeDefined();

    // 2. Verify Headers in Sheet 1
    const headers = [
      'NAMA_ANGGOTA',
      'USERNAME',
      'PASSWORD',
      'JAM_KERJA',
      'POSISI',
      'AREA',
      'GAJI_POKOK',
      'TUNJANGAN',
      'LEMBUR',
      'POT_BPJS',
      'POT_TIDAK_MASUK',
      'POT_LUPA_ABSENSI',
    ];
    headers.forEach((h, idx) => {
      expect(s1!.getRow(1).getCell(idx + 1).value).toBe(h);
      expect(s1!.getRow(1).getCell(idx + 1).font?.bold).toBe(true);
      expect(s1!.getRow(1).getCell(idx + 1).fill).toBeDefined();
    });

    expect(s1!.getRow(1).height).toBe(28);

    // 3. Verify Sample Row (Row 2)
    expect(s1!.getRow(2).getCell(1).value).toBe('Contoh Nama');
    expect(s1!.getRow(2).getCell(2).value).toBe('contohuser');
    expect(s1!.getRow(2).getCell(4).value).toBe(16);
    expect(s1!.getRow(2).getCell(5).value).toBe('Security');
    expect(s1!.getRow(2).getCell(6).value).toBe('Site Proyek Demo');

    // 4. Verify Dropdown Data Validations
    expect(s1!.getCell('E2').dataValidation?.type).toBe('list');
    expect(s1!.getCell('E2').dataValidation?.formulae).toEqual(['=PosisiList']);
    expect(s1!.getCell('F2').dataValidation?.type).toBe('list');
    expect(s1!.getCell('F2').dataValidation?.formulae).toEqual(['=AreaList']);

    // 5. Verify Sheet 2 DAFTAR_AREA
    expect(s2!.getRow(1).getCell(1).value).toBe('DAFTAR AREA');
    expect(s2!.getRow(1).getCell(2).value).toBe('DAFTAR POSISI');
    expect(s2!.getRow(2).getCell(1).value).toBe('Site Proyek Demo');
    expect(s2!.getRow(2).getCell(2).value).toBe('Security');
    expect(s2!.getRow(3).getCell(2).value).toBe('Cleaning Service');
    expect(s2!.getRow(4).getCell(2).value).toBe('Driver');
    expect(s2!.getRow(5).getCell(2).value).toBe('Staf');

    // 6. Verify Defined Names
    const definedNames = wb.definedNames.model;
    const names = definedNames.map((d: any) => d.name);
    expect(names).toContain('AreaList');
    expect(names).toContain('PosisiList');
  });

  it('should process bulk import with the 12 Excel columns correctly', async () => {
    mockDb.queryOne
      .mockResolvedValueOnce(null) // check username existing
      .mockResolvedValueOnce({ id: 'new-user-123' }); // insert returning id

    const items = [
      {
        namaAnggota: 'Ahmad Satpam',
        username: 'ahmadsatpam',
        password: 'Password123',
        jamKerja: 12,
        posisi: 'Security',
        area: 'Site Proyek Demo',
        gajiPokok: 5000000,
        tunjangan: 750000,
        lembur: 35000,
        potBpjs: 150000,
        potTidakMasuk: 100000,
        potLupaAbsensi: 50000,
      },
    ];

    const result = await authService.bulkImportPersonil(items);
    expect(result.importedCount).toBe(1);
    expect(result.errors.length).toBe(0);

    // Verify insert user query had all correct parameters
    expect(mockDb.queryOne).toHaveBeenCalledTimes(2);
    const insertArgs = mockDb.queryOne.mock.calls[1][1];
    expect(insertArgs[0]).toBe('ahmadsatpam');
    expect(insertArgs[2]).toBe('Ahmad Satpam');
    expect(insertArgs[3]).toBe('SECURITY_OFFICER');
    expect(insertArgs[4]).toBe('SECURITY');
    expect(insertArgs[5]).toBe('ANGGOTA');
    expect(insertArgs[6]).toBe(12);
    expect(insertArgs[7]).toBe(5000000);
    expect(insertArgs[8]).toBe(750000);
    expect(insertArgs[9]).toBe(35000);
    expect(insertArgs[10]).toBe(150000);
    expect(insertArgs[11]).toBe(100000);
    expect(insertArgs[12]).toBe(50000);

    // Verify site assignment
    expect(mockDb.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO user_site_assignments'),
      ['new-user-123', 'site-1'],
    );
  });
});
