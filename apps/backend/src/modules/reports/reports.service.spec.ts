import { ReportsService } from './reports.service';
import { DatabaseService } from '../../database/database.service';

describe('ReportsService (Laporan Security Chief & Parity)', () => {
  let service: ReportsService;
  let dbMock: Partial<DatabaseService>;

  beforeEach(() => {
    dbMock = {
      query: jest.fn(),
      queryOne: jest.fn(),
    };
    service = new ReportsService(dbMock as any);
  });

  describe('TC-CHF-01: Query Chief Evaluations with 100% Parity Fields', () => {
    it('should query chief evaluations with exact status mapping and badges', async () => {
      const mockRows = [
        {
          id: 'ce-01',
          siteId: 'site-1',
          siteName: 'site proyek demo',
          chiefId: 'chief-1',
          chiefName: 'HENDRA CHIEF',
          komandanId: 'kom-1',
          namaKomandan: 'DANDAN KOMANDAN',
          komandanPosition: 'Komandan Regu',
          komandanRole: 'Laporan Komandan',
          kedisiplinan: 'Baik',
          koordinasi: 'Baik',
          kehadiran: 'Lengkap',
          reguHadir: 'Lengkap',
          reguIzin: '0',
          insiden: 'Tidak Ada',
          detailInsiden: 'Tidak ada kejadian menonjol atau insiden keamanan.',
          catatan: 'Evaluasi pengawasan apel dan serah terima regu berjalan tertib dan sesuai SOP. Personil sigap.',
          statusLaporan: 'Selesai',
          tanggalLapor: '2026-10-18 21:11:40',
          disciplineScore: 95,
          coordinationScore: 90,
          attendanceScore: 100,
          incidentNotes: null,
          createdAt: new Date().toISOString(),
        },
      ];

      (dbMock.query as jest.Mock).mockResolvedValueOnce(mockRows);

      const result = await service.getChiefEvaluations('site-1');
      expect(result).toHaveLength(1);
      expect(result[0].namaKomandan).toBe('DANDAN KOMANDAN');
      expect(result[0].kedisiplinan).toBe('Baik');
      expect(result[0].koordinasi).toBe('Baik');
      expect(result[0].kehadiran).toBe('Lengkap');
      expect(result[0].insiden).toBe('Tidak Ada');
      expect(result[0].statusLaporan).toBe('Selesai');
      expect(dbMock.query).toHaveBeenCalledWith(expect.stringContaining('WHERE ce.site_id = $1'), ['site-1']);
    });
  });

  describe('TC-CHF-02: Query Chief Evaluation Detail for Action Modal', () => {
    it('should return specific chief evaluation detail matching id', async () => {
      const mockRecord = {
        id: 'ce-01',
        siteId: 'site-1',
        siteName: 'site proyek demo',
        namaKomandan: 'DANDAN KOMANDAN',
        komandanPosition: 'Komandan Regu',
        komandanRole: 'Laporan Komandan',
        kedisiplinan: 'Baik',
        koordinasi: 'Baik',
        kehadiran: 'Lengkap',
        reguHadir: 'Lengkap',
        reguIzin: '0',
        insiden: 'Tidak Ada',
        detailInsiden: 'Tidak ada kejadian menonjol atau insiden keamanan.',
        catatan: 'Evaluasi pengawasan apel dan serah terima regu berjalan tertib dan sesuai SOP. Personil sigap.',
        statusLaporan: 'Selesai',
        tanggalLapor: '2026-10-18 21:11:40',
      };

      (dbMock.query as jest.Mock).mockResolvedValueOnce([mockRecord]);

      const detail = await service.getChiefEvaluationDetail('ce-01');
      expect(detail).toBeDefined();
      expect(detail.id).toBe('ce-01');
      expect(detail.namaKomandan).toBe('DANDAN KOMANDAN');
      expect(detail.detailInsiden).toBe('Tidak ada kejadian menonjol atau insiden keamanan.');
    });

    it('should return fallback demo detail when not found in database', async () => {
      (dbMock.query as jest.Mock).mockResolvedValueOnce([]);

      const detail = await service.getChiefEvaluationDetail('unknown-id');
      expect(detail).toBeDefined();
      expect(detail.namaKomandan).toBe('DANDAN KOMANDAN');
      expect(detail.siteName).toBe('site proyek demo');
      expect(detail.statusLaporan).toBe('Selesai');
    });
  });

  describe('TC-CHF-03: Create Chief Evaluation', () => {
    it('should insert new evaluation into database', async () => {
      const dto = {
        siteId: 'site-1',
        komandanId: 'kom-1',
        disciplineScore: 90,
        coordinationScore: 85,
        attendanceScore: 100,
        incidentNotes: 'Semua aman terkendali',
      };

      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce({
        id: 'new-eval-1',
        ...dto,
      });

      const res = await service.createChiefEvaluation('chief-user-1', dto);
      expect(res.id).toBe('new-eval-1');
      expect(dbMock.queryOne).toHaveBeenCalled();
    });
  });

  describe('TC-PAY-01: Reverse-Engineered Payroll Calculation (100% Parity with patroli.site)', () => {
    it('should calculate take home pay accurately including overtime, bpjs, and absence penalties', async () => {
      const mockUsers = [
        {
          id: 'u-andi',
          fullName: 'Andi Rahman',
          division: 'SECURITY',
          role: 'SECURITY_OFFICER',
          siteName: 'kantor pusat',
          gajiPokok: '5200000',
          tunjangan: '450000',
          lemburPerJam: '45000',
          potonganBpjs: '210000',
          potonganAlpa: '130000',
          potonganLupaAbsen: '50000',
        },
      ];

      const mockAttendances = [
        // 1 Normal present with 120 mins (2 hrs) overtime
        {
          userId: 'u-andi',
          date: '2026-10-01',
          statusType: 2,
          overtimeMinutes: 120,
        },
        // 1 Lupa absen (clock in without clock out in past date)
        {
          userId: 'u-andi',
          date: '2026-10-02',
          statusType: 1,
          overtimeMinutes: 0,
        },
        // 1 Izin
        {
          userId: 'u-andi',
          date: '2026-10-03',
          statusType: 3,
          overtimeMinutes: 0,
        },
      ];

      (dbMock.query as jest.Mock)
        .mockResolvedValueOnce(mockUsers)
        .mockResolvedValueOnce(mockAttendances);

      const payroll = await service.getPayrollSummary({ month: 10, year: 2026 });
      expect(payroll).toHaveLength(1);
      const row = payroll[0];

      // Verifikasi komponen dasar
      expect(row.hadirCount).toBe(1);
      expect(row.lupaAbsenCount).toBe(1);
      expect(row.izinCount).toBe(1);
      expect(row.lemburHours).toBe(2);

      // Verifikasi finansial
      // lembur = 2 jam * 45.000 = 90.000
      expect(row.lemburNominal).toBe(90000);
      // pot_lupa = 1 * 50.000 = 50.000
      expect(row.totalPotLupa).toBe(50000);
      // pot_izin = 1 * 130.000 = 130.000
      expect(row.totalPotIzin).toBe(130000);
      // pot_bpjs = 210.000
      expect(row.potonganBpjs).toBe(210000);
      // totalPotongan = 50.000 + 130.000 + 210.000 = 390.000
      expect(row.totalPotongan).toBe(390000);
      // total_gaji = 5.200.000 (gapok) + 450.000 (tunjangan) + 90.000 (lembur) - 390.000 = 5.350.000
      expect(row.gajiDiterima).toBe(5350000);

      // Verifikasi 100% Parity aliases
      expect(row.nama_anggota).toBe('Andi Rahman');
      expect(row.posisi).toBe('SECURITY');
      expect(row.lokasi_site).toBe('kantor pusat');
      expect(row.bulan).toBe('October');
      expect(row.tahun).toBe('2026');
      expect(row.total_hadir).toBe('1');
      expect(row.total_lupa_absen).toBe('1');
      expect(row.total_izin).toBe('1');
      expect(row.total_gaji).toBe(5350000);
    });
  });

  describe('TC-EXP-01: Export Categories & Personnel (100% Parity with get_kategori & get_personil)', () => {
    it('should return categories for given site or corporate defaults', async () => {
      (dbMock.query as jest.Mock).mockResolvedValueOnce([
        { division: 'Security' },
        { division: 'Cleaning Service' },
      ]);

      const categories = await service.getCategoriesForExport('site-1');
      expect(categories).toEqual(['Security', 'Cleaning Service']);
      expect(dbMock.query).toHaveBeenCalledWith(expect.stringContaining('SELECT DISTINCT u.division'), ['site-1', '%site-1%']);
    });

    it('should query personnel matching site and division category', async () => {
      const mockPersonnel = [
        { id: 'u1', fullName: 'Budi Santoso', division: 'Security', nik: 'SEC-001', role: 'PETUGAS' },
        { id: 'u2', fullName: 'Andi Rahman', division: 'Security', nik: 'SEC-002', role: 'PETUGAS' },
      ];
      (dbMock.query as jest.Mock).mockResolvedValueOnce(mockPersonnel);

      const res = await service.getPersonnelForExport('Kantor Pusat', 'Security');
      expect(res).toHaveLength(2);
      expect(res[0].fullName).toBe('Budi Santoso');
      expect(dbMock.query).toHaveBeenCalledWith(expect.stringContaining('ORDER BY u.full_name ASC'), expect.arrayContaining(['Kantor Pusat', '%Kantor Pusat%', '%Security%']));
    });
  });

  describe('TC-EXP-02: Export Personnel Attendance with 5 KPI Chips (patroli.site parity)', () => {
    it('should compute exact KPI chips and formatted attendance rows', async () => {
      // Mock user lookup
      (dbMock.queryOne as jest.Mock)
        .mockResolvedValueOnce({ id: 'u1', full_name: 'Budi Santoso', division: 'Security', nik: 'SEC-001' }) // user
        .mockResolvedValueOnce({ name: 'Kantor Pusat' }); // site

      // Mock attendance rows (1 complete with checkout, 1 incomplete missing checkout, 1 late)
      (dbMock.query as jest.Mock).mockResolvedValueOnce([
        {
          id: 'att-1',
          attendance_date: '2026-10-26T00:00:00.000Z',
          date_str: '2026-10-26',
          status_type: 1,
          shift_name: 'Shift Pagi',
          clock_in_at: '2026-10-26T05:33:53.000Z',
          clock_in_time: '05:33:53',
          clock_in_photo_key: 'selfie_in_1.jpg',
          clock_in_distance_meters: 25,
          is_late: false,
          late_minutes: 0,
          clock_out_at: '2026-10-26T17:33:53.000Z',
          clock_out_time: '17:33:53',
          clock_out_photo_key: 'selfie_out_1.jpg',
          work_duration_minutes: 720, // 12 hours
          notes: 'Patroli lancar',
          site_name: 'Kantor Pusat',
          geofence_radius_meters: 100,
        },
        {
          id: 'att-2',
          attendance_date: '2026-10-27T00:00:00.000Z',
          date_str: '2026-10-27',
          status_type: 1,
          shift_name: 'Shift Pagi',
          clock_in_at: '2026-10-27T08:25:00.000Z',
          clock_in_time: '08:25:00',
          clock_in_photo_key: 'selfie_in_2.jpg',
          clock_in_distance_meters: 30,
          is_late: true,
          late_minutes: 25,
          clock_out_at: null,
          clock_out_time: null,
          clock_out_photo_key: null,
          work_duration_minutes: 0,
          notes: 'Terlambat karena macet',
          site_name: 'Kantor Pusat',
          geofence_radius_meters: 100,
        },
      ]);

      const result = await service.getExportAttendancePersonnel({
        siteId: 'site-1',
        personnelName: 'Budi Santoso',
        fromDate: '2026-10-01',
        toDate: '2026-10-31',
      });

      expect(result.namaPersonil).toBe('BUDI SANTOSO');
      expect(result.posisi).toBe('SECURITY');
      expect(result.siteName).toBe('KANTOR PUSAT');

      // Verifikasi 5 KPI chips
      expect(result.summary.kehadiranCount).toBe(2);
      expect(result.summary.lupaPulangCount).toBe(1); // att-2 missing checkout
      expect(result.summary.terlambatCount).toBe(1);
      expect(result.summary.terlambatMenit).toBe(25);
      expect(result.summary.izinSakitCount).toBe(0);

      // Verifikasi baris record
      expect(result.records).toHaveLength(2);
      expect(result.records[0].totalJamEfektif).toBe('12:00');
      expect(result.records[0].absenPulang).toContain('17:33:53');
      expect(result.records[1].absenPulang).toBe('Belum Absen Pulang');
      expect(result.records[1].totalJamEfektif).toBe('-');
      expect(result.records[1].absenMasuk).toContain('Terlambat 25 menit');
    });
  });

  describe('TC-EXP-03: Export Area Attendance & Patrol Activities', () => {
    it('should query area attendance records', async () => {
      (dbMock.query as jest.Mock).mockResolvedValueOnce([
        {
          id: 'att-1',
          fullName: 'Budi Santoso',
          division: 'Security',
          attendance_date: '2026-10-26T00:00:00.000Z',
          date_str: '2026-10-26',
          clock_in_at: '2026-10-26T05:33:53.000Z',
          clock_in_time: '05:33:53',
          clock_in_photo_key: null,
          clock_in_distance_meters: 10,
          is_late: false,
          clock_out_at: null,
          work_duration_minutes: 0,
          notes: null,
          site_name: 'Kantor Pusat',
          geofence_radius_meters: 100,
        },
      ]);

      const res = await service.getExportAttendanceArea({
        areaName: 'Kantor Pusat',
        category: 'Security',
        fromDate: '2026-10-01',
        toDate: '2026-10-31',
      });

      expect(res.records).toHaveLength(1);
      expect(res.records[0].namaPersonil).toBe('BUDI SANTOSO');
      expect(res.records[0].absenPulang).toBe('Belum Absen Pulang');
    });

    it('should query area patrol activities with reported findings', async () => {
      (dbMock.query as jest.Mock).mockResolvedValueOnce([
        {
          id: 'pl-1',
          officerName: 'Andi Rahman',
          division: 'Security',
          scanned_at: '2026-10-26T05:33:00.000Z',
          time_str: '05:33:00',
          status_result: 'ABNORMAL',
          notes: 'Lampu penerangan zona B1 padam, perlu diganti bohlam',
          photo_key: 'lampu.jpg',
          checkpoint_name: 'Parkir Basement',
          location_detail: 'Basement Lantai 1',
          task_description: 'Pemeriksaan area parkir',
        },
      ]);

      const res = await service.getExportActivityArea({
        areaName: 'Kantor Pusat',
        fromDate: '2026-10-01',
        toDate: '2026-10-31',
      });

      expect(res.records).toHaveLength(1);
      expect(res.records[0].namaPersonel).toBe('ANDI RAHMAN');
      expect(res.records[0].statusTemuan).toBe('BELUM DITINDAKLANJUTI');
      expect(res.records[0].temuanDilaporkan).toBe('Lampu penerangan zona B1 padam, perlu diganti bohlam');
    });
  });
});

