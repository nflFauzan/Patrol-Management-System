import { Injectable, Optional } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { EventsGateway } from '../gateway/events.gateway';
import { BroadcastMessage } from '@patrol/types';

@Injectable()
export class BroadcastService {
  constructor(
    private db: DatabaseService,
    @Optional() private eventsGateway?: EventsGateway,
  ) {}

  async getAll(siteId?: string): Promise<BroadcastMessage[]> {
    let sql = `
      SELECT 
        bm.id, bm.site_id as "siteId", s.name as "siteName",
        bm.title, bm.message as "content", bm.priority,
        bm.created_at as "createdAt",
        u.full_name as "senderName", bm.sender_id as "senderId"
      FROM broadcast_messages bm
      LEFT JOIN sites s ON bm.site_id = s.id
      JOIN users u ON bm.sender_id = u.id
    `;
    const params: any[] = [];
    if (siteId) {
      sql += ` WHERE bm.site_id = $1 OR bm.site_id IS NULL`;
      params.push(siteId);
    }
    sql += ` ORDER BY bm.created_at DESC LIMIT 50`;
    const rows = await this.db.query(sql, params);
    return rows.map((r) => ({
      id: r.id,
      siteId: r.siteId,
      content: r.content,
      senderId: r.senderId,
      senderName: r.senderName,
      isActive: true,
      createdAt: r.createdAt,
      updatedAt: r.createdAt,
    }));
  }

  async create(senderId: string, senderName: string, dto: { siteId?: string; content: string; title?: string }): Promise<BroadcastMessage> {
    const sql = `
      INSERT INTO broadcast_messages (site_id, sender_id, title, message, priority)
      VALUES ($1, $2, $3, $4, 'NORMAL')
      RETURNING id, site_id as "siteId", title, message as "content", created_at as "createdAt"
    `;
    const row = await this.db.queryOne<any>(sql, [
      dto.siteId || null,
      senderId,
      dto.title || 'Pengumuman / Pesan Siaran',
      dto.content,
    ]);

    const result: BroadcastMessage = {
      id: row.id,
      siteId: row.siteId,
      content: row.content,
      senderId,
      senderName,
      isActive: true,
      createdAt: row.createdAt,
      updatedAt: row.createdAt,
    };

    if (this.eventsGateway) {
      this.eventsGateway.broadcastAnnouncement(dto.siteId || null, result);
    }

    return result;
  }
}
