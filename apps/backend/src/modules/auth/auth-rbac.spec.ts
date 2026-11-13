import { AuthService } from './auth.service';
import { DatabaseService } from '../../database/database.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException, ForbiddenException, HttpException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Division } from '@patrol/types';

describe('AuthService - RBAC & Approval Extensions', () => {
  let authService: AuthService;
  let dbMock: Partial<DatabaseService>;
  let jwtMock: Partial<JwtService>;

  beforeEach(() => {
    dbMock = {
      query: jest.fn(),
      queryOne: jest.fn(),
    };

    jwtMock = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    authService = new AuthService(dbMock as any, jwtMock as any);
  });

  describe('register()', () => {
    const validRegisterDto = {
      fullName: 'Ahmad Fauzi',
      nik: '3201234567890001',
      username: 'ahmad.fauzi',
      email: 'ahmad@example.com',
      phone: '081234567890',
      password: 'password123',
      passwordConfirm: 'password123',
      divisionInterest: Division.SECURITY,
    };

    it('should throw BadRequestException if honeypot is filled', async () => {
      await expect(
        authService.register({ ...validRegisterDto, hp_input: 'bot-fill' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if passwords do not match', async () => {
      await expect(
        authService.register({ ...validRegisterDto, passwordConfirm: 'mismatch' }),
      ).rejects.toThrow(new BadRequestException('Konfirmasi kata sandi tidak cocok'));
    });

    it('should throw BadRequestException if password is under 6 characters', async () => {
      await expect(
        authService.register({ ...validRegisterDto, password: '123', passwordConfirm: '123' }),
      ).rejects.toThrow(new BadRequestException('Kata sandi minimal 6 karakter'));
    });

    it('should throw BadRequestException if username or NIK already exists', async () => {
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce({ id: 'existing-id' });
      await expect(authService.register(validRegisterDto)).rejects.toThrow(
        new BadRequestException('Username, NIK, atau Email sudah terdaftar'),
      );
    });

    it('should insert new user with is_approved=false and is_active=false', async () => {
      (dbMock.queryOne as jest.Mock)
        .mockResolvedValueOnce(null) // uniqueness check
        .mockResolvedValueOnce({
          id: 'new-uuid',
          username: 'ahmad.fauzi',
          full_name: 'Ahmad Fauzi',
          role: 'SECURITY_OFFICER',
          division: 'SECURITY',
          is_approved: false,
          is_active: false,
          created_at: new Date().toISOString(),
        });

      const res = await authService.register(validRegisterDto);
      expect(res).toBeDefined();
      expect(res.username).toBe('ahmad.fauzi');
      expect(dbMock.queryOne).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        expect.arrayContaining(['ahmad.fauzi', false, false]),
      );
    });
  });

  describe('login() with security & approval checks', () => {
    it('should throw HttpException 423 if account is locked_until in the future', async () => {
      const futureLock = new Date(Date.now() + 10 * 60 * 1000);
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce({
        id: 'u1',
        username: 'lockeduser',
        password_hash: 'hash',
        is_active: true,
        is_approved: true,
        locked_until: futureLock,
      });

      await expect(
        authService.login({ username: 'lockeduser', password: 'any' }),
      ).rejects.toThrow(HttpException);
    });

    it('should increment failed_login_attempts on wrong password and lock upon 5 attempts', async () => {
      const hash = await bcrypt.hash('correctPassword', 10);
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce({
        id: 'u2',
        username: 'testuser',
        password_hash: hash,
        is_active: true,
        is_approved: true,
        failed_login_attempts: 4,
      });

      await expect(
        authService.login({ username: 'testuser', password: 'wrongPassword' }),
      ).rejects.toThrow(HttpException);

      expect(dbMock.query).toHaveBeenCalledWith(
        expect.stringContaining('locked_until'),
        expect.arrayContaining(['u2']),
      );
    });

    it('should throw ForbiddenException if user is not approved (pending)', async () => {
      const hash = await bcrypt.hash('correctPassword', 10);
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce({
        id: 'u3',
        username: 'pendinguser',
        password_hash: hash,
        is_active: false,
        is_approved: false,
        rejection_reason: null,
      });

      await expect(
        authService.login({ username: 'pendinguser', password: 'correctPassword' }),
      ).rejects.toThrow(
        new ForbiddenException('Akun Anda sedang dalam antrean verifikasi Administrator. Silakan hubungi supervisor Anda.'),
      );
    });

    it('should throw ForbiddenException with reason if user was rejected', async () => {
      const hash = await bcrypt.hash('correctPassword', 10);
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce({
        id: 'u4',
        username: 'rejecteduser',
        password_hash: hash,
        is_active: false,
        is_approved: false,
        rejection_reason: 'NIK KTP tidak sesuai data Disdukcapil',
      });

      await expect(
        authService.login({ username: 'rejecteduser', password: 'correctPassword' }),
      ).rejects.toThrow(
        new ForbiddenException('Pendaftaran Anda ditolak oleh Administrator: NIK KTP tidak sesuai data Disdukcapil'),
      );
    });

    it('should populate active permissions array and reset failed attempts on successful login', async () => {
      const hash = await bcrypt.hash('correctPassword', 10);
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce({
        id: 'u5',
        username: 'admin',
        full_name: 'Super Admin',
        password_hash: hash,
        role: 'ADMIN_SUPER',
        division: 'STAFF',
        is_active: true,
        is_approved: true,
        failed_login_attempts: 2,
      });

      (dbMock.query as jest.Mock)
        .mockResolvedValueOnce([]) // for UPDATE last_login_at
        .mockResolvedValueOnce([   // for SELECT permissions
          { code: 'DATA_INDUK:VIEW' },
          { code: 'USER:APPROVE' },
          { code: 'RBAC:MANAGE' },
        ]);

      const res = await authService.login({ username: 'admin', password: 'correctPassword' });
      expect(res.user.permissions).toEqual(['DATA_INDUK:VIEW', 'USER:APPROVE', 'RBAC:MANAGE']);
      expect(dbMock.query).toHaveBeenCalledWith(
        expect.stringContaining('failed_login_attempts = 0'),
        expect.arrayContaining(['u5']),
      );
    });
  });
});
