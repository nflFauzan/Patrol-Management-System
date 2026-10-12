import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../../database/database.service';
import { LoginRequestDto, LoginResponseDto, User } from '@patrol/types';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private db: DatabaseService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginRequestDto): Promise<LoginResponseDto> {
    const userRow = await this.db.queryOne<any>(
      `SELECT id, username, email, password_hash, full_name, phone, role, division, site_id, is_active, avatar_url, created_at, updated_at
       FROM users 
       WHERE username = $1`,
      [dto.username.trim().toLowerCase()],
    );

    if (!userRow) {
      throw new UnauthorizedException('Invalid username or password');
    }

    if (!userRow.is_active) {
      throw new UnauthorizedException('This account has been deactivated. Contact Administrator.');
    }

    const isMatch = await bcrypt.compare(dto.password, userRow.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid username or password');
    }

    // Update last login
    await this.db.query(`UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1`, [userRow.id]);

    const user: User = {
      id: userRow.id,
      username: userRow.username,
      email: userRow.email,
      fullName: userRow.full_name,
      phone: userRow.phone,
      role: userRow.role,
      division: userRow.division,
      siteId: userRow.site_id,
      isActive: userRow.is_active,
      avatarUrl: userRow.avatar_url,
      createdAt: userRow.created_at,
      updatedAt: userRow.updated_at,
    };

    const payload = { sub: user.id, username: user.username, role: user.role, division: user.division };
    const token = this.jwtService.sign(payload);

    return {
      user,
      token,
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
      expiresIn: 86400, // 24 hours
    };
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.db.queryOne<any>(
      `SELECT id, username, email, full_name as "fullName", phone, role, division, site_id as "siteId", is_active as "isActive", avatar_url as "avatarUrl", created_at as "createdAt", updated_at as "updatedAt"
       FROM users WHERE id = $1`,
      [userId],
    );

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async getAllUsers(siteId?: string, division?: string): Promise<User[]> {
    let sql = `
      SELECT DISTINCT
        u.id, u.username, u.email, u.full_name as "fullName", u.phone_number as "phone",
        u.role, u.division, u.security_rank as "securityRank",
        u.working_hours_per_day as "workingHoursPerDay",
        u.gaji_pokok as "gajiPokok", u.tunjangan, u.lembur_per_jam as "lemburPerJam",
        u.potongan_bpjs as "potonganBpjs", u.potongan_alpa as "potonganAlpa",
        u.potongan_lupa_absen as "potonganLupaAbsen",
        u.is_active as "isActive", u.photo_key as "avatarUrl",
        COALESCE(usa.site_id, u.site_id) as "siteId",
        s.name as "siteName",
        u.created_at as "createdAt", u.updated_at as "updatedAt"
      FROM users u
      LEFT JOIN user_site_assignments usa ON u.id = usa.user_id
      LEFT JOIN sites s ON (usa.site_id = s.id OR u.site_id = s.id)
      WHERE u.is_active = true
    `;
    const params: any[] = [];
    let idx = 1;
    if (siteId) {
      sql += ` AND (usa.site_id = $${idx} OR u.site_id = $${idx})`;
      params.push(siteId);
      idx++;
    }
    if (division) {
      sql += ` AND u.division ILIKE $${idx}`;
      params.push(division);
      idx++;
    }
    sql += ` ORDER BY u.full_name ASC`;
    const rows = await this.db.query(sql, params);
    return rows.map((r) => ({
      ...r,
      gajiPokok: Number(r.gajiPokok || 0),
      tunjangan: Number(r.tunjangan || 0),
      lemburPerJam: Number(r.lemburPerJam || 0),
      potonganBpjs: Number(r.potonganBpjs || 0),
      potonganAlpa: Number(r.potonganAlpa || 0),
      potonganLupaAbsen: Number(r.potonganLupaAbsen || 0),
      workingHoursPerDay: Number(r.workingHoursPerDay || 8),
    }));
  }

  async createUser(dto: any): Promise<User> {
    const existing = await this.db.queryOne(`SELECT id FROM users WHERE username = $1`, [dto.username.trim().toLowerCase()]);
    if (existing) {
      throw new BadRequestException('Username is already taken');
    }

    const hashedPassword = await bcrypt.hash(dto.password || 'password123', 10);
    const photoKey = dto.image || dto.avatarUrl || null;

    const row = await this.db.queryOne<any>(
      `INSERT INTO users (
        username, password_hash, full_name, phone_number, role, division,
        security_rank, working_hours_per_day, gaji_pokok, tunjangan,
        lembur_per_jam, potongan_bpjs, potongan_alpa, potongan_lupa_absen,
        photo_key, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, true)
      RETURNING id, username, full_name as "fullName", role, division, created_at as "createdAt"`,
      [
        dto.username.trim().toLowerCase(),
        hashedPassword,
        dto.fullName || dto.namaAnggota || dto.nama,
        dto.phone || null,
        dto.role || dto.posisi || 'PETUGAS',
        dto.division || 'Security',
        dto.securityRank || dto.jabatan || 'ANGGOTA',
        dto.workingHoursPerDay || dto.jamKerja || 8,
        dto.gajiPokok || 3000000,
        dto.tunjangan || 500000,
        dto.lemburPerJam || 25000,
        dto.potonganBpjs || 150000,
        dto.potonganAlpa || 100000,
        dto.potonganLupaAbsen || 50000,
        photoKey,
      ],
    );

    const siteId = dto.siteId || dto.lokasiSiteAnggota;
    if (siteId) {
      await this.db.query(
        `INSERT INTO user_site_assignments (user_id, site_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [row.id, siteId],
      );
    }

    return this.getProfile(row.id);
  }

  async updatePassword(userId: string, newPassword: string): Promise<boolean> {
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.db.query(`UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, [hashed, userId]);
    return true;
  }

  async updatePhoto(userId: string, photoKey: string): Promise<boolean> {
    await this.db.query(`UPDATE users SET photo_key = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, [photoKey, userId]);
    return true;
  }

  async bulkImportPersonil(items: any[]): Promise<{ importedCount: number; errors: string[] }> {
    let importedCount = 0;
    const errors: string[] = [];

    const sites = await this.db.query<any>(`SELECT id, name FROM sites WHERE is_active = true`);
    const siteMap = new Map<string, string>();
    for (const s of sites) {
      siteMap.set(s.name.trim().toLowerCase(), s.id);
      siteMap.set(s.id, s.id);
    }
    const defaultSiteId = sites.length > 0 ? sites[0].id : null;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        const username = (item.username || `user_${Date.now()}_${i}`).trim().toLowerCase();
        const existing = await this.db.queryOne(`SELECT id FROM users WHERE username = $1`, [username]);
        if (existing) {
          errors.push(`Row ${i + 1}: Username "${username}" already exists`);
          continue;
        }

        const hashedPassword = await bcrypt.hash(item.password || 'password123', 10);
        const row = await this.db.queryOne<any>(
          `INSERT INTO users (
            username, password_hash, full_name, role, division,
            security_rank, working_hours_per_day, gaji_pokok, tunjangan,
            lembur_per_jam, potongan_bpjs, potongan_alpa, potongan_lupa_absen, is_active
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true)
          RETURNING id`,
          [
            username,
            hashedPassword,
            item.nama || item.fullName || 'Petugas Lapangan',
            item.posisi || item.role || 'PETUGAS',
            item.division || 'Security',
            item.jabatan || item.securityRank || 'ANGGOTA',
            item.jamKerja || 8,
            item.gajiPokok || 3000000,
            item.tunjangan || 500000,
            item.lemburPerJam || 25000,
            item.potonganBpjs || 150000,
            item.potonganAlpa || 100000,
            item.potonganLupaAbsen || 50000,
          ],
        );

        const siteId = (item.siteCodeOrName && siteMap.get(item.siteCodeOrName.trim().toLowerCase())) || defaultSiteId;
        if (siteId) {
          await this.db.query(
            `INSERT INTO user_site_assignments (user_id, site_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [row.id, siteId],
          );
        }
        importedCount++;
      } catch (err: any) {
        errors.push(`Row ${i + 1}: ${err.message}`);
      }
    }

    return { importedCount, errors };
  }

  getPersonilTemplate(): string {
    return 'nama,username,password,posisi,jabatan,jamKerja,gajiPokok,tunjangan,siteCodeOrName\n' +
      'Budi Satpam,satpambudi,satpam123,Security,Anggota,8,3500000,500000,Site Proyek Demo\n' +
      'Siti Cleaning,siticlean,clean123,Cleaning Service,Anggota,8,3000000,400000,Site Proyek Demo';
  }
}
