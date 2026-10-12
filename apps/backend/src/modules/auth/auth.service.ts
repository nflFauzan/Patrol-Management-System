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
}
