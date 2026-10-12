import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { EventsGateway } from '../gateway/events.gateway';

export interface RecordScanDto {
  siteId: string;
  checkpointId?: string;
  qrPayload?: string;
  latitude: number;
  longitude: number;
  statusResult?: string; // 'Situasi Aman Terkendali' | 'Perlu Tindak Lanjut'
  notes?: string;
  photoKey?: string;
}

@Injectable()
export class PatrolService {
  constructor(
    private db: DatabaseService,
    private eventsGateway: EventsGateway,
  ) {}

  async getLogs(siteId?: string, limit = 50) {
    let sql = `
      SELECT 
        p.id, 
        p.site_id AS "siteId", 
        p.checkpoint_id AS "checkpointId", 
        p.user_id AS "userId",
        p.scanned_at AS "scannedAt",
        ST_Y(p.coordinates::geometry) AS latitude,
        ST_X(p.coordinates::geometry) AS longitude,
        p.status_result AS "statusResult", 
        p.notes, 
        p.photo_key AS "photoKey",
        u.full_name AS "officerName", 
        u.username AS "officerUsername",
        c.name AS "checkpointName", 
        c.qr_code_token AS "checkpointCode",
        c.location_detail AS "locationDetail",
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

  async recordScan(userId: string, data: RecordScanDto) {
    // 1. Verify Checkpoint existence & QR payload
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
      throw new NotFoundException('Checkpoint not found or inactive');
    }

    // If QR payload provided, verify match
    if (data.qrPayload && cp.qr_code_token !== data.qrPayload) {
      throw new BadRequestException('QR Code does not match this checkpoint');
    }

    // 2. PostGIS proximity verification against the site
    const proximity = await this.db.checkCheckpointProximity(cp.id, data.latitude, data.longitude);

    // 3. Insert patrol log
    const statusResult = data.statusResult || 'Situasi Aman Terkendali';
    const row = await this.db.queryOne<any>(
      `
      INSERT INTO patrol_logs (
        site_id, checkpoint_id, user_id, coordinates, status_result, notes, photo_key
      )
      VALUES (
        $1, $2, $3,
        ST_SetSRID(ST_MakePoint($5, $4), 4326),
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
        cp.site_id,
        cp.id,
        userId,
        data.latitude,
        data.longitude,
        statusResult,
        data.notes || null,
        data.photoKey || null,
      ],
    );

    // 4. Incident Ticket Auto-Generation if 'Perlu Tindak Lanjut'
    let incidentTicket: any = null;
    if (statusResult === 'Perlu Tindak Lanjut') {
      incidentTicket = await this.db.queryOne<any>(
        `
        INSERT INTO incident_tickets (
          site_id, patrol_log_id, ticket_status, reported_by, resolution_notes
        )
        VALUES ($1, $2, 'OPEN', $3, $4)
        RETURNING id, ticket_status AS "ticketStatus", created_at AS "createdAt"
      `,
        [
          cp.site_id,
          row.id,
          userId,
          data.notes || 'Temuan kejanggalan pada pos patroli',
        ],
      );
    }

    // 5. Broadcast real-time event to Web Admin
    const user = await this.db.queryOne<any>(
      `SELECT full_name, username, division FROM users WHERE id = $1`,
      [userId],
    );

    this.eventsGateway.broadcastPatrolScan(cp.site_id, {
      id: row.id,
      checkpointId: cp.id,
      checkpointName: cp.name,
      locationDetail: cp.location_detail,
      officerId: userId,
      officerName: user?.full_name || 'Petugas Satpam',
      division: user?.division || 'Security',
      latitude: data.latitude,
      longitude: data.longitude,
      distanceMeters: proximity.distanceMeters,
      isWithinGeofence: proximity.isWithin,
      statusResult: statusResult,
      isIncident: statusResult === 'Perlu Tindak Lanjut',
      incidentTicketId: incidentTicket?.id || null,
      scannedAt: row.scannedAt,
    });

    return {
      ...row,
      checkpointName: cp.name,
      locationDetail: cp.location_detail,
      proximity,
      incidentTicket,
    };
  }

  async getIncidentTickets(siteId?: string) {
    let sql = `
      SELECT 
        it.id,
        it.site_id AS "siteId",
        it.patrol_log_id AS "patrolLogId",
        it.ticket_status AS "ticketStatus",
        it.resolution_notes AS "resolutionNotes",
        it.resolution_photo_key AS "resolutionPhotoKey",
        it.resolved_at AS "resolvedAt",
        it.created_at AS "createdAt",
        u.full_name AS "reporterName",
        c.name AS "checkpointName",
        c.location_detail AS "locationDetail",
        pl.notes AS "patrolNotes",
        pl.photo_key AS "patrolPhotoKey",
        ST_Y(pl.coordinates::geometry) AS latitude,
        ST_X(pl.coordinates::geometry) AS longitude
      FROM incident_tickets it
      JOIN patrol_logs pl ON it.patrol_log_id = pl.id
      JOIN checkpoints c ON pl.checkpoint_id = c.id
      JOIN users u ON it.reported_by = u.id
    `;
    const params: any[] = [];

    if (siteId) {
      sql += ` WHERE it.site_id = $1`;
      params.push(siteId);
    }

    sql += ` ORDER BY it.created_at DESC`;

    return this.db.query(sql, params);
  }

  async resolveIncidentTicket(ticketId: string, assignedToUserId: string, notes: string) {
    const row = await this.db.queryOne<any>(
      `
      UPDATE incident_tickets
      SET ticket_status = 'RESOLVED',
          assigned_to = $2,
          resolution_notes = $3,
          resolved_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `,
      [ticketId, assignedToUserId, notes],
    );

    if (!row) {
      throw new NotFoundException(`Incident Ticket with ID ${ticketId} not found`);
    }

    return row;
  }
}
