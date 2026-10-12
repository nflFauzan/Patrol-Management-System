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
      secretOrKey: configService.get<string>('JWT_SECRET', 'super_secret_jwt_key_patrol_2026'),
    });
  }

  async validate(payload: { sub: string; username: string; role: string }): Promise<User> {
    const user = await this.db.queryOne<User>(
      `SELECT id, username, email, full_name as "fullName", phone, role, division, site_id as "siteId", is_active as "isActive", avatar_url as "avatarUrl", created_at as "createdAt", updated_at as "updatedAt"
       FROM users WHERE id = $1 AND is_active = true`,
      [payload.sub],
    );

    if (!user) {
      throw new UnauthorizedException('User account no longer active or exists');
    }

    return user;
  }
}
