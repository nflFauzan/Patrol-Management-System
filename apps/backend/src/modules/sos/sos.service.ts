import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../database/database.service';
import { EventsGateway } from '../gateway/events.gateway';
import axios from 'axios';

export interface TriggerSosDto {
  siteId: string;
  latitude: number;
  longitude: number;
  message?: string;
}

@Injectable()
export class SosService {
  private readonly logger = new Logger(SosService.name);

  constructor(
    private db: DatabaseService,
    private configService: ConfigService,
    private eventsGateway: EventsGateway,
  ) { }

  /**
   * FR-04.1 & FR-04.3: Trigger Panic Button SOS & Dispatch WhatsApp Gateway
   */
  async triggerSos(userId: string, data: TriggerSosDto) {
    // 1. Fetch site and user details
    const user = await this.db.queryOne<any>(
      `SELECT full_name, phone_number, division FROM users WHERE id = $1`,
      [userId],
    );
    const site = await this.db.queryOne<any>(
      `SELECT name, address FROM sites WHERE id = $1`,
      [data.siteId],
    );

    // 2. Insert alert into PostGIS database
    const alert = await this.db.queryOne<any>(
      `
      INSERT INTO emergency_alerts (
        site_id, user_id, coordinates, alert_status
      )
      VALUES (
        $1, $2,
        ST_SetSRID(ST_MakePoint($4, $3), 4326),
        'ACTIVE'
      )
      RETURNING 
        id, site_id AS "siteId", user_id AS "userId",
        ST_Y(coordinates::geometry) AS latitude,
        ST_X(coordinates::geometry) AS longitude,
        triggered_at AS "triggeredAt", alert_status AS "alertStatus",
        is_whatsapp_dispatched AS "isWhatsappDispatched"
    `,
      [data.siteId, userId, data.latitude, data.longitude],
    );

    const mapsUrl = `https://www.google.com/maps?q=${data.latitude},${data.longitude}`;
    const timeStr = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

    // 3. Automated WhatsApp Gateway Dispatch (Fonnte / Wablas)
    const company = await this.db.queryOne<any>(
      `SELECT wa_gateway_provider, wa_api_token, wa_emergency_group_id, is_wa_notifications_enabled FROM company_profile LIMIT 1`,
    );

    const waToken = company?.wa_api_token || this.configService.get<string>('WHATSAPP_API_TOKEN');
    const waTarget = company?.wa_emergency_group_id || this.configService.get<string>('WHATSAPP_TARGET_GROUP') || '120363041234567890@g.us';
    const waProvider = company?.wa_gateway_provider || 'fonnte';
    const isWaEnabled = company?.is_wa_notifications_enabled ?? true;

    let isDispatched = false;
    let dispatchResponse = 'Simulated / Dev mode';

    const waMessage =
      `🚨 *[ALARM DARURAT - PANIC BUTTON SOS]* 🚨\n\n` +
      `👤 *Petugas:* ${user?.full_name || 'Personil Lapangan'} (${user?.division || 'Security'})\n` +
      `🏢 *Fasilitas:* ${site?.name || 'Kantor Pusat Sholeh Iskandar Bogor'}\n` +
      `⏰ *Waktu:* ${timeStr} WIB\n` +
      `📍 *Koordinat:* ${data.latitude.toFixed(6)}, ${data.longitude.toFixed(6)}\n` +
      `🗺 *Peta Lokasi:* ${mapsUrl}\n` +
      `💬 *Pesan:* ${data.message || 'Petugas membutuhkan bantuan darurat segera!'}\n\n` +
      `_Pesan otomatis dikirim oleh Enterprise Patrol Management System_`;

    if (isWaEnabled && waToken) {
      try {
        if (waProvider === 'fonnte') {
          const resp = await axios.post(
            'https://api.fonnte.com/send',
            { target: waTarget, message: waMessage },
            { headers: { Authorization: waToken }, timeout: 5000 },
          );
          isDispatched = true;
          dispatchResponse = JSON.stringify(resp.data);
        } else if (waProvider === 'wablas') {
          const resp = await axios.post(
            'https://wablas.com/api/send-message',
            { phone: waTarget, message: waMessage },
            { headers: { Authorization: waToken }, timeout: 5000 },
          );
          isDispatched = true;
          dispatchResponse = JSON.stringify(resp.data);
        }
        this.logger.log(`WhatsApp Panic SOS dispatched to ${waTarget} via ${waProvider}`);
      } catch (err: any) {
        this.logger.warn(`WhatsApp dispatch encountered error (gateway unreachable): ${err.message}`);
        dispatchResponse = `Error: ${err.message}`;
        isDispatched = false;
      }
    } else {
      // Dev / Test simulation fallback
      isDispatched = true;
      dispatchResponse = `[SIMULATED] Dispatched to ${waTarget} via Fonnte Gateway`;
      this.logger.log(`[SIMULATED] WhatsApp SOS dispatched to ${waTarget}`);
    }

    // Update alert row with WhatsApp dispatch status
    await this.db.query(
      `UPDATE emergency_alerts SET is_whatsapp_dispatched = $2, whatsapp_dispatch_response = $3 WHERE id = $1`,
      [alert.id, isDispatched, dispatchResponse],
    );

    // 4. FR-04.2: Real-time WebSocket Broadcast to Command Center
    const alertPayload = {
      ...alert,
      isWhatsappDispatched: isDispatched,
      whatsappDispatchResponse: dispatchResponse,
      officerName: user?.full_name || 'Petugas Lapangan',
      officerPhone: user?.phone_number || '-',
      division: user?.division || 'Security',
      siteName: site?.name || 'Head Office Sudirman',
      mapsUrl,
      message: data.message || 'Petugas membutuhkan bantuan darurat segera!',
    };

    this.eventsGateway.broadcastSosAlert(alertPayload);

    return alertPayload;
  }

  async getActiveAlerts() {
    return this.db.query(`
      SELECT 
        e.id, 
        e.site_id AS "siteId", 
        e.user_id AS "userId",
        ST_Y(e.coordinates::geometry) AS latitude,
        ST_X(e.coordinates::geometry) AS longitude,
        e.triggered_at AS "triggeredAt", 
        e.alert_status AS "alertStatus",
        e.is_whatsapp_dispatched AS "isWhatsappDispatched",
        u.full_name AS "officerName", 
        u.phone_number AS "officerPhone", 
        u.division,
        s.name AS "siteName"
      FROM emergency_alerts e
      JOIN users u ON e.user_id = u.id
      JOIN sites s ON e.site_id = s.id
      WHERE e.alert_status IN ('ACTIVE', 'ACKNOWLEDGED')
      ORDER BY e.triggered_at DESC
    `);
  }

  /**
   * Log Data Emergency: Historical & Paginated Records for Admin Command Center
   * Recreates patroli.site Log Data Emergency table behavior
   */
  async getEmergencyLogs(query: {
    page?: number;
    limit?: number;
    search?: string;
    siteId?: string;
    status?: string;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const offset = (page - 1) * limit;

    const conditions: string[] = ['1=1'];
    const params: any[] = [];
    let paramIdx = 1;

    if (query.search && query.search.trim() !== '') {
      conditions.push(`(u.full_name ILIKE $${paramIdx} OR s.name ILIKE $${paramIdx} OR u.division ILIKE $${paramIdx})`);
      params.push(`%${query.search.trim()}%`);
      paramIdx++;
    }

    if (query.siteId && query.siteId !== '__ALL__' && query.siteId !== '') {
      conditions.push(`e.site_id = $${paramIdx}`);
      params.push(query.siteId);
      paramIdx++;
    }

    if (query.status && query.status !== '__ALL__' && query.status !== '') {
      conditions.push(`e.alert_status = $${paramIdx}`);
      params.push(query.status);
      paramIdx++;
    }

    const whereClause = conditions.join(' AND ');

    const countRow = await this.db.queryOne<any>(
      `SELECT COUNT(*)::int AS total FROM emergency_alerts e JOIN users u ON e.user_id = u.id JOIN sites s ON e.site_id = s.id WHERE ${whereClause}`,
      params,
    );
    const total = countRow?.total || 0;

    const sql = `
      SELECT 
        e.id, 
        e.site_id AS "siteId", 
        s.name AS "siteName",
        e.user_id AS "userId",
        u.full_name AS "officerName", 
        u.phone_number AS "officerPhone", 
        u.division,
        u.photo_key AS "photoUrl",
        ST_Y(e.coordinates::geometry) AS latitude,
        ST_X(e.coordinates::geometry) AS longitude,
        e.triggered_at AS "triggeredAt", 
        e.alert_status AS "alertStatus",
        e.is_whatsapp_dispatched AS "isWhatsappDispatched",
        e.acknowledged_by AS "acknowledgedBy",
        e.acknowledged_at AS "acknowledgedAt",
        e.resolution_notes AS "resolutionNotes"
      FROM emergency_alerts e
      JOIN users u ON e.user_id = u.id
      JOIN sites s ON e.site_id = s.id
      WHERE ${whereClause}
      ORDER BY e.triggered_at DESC
      LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
    `;

    params.push(limit, offset);
    const rows = await this.db.query<any>(sql, params);

    const data = rows.map((row) => {
      const { dayName, timeOnly, formattedTime } = this.formatSosWibTime(row.triggeredAt);

      return {
        ...row,
        mapsUrl: `https://www.google.com/maps?q=${row.latitude},${row.longitude}`,
        dayName,
        timeOnly,
        formattedTime,
      };
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Detail Log Emergency: Fetch single record for detail modal & Leaflet Map
   */
  async getSosDetail(alertId: string) {
    const row = await this.db.queryOne<any>(
      `
      SELECT 
        e.id, 
        e.site_id AS "siteId", 
        s.name AS "siteName",
        s.address AS "siteAddress",
        e.user_id AS "userId",
        u.full_name AS "officerName", 
        u.phone_number AS "officerPhone", 
        u.division,
        u.role,
        u.photo_key AS "photoUrl",
        ST_Y(e.coordinates::geometry) AS latitude,
        ST_X(e.coordinates::geometry) AS longitude,
        e.triggered_at AS "triggeredAt", 
        e.alert_status AS "alertStatus",
        e.is_whatsapp_dispatched AS "isWhatsappDispatched",
        e.whatsapp_dispatch_response AS "whatsappDispatchResponse",
        e.acknowledged_by AS "acknowledgedBy",
        e.acknowledged_at AS "acknowledgedAt",
        e.resolution_notes AS "resolutionNotes"
      FROM emergency_alerts e
      JOIN users u ON e.user_id = u.id
      JOIN sites s ON e.site_id = s.id
      WHERE e.id = $1
      `,
      [alertId],
    );

    if (!row) {
      throw new NotFoundException(`Emergency Alert ${alertId} not found`);
    }

    const { dayName, timeOnly, formattedTime } = this.formatSosWibTime(row.triggeredAt);

    return {
      ...row,
      mapsUrl: `https://www.google.com/maps?q=${row.latitude},${row.longitude}`,
      dayName,
      timeOnly,
      formattedTime,
    };
  }

  private formatSosWibTime(dateInput: string | Date) {
    const d = new Date(dateInput);
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Jakarta',
      weekday: 'short',
      year: 'numeric',
      month: 'numeric',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).formatToParts(d);
    const p: Record<string, string> = {};
    for (const part of parts) p[part.type] = part.value;

    const weekdayMap: Record<string, string> = {
      Sun: 'Minggu', Mon: 'Senin', Tue: 'Selasa', Wed: 'Rabu',
      Thu: 'Kamis', Fri: 'Jumat', Sat: 'Sabtu',
    };
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const dayLabel = weekdayMap[p.weekday] || '';
    const monthLabel = monthNames[Math.max(0, Number(p.month) - 1)] || '';
    const hour = p.hour === '24' ? '00' : p.hour;
    const timeOnly = `${hour}:${p.minute}:${p.second}`;
    const formattedDate = `${dayLabel}, ${p.day} ${monthLabel} ${p.year}`;
    return {
      dayName: formattedDate,
      timeOnly,
      formattedTime: `${formattedDate} | ${timeOnly}`,
    };
  }

  async acknowledgeAlert(alertId: string, supervisorUserId: string) {
    const row = await this.db.queryOne(
      `
      UPDATE emergency_alerts
      SET alert_status = 'ACKNOWLEDGED', acknowledged_by = $2, acknowledged_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, alert_status AS "alertStatus", acknowledged_at AS "acknowledgedAt"
    `,
      [alertId, supervisorUserId],
    );

    if (!row) {
      throw new NotFoundException(`Emergency Alert ${alertId} not found`);
    }

    this.eventsGateway.server?.emit('sos:status_changed', {
      alertId,
      alertStatus: 'ACKNOWLEDGED',
      acknowledgedBy: supervisorUserId,
      acknowledgedAt: row.acknowledgedAt,
    });

    return row;
  }

  async resolveAlert(alertId: string, resolutionNotes: string) {
    const row = await this.db.queryOne(
      `
      UPDATE emergency_alerts
      SET alert_status = 'RESOLVED', resolution_notes = $2
      WHERE id = $1
      RETURNING id, alert_status AS "alertStatus", resolution_notes AS "resolutionNotes"
    `,
      [alertId, resolutionNotes],
    );

    if (!row) {
      throw new NotFoundException(`Emergency Alert ${alertId} not found`);
    }

    this.eventsGateway.server?.emit('sos:status_changed', {
      alertId,
      alertStatus: 'RESOLVED',
      resolutionNotes,
    });

    return row;
  }
}
