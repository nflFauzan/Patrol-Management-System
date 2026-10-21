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
});
