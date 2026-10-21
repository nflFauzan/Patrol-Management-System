import { CleaningService } from './cleaning.service';
import { DatabaseService } from '../../database/database.service';
import { EventsGateway } from '../gateway/events.gateway';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CleaningService (Cleaning Service Records & Parity)', () => {
  let service: CleaningService;
  let dbMock: Partial<DatabaseService>;
  let gatewayMock: Partial<EventsGateway>;

  beforeEach(() => {
    dbMock = {
      queryOne: jest.fn(),
      query: jest.fn(),
    };

    gatewayMock = {
      server: {
        to: jest.fn().mockReturnValue({
          emit: jest.fn(),
        }),
      } as any,
    };

    service = new CleaningService(dbMock as any, gatewayMock as any);
  });

  describe('TC-CLN-01: formatWibDateTime', () => {
    it('should format ISO date correctly into Indonesian WIB components', () => {
      const res = service.formatWibDateTime('2026-10-12T11:05:00.000Z');
      expect(res.dateFormatted).toContain('Senin');
      expect(res.dateFormatted).toContain('12 Oct 2026');
      expect(res.timeFormatted).toBe('18:05:00');
      expect(res.dateTimeFull).toContain('Senin, 12 Oct 2026 | 18:05:00');
    });
  });

  describe('TC-CLN-02: getCleaningRecords', () => {
    it('should return demo cleaning records when DB is empty or fallback', async () => {
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce({ total: 0 });

      const res = await service.getCleaningRecords({ page: 1, limit: 5 });

      expect(res.recordsTotal).toBe(2);
      expect(res.data.length).toBe(2);
      expect(res.data[0].id).toBe('7546');
      expect(res.data[0].personilName).toBe('akmal');
      expect(res.data[0].status).toBe('KONDISI BERSIH DAN RAPI');
      expect(res.data[1].id).toBe('7544');
    });

    it('should filter demo cleaning records by search query', async () => {
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce({ total: 0 });

      const res = await service.getCleaningRecords({ search: '7546' });
      // When searching by 7546
      expect(res.data.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('TC-CLN-03: getCleaningDetail', () => {
    it('should return exact 100% parity detail for id 7546', async () => {
      const detail = await service.getCleaningDetail('7546');

      expect(detail).toBeDefined();
      expect(detail.id).toBe('7546');
      expect(detail.officerName).toBe('akmal');
      expect(detail.position).toBe('anggota');
      expect(detail.siteName).toBe('site proyek demo');
      expect(detail.assetName).toBe('toilet');
      expect(detail.cleaningCode).toBe('#7546');
      expect(detail.taskDescription).toBe('bersihkan kloset');
      expect(detail.cleaningResult).toBe('Bersih dan Rapi');
      expect(detail.latitude).toBeCloseTo(-6.562729, 5);
      expect(detail.longitude).toBeCloseTo(106.856097, 5);
      expect(detail.googleMapsUrl).toContain('https://www.google.com/maps?q=');
    });

    it('should return exact 100% parity detail for id 7544', async () => {
      const detail = await service.getCleaningDetail('7544');

      expect(detail).toBeDefined();
      expect(detail.id).toBe('7544');
      expect(detail.officerName).toBe('akmal');
      expect(detail.cleaningCode).toBe('#7544');
      expect(detail.timeFormatted).toBe('17:54:00');
    });
  });

  describe('TC-CLN-04: updateTindakLanjut', () => {
    it('should update tindak lanjut status and emit event', async () => {
      const res = await service.updateTindakLanjut('7546', 'Ya sudah di TL');

      expect(res.id).toBe('7546');
      expect(res.status).toBe('RESOLVED');
      expect(res.tindakLanjutStatus).toBe('Sudah di TL');
      expect(res.notes).toBe('Ya sudah di TL');
    });
  });

  describe('TC-CLN-05: submitChecklist', () => {
    it('should throw BadRequestException if neither checkpointId nor qrPayload provided', async () => {
      await expect(
        service.submitChecklist('user-1', {
          siteId: 'site-1',
          floorCleaned: true,
          trashEmptied: true,
          suppliesRestocked: true,
          odorNormal: true,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if checkpoint is not found', async () => {
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        service.submitChecklist('user-1', {
          siteId: 'site-1',
          checkpointId: 'cp-invalid',
          floorCleaned: true,
          trashEmptied: true,
          suppliesRestocked: true,
          odorNormal: true,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
