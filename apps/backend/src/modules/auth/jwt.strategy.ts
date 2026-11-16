import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../database/database.service';
import { User } from '@patrol/types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private db: DatabaseService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_ACCESS_SECRET') ||
        configService.get<string>('JWT_SECRET') ||
        'super_secret_patrol_access_jwt_key_2026_xyz!',
    });
  }

  async validate(payload: { sub: string; username: string; role: string }): Promise<User> {
    const userRow = await this.db.queryOne<any>(
      `SELECT id, username, email, full_name as "fullName", phone_number as "phone", 
              role, division, security_rank as "securityRank", 
              is_active, is_approved, rejection_reason, 
              photo_key as "avatarUrl", created_at, updated_at
       FROM users WHERE id = $1`,
      [payload.sub],
    );

    if (!userRow) {
      throw new UnauthorizedException('User account no longer active or exists');
    }

    const isActive = userRow.is_active !== undefined ? userRow.is_active : userRow.isActive;
    const isApproved = userRow.is_approved !== undefined ? userRow.is_approved : userRow.isApproved;
    const rejectionReason = userRow.rejection_reason || userRow.rejectionReason;

    if (rejectionReason) {
      throw new UnauthorizedException('Akun ditolak atau dinonaktifkan');
    }

    if (isApproved === false || !isActive) {
      throw new UnauthorizedException('Akun Anda belum disetujui atau dinonaktifkan');
    }

    // Resolve active permissions from user_roles -> role_permissions -> permissions
    const permRows = await this.db.query<{ code: string }>(
      `SELECT DISTINCT p.code
       FROM user_roles ur
       JOIN role_permissions rp ON rp.role_id = ur.role_id
       JOIN permissions p ON p.id = rp.permission_id
       WHERE ur.user_id = $1`,
      [userRow.id],
    );

    const permissions: string[] = (permRows || []).map((r) => r.code);

    const user: User = {
      id: userRow.id,
      username: userRow.username,
      email: userRow.email || `${userRow.username}@mahakarya-ops.co.id`,
      fullName: userRow.fullName || userRow.full_name,
      phone: userRow.phone || userRow.phone_number || '',
      role: userRow.role,
      division: userRow.division,
      securityRank: userRow.securityRank || userRow.security_rank || null,
      siteId: userRow.siteId || userRow.site_id || null,
      isActive: true,
      isApproved: true,
      permissions,
      createdAt: userRow.createdAt || userRow.created_at,
      updatedAt: userRow.updatedAt || userRow.updated_at,
    };

    return user;
  }
}
