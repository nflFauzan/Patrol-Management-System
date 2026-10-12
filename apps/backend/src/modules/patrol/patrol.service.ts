import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class PatrolService {
  constructor(private db: DatabaseService) {}

  async getLogs(siteId?: string, limit = 50) {
    let sql = `
      SELECT 
        p.id, p.site_id AS "siteId", p.checkpoint_id AS "checkpointId", p.user_id AS "userId",
        p.scanned_at AS "scannedAt",
        ST_Y(p.coordinates::geometry) AS latitude,
        ST_X(p.coordinates::geometry) AS longitude,
        p.status_result AS "statusResult", p.notes, p.photo_key AS "photoKey",
        u.full_name AS "officerName", u.username AS "officerUsername",
        c.name AS "checkpointName", c.code AS "checkpointCode",
        s.name AS "siteName"
      FROM patrol_logs p
      JOIN users u ON p.user_id = u.id
      JOIN checkpoints c ON p.checkpoint_id = c.id
      JOIN sites s ON p.site_id = s.id
    `;
    const params: any[] = [];

    if (siteId) {
      sql += ` WHERE p.site_id = $1`;
      params.push(siteId);
    }

    sql += ` ORDER BY p.scanned_at DESC LIMIT ${Math.min(limit, 100)}`;

    return this.db.query(sql, params);
  }

  async recordScan(userId: string, data: {
    siteId: string;
    checkpointId: string;
    qrPayload: string;
    latitude: number;
    longitude: number;
    statusResult?: string;
    notes?: string;
    photoKey?: string;
  }) {
    // 1. Verify Checkpoint existence & QR payload
    const cp = await this.db.queryOne<any>(
      `SELECT id, name, qr_payload, allowed_distance_meters FROM checkpoints WHERE id = $1 AND site_id = $2`,
      [data.checkpointId, data.siteId],
    );

    if (!cp) {
      throw new NotFoundException('Checkpoint not found for this facility');
    }

    if (cp.qr_payload !== data.qrPayload) {
      throw new BadRequestException('QR Code does not match this checkpoint');
    }

    // 2. PostGIS proximity verification
    const proximity = await this.db.checkCheckpointProximity(data.checkpointId, data.latitude, data.longitude);

    // 3. Insert patrol log
    const row = await this.db.queryOne<any>(
      `
      INSERT INTO patrol_logs (
        site_id, checkpoint_id, user_id, coordinates, status_result, notes, photo_key
      )
      VALUES (
        $1, $2, $3,
        ST_SetSRID(ST_MakePoint($5, $4), 4326)::geography,
        $6, $7, $8
      )
      RETURNING 
        id, site_id AS "siteId", checkpoint_id AS "checkpointId", user_id AS "userId",
        scanned_at AS "scannedAt",
        ST_Y(coordinates::geometry) AS latitude,
        ST_X(coordinates::geometry) AS longitude,
        status_result AS "statusResult", notes, photo_key AS "photoKey"
    `,
      [
        data.siteId,
        data.checkpointId,
        userId,
        data.latitude,
        data.longitude,
        data.statusResult || 'Situasi Aman Terkendali',
        data.notes || null,
        data.photoKey || null,
      ],
    );

    return {
      ...row,
      proximity,
    };
  }
}
