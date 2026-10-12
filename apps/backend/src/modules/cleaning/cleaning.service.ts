import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { EventsGateway } from '../gateway/events.gateway';

export interface SubmitCleaningChecklistDto {
  siteId: string;
  checkpointId?: string;
  qrPayload?: string;
  floorCleaned: boolean;
  trashEmptied: boolean;
  suppliesRestocked: boolean;
  odorNormal: boolean;
  notes?: string;
  photoKey?: string;
}

@Injectable()
export class CleaningService {
  constructor(
    private db: DatabaseService,
    private eventsGateway: EventsGateway,
  ) {}

  async submitChecklist(officerId: string, data: SubmitCleaningChecklistDto) {
    let checkpointQuery = `
      SELECT id, site_id, name, qr_code_token, category, location_detail, task_description
      FROM checkpoints 
      WHERE is_active = true
    `;
    const checkpointParams: any[] = [];

    if (data.checkpointId) {
      checkpointQuery += ` AND id = $1`;
      checkpointParams.push(data.checkpointId);
    } else if (data.qrPayload) {
      checkpointQuery += ` AND qr_code_token = $1`;
      checkpointParams.push(data.qrPayload);
    } else {
      throw new BadRequestException('Either checkpointId or qrPayload must be provided');
    }

    const cp = await this.db.queryOne<any>(checkpointQuery, checkpointParams);

    if (!cp) {
      throw new NotFoundException('Checkpoint sanitasi tidak ditemukan');
    }

    const row = await this.db.queryOne<any>(
      `
      INSERT INTO cleaning_checklists (
        site_id, checkpoint_id, officer_id,
        floor_cleaned, trash_emptied, supplies_restocked, odor_normal,
        notes, photo_key
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING 
        id, site_id AS "siteId", checkpoint_id AS "checkpointId", officer_id AS "officerId",
        floor_cleaned AS "floorCleaned", trash_emptied AS "trashEmptied",
        supplies_restocked AS "suppliesRestocked", odor_normal AS "odorNormal",
        notes, photo_key AS "photoKey",
        inspected_at AS "inspectedAt"
    `,
      [
        cp.site_id,
        cp.id,
        officerId,
        data.floorCleaned ?? true,
        data.trashEmptied ?? true,
        data.suppliesRestocked ?? true,
        data.odorNormal ?? true,
        data.notes || null,
        data.photoKey || null,
      ],
    );

    const officer = await this.db.queryOne<any>(
      `SELECT full_name, username FROM users WHERE id = $1`,
      [officerId],
    );

    // Broadcast cleaning activity to Web Admin
    this.eventsGateway.server?.to(`site_${cp.site_id}`).emit('cleaning:submitted', {
      ...row,
      checkpointName: cp.name,
      locationDetail: cp.location_detail,
      officerName: officer?.full_name || 'Petugas Kebersihan',
    });

    return {
      ...row,
      checkpointName: cp.name,
      locationDetail: cp.location_detail,
      officerName: officer?.full_name || 'Petugas Kebersihan',
    };
  }

  async getChecklists(siteId?: string, limit = 50) {
    let sql = `
      SELECT 
        cc.id,
        cc.site_id AS "siteId",
        cc.checkpoint_id AS "checkpointId",
        cc.officer_id AS "officerId",
        cc.floor_cleaned AS "floorCleaned",
        cc.trash_emptied AS "trashEmptied",
        cc.supplies_restocked AS "suppliesRestocked",
        cc.odor_normal AS "odorNormal",
        cc.notes,
        cc.photo_key AS "photoKey",
        cc.inspected_at AS "inspectedAt",
        u.full_name AS "officerName",
        c.name AS "checkpointName",
        c.location_detail AS "locationDetail",
        s.name AS "siteName"
      FROM cleaning_checklists cc
      JOIN users u ON cc.officer_id = u.id
      JOIN checkpoints c ON cc.checkpoint_id = c.id
      JOIN sites s ON cc.site_id = s.id
    `;
    const params: any[] = [];

    if (siteId) {
      sql += ` WHERE cc.site_id = $1`;
      params.push(siteId);
    }

    sql += ` ORDER BY cc.inspected_at DESC LIMIT ${Math.min(limit, 100)}`;

    return this.db.query(sql, params);
  }
}
