import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { EventsGateway } from '../gateway/events.gateway';
import { saveBase64Image } from '../../common/utils/file-upload.util';
import { CreateStaffActivityDto, StaffActivityItem } from '@patrol/types';

export const STANDARD_STAFF_CATEGORIES = [
  'Administrasi & Pelaporan',
  'Meeting & Koordinasi',
  'Dokumentasi & Arsip',
  'Penginputan Data Operasional',
  'Koordinasi Lapangan / Site',
  'Pemeliharaan Aset & Fasilitas',
  'Pelatihan & Evaluasi Tim',
  'Kegiatan Operasional Lainnya',
];

@Injectable()
export class StaffService {
  constructor(
    private db: DatabaseService,
    private eventsGateway: EventsGateway,
  ) {}

  getCategories(): string[] {
    return STANDARD_STAFF_CATEGORIES;
  }

  async createActivity(userId: string, data: CreateStaffActivityDto): Promise<StaffActivityItem> {
    if (!data.siteId || !data.activityType || !data.description) {
      throw new BadRequestException('siteId, activityType, and description are required');
    }

    const site = await this.db.queryOne<any>('SELECT id, name FROM sites WHERE id = $1', [data.siteId]);
    if (!site) {
      throw new NotFoundException(`Site with ID ${data.siteId} not found`);
    }

    const user = await this.db.queryOne<any>('SELECT id, full_name, username FROM users WHERE id = $1', [userId]);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const savedPhotoKey = data.photoBase64 ? saveBase64Image(data.photoBase64, 'staff', userId) : null;
    const createdAt = data.deviceTimestamp ? new Date(data.deviceTimestamp) : new Date();

    const row = await this.db.queryOne<any>(
      `
      INSERT INTO staff_activity_logs (
        site_id, user_id, activity_type, description, status, photo_key, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING 
        id, site_id AS "siteId", user_id AS "userId",
        activity_type AS "activityType", description, status,
        photo_key AS "photoKey", created_at AS "createdAt"
    `,
      [
        data.siteId,
        userId,
        data.activityType,
        data.description,
        data.status || 'COMPLETED',
        savedPhotoKey,
        createdAt,
      ],
    );

    const result: StaffActivityItem = {
      id: row.id,
      siteId: site.id,
      siteName: site.name,
      userId: user.id,
      staffName: user.full_name,
      activityType: row.activityType,
      description: row.description,
      status: row.status,
      createdAt: row.createdAt.toISOString ? row.createdAt.toISOString() : String(row.createdAt),
      formattedDate: new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(new Date(row.createdAt)),
      formattedTime: new Intl.DateTimeFormat('id-ID', { timeStyle: 'medium' }).format(new Date(row.createdAt)) + ' WIB',
    };

    // Broadcast event to Web Admin
    this.eventsGateway.server?.to(`site_${data.siteId}`).emit('staff:activity_created', result);

    return result;
  }

  async getActivities(query: { siteId?: string; limit?: number; search?: string }): Promise<StaffActivityItem[]> {
    let sql = `
      SELECT 
        sal.id,
        sal.site_id AS "siteId",
        s.name AS "siteName",
        sal.user_id AS "userId",
        u.full_name AS "staffName",
        sal.activity_type AS "activityType",
        sal.description,
        sal.status,
        sal.created_at AS "createdAt"
      FROM staff_activity_logs sal
      JOIN users u ON sal.user_id = u.id
      JOIN sites s ON sal.site_id = s.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let idx = 1;

    if (query.siteId) {
      sql += ` AND sal.site_id = $${idx++}`;
      params.push(query.siteId);
    }

    if (query.search) {
      sql += ` AND (u.full_name ILIKE $${idx} OR sal.activity_type ILIKE $${idx} OR sal.description ILIKE $${idx})`;
      params.push(`%${query.search}%`);
      idx++;
    }

    const limit = Math.min(query.limit || 50, 100);
    sql += ` ORDER BY sal.created_at DESC LIMIT $${idx}`;
    params.push(limit);

    const rows = await this.db.query<any>(sql, params);

    return rows.map((r) => ({
      id: r.id,
      siteId: r.siteId,
      siteName: r.siteName,
      userId: r.userId,
      staffName: r.staffName,
      activityType: r.activityType,
      description: r.description,
      status: r.status,
      createdAt: r.createdAt.toISOString ? r.createdAt.toISOString() : String(r.createdAt),
      formattedDate: new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(new Date(r.createdAt)),
      formattedTime: new Intl.DateTimeFormat('id-ID', { timeStyle: 'medium' }).format(new Date(r.createdAt)) + ' WIB',
    }));
  }
}

