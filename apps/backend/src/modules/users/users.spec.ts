import { UsersService } from './users.service';
import { DatabaseService } from '../../database/database.service';
import { UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserRole, Division, SecurityRank } from '@patrol/types';
import * as bcrypt from 'bcryptjs';

describe('UsersService (Data Induk Personil & Security Parity)', () => {
  let service: UsersService;
  let dbMock: Partial<DatabaseService>;

  beforeEach(() => {
    dbMock = {
      queryOne: jest.fn(),
      query: jest.fn(),
    };

    service = new UsersService(dbMock as any);
  });

  describe('TC-USR-01: Create Personnel with Payroll & Rank', () => {
    it('should create user with bcrypt hash and payroll settings', async () => {
      (dbMock.queryOne as jest.Mock)
        // check username exists -> null
        .mockResolvedValueOnce(null)
        // insert user returning
        .mockResolvedValueOnce({
          id: 'usr-new-001',
          username: 'satpam_baru',
          full_name: 'Budi Santoso',
          email: 'budi@patrol.local',
          phone: '08123456789',
          role: UserRole.SECURITY_OFFICER,
          division: Division.SECURITY,
          security_rank: SecurityRank.ANGGOTA,
          working_hours_per_day: 8,
          gaji_pokok: 4500000,
          tunjangan: 500000,
          lembur_per_jam: 30000,
          potongan_bpjs: 100000,
          potongan_alpa: 150000,
          potongan_lupa_absen: 50000,
          site_id: 'site-001',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      const result = await service.create({
        username: 'satpam_baru',
        password: 'password123',
        fullName: 'Budi Santoso',
        email: 'budi@patrol.local',
        phone: '08123456789',
        role: UserRole.SECURITY_OFFICER,
        division: Division.SECURITY,
        securityRank: SecurityRank.ANGGOTA,
        workingHoursPerDay: 8,
        gajiPokok: 4500000,
        tunjangan: 500000,
        lemburPerJam: 30000,
        potonganBpjs: 100000,
        potonganAlpa: 150000,
        potonganLupaAbsen: 50000,
        siteId: 'site-001',
      });

      expect(result).toBeDefined();
      expect(result.id).toBe('usr-new-001');
      expect(result.gajiPokok).toBe(4500000);
      expect(result.securityRank).toBe(SecurityRank.ANGGOTA);
      expect(dbMock.queryOne).toHaveBeenCalled();
    });

    it('should throw BadRequestException if username already exists', async () => {
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce({ id: 'existing-id' });

      await expect(
        service.create({
          username: 'existing_user',
          password: 'password123',
          fullName: 'Duplicate User',
          phone: '0811',
          role: UserRole.SECURITY_OFFICER,
          division: Division.SECURITY,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('TC-USR-02: Delete Personnel with Admin Password Verification', () => {
    it('should successfully delete user when admin password is correct', async () => {
      const adminPasswordHash = await bcrypt.hash('adminSecret123', 10);

      // 1. query admin user
      (dbMock.queryOne as jest.Mock)
        .mockResolvedValueOnce({
          id: 'admin-001',
          username: 'superadmin',
          password_hash: adminPasswordHash,
          role: UserRole.ADMIN_SUPER,
        })
        // 2. query target user to delete
        .mockResolvedValueOnce({
          id: 'usr-target-001',
          full_name: 'Target Personil',
        });

      // 3. delete queries
      (dbMock.query as jest.Mock).mockResolvedValueOnce([]);

      const result = await service.verifyAndDeleteUser({
        adminId: 'admin-001',
        targetUserId: 'usr-target-001',
        passwordConfirm: 'adminSecret123',
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('berhasil dihapus');
      expect(dbMock.query).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM users'), ['usr-target-001']);
    });

    it('should throw UnauthorizedException when admin password is wrong', async () => {
      const adminPasswordHash = await bcrypt.hash('adminSecret123', 10);

      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce({
        id: 'admin-001',
        username: 'superadmin',
        password_hash: adminPasswordHash,
        role: UserRole.ADMIN_SUPER,
      });

      await expect(
        service.verifyAndDeleteUser({
          adminId: 'admin-001',
          targetUserId: 'usr-target-001',
          passwordConfirm: 'wrongPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw NotFoundException if target user does not exist', async () => {
      const adminPasswordHash = await bcrypt.hash('adminSecret123', 10);

      (dbMock.queryOne as jest.Mock)
        .mockResolvedValueOnce({
          id: 'admin-001',
          password_hash: adminPasswordHash,
        })
        .mockResolvedValueOnce(null); // target user not found

      await expect(
        service.verifyAndDeleteUser({
          adminId: 'admin-001',
          targetUserId: 'non-existent',
          passwordConfirm: 'adminSecret123',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
