import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { EventsGateway } from '../gateway/events.gateway';
import { saveBase64Image, normalizePhotoUrl } from '../../common/utils/file-upload.util';
import { 
  HourlyPatrolMatrixResponse, 
  HourlyPatrolMatrixRow, 
  Division,
  PatrolRecordsResponse,
  PatrolDetailResponse,
  PatrolRecordItem
} from '@patrol/types';

export interface RecordScanDto {
  id?: string;
  siteId: string;
  checkpointId?: string;
  qrPayload?: string;
  latitude: number;
  longitude: number;
  statusResult?: string; // 'Situasi Aman Terkendali' | 'Perlu Tindak Lanjut'
  notes?: string;
  photoKey?: string;
  deviceTimestamp?: string;
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
      checkpointQuery += ` AND (id = $1 OR id::text = $1 OR qr_code_token = $1 OR qr_code_token ILIKE $1)`;
      checkpointParams.push(data.checkpointId);
    } else if (data.qrPayload) {
      checkpointQuery += ` AND (qr_code_token = $1 OR qr_code_token ILIKE $1 OR id::text = $1)`;
      checkpointParams.push(data.qrPayload);
    } else {
      throw new BadRequestException('Either checkpointId or qrPayload must be provided');
    }

    const cp = await this.db.queryOne<any>(checkpointQuery, checkpointParams);

    if (!cp) {
      throw new NotFoundException('Checkpoint not found or inactive');
    }

    // Check user division vs checkpoint category (patroli.site parity)
    const user = await this.db.queryOne<any>('SELECT division FROM users WHERE id = $1', [userId]);
    if (user && user.division) {
      const isSecurityUser = user.division.toLowerCase().includes('security') || user.division.toLowerCase().includes('satpam');
      const isCleaningUser = user.division.toLowerCase().includes('cleaning');
      const isSecurityCp = cp.category.toLowerCase().includes('security') || cp.category.toLowerCase().includes('satpam');
      const isCleaningCp = cp.category.toLowerCase().includes('clean');

      if ((isSecurityUser && isCleaningCp) || (isCleaningUser && isSecurityCp)) {
        throw new BadRequestException('Gagal..Scan QRcode sesuai bagian anda');
      }
    }

    // Idempotency check: if client already submitted this transaction ID
    if (data.id) {
      const existing = await this.db.queryOne<any>(
        `SELECT 
          id, site_id AS "siteId", checkpoint_id AS "checkpointId", user_id AS "userId",
          scanned_at AS "scannedAt",
          ST_Y(coordinates::geometry) AS latitude,
          ST_X(coordinates::geometry) AS longitude,
          status_result AS "statusResult", notes, photo_key AS "photoKey"
        FROM patrol_logs WHERE id = $1`,
        [data.id],
      );
      if (existing) {
        return existing;
      }
    }

    // 2. PostGIS proximity verification against the site
    const proximity = await this.db.checkCheckpointProximity(cp.id, data.latitude, data.longitude);

    // 3. Insert patrol log (preserving offline deviceTimestamp if provided)
    const statusResult = data.statusResult || 'Situasi Aman Terkendali';
    const savedPhotoKey = data.photoKey ? saveBase64Image(data.photoKey, 'patrol', userId) : null;
    const scannedAt = data.deviceTimestamp ? new Date(data.deviceTimestamp) : new Date();

    const insertSql = data.id
      ? `
        INSERT INTO patrol_logs (
          id, site_id, checkpoint_id, user_id, coordinates, status_result, notes, photo_key, scanned_at
        )
        VALUES (
          $1, $2, $3, $4,
          ST_SetSRID(ST_MakePoint($6, $5), 4326),
          $7, $8, $9, $10
        )
        RETURNING 
          id, site_id AS "siteId", checkpoint_id AS "checkpointId", user_id AS "userId",
          scanned_at AS "scannedAt",
          ST_Y(coordinates::geometry) AS latitude,
          ST_X(coordinates::geometry) AS longitude,
          status_result AS "statusResult", notes, photo_key AS "photoKey"
      `
      : `
        INSERT INTO patrol_logs (
          site_id, checkpoint_id, user_id, coordinates, status_result, notes, photo_key, scanned_at
        )
        VALUES (
          $1, $2, $3,
          ST_SetSRID(ST_MakePoint($5, $4), 4326),
          $6, $7, $8, $9
        )
        RETURNING 
          id, site_id AS "siteId", checkpoint_id AS "checkpointId", user_id AS "userId",
          scanned_at AS "scannedAt",
          ST_Y(coordinates::geometry) AS latitude,
          ST_X(coordinates::geometry) AS longitude,
          status_result AS "statusResult", notes, photo_key AS "photoKey"
      `;

    const insertParams = data.id
      ? [
          data.id,
          cp.site_id,
          cp.id,
          userId,
          data.latitude,
          data.longitude,
          statusResult,
          data.notes || null,
          savedPhotoKey,
          scannedAt,
        ]
      : [
          cp.site_id,
          cp.id,
          userId,
          data.latitude,
          data.longitude,
          statusResult,
          data.notes || null,
          savedPhotoKey,
          scannedAt,
        ];

    const row = await this.db.queryOne<any>(insertSql, insertParams);

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
    const userDetail = await this.db.queryOne<any>(
      `SELECT full_name, username, division FROM users WHERE id = $1`,
      [userId],
    );

    this.eventsGateway.broadcastPatrolScan(cp.site_id, {
      id: row.id,
      checkpointId: cp.id,
      checkpointName: cp.name,
      locationDetail: cp.location_detail,
      officerId: userId,
      officerName: userDetail?.full_name || 'Petugas Satpam',
      division: userDetail?.division || 'Security',
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

  /**
   * 100% Parity with patroli.site: Monitoring Patroli Personil 24 Jam
   * Shows 24 hourly columns (00:00 to 23:00) vs Assets to check if scanned in each hour
   */
  async getHourlyMonitoringMatrix(dateStr?: string, siteId?: string): Promise<HourlyPatrolMatrixResponse> {
    const targetDate = dateStr || new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
    const startIso = `${targetDate} 00:00:00`;
    const endIso = `${targetDate} 23:59:59`;

    let targetSiteId = siteId;
    let siteName = 'Semua Area';
    if (siteId) {
      const site = await this.db.queryOne<any>(`SELECT name FROM sites WHERE id = $1`, [siteId]);
      if (site) siteName = site.name;
    } else {
      const firstSite = await this.db.queryOne<any>(`SELECT id, name FROM sites WHERE is_active = true LIMIT 1`);
      if (firstSite) {
        targetSiteId = firstSite.id;
        siteName = firstSite.name;
      }
    }

    if (!targetSiteId) {
      return { date: targetDate, siteId: '', siteName: 'No Site Found', rows: [] };
    }

    // 1. Fetch all checkpoints for this site
    const cpSql = `
      SELECT id, name, location_detail as "locationDetail", category
      FROM checkpoints
      WHERE site_id = $1 AND is_active = true
      ORDER BY name ASC
    `;
    const checkpoints = await this.db.query<any>(cpSql, [targetSiteId]);

    // 2. Fetch all patrol logs for this site on this date
    const logsSql = `
      SELECT checkpoint_id as "checkpointId", EXTRACT(HOUR FROM scanned_at)::int as "hour"
      FROM patrol_logs
      WHERE site_id = $1 AND scanned_at >= $2::timestamp AND scanned_at <= $3::timestamp
    `;
    const logs = await this.db.query<any>(logsSql, [targetSiteId, startIso, endIso]);

    // Map checkpointId -> Set of hours scanned
    const scannedMap = new Map<string, Set<number>>();
    for (const log of logs) {
      if (!scannedMap.has(log.checkpointId)) {
        scannedMap.set(log.checkpointId, new Set());
      }
      scannedMap.get(log.checkpointId)!.add(log.hour);
    }

    // 3. Build rows
    const rows: HourlyPatrolMatrixRow[] = checkpoints.map((cp) => {
      const hoursSet = scannedMap.get(cp.id) || new Set();
      const hours: Record<number, boolean> = {};
      let totalScanned = 0;

      for (let h = 0; h < 24; h++) {
        const isScanned = hoursSet.has(h);
        hours[h] = isScanned;
        if (isScanned) totalScanned++;
      }

      return {
        checkpointId: cp.id,
        assetName: cp.name,
        locationDescription: cp.locationDetail || '-',
        category: cp.category as Division,
        hours,
        totalScanned,
      };
    });

    return {
      date: targetDate,
      siteId: targetSiteId,
      siteName,
      rows,
    };
  }

  async getPatrolRecords(query: {
    page?: number;
    limit?: number;
    siteName?: string;
    search?: string;
  }): Promise<PatrolRecordsResponse> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 5);
    const offset = (page - 1) * limit;

    let whereClause = ` WHERE 1=1 `;
    const params: any[] = [];
    let paramIdx = 1;

    if (query.siteName && query.siteName.trim() !== '') {
      whereClause += ` AND s.name ILIKE $${paramIdx++}`;
      params.push(`%${query.siteName.trim()}%`);
    }

    if (query.search && query.search.trim() !== '') {
      whereClause += ` AND (
        u.full_name ILIKE $${paramIdx} OR 
        s.name ILIKE $${paramIdx} OR 
        c.name ILIKE $${paramIdx} OR 
        p.status_result ILIKE $${paramIdx} OR 
        p.notes ILIKE $${paramIdx}
      )`;
      params.push(`%${query.search.trim()}%`);
      paramIdx++;
    }

    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM patrol_logs p
      JOIN users u ON p.user_id = u.id
      JOIN checkpoints c ON p.checkpoint_id = c.id
      JOIN sites s ON p.site_id = s.id
      ${whereClause}
    `;
    const countResult = await this.db.queryOne<{ total: number }>(countSql, params);
    const recordsTotal = countResult?.total || 0;

    const dataSql = `
      SELECT 
        p.id,
        s.name AS "siteName",
        u.full_name AS "officerName",
        u.avatar_url AS "avatarUrl",
        COALESCE(u.role::text, 'anggota') AS "position",
        c.name AS "assetName",
        c.category AS "assetType",
        c.location_detail AS "assetLocation",
        c.task_description AS "taskDescription",
        p.status_result AS "statusResult",
        p.notes,
        p.scanned_at AS "scannedAt",
        ST_Y(p.coordinates::geometry) AS latitude,
        ST_X(p.coordinates::geometry) AS longitude,
        p.photo_key AS "photoKey",
        it.ticket_status AS "ticketStatus",
        it.resolution_notes AS "resolutionNotes"
      FROM patrol_logs p
      JOIN users u ON p.user_id = u.id
      JOIN checkpoints c ON p.checkpoint_id = c.id
      JOIN sites s ON p.site_id = s.id
      LEFT JOIN incident_tickets it ON it.patrol_log_id = p.id
      ${whereClause}
      ORDER BY p.scanned_at DESC
      LIMIT $${paramIdx++} OFFSET $${paramIdx++}
    `;
    const dataParams = [...params, limit, offset];
    const rows = await this.db.query<any>(dataSql, dataParams);

    const data: PatrolRecordItem[] = rows.map((r) => {
      const { dateFormatted, timeFormatted, dateTimeFull } = this.formatWibDateTime(r.scannedAt);

      return {
        id: String(r.id),
        siteName: r.siteName,
        officerName: r.officerName,
        position: 'anggota',
        assetName: r.assetName,
        assetType: r.assetType || 'keamanan',
        assetLocation: r.assetLocation || `${r.assetName} - ${r.siteName}`,
        taskDescription: r.taskDescription || r.notes || 'Pemeriksaan akses dan keamanan area',
        statusResult: r.statusResult || 'Situasi Aman Terkendali',
        notes: r.notes,
        scannedAt: r.scannedAt,
        dateFormatted,
        timeFormatted,
        dateTimeFull,
        latitude: Number(r.latitude) || 0,
        longitude: Number(r.longitude) || 0,
        photoUrl: normalizePhotoUrl(r.photoKey),
        tindakLanjutStatus: r.ticketStatus === 'RESOLVED' ? 'Sudah di TL' : null,
      };
    });

    return {
      draw: query.page || 1,
      recordsTotal,
      recordsFiltered: recordsTotal,
      data,
    };
  }

  async getPatrolDetail(id: string): Promise<PatrolDetailResponse> {
    const sql = `
      SELECT 
        p.id,
        s.name AS "siteName",
        u.full_name AS "officerName",
        u.avatar_url AS "avatarUrl",
        COALESCE(u.role::text, 'anggota') AS "position",
        c.name AS "assetName",
        c.category AS "assetType",
        c.location_detail AS "assetLocation",
        c.task_description AS "taskDescription",
        p.status_result AS "statusResult",
        p.notes,
        p.scanned_at AS "scannedAt",
        ST_Y(p.coordinates::geometry) AS latitude,
        ST_X(p.coordinates::geometry) AS longitude,
        p.photo_key AS "photoKey",
        it.ticket_status AS "ticketStatus",
        it.resolution_notes AS "resolutionNotes"
      FROM patrol_logs p
      JOIN users u ON p.user_id = u.id
      JOIN checkpoints c ON p.checkpoint_id = c.id
      JOIN sites s ON p.site_id = s.id
      LEFT JOIN incident_tickets it ON it.patrol_log_id = p.id
      WHERE p.id::text = $1
    `;
    const r = await this.db.queryOne<any>(sql, [id]);
    if (!r) {
      throw new NotFoundException(`Patrol detail with ID ${id} not found`);
    }

    const { dateFormatted, timeFormatted } = this.formatWibDateTime(r.scannedAt);
    const shortCode = String(r.id).includes('-') ? String(r.id).substring(0, 4) : String(r.id);
    const lat = Number(r.latitude) || 0;
    const lng = Number(r.longitude) || 0;
    const googleMapsUrl = `https://www.google.com/maps?q=${lat}%2C${lng}`;

    return {
      id: String(r.id),
      officerName: r.officerName,
      position: 'anggota',
      siteName: r.siteName,
      avatarUrl: r.avatarUrl,
      activityStatus: 'Selesai',
      assetName: r.assetName,
      assetType: r.assetType || 'keamanan',
      assetLocation: r.assetLocation || `${r.assetName} - ${r.siteName}`,
      dateFormatted,
      timeFormatted,
      patrolCode: `#${shortCode}`,
      taskDescription: r.taskDescription || 'Pemeriksaan akses dan keamanan area',
      patrolResult: r.statusResult || 'Situasi Aman Terkendali',
      latitude: lat,
      longitude: lng,
      googleMapsUrl,
      photoUrl: normalizePhotoUrl(r.photoKey),
      tindakLanjutStatus: r.ticketStatus === 'RESOLVED' ? 'Sudah di TL' : null,
    };
  }

  private formatWibDateTime(dateInput: string | Date) {
    const d = new Date(dateInput);
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Jakarta',
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(d);
    const p: Record<string, string> = {};
    for (const part of parts) {
      p[part.type] = part.value;
    }

    const dayNameMap: Record<string, string> = {
      Sunday: 'Minggu',
      Monday: 'Senin',
      Tuesday: 'Selasa',
      Wednesday: 'Rabu',
      Thursday: 'Kamis',
      Friday: 'Jumat',
      Saturday: 'Sabtu',
    };
    const indonesianDay = dayNameMap[p.weekday] || p.weekday;

    const dateFormatted = `${indonesianDay}, ${p.day} ${p.month} ${p.year}`;
    const timeFormatted = `${p.hour}:${p.minute}:${p.second}`;
    const dateTimeFull = `${dateFormatted} | ${timeFormatted}`;

    return { dateFormatted, timeFormatted, dateTimeFull };
  }

  async updateTindakLanjut(patrolLogId: string, notes = 'Ya sudah di TL') {
    const existingTicket = await this.db.queryOne<any>(
      'SELECT id FROM incident_tickets WHERE patrol_log_id = $1::uuid OR patrol_log_id::text = $1',
      [patrolLogId]
    );

    if (existingTicket) {
      return this.db.queryOne<any>(
        `UPDATE incident_tickets 
         SET ticket_status = 'RESOLVED', resolution_notes = $2, resolved_at = CURRENT_TIMESTAMP
         WHERE id = $1 RETURNING *`,
        [existingTicket.id, notes]
      );
    } else {
      const patrol = await this.db.queryOne<any>(
        'SELECT site_id, user_id FROM patrol_logs WHERE id::text = $1 OR id = $1::uuid',
        [patrolLogId]
      );
      if (!patrol) throw new NotFoundException('Patrol log not found');
      return this.db.queryOne<any>(
        `INSERT INTO incident_tickets (site_id, patrol_log_id, ticket_status, reported_by, resolution_notes, resolved_at)
         VALUES ($1, $2, 'RESOLVED', $3, $4, CURRENT_TIMESTAMP)
         RETURNING *`,
        [patrol.site_id, patrolLogId, patrol.user_id, notes]
      );
    }
  }
}
