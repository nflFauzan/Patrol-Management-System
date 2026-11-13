import { CheckpointsService } from './checkpoints.service';
import { DatabaseService } from '../../database/database.service';
import { NotFoundException } from '@nestjs/common';

describe('CheckpointsService (Checkpoint & QR Management)', () => {
  let service: CheckpointsService;
  let dbMock: Partial<DatabaseService>;

  beforeEach(() => {
    dbMock = {
      query: jest.fn(),
      queryOne: jest.fn(),
    };

    service = new CheckpointsService(dbMock as any);
  });

  describe('findByQrToken', () => {
    it('TC-CHK-01: should return checkpoint when QR code token exists', async () => {
      const mockCheckpoint = {
        id: 'cp-01',
        siteId: 'site-01',
        qrCodeToken: 'QR-HQ-GATE-01',
        category: 'Security',
        name: 'Pos Utama Gerbang Masuk',
        locationDetail: 'Gate A',
        taskDescription: 'Cek identitas tamu',
        latitude: -6.2215,
        longitude: 106.8055,
        allowedDistanceMeters: 100,
        isActive: true,
        createdAt: '2026-10-12T00:00:00Z',
        updatedAt: '2026-10-12T00:00:00Z',
      };

      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce(mockCheckpoint);

      const result = await service.findByQrToken('QR-HQ-GATE-01');

      expect(result).toBeDefined();
      expect(result.id).toBe('cp-01');
      expect(result.qrCodeToken).toBe('QR-HQ-GATE-01');
      expect(result.name).toBe('Pos Utama Gerbang Masuk');
      expect(result.latitude).toBe(-6.2215);
      expect(result.longitude).toBe(106.8055);
    });

    it('TC-CHK-02: should throw NotFoundException when QR code token is not found', async () => {
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.findByQrToken('NON-EXISTENT-QR')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('TC-CHK-03: should insert and return newly created checkpoint', async () => {
      (dbMock.queryOne as jest.Mock)
        .mockResolvedValueOnce({ id: 'cp-new-01' }) // for INSERT RETURNING id
        .mockResolvedValueOnce({
          id: 'cp-new-01',
          site_id: 'site-01',
          qr_code_token: 'QR-NEW-01',
          category: 'Security',
          name: 'Pos Timur',
          location_detail: 'Pintu Samping',
          task_description: 'Patroli berkala',
          latitude: -6.2215,
          longitude: 106.8055,
          allowedDistanceMeters: 100,
          is_active: true,
          created_at: '2026-10-12T00:00:00Z',
          updated_at: '2026-10-12T00:00:00Z',
        }); // for findById

      const result = await service.create({
        siteId: 'site-01',
        qrCodeToken: 'QR-NEW-01',
        name: 'Pos Timur',
        category: 'Security',
        locationDetail: 'Pintu Samping',
        taskDescription: 'Patroli berkala',
      });

      expect(result).toBeDefined();
      expect(result.id).toBe('cp-new-01');
      expect(result.name).toBe('Pos Timur');
      expect(dbMock.queryOne).toHaveBeenCalledTimes(2);
    });
  });

  describe('bulkImport', () => {
    it('TC-CHK-04: should successfully import multiple valid checkpoints', async () => {
      (dbMock.query as jest.Mock)
        .mockResolvedValueOnce([
          { id: 'site-01', name: 'Site Proyek Demo' },
        ]) // for sites query
        .mockResolvedValueOnce({ rowCount: 1 }) // for item 1 insert
        .mockResolvedValueOnce({ rowCount: 1 }); // for item 2 insert

      const items = [
        {
          namaAset: 'Pos Barat',
          kategori: 'Security',
          lokasi: 'Pintu Barat',
          siteCodeOrName: 'Site Proyek Demo',
          qrPayload: 'QR-POS-BARAT',
        },
        {
          namaAset: 'Toilet Lantai 2',
          kategori: 'Cleaning Service',
          lokasi: 'Lantai 2',
          siteCodeOrName: 'Site Proyek Demo',
          qrPayload: 'QR-TOILET-L2',
        },
      ];

      const result = await service.bulkImport(items);

      expect(result.importedCount).toBe(2);
      expect(result.errors).toHaveLength(0);
    });

    it('TC-CHK-05: should catch error and report in errors array when site is not found', async () => {
      (dbMock.query as jest.Mock).mockResolvedValueOnce([]); // no sites returned

      const items = [
        {
          namaAset: 'Pos Invalid',
          siteCodeOrName: 'Unknown Site',
        },
      ];

      const result = await service.bulkImport(items);

      expect(result.importedCount).toBe(0);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('not found');
    });
  });

  describe('getImportTemplate', () => {
    it('TC-CHK-06: should return CSV template header and sample row', () => {
      const template = service.getImportTemplate();
      expect(template).toContain('namaAset,kategori,lokasi,deskripsiTugas,jenisAset,siteCodeOrName');
      expect(template).toContain('Pos Gerbang Utama');
    });
  });
});
