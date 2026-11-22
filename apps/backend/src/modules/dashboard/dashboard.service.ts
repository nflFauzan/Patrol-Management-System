import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
  DashboardSummary,
  ShiftComplianceData,
  ShiftRoundSlot,
  PendingCheckpoint,
  DashboardNotificationItem,
  PatrolHourlyActivity,
} from '@patrol/types';

@Injectable()
export class DashboardService {
  constructor(private db: DatabaseService) {}

  async getDashboardSummary(siteId?: string): Promise<DashboardSummary> {
    const cleanSiteId = siteId && siteId.trim() !== '' && siteId !== 'ALL' ? siteId : null;

    const row = await this.db.queryOne<any>(
      `
      WITH 
      active_users AS (
        SELECT u.id, u.division FROM users u
        WHERE u.is_active = true
          AND ($1::uuid IS NULL OR u.site_id = $1::uuid OR EXISTS (
            SELECT 1 FROM user_site_assignments usa WHERE usa.user_id = u.id AND usa.site_id = $1::uuid
          ))
      ),
      today_attendance AS (
        SELECT DISTINCT user_id FROM attendances
        WHERE attendance_date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::date AND status_type IN (1, 2)
      ),
      active_patrol AS (
        SELECT DISTINCT user_id FROM attendances
        WHERE attendance_date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::date AND status_type = 1 AND clock_out_at IS NULL
      ),
      active_checkpoints AS (
        SELECT id, category FROM checkpoints
        WHERE is_active = true
          AND ($1::uuid IS NULL OR site_id = $1::uuid)
      ),
      active_trips AS (
        SELECT id FROM driver_trip_logs
        WHERE trip_status = 'IN_PROGRESS'
          AND ($1::uuid IS NULL OR site_id = $1::uuid)
      ),
      site_count AS (
        SELECT COUNT(*) AS cnt FROM sites
        WHERE is_active = true
          AND ($1::uuid IS NULL OR id = $1::uuid)
      )
      SELECT
        (SELECT COUNT(*) FROM active_users) AS "totalPersonnel",
        (SELECT cnt FROM site_count) AS "totalSites",
        (SELECT COUNT(*) FROM active_checkpoints) AS "totalCheckpoints",
        (SELECT COUNT(*) FROM today_attendance ta JOIN active_users au ON ta.user_id = au.id) AS "hadir",
        (SELECT COUNT(*) FROM active_patrol ap JOIN active_users au ON ap.user_id = au.id) AS "activePatrol",
        (SELECT COUNT(*) FROM active_users WHERE UPPER(division::text) = 'SECURITY') AS "securityPersonnel",
        (SELECT COUNT(*) FROM active_users WHERE UPPER(division::text) = 'CLEANING') AS "cleaningPersonnel",
        (SELECT COUNT(*) FROM active_users WHERE UPPER(division::text) = 'DRIVER') AS "driverPersonnel",
        (SELECT COUNT(*) FROM active_users WHERE UPPER(division::text) = 'STAFF') AS "staffPersonnel",
        (SELECT COUNT(*) FROM active_checkpoints WHERE category = 'Security') AS "securityCheckpoints",
        (SELECT COUNT(*) FROM active_checkpoints WHERE category = 'Cleaning Service') AS "cleaningCheckpoints",
        (SELECT COUNT(*) FROM active_trips) AS "activeDriverTrips"
    `,
      [cleanSiteId],
    );

    const totalPersonnel = Number(row?.totalPersonnel || 0);
    const hadir = Number(row?.hadir || 0);
    const percentageStr = totalPersonnel > 0 ? `${Math.round((hadir / totalPersonnel) * 100)}%` : '0%';

    return {
      totalPersonnel,
      totalSites: Number(row?.totalSites || 0),
      totalCheckpoints: Number(row?.totalCheckpoints || 0),
      attendanceToday: {
        hadir,
        totalPersonnel,
        percentageStr,
      },
      activePatrol: {
        count: Number(row?.activePatrol || 0),
      },
      divisionCounts: {
        security: Number(row?.securityPersonnel || 0),
        cleaning: Number(row?.cleaningPersonnel || 0),
        driver: Number(row?.driverPersonnel || 0),
        staff: Number(row?.staffPersonnel || 0),
      },
      divisionCheckpointCounts: {
        security: Number(row?.securityCheckpoints || 0),
        cleaning: Number(row?.cleaningCheckpoints || 0),
      },
      activeDriverTrips: Number(row?.activeDriverTrips || 0),
    };
  }

  async getShiftCompliance(
    siteId?: string,
    shiftType: 'PAGI' | 'SIANG' | 'MALAM' = 'PAGI',
  ): Promise<ShiftComplianceData> {
    const cleanSiteId = siteId && siteId.trim() !== '' && siteId !== 'ALL' ? siteId : null;

    // Default schedules
    let shiftStart = '07:00';
    let shiftEnd = '15:00';
    let shiftName = `Shift ${shiftType}`;

    if (cleanSiteId) {
      const site = await this.db.queryOne<any>(
        `
        SELECT name, shift_pagi_in, shift_pagi_out, shift_siang_in, shift_siang_out, shift_malam_in, shift_malam_out
        FROM sites WHERE id = $1
      `,
        [cleanSiteId],
      );

      if (site) {
        if (shiftType === 'PAGI') {
          shiftStart = site.shift_pagi_in ? site.shift_pagi_in.substring(0, 5) : '07:00';
          shiftEnd = site.shift_pagi_out ? site.shift_pagi_out.substring(0, 5) : '15:00';
        } else if (shiftType === 'SIANG') {
          shiftStart = site.shift_siang_in ? site.shift_siang_in.substring(0, 5) : '15:00';
          shiftEnd = site.shift_siang_out ? site.shift_siang_out.substring(0, 5) : '23:00';
        } else if (shiftType === 'MALAM') {
          shiftStart = site.shift_malam_in ? site.shift_malam_in.substring(0, 5) : '23:00';
          shiftEnd = site.shift_malam_out ? site.shift_malam_out.substring(0, 5) : '07:00';
        }
      }
    } else {
      if (shiftType === 'SIANG') {
        shiftStart = '15:00';
        shiftEnd = '23:00';
      } else if (shiftType === 'MALAM') {
        shiftStart = '23:00';
        shiftEnd = '07:00';
      }
    }

    // Active checkpoints in security category
    const checkpoints = await this.db.query<any>(
      `
      SELECT id, name, location_detail
      FROM checkpoints
      WHERE is_active = true AND category = 'Security'
        AND ($1::uuid IS NULL OR site_id = $1::uuid)
      ORDER BY name ASC
    `,
      [cleanSiteId],
    );
    const totalCheckpoints = checkpoints.length;

    // Current Jakarta time
    const nowJakarta = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    const currentHour = nowJakarta.getHours();
    const currentMinute = nowJakarta.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinute;

    const [startH, startM] = shiftStart.split(':').map(Number);
    const [endH, endM] = shiftEnd.split(':').map(Number);
    let startMinutes = startH * 60 + (startM || 0);
    let endMinutes = endH * 60 + (endM || 0);
    if (endMinutes <= startMinutes) {
      endMinutes += 24 * 60; // Cross midnight (e.g. 23:00 to 07:00)
    }
    const totalShiftMinutes = endMinutes - startMinutes;
    const roundDuration = Math.floor(totalShiftMinutes / 4);

    // Build rounds
    const rounds: ShiftRoundSlot[] = [];
    for (let i = 0; i < 4; i++) {
      const slotStartMin = startMinutes + i * roundDuration;
      const slotEndMin = startMinutes + (i + 1) * roundDuration;

      const formatTime = (min: number) => {
        const normalizedH = Math.floor((min % (24 * 60)) / 60);
        const normalizedM = min % 60;
        return `${String(normalizedH).padStart(2, '0')}:${String(normalizedM).padStart(2, '0')}`;
      };

      const startTimeStr = formatTime(slotStartMin);
      const endTimeStr = formatTime(slotEndMin);

      // Check if current Jakarta time is in slot
      let checkCurrentMin = currentTotalMinutes;
      if (checkCurrentMin < startMinutes && endMinutes > 24 * 60) {
        checkCurrentMin += 24 * 60;
      }

      const isCurrentRound = checkCurrentMin >= slotStartMin && checkCurrentMin < slotEndMin;
      const isCompleted = checkCurrentMin >= slotEndMin;

      rounds.push({
        roundNumber: i + 1,
        startTime: startTimeStr,
        endTime: endTimeStr,
        scannedCount: 0,
        totalCheckpoints,
        isCurrentRound,
        isCompleted,
      });
    }

    // Get scanned checkpoints within shift window
    // Window: from shiftStart to shiftEnd today
    const scannedLogs = await this.db.query<any>(
      `
      SELECT 
        pl.checkpoint_id,
        pl.scanned_at AT TIME ZONE 'Asia/Jakarta' AS scanned_at_wib,
        u.full_name AS officer_name
      FROM patrol_logs pl
      JOIN users u ON pl.user_id = u.id
      WHERE ($1::uuid IS NULL OR pl.site_id = $1::uuid)
        AND pl.scanned_at AT TIME ZONE 'Asia/Jakarta' >= (
          CASE 
            WHEN $2 = 'MALAM' AND EXTRACT(HOUR FROM CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta') < 12 
              THEN ((CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::date - 1 || ' ' || $3)::timestamp
            ELSE ((CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::date || ' ' || $3)::timestamp
          END
        )
        AND pl.scanned_at AT TIME ZONE 'Asia/Jakarta' <= (
          CASE 
            WHEN $2 = 'MALAM' AND EXTRACT(HOUR FROM CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta') >= 12 
              THEN ((CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::date + 1 || ' ' || $4)::timestamp
            ELSE ((CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::date || ' ' || $4)::timestamp
          END
        )
      ORDER BY pl.scanned_at DESC
    `,
      [cleanSiteId, shiftType, shiftStart + ':00', shiftEnd + ':00'],
    );

    // Calculate scanned checkpoints per round
    const distinctShiftScanned = new Set<string>();
    scannedLogs.forEach((log) => {
      distinctShiftScanned.add(log.checkpoint_id);

      const logDate = new Date(log.scanned_at_wib);
      const logH = logDate.getHours();
      const logM = logDate.getMinutes();
      let logTotalMinutes = logH * 60 + logM;
      if (logTotalMinutes < startMinutes && endMinutes > 24 * 60) {
        logTotalMinutes += 24 * 60;
      }

      for (let i = 0; i < 4; i++) {
        const slotStartMin = startMinutes + i * roundDuration;
        const slotEndMin = startMinutes + (i + 1) * roundDuration;
        if (logTotalMinutes >= slotStartMin && logTotalMinutes < slotEndMin) {
          rounds[i].scannedCount++;
          break;
        }
      }
    });

    const overallScannedCount = distinctShiftScanned.size;
    const percentage = totalCheckpoints > 0 ? Math.round((overallScannedCount / totalCheckpoints) * 100) : 0;

    // Identify pending checkpoints: checkpoints that are not scanned in recent shift window
    const pendingCheckpoints: PendingCheckpoint[] = [];
    const recentScans = await this.db.query<any>(
      `
      SELECT DISTINCT ON (checkpoint_id)
        checkpoint_id,
        scanned_at AT TIME ZONE 'Asia/Jakarta' AS last_scanned_at,
        EXTRACT(EPOCH FROM ((CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta') - (scanned_at AT TIME ZONE 'Asia/Jakarta')))/60 AS minutes_ago,
        u.full_name AS officer_name
      FROM patrol_logs pl
      JOIN users u ON pl.user_id = u.id
      WHERE ($1::uuid IS NULL OR pl.site_id = $1::uuid)
      ORDER BY checkpoint_id, pl.scanned_at DESC
    `,
      [cleanSiteId],
    );

    const scanMap = new Map<string, any>();
    recentScans.forEach((s) => scanMap.set(s.checkpoint_id, s));

    checkpoints.forEach((cp) => {
      if (!distinctShiftScanned.has(cp.id)) {
        const scan = scanMap.get(cp.id);
        pendingCheckpoints.push({
          checkpointId: cp.id,
          checkpointName: cp.name,
          locationDetail: cp.location_detail || 'Pos Area',
          lastScannedAt: scan ? scan.last_scanned_at : null,
          timeSinceLastScanMinutes: scan ? Math.round(Number(scan.minutes_ago)) : null,
          lastOfficerName: scan ? scan.officer_name : null,
        });
      }
    });

    return {
      shiftName,
      shiftStart,
      shiftEnd,
      scannedCount: overallScannedCount,
      totalCheckpoints,
      percentageStr: `${percentage}%`,
      rounds,
      pendingCheckpoints: pendingCheckpoints.slice(0, 10),
    };
  }

  async getRecentNotifications(limit = 10): Promise<DashboardNotificationItem[]> {
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);

    const rows = await this.db.query<any>(
      `
      SELECT * FROM (
        (SELECT 
          'sos-' || ea.id AS id, 'PANIC' AS type,
          '🚨 Panic: ' || COALESCE(u.full_name, 'Petugas') AS title,
          COALESCE(s.name, 'Lokasi Darurat') AS subtitle,
          to_char(ea.triggered_at AT TIME ZONE 'Asia/Jakarta', 'HH24:MI') || ' WIB' AS time,
          '/emergency' AS link,
          ea.triggered_at AS "createdAt"
        FROM emergency_alerts ea
        LEFT JOIN users u ON ea.user_id = u.id
        LEFT JOIN sites s ON ea.site_id = s.id
        ORDER BY ea.triggered_at DESC LIMIT 10)
        UNION ALL
        (SELECT
          'patrol-' || pl.id AS id, 'PATROL' AS type,
          'Patroli: ' || COALESCE(c.name, 'Pos Checkpoint') AS title,
          COALESCE(u.full_name, 'Petugas') AS subtitle,
          to_char(pl.scanned_at AT TIME ZONE 'Asia/Jakarta', 'HH24:MI') || ' WIB' AS time,
          '/validasi-patroli' AS link,
          pl.scanned_at AS "createdAt"
        FROM patrol_logs pl
        LEFT JOIN checkpoints c ON pl.checkpoint_id = c.id
        LEFT JOIN users u ON pl.user_id = u.id
        ORDER BY pl.scanned_at DESC LIMIT 10)
        UNION ALL
        (SELECT
          'att-' || a.id AS id, 'ATTENDANCE' AS type,
          'Absensi Masuk: ' || COALESCE(u.full_name, 'Personel') AS title,
          COALESCE(s.name, 'Site') AS subtitle,
          to_char(a.clock_in_at AT TIME ZONE 'Asia/Jakarta', 'HH24:MI') || ' WIB' AS time,
          '/absensi' AS link,
          a.clock_in_at AS "createdAt"
        FROM attendances a
        LEFT JOIN users u ON a.user_id = u.id
        LEFT JOIN sites s ON a.site_id = s.id
        WHERE a.attendance_date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::date AND a.status_type = 1
        ORDER BY a.clock_in_at DESC LIMIT 10)
        UNION ALL
        (SELECT
          'bc-' || bm.id AS id, 'BROADCAST' AS type,
          'Pesan Siaran' AS title,
          SUBSTRING(bm.content FROM 1 FOR 40) AS subtitle,
          to_char(bm.sent_at AT TIME ZONE 'Asia/Jakarta', 'HH24:MI') || ' WIB' AS time,
          '/pesan-siaran' AS link,
          bm.sent_at AS "createdAt"
        FROM broadcast_messages bm
        ORDER BY bm.sent_at DESC LIMIT 10)
      ) combined
      ORDER BY "createdAt" DESC
      LIMIT $1
    `,
      [safeLimit],
    );

    return rows.map((r) => ({
      id: r.id,
      type: r.type,
      title: r.title,
      subtitle: r.subtitle,
      time: r.time,
      link: r.link,
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
    }));
  }

  async getHourlyPatrolActivity(date?: string, siteId?: string): Promise<PatrolHourlyActivity[]> {
    const cleanSiteId = siteId && siteId.trim() !== '' && siteId !== 'ALL' ? siteId : null;
    const targetDate = date || new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

    const rows = await this.db.query<any>(
      `
      SELECT 
        EXTRACT(HOUR FROM pl.scanned_at AT TIME ZONE 'Asia/Jakarta')::int AS hour,
        COUNT(*)::int AS "scanCount",
        (ARRAY_AGG(c.name ORDER BY pl.scanned_at DESC))[1] AS "checkpointName"
      FROM patrol_logs pl
      JOIN checkpoints c ON pl.checkpoint_id = c.id
      WHERE (pl.scanned_at AT TIME ZONE 'Asia/Jakarta')::date = $1::date
        AND ($2::uuid IS NULL OR pl.site_id = $2::uuid)
      GROUP BY hour
      ORDER BY hour
    `,
      [targetDate, cleanSiteId],
    );

    const map = new Map<number, { scanCount: number; checkpointName: string | null }>();
    rows.forEach((r) => {
      map.set(Number(r.hour), {
        scanCount: Number(r.scanCount || 0),
        checkpointName: r.checkpointName || null,
      });
    });

    const result: PatrolHourlyActivity[] = [];
    for (let h = 0; h < 24; h++) {
      const item = map.get(h);
      result.push({
        hour: h,
        scanCount: item ? item.scanCount : 0,
        checkpointName: item ? item.checkpointName : null,
      });
    }

    return result;
  }
}
