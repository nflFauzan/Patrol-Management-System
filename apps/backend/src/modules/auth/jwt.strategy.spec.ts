import { JwtStrategy } from './jwt.strategy';
import { DatabaseService } from '../../database/database.service';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let dbMock: Partial<DatabaseService>;
  let configMock: Partial<ConfigService>;

  beforeEach(() => {
    dbMock = {
      query: jest.fn(),
      queryOne: jest.fn(),
    };

    configMock = {
      get: jest.fn().mockImplementation((key: string, defaultVal?: string) => {
        if (key === 'JWT_ACCESS_SECRET' || key === 'JWT_SECRET') {
          return 'test_jwt_secret_key_123';
        }
        return defaultVal;
      }),
    };

    strategy = new JwtStrategy(configMock as any, dbMock as any);
  });

  describe('validate()', () => {
    it('should throw UnauthorizedException if user does not exist or is inactive', async () => {
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        strategy.validate({ sub: 'u-none', username: 'ghost', role: 'SECURITY_OFFICER' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user is not approved (pending)', async () => {
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce({
        id: 'u-pending',
        username: 'pending.officer',
        is_active: false,
        is_approved: false,
        rejection_reason: null,
      });

      await expect(
        strategy.validate({ sub: 'u-pending', username: 'pending.officer', role: 'SECURITY_OFFICER' }),
      ).rejects.toThrow(new UnauthorizedException('Akun Anda belum disetujui atau dinonaktifkan'));
    });

    it('should throw UnauthorizedException if user was rejected', async () => {
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce({
        id: 'u-rejected',
        username: 'rejected.officer',
        is_active: false,
        is_approved: false,
        rejection_reason: 'Dokumen palsu',
      });

      await expect(
        strategy.validate({ sub: 'u-rejected', username: 'rejected.officer', role: 'SECURITY_OFFICER' }),
      ).rejects.toThrow(new UnauthorizedException('Akun ditolak atau dinonaktifkan'));
    });

    it('should resolve and attach user permissions from database on valid token', async () => {
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce({
        id: 'u-active',
        username: 'active.officer',
        email: 'officer@example.com',
        full_name: 'Budi Officer',
        phone: '0812345678',
        role: 'SECURITY_OFFICER',
        division: 'SECURITY',
        site_id: 'site-1',
        is_active: true,
        is_approved: true,
      });

      (dbMock.query as jest.Mock).mockResolvedValueOnce([
        { code: 'FIELD:DASHBOARD_ACCESS' },
        { code: 'PATROL:VALIDATE' },
        { code: 'SOS:RESOLVE' },
      ]);

      const user = await strategy.validate({ sub: 'u-active', username: 'active.officer', role: 'SECURITY_OFFICER' });

      expect(user).toBeDefined();
      expect(user.username).toBe('active.officer');
      expect(user.permissions).toEqual(['FIELD:DASHBOARD_ACCESS', 'PATROL:VALIDATE', 'SOS:RESOLVE']);
      expect(dbMock.query).toHaveBeenCalledWith(
        expect.stringContaining('JOIN role_permissions'),
        ['u-active'],
      );
    });
  });
});
