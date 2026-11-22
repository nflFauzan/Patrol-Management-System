import { StaffService, STANDARD_STAFF_CATEGORIES } from './staff.service';
import { DatabaseService } from '../../database/database.service';
import { EventsGateway } from '../gateway/events.gateway';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('StaffService', () => {
  let service: StaffService;
  let mockDb: any;
  let mockGateway: any;

  beforeEach(() => {
    mockDb = {
      query: jest.fn(),
      queryOne: jest.fn(),
    };
    mockGateway = {
      server: {
        to: jest.fn().mockReturnValue({
          emit: jest.fn(),
        }),
      },
    };

    service = new StaffService(mockDb as any, mockGateway as any);
  });

  it('should return 8 standard staff categories', () => {
    const categories = service.getCategories();
    expect(categories.length).toBe(8);
    expect(categories).toEqual(STANDARD_STAFF_CATEGORIES);
  });

  describe('createActivity', () => {
    it('should throw BadRequestException if required fields are missing', async () => {
      await expect(service.createActivity('user-1', {} as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if site does not exist', async () => {
      mockDb.queryOne.mockResolvedValueOnce(null); // site check
      await expect(
        service.createActivity('user-1', {
          siteId: 'site-999',
          activityType: 'Administrasi & Pelaporan',
          description: 'Laporan mingguan',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create staff activity successfully and broadcast event', async () => {
      mockDb.queryOne
        .mockResolvedValueOnce({ id: 'site-1', name: 'Site Kantor Pusat' }) // site
        .mockResolvedValueOnce({ id: 'user-1', full_name: 'Budi Santoso', username: 'budi' }) // user
        .mockResolvedValueOnce({
          id: 'act-1',
          siteId: 'site-1',
          userId: 'user-1',
          activityType: 'Administrasi & Pelaporan',
          description: 'Penyusunan berkas',
          status: 'COMPLETED',
          photoKey: null,
          createdAt: new Date('2026-11-20T10:00:00Z'),
        }); // insert row

      const result = await service.createActivity('user-1', {
        siteId: 'site-1',
        activityType: 'Administrasi & Pelaporan',
        description: 'Penyusunan berkas',
      });

      expect(result.id).toBe('act-1');
      expect(result.staffName).toBe('Budi Santoso');
      expect(mockGateway.server.to).toHaveBeenCalledWith('site_site-1');
    });
  });

  describe('getActivities', () => {
    it('should return list of staff activities mapped cleanly', async () => {
      mockDb.query.mockResolvedValueOnce([
        {
          id: 'act-1',
          siteId: 'site-1',
          siteName: 'Site Kantor Pusat',
          userId: 'user-1',
          staffName: 'Budi Santoso',
          activityType: 'Meeting & Koordinasi',
          description: 'Rapat koordinasi mingguan',
          status: 'COMPLETED',
          createdAt: new Date('2026-11-20T10:00:00Z'),
        },
      ]);

      const list = await service.getActivities({ siteId: 'site-1' });
      expect(list.length).toBe(1);
      expect(list[0].activityType).toBe('Meeting & Koordinasi');
      expect(list[0].siteName).toBe('Site Kantor Pusat');
    });
  });
});
