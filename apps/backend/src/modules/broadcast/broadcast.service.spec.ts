import { BroadcastService } from './broadcast.service';
import { DatabaseService } from '../../database/database.service';
import { EventsGateway } from '../gateway/events.gateway';
import { NotFoundException } from '@nestjs/common';

describe('BroadcastService (Reverse Engineered Pesan Siaran Parity)', () => {
  let service: BroadcastService;
  let dbMock: Partial<DatabaseService>;
  let gatewayMock: Partial<EventsGateway>;

  beforeEach(() => {
    dbMock = {
      query: jest.fn(),
      queryOne: jest.fn(),
    };

    gatewayMock = {
      broadcastAnnouncement: jest.fn(),
      broadcastAnnouncementUpdated: jest.fn(),
      broadcastAnnouncementDeleted: jest.fn(),
    };

    service = new BroadcastService(dbMock as any, gatewayMock as any);
  });

  describe('getAll', () => {
    it('should query all broadcast messages ordered by created_at desc', async () => {
      const mockRows = [
        {
          id: 'b1',
          siteId: '11111111-1111-1111-1111-111111111111',
          siteName: 'Kantor Pusat',
          title: 'Pengumuman Penting',
          content: 'Pemberitahuan operasional kantor pusat',
          priority: 'NORMAL',
          createdAt: new Date().toISOString(),
          senderName: 'Administrator',
          senderId: 'u1',
        },
      ];

      (dbMock.query as jest.Mock).mockResolvedValueOnce(mockRows);

      const result = await service.getAll();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('b1');
      expect(result[0].siteName).toBe('Kantor Pusat');
      expect(result[0].content).toBe('Pemberitahuan operasional kantor pusat');
      expect(dbMock.query).toHaveBeenCalledTimes(1);
    });

    it('should filter by siteId when provided', async () => {
      (dbMock.query as jest.Mock).mockResolvedValueOnce([]);

      await service.getAll('11111111-1111-1111-1111-111111111111');
      expect(dbMock.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE bm.site_id = $1 OR bm.site_id IS NULL'),
        ['11111111-1111-1111-1111-111111111111'],
      );
    });
  });

  describe('getById', () => {
    it('should return the broadcast message if found', async () => {
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce({
        id: 'b1',
        siteId: '11111111-1111-1111-1111-111111111111',
        siteName: 'Kantor Pusat',
        title: 'Pengumuman Penting',
        content: 'Pesan kantor pusat',
        priority: 'NORMAL',
        createdAt: new Date().toISOString(),
        senderName: 'Admin',
        senderId: 'u1',
      });

      const result = await service.getById('b1');
      expect(result.id).toBe('b1');
      expect(result.content).toBe('Pesan kantor pusat');
    });

    it('should throw NotFoundException if not found', async () => {
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.getById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should insert broadcast message and emit real-time WebSocket event', async () => {
      (dbMock.queryOne as jest.Mock)
        .mockResolvedValueOnce({
          id: 'b-new',
          siteId: '22222222-2222-2222-2222-222222222222',
          title: 'Instruksi K3 Pabrik Bekasi',
          content: 'Pemeriksaan QR Code Area Boiler',
          priority: 'HIGH',
          createdAt: new Date().toISOString(),
        })
        .mockResolvedValueOnce({
          name: 'Pabrik Bekasi',
        });

      const result = await service.create('u-admin', 'Superadmin', {
        siteId: '22222222-2222-2222-2222-222222222222',
        title: 'Instruksi K3 Pabrik Bekasi',
        content: 'Pemeriksaan QR Code Area Boiler',
        priority: 'HIGH',
      });

      expect(result.id).toBe('b-new');
      expect(result.siteName).toBe('Pabrik Bekasi');
      expect(result.priority).toBe('HIGH');
      expect(gatewayMock.broadcastAnnouncement).toHaveBeenCalledWith(
        '22222222-2222-2222-2222-222222222222',
        expect.objectContaining({ id: 'b-new' }),
      );
    });
  });

  describe('update', () => {
    it('should update broadcast message and emit broadcastAnnouncementUpdated', async () => {
      // Mock existing
      (dbMock.queryOne as jest.Mock)
        .mockResolvedValueOnce({
          id: 'b1',
          siteId: '11111111-1111-1111-1111-111111111111',
          siteName: 'Kantor Pusat',
          title: 'Title Lama',
          content: 'Pesan Lama',
          priority: 'NORMAL',
          createdAt: new Date().toISOString(),
          senderName: 'Admin',
          senderId: 'u1',
        })
        // Mock update
        .mockResolvedValueOnce({
          id: 'b1',
          siteId: '11111111-1111-1111-1111-111111111111',
          title: 'Title Baru',
          content: 'Pesan Baru yang Diperbarui',
          priority: 'HIGH',
          createdAt: new Date().toISOString(),
        })
        // Mock site name
        .mockResolvedValueOnce({
          name: 'Kantor Pusat',
        });

      const result = await service.update('b1', {
        title: 'Title Baru',
        content: 'Pesan Baru yang Diperbarui',
        priority: 'HIGH',
      });

      expect(result.content).toBe('Pesan Baru yang Diperbarui');
      expect(result.priority).toBe('HIGH');
      expect(gatewayMock.broadcastAnnouncementUpdated).toHaveBeenCalledWith(
        '11111111-1111-1111-1111-111111111111',
        expect.objectContaining({ id: 'b1' }),
      );
    });
  });

  describe('delete', () => {
    it('should delete broadcast message and emit broadcastAnnouncementDeleted', async () => {
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce({
        id: 'b1',
        siteId: '11111111-1111-1111-1111-111111111111',
        siteName: 'Kantor Pusat',
        title: 'Title',
        content: 'Pesan',
        priority: 'NORMAL',
        createdAt: new Date().toISOString(),
        senderName: 'Admin',
        senderId: 'u1',
      });

      (dbMock.query as jest.Mock).mockResolvedValueOnce([]);

      const result = await service.delete('b1');
      expect(result.success).toBe(true);
      expect(result.id).toBe('b1');
      expect(dbMock.query).toHaveBeenCalledWith('DELETE FROM broadcast_messages WHERE id = $1', ['b1']);
      expect(gatewayMock.broadcastAnnouncementDeleted).toHaveBeenCalledWith(
        '11111111-1111-1111-1111-111111111111',
        { id: 'b1' },
      );
    });
  });
});

