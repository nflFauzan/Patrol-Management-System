import { UsersService } from './users.service';
import { DatabaseService } from '../../database/database.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Division, SecurityRank, UserRole } from '@patrol/types';

describe('UsersService - Approval Queue & RBAC', () => {
  let service: UsersService;
  let dbMock: Partial<DatabaseService>;

  beforeEach(() => {
    dbMock = {
      query: jest.fn(),
      queryOne: jest.fn(),
    };

    service = new UsersService(dbMock as any);
  });

  describe('getApprovalQueue()', () => {
    it('should query users with is_approved=false and rejection_reason IS NULL', async () => {
      (dbMock.query as jest.Mock).mockResolvedValueOnce([
        {
          id: 'p-1',
          nik: '3201000000000001',
          username: 'calon.satpam',
          full_name: 'Calon Satpam',
          email: 'calon@example.com',
          phone_number: '08111111111',
          division: 'SECURITY',
          created_at: new Date().toISOString(),
          is_approved: false,
          is_active: false,
        },
      ]);

      const queue = await service.getApprovalQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].username).toBe('calon.satpam');
      expect(dbMock.query).toHaveBeenCalledWith(
        expect.stringContaining('is_approved = false AND'),
      );
    });
  });

  describe('approveUser()', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce(null);
      await expect(
        service.approveUser('non-existent', {
          roleId: 'role-sec',
          division: Division.SECURITY,
          siteId: 'site-sudirman',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update user to is_approved=true, is_active=true, assign role and site', async () => {
      (dbMock.queryOne as jest.Mock)
        .mockResolvedValueOnce({ id: 'u-1', username: 'pending.satpam', role: 'SECURITY_OFFICER' }) // user found
        .mockResolvedValueOnce({ id: 'role-sec-uuid', code: 'SECURITY_OFFICER' }) // role found
        .mockResolvedValueOnce({
          id: 'u-1',
          username: 'pending.satpam',
          is_approved: true,
          is_active: true,
          role: 'SECURITY_OFFICER',
          division: 'SECURITY',
        }); // updated user

      (dbMock.query as jest.Mock).mockResolvedValue([]);

      const result = await service.approveUser(
        'u-1',
        {
          roleId: 'role-sec-uuid',
          division: Division.SECURITY,
          siteId: 'site-sudirman',
          securityRank: SecurityRank.ANGGOTA,
          gajiPokok: 4500000,
          tunjangan: 500000,
        },
        'admin-uuid',
      );

      expect(result).toBeDefined();
      expect(dbMock.queryOne).toHaveBeenCalledWith(
        expect.stringContaining('is_approved = true'),
        expect.arrayContaining(['u-1', 'admin-uuid']),
      );
      expect(dbMock.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO user_roles'),
        expect.arrayContaining(['u-1', 'role-sec-uuid']),
      );
      expect(dbMock.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO user_site_assignments'),
        expect.arrayContaining(['u-1', 'site-sudirman']),
      );
    });
  });

  describe('rejectUser()', () => {
    it('should throw BadRequestException if rejection reason is empty', async () => {
      await expect(
        service.rejectUser('u-1', { reason: '   ' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update user rejection_reason and keep is_active=false', async () => {
      (dbMock.queryOne as jest.Mock)
        .mockResolvedValueOnce({ id: 'u-1', username: 'pending.satpam' }) // user found
        .mockResolvedValueOnce({
          id: 'u-1',
          username: 'pending.satpam',
          is_approved: false,
          is_active: false,
          rejection_reason: 'NIK tidak valid',
        });

      const res = await service.rejectUser('u-1', { reason: 'NIK tidak valid' }, 'admin-uuid');
      expect(res).toBeDefined();
      expect(dbMock.queryOne).toHaveBeenCalledWith(
        expect.stringContaining('rejection_reason = $1'),
        expect.arrayContaining(['u-1', 'NIK tidak valid', 'admin-uuid']),
      );
    });
  });
});
