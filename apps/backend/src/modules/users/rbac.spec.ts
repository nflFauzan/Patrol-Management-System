import { UsersService } from './users.service';
import { DatabaseService } from '../../database/database.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('UsersService - Dynamic RBAC & SuperAdmin Protection', () => {
  let service: UsersService;
  let dbMock: Partial<DatabaseService>;

  beforeEach(() => {
    dbMock = {
      queryOne: jest.fn(),
      query: jest.fn(),
    };

    service = new UsersService(dbMock as any);
  });

  describe('updateRole()', () => {
    it('should throw NotFoundException if role does not exist', async () => {
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        service.updateRole('r-none', { name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update role name, description, and synchronize role_permissions', async () => {
      (dbMock.queryOne as jest.Mock)
        .mockResolvedValueOnce({
          id: 'r-custom-1',
          code: 'CUSTOM_LEAD',
          name: 'Old Lead',
          is_system: false,
          is_active: true,
        })
        .mockResolvedValueOnce({
          id: 'r-custom-1',
          code: 'CUSTOM_LEAD',
          name: 'Updated Lead',
          description: 'Team lead role',
          is_system: false,
          is_active: true,
        });

      (dbMock.query as jest.Mock).mockResolvedValue([]);

      const updated = await service.updateRole('r-custom-1', {
        name: 'Updated Lead',
        description: 'Team lead role',
        permissions: ['DATA_INDUK:VIEW', 'PATROL:VALIDATE'],
      });

      expect(updated).toBeDefined();
      expect(updated.name).toBe('Updated Lead');
      expect(dbMock.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM role_permissions WHERE role_id = $1'),
        ['r-custom-1'],
      );
    });
  });

  describe('assignUserRole() with SuperAdmin Protection', () => {
    it('should throw BadRequestException when attempting to remove the last active Super Admin', async () => {
      // 1. target user is currently ADMIN_SUPER
      (dbMock.queryOne as jest.Mock)
        .mockResolvedValueOnce({
          id: 'admin-solo',
          username: 'superadmin',
          role: 'ADMIN_SUPER',
          is_active: true,
        })
        // 2. target new role is SECURITY_OFFICER
        .mockResolvedValueOnce({
          id: 'r-sec',
          code: 'SECURITY_OFFICER',
        })
        // 3. count active superadmins in system = 1
        .mockResolvedValueOnce({
          count: '1',
        });

      await expect(
        service.assignUserRole('admin-solo', 'r-sec'),
      ).rejects.toThrow(
        new BadRequestException('Tidak dapat mengubah atau mencabut hak akses Super Administrator terakhir yang aktif.'),
      );
    });

    it('should assign role and update both users.role and user_roles when multiple Super Admins exist', async () => {
      // 1. target user
      (dbMock.queryOne as jest.Mock)
        .mockResolvedValueOnce({
          id: 'usr-1',
          username: 'petugas1',
          role: 'SECURITY_OFFICER',
          is_active: true,
        })
        // 2. new role
        .mockResolvedValueOnce({
          id: 'r-chief',
          code: 'SITE_SUPERVISOR',
          name: 'Site Supervisor',
        })
        // 3. update queryOne returning
        .mockResolvedValueOnce({
          id: 'usr-1',
          username: 'petugas1',
          role: 'SITE_SUPERVISOR',
          is_active: true,
        });

      (dbMock.query as jest.Mock).mockResolvedValue([]);

      const res = await service.assignUserRole('usr-1', 'r-chief');
      expect(res).toBeDefined();
      expect(res.role).toBe('SITE_SUPERVISOR');
      expect(dbMock.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO user_roles'),
        ['usr-1', 'r-chief'],
      );
    });
  });

  describe('deactivateRole()', () => {
    it('should throw BadRequestException when attempting to deactivate ADMIN_SUPER role', async () => {
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce({
        id: 'r-admin',
        code: 'ADMIN_SUPER',
        is_system: true,
      });

      await expect(
        service.deactivateRole('r-admin'),
      ).rejects.toThrow(new BadRequestException('Peran sistem inti ADMIN_SUPER tidak dapat dinonaktifkan.'));
    });

    it('should set is_active=false for custom role', async () => {
      (dbMock.queryOne as jest.Mock)
        .mockResolvedValueOnce({
          id: 'r-custom-2',
          code: 'EXTRA_ROLE',
          is_system: false,
          is_active: true,
        })
        .mockResolvedValueOnce({
          id: 'r-custom-2',
          code: 'EXTRA_ROLE',
          is_active: false,
        });

      const res = await service.deactivateRole('r-custom-2');
      expect(res.isActive).toBe(false);
    });
  });
});
