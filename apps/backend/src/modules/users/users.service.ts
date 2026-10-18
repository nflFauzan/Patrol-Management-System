import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { User, UserRole, Division, SecurityRank } from '@patrol/types';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { VerifyDeleteDto } from './dto/verify-delete.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private db: DatabaseService) {}

  private mapUser(row: any): User {
    return {
      id: row.id,
      username: row.username,
      email: row.email || `${row.username}@patrol.local`,
      fullName: row.full_name || row.fullName || '',
      phone: row.phone_number || row.phone || '',
      role: row.role as UserRole,
      division: row.division as Division,
      securityRank: (row.security_rank || row.securityRank || null) as SecurityRank | null,
      siteId: row.site_id || row.siteId || null,
      multiSiteIds: row.multi_site_ids || (row.site_id ? [row.site_id] : []),
      workingHoursPerDay: Number(row.working_hours_per_day || 8),
      gajiPokok: Number(row.gaji_pokok || 0),
      tunjangan: Number(row.tunjangan || 0),
      lemburPerJam: Number(row.lembur_per_jam || 0),
      potonganBpjs: Number(row.potongan_bpjs || 0),
      potonganAlpa: Number(row.potongan_alpa || 0),
      potonganLupaAbsen: Number(row.potongan_lupa_absen || 0),
      isActive: row.is_active ?? true,
      avatarUrl: row.photo_key || row.avatarUrl || null,
      lastLoginAt: row.last_login_at || null,
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString(),
    };
  }

  async findAll(query?: { siteId?: string; division?: string; search?: string }): Promise<User[]> {
    let sql = `
      SELECT 
        u.id, u.username, u.full_name, u.phone_number, u.role, u.division,
        u.security_rank, u.working_hours_per_day, u.gaji_pokok, u.tunjangan,
        u.lembur_per_jam, u.potongan_bpjs, u.potongan_alpa, u.potongan_lupa_absen,
        u.photo_key, u.is_active, u.created_at, u.updated_at,
        usa.site_id,
        ARRAY_AGG(usa_all.site_id) FILTER (WHERE usa_all.site_id IS NOT NULL) AS multi_site_ids
      FROM users u
      LEFT JOIN user_site_assignments usa ON u.id = usa.user_id
      LEFT JOIN user_site_assignments usa_all ON u.id = usa_all.user_id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (query?.siteId && query.siteId !== '__SEMUA__') {
      sql += ` AND usa.site_id = $${paramIndex++}`;
      params.push(query.siteId);
    }

    if (query?.division && query.division !== '__SEMUA__') {
      sql += ` AND LOWER(u.division) = LOWER($${paramIndex++})`;
      params.push(query.division);
    }

    if (query?.search) {
      sql += ` AND (LOWER(u.full_name) LIKE $${paramIndex} OR LOWER(u.username) LIKE $${paramIndex})`;
      params.push(`%${query.search.toLowerCase()}%`);
      paramIndex++;
    }

    sql += `
      GROUP BY u.id, usa.site_id
      ORDER BY u.created_at DESC
    `;

    const rows = await this.db.query<any>(sql, params);
    return rows.map((r) => this.mapUser(r));
  }

  async findById(id: string): Promise<User> {
    const row = await this.db.queryOne<any>(
      `
      SELECT 
        u.id, u.username, u.full_name, u.phone_number, u.role, u.division,
        u.security_rank, u.working_hours_per_day, u.gaji_pokok, u.tunjangan,
        u.lembur_per_jam, u.potongan_bpjs, u.potongan_alpa, u.potongan_lupa_absen,
        u.photo_key, u.is_active, u.created_at, u.updated_at,
        usa.site_id,
        ARRAY_AGG(usa_all.site_id) FILTER (WHERE usa_all.site_id IS NOT NULL) AS multi_site_ids
      FROM users u
      LEFT JOIN user_site_assignments usa ON u.id = usa.user_id
      LEFT JOIN user_site_assignments usa_all ON u.id = usa_all.user_id
      WHERE u.id = $1
      GROUP BY u.id, usa.site_id
    `,
      [id],
    );

    if (!row) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.mapUser(row);
  }

  async create(dto: CreateUserDto): Promise<User> {
    // Check duplicate username
    const existing = await this.db.queryOne<any>(
      `SELECT id FROM users WHERE LOWER(username) = LOWER($1)`,
      [dto.username.trim()],
    );

    if (existing) {
      throw new BadRequestException(`Username "${dto.username}" is already taken`);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const photoKey = dto.avatarUrl || null;

    const row = await this.db.queryOne<any>(
      `
      INSERT INTO users (
        username, password_hash, full_name, phone_number, role, division,
        security_rank, working_hours_per_day, gaji_pokok, tunjangan,
        lembur_per_jam, potongan_bpjs, potongan_alpa, potongan_lupa_absen,
        photo_key, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING 
        id, username, full_name, phone_number, role, division,
        security_rank, working_hours_per_day, gaji_pokok, tunjangan,
        lembur_per_jam, potongan_bpjs, potongan_alpa, potongan_lupa_absen,
        photo_key, is_active, created_at, updated_at
    `,
      [
        dto.username.trim().toLowerCase(),
        hashedPassword,
        dto.fullName.trim(),
        dto.phone || null,
        dto.role,
        dto.division,
        dto.securityRank || 'ANGGOTA',
        dto.workingHoursPerDay || 8,
        dto.gajiPokok || 0,
        dto.tunjangan || 0,
        dto.lemburPerJam || 0,
        dto.potonganBpjs || 0,
        dto.potonganAlpa || 0,
        dto.potonganLupaAbsen || 0,
        photoKey,
        dto.isActive ?? true,
      ],
    );

    // Save site assignments
    if (dto.siteId) {
      await this.db.query(
        `INSERT INTO user_site_assignments (user_id, site_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [row.id, dto.siteId],
      );
    }

    if (dto.multiSiteIds && dto.multiSiteIds.length > 0) {
      for (const sId of dto.multiSiteIds) {
        if (sId !== dto.siteId) {
          await this.db.query(
            `INSERT INTO user_site_assignments (user_id, site_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [row.id, sId],
          );
        }
      }
    }

    return this.mapUser({
      ...row,
      site_id: dto.siteId,
      multi_site_ids: dto.multiSiteIds || (dto.siteId ? [dto.siteId] : []),
    });
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const existing = await this.db.queryOne<any>(`SELECT id FROM users WHERE id = $1`, [id]);
    if (!existing) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updates: string[] = [];
    const params: any[] = [];
    let pIdx = 1;

    if (dto.fullName !== undefined) {
      updates.push(`full_name = $${pIdx++}`);
      params.push(dto.fullName.trim());
    }
    if (dto.phone !== undefined) {
      updates.push(`phone_number = $${pIdx++}`);
      params.push(dto.phone);
    }
    if (dto.role !== undefined) {
      updates.push(`role = $${pIdx++}`);
      params.push(dto.role);
    }
    if (dto.division !== undefined) {
      updates.push(`division = $${pIdx++}`);
      params.push(dto.division);
    }
    if (dto.securityRank !== undefined) {
      updates.push(`security_rank = $${pIdx++}`);
      params.push(dto.securityRank);
    }
    if (dto.workingHoursPerDay !== undefined) {
      updates.push(`working_hours_per_day = $${pIdx++}`);
      params.push(dto.workingHoursPerDay);
    }
    if (dto.gajiPokok !== undefined) {
      updates.push(`gaji_pokok = $${pIdx++}`);
      params.push(dto.gajiPokok);
    }
    if (dto.tunjangan !== undefined) {
      updates.push(`tunjangan = $${pIdx++}`);
      params.push(dto.tunjangan);
    }
    if (dto.lemburPerJam !== undefined) {
      updates.push(`lembur_per_jam = $${pIdx++}`);
      params.push(dto.lemburPerJam);
    }
    if (dto.potonganBpjs !== undefined) {
      updates.push(`potongan_bpjs = $${pIdx++}`);
      params.push(dto.potonganBpjs);
    }
    if (dto.potonganAlpa !== undefined) {
      updates.push(`potongan_alpa = $${pIdx++}`);
      params.push(dto.potonganAlpa);
    }
    if (dto.potonganLupaAbsen !== undefined) {
      updates.push(`potongan_lupa_absen = $${pIdx++}`);
      params.push(dto.potonganLupaAbsen);
    }
    if (dto.isActive !== undefined) {
      updates.push(`is_active = $${pIdx++}`);
      params.push(dto.isActive);
    }
    if (dto.avatarUrl !== undefined) {
      updates.push(`photo_key = $${pIdx++}`);
      params.push(dto.avatarUrl);
    }
    if (dto.password) {
      const hashed = await bcrypt.hash(dto.password, 10);
      updates.push(`password_hash = $${pIdx++}`);
      params.push(hashed);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    params.push(id);
    const sql = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${pIdx}
      RETURNING 
        id, username, full_name, phone_number, role, division,
        security_rank, working_hours_per_day, gaji_pokok, tunjangan,
        lembur_per_jam, potongan_bpjs, potongan_alpa, potongan_lupa_absen,
        photo_key, is_active, created_at, updated_at
    `;

    const row = await this.db.queryOne<any>(sql, params);

    // Update site assignment if given
    if (dto.siteId !== undefined) {
      await this.db.query(`DELETE FROM user_site_assignments WHERE user_id = $1`, [id]);
      if (dto.siteId) {
        await this.db.query(
          `INSERT INTO user_site_assignments (user_id, site_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [id, dto.siteId],
        );
      }
      if (dto.multiSiteIds && dto.multiSiteIds.length > 0) {
        for (const sId of dto.multiSiteIds) {
          if (sId !== dto.siteId) {
            await this.db.query(
              `INSERT INTO user_site_assignments (user_id, site_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
              [id, sId],
            );
          }
        }
      }
    }

    return this.mapUser(row);
  }

  async verifyAndDeleteUser(dto: VerifyDeleteDto): Promise<{ success: boolean; message: string }> {
    // 1. Fetch admin user and verify password
    const admin = await this.db.queryOne<any>(
      `SELECT id, username, password_hash, role FROM users WHERE id = $1`,
      [dto.adminId],
    );

    if (!admin) {
      throw new UnauthorizedException('Admin pengeksekusi tidak ditemukan');
    }

    const isMatch = await bcrypt.compare(dto.passwordConfirm, admin.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Password verifikasi admin salah');
    }

    // 2. Verify target user exists
    const target = await this.db.queryOne<any>(
      `SELECT id, full_name FROM users WHERE id = $1`,
      [dto.targetUserId],
    );

    if (!target) {
      throw new NotFoundException(`Personil yang hendak dihapus tidak ditemukan`);
    }

    // 3. Delete target user (cascades to user_site_assignments)
    await this.db.query(`DELETE FROM user_site_assignments WHERE user_id = $1`, [dto.targetUserId]);
    await this.db.query(`DELETE FROM users WHERE id = $1`, [dto.targetUserId]);

    this.logger.log(`User ${dto.targetUserId} (${target.full_name}) successfully deleted by admin ${dto.adminId}`);

    return {
      success: true,
      message: `Personil ${target.full_name} berhasil dihapus dari sistem`,
    };
  }

  async getIdCardBatch(query?: { siteId?: string; division?: string; securityRank?: string }) {
    const users = await this.findAll({
      siteId: query?.siteId,
      division: query?.division,
    });

    return users.map((u) => ({
      id: u.id,
      fullName: u.fullName,
      username: u.username,
      division: u.division,
      securityRank: u.securityRank,
      role: u.role,
      avatarUrl: u.avatarUrl,
      siteId: u.siteId,
      qrToken: `USER-${u.id.substring(0, 8).toUpperCase()}`,
    }));
  }
}
