import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../database/database.service';
import axios from 'axios';

@Injectable()
export class SosService {
  private readonly logger = new Logger(SosService.name);

  constructor(
    private db: DatabaseService,
    private configService: ConfigService,
  ) {}

  async triggerSos(userId: string, data: { siteId: string; latitude: number; longitude: number; message?: string }) {
    // 1. Fetch site and user details
    const user = await this.db.queryOne<any>(`SELECT full_name, phone_number, division FROM users WHERE id = $1`, [userId]);
    const site = await this.db.queryOne<any>(`SELECT name, address FROM sites WHERE id = $1`, [data.siteId]);

    // 2. Insert alert into database
    const alert = await this.db.queryOne<any>(
      `
      INSERT INTO emergency_alerts (
        site_id, user_id, coordinates, alert_status
      )
      VALUES (
        $1, $2,
        ST_SetSRID(ST_MakePoint($4, $3), 4326)::geography,
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

    // 3. Automated WhatsApp Gateway Dispatch (Fonnte / Wablas)
    const waUrl = this.configService.get<string>('WHATSAPP_API_URL');
    const waToken = this.configService.get<string>('WHATSAPP_API_TOKEN');
    const waTarget = this.configService.get<string>('WHATSAPP_TARGET_GROUP');

    if (waUrl && waToken && waTarget) {
      const waMessage = 
        `🚨 *EMERGENCY PANIC ALERT!* 🚨\n\n` +
        `👤 *Petugas:* ${user?.full_name || 'Personil'}\n` +
        `🏢 *Fasilitas:* ${site?.name || 'Area Operasional'}\n` +
        `🏷 *Divisi:* ${user?.division || 'Security'}\n` +
        `📍 *Lokasi GPS:* ${mapsUrl}\n` +
        `⏰ *Waktu:* ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB\n\n` +
        `_Segera lakukan pengecekan dan koordinasi dengan pos komando!_`;

      try {
        const resp = await axios.post(
          waUrl,
          { target: waTarget, message: waMessage },
          { headers: { Authorization: waToken }, timeout: 5000 },
        );

        await this.db.query(
          `UPDATE emergency_alerts SET is_whatsapp_dispatched = true, whatsapp_dispatch_response = $2 WHERE id = $1`,
          [alert.id, JSON.stringify(resp.data)],
        );
        this.logger.log(`WhatsApp Panic SOS dispatched to ${waTarget}`);
      } catch (err: any) {
        this.logger.error(`Failed to dispatch WhatsApp alert: ${err.message}`);
        await this.db.query(
          `UPDATE emergency_alerts SET is_whatsapp_dispatched = false, whatsapp_dispatch_response = $2 WHERE id = $1`,
          [alert.id, err.message],
        );
      }
    } else {
      this.logger.warn(`WhatsApp Gateway credentials not configured. Skipping external WhatsApp dispatch.`);
    }

    return {
      ...alert,
      user,
      site,
      mapsUrl,
    };
  }

  async getActiveAlerts() {
    return this.db.query(`
      SELECT 
        e.id, e.site_id AS "siteId", e.user_id AS "userId",
        ST_Y(e.coordinates::geometry) AS latitude,
        ST_X(e.coordinates::geometry) AS longitude,
        e.triggered_at AS "triggeredAt", e.alert_status AS "alertStatus",
        e.is_whatsapp_dispatched AS "isWhatsappDispatched",
        u.full_name AS "officerName", u.phone_number AS "officerPhone", u.division,
        s.name AS "siteName"
      FROM emergency_alerts e
      JOIN users u ON e.user_id = u.id
      JOIN sites s ON e.site_id = s.id
      WHERE e.alert_status IN ('ACTIVE', 'ACKNOWLEDGED')
      ORDER BY e.triggered_at DESC
    `);
  }

  async acknowledgeAlert(alertId: string, supervisorUserId: string) {
    return this.db.queryOne(
      `
      UPDATE emergency_alerts
      SET alert_status = 'ACKNOWLEDGED', acknowledged_by = $2, acknowledged_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, alert_status AS "alertStatus", acknowledged_at AS "acknowledgedAt"
    `,
      [alertId, supervisorUserId],
    );
  }

  async resolveAlert(alertId: string, resolutionNotes: string) {
    return this.db.queryOne(
      `
      UPDATE emergency_alerts
      SET alert_status = 'RESOLVED', resolution_notes = $2
      WHERE id = $1
      RETURNING id, alert_status AS "alertStatus", resolution_notes AS "resolutionNotes"
    `,
      [alertId, resolutionNotes],
    );
  }
}
