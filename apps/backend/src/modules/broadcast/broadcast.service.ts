import { Injectable, Optional, NotFoundException } from '@nestjs/common';
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
        COALESCE(u.full_name, 'Command Center Admin') as "senderName", bm.sender_id as "senderId"
      FROM broadcast_messages bm
      LEFT JOIN sites s ON bm.site_id = s.id
      LEFT JOIN users u ON bm.sender_id = u.id
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
      siteName: r.siteName || 'Semua Area / Korporat',
      title: r.title,
      content: r.content,
      message: r.content,
      priority: r.priority || 'NORMAL',
      senderId: r.senderId,
      senderName: r.senderName,
      isActive: true,
      createdAt: r.createdAt,
      updatedAt: r.createdAt,
    }));
  }

  async getById(id: string): Promise<BroadcastMessage> {
    const sql = `
      SELECT 
        bm.id, bm.site_id as "siteId", s.name as "siteName",
        bm.title, bm.message as "content", bm.priority,
        bm.created_at as "createdAt",
        COALESCE(u.full_name, 'Command Center Admin') as "senderName", bm.sender_id as "senderId"
      FROM broadcast_messages bm
      LEFT JOIN sites s ON bm.site_id = s.id
      LEFT JOIN users u ON bm.sender_id = u.id
      WHERE bm.id = $1
    `;
    const row = await this.db.queryOne<any>(sql, [id]);
    if (!row) {
      throw new NotFoundException(`Pesan siaran dengan ID ${id} tidak ditemukan`);
    }
    return {
      id: row.id,
      siteId: row.siteId,
      siteName: row.siteName || 'Semua Area / Korporat',
      title: row.title,
      content: row.content,
      message: row.content,
      priority: row.priority || 'NORMAL',
      senderId: row.senderId,
      senderName: row.senderName,
      isActive: true,
      createdAt: row.createdAt,
      updatedAt: row.createdAt,
    };
  }

  async create(
    senderId: string,
    senderName: string,
    dto: { siteId?: string | null; content: string; title?: string; priority?: string },
  ): Promise<BroadcastMessage> {
    const sql = `
      INSERT INTO broadcast_messages (site_id, sender_id, title, message, priority)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, site_id as "siteId", title, message as "content", priority, created_at as "createdAt"
    `;
    const row = await this.db.queryOne<any>(sql, [
      dto.siteId || null,
      senderId,
      dto.title || 'Pengumuman / Pesan Siaran',
      dto.content,
      dto.priority || 'NORMAL',
    ]);

    let siteName = 'Semua Area / Korporat';
    if (row.siteId) {
      const site = await this.db.queryOne<any>('SELECT name FROM sites WHERE id = $1', [row.siteId]);
      if (site) siteName = site.name;
    }

    const result: BroadcastMessage = {
      id: row.id,
      siteId: row.siteId,
      siteName,
      title: row.title,
      content: row.content,
      message: row.content,
      priority: row.priority,
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

  async update(
    id: string,
    dto: { siteId?: string | null; content?: string; title?: string; priority?: string },
  ): Promise<BroadcastMessage> {
    const existing = await this.getById(id);

    const sql = `
      UPDATE broadcast_messages
      SET 
        message = COALESCE($1, message),
        site_id = $2,
        title = COALESCE($3, title),
        priority = COALESCE($4, priority)
      WHERE id = $5
      RETURNING id, site_id as "siteId", title, message as "content", priority, created_at as "createdAt"
    `;
    const row = await this.db.queryOne<any>(sql, [
      dto.content !== undefined ? dto.content : null,
      dto.siteId !== undefined ? (dto.siteId || null) : existing.siteId,
      dto.title !== undefined ? dto.title : null,
      dto.priority !== undefined ? dto.priority : null,
      id,
    ]);

    let siteName = 'Semua Area / Korporat';
    if (row.siteId) {
      const site = await this.db.queryOne<any>('SELECT name FROM sites WHERE id = $1', [row.siteId]);
      if (site) siteName = site.name;
    }

    const result: BroadcastMessage = {
      id: row.id,
      siteId: row.siteId,
      siteName,
      title: row.title,
      content: row.content,
      message: row.content,
      priority: row.priority,
      senderId: existing.senderId,
      senderName: existing.senderName,
      isActive: true,
      createdAt: row.createdAt,
      updatedAt: new Date().toISOString(),
    };

    if (this.eventsGateway) {
      this.eventsGateway.broadcastAnnouncementUpdated(row.siteId || null, result);
    }

    return result;
  }

  async delete(id: string): Promise<{ success: boolean; id: string }> {
    const existing = await this.getById(id);
    await this.db.query('DELETE FROM broadcast_messages WHERE id = $1', [id]);

    if (this.eventsGateway) {
      this.eventsGateway.broadcastAnnouncementDeleted(existing.siteId || null, { id });
    }

    return { success: true, id };
  }
}
