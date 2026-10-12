import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class ReportsService {
  constructor(private db: DatabaseService) {}

  async getHrisAttendanceRecap(query: {
    startDate?: string;
    endDate?: string;
    siteId?: string;
    division?: string;
  }) {
    let sql = `
      SELECT 
        a.id, a.attendance_date AS "date",
        u.nik, u.full_name AS "fullName", u.division, u.role,
        s.name AS "siteName",
        a.shift_name AS "shiftName",
        to_char(a.clock_in_at, 'HH24:MI:SS') AS "clockInTime",
        a.clock_in_distance_meters AS "clockInDistanceMeters",
        to_char(a.clock_out_at, 'HH24:MI:SS') AS "clockOutTime",
        a.clock_out_distance_meters AS "clockOutDistanceMeters",
        a.late_minutes AS "lateMinutes",
        a.work_duration_minutes AS "workDurationMinutes",
        ROUND((a.work_duration_minutes::numeric / 60.0), 2) AS "effectiveWorkingHours",
        a.overtime_minutes AS "overtimeMinutes",
        ROUND((a.overtime_minutes::numeric / 60.0), 2) AS "overtimeHours",
        CASE 
          WHEN a.status_type = 1 THEN 'HADIR_BERJALAN'
          WHEN a.status_type = 2 THEN 'SELESAI'
          WHEN a.status_type = 3 THEN COALESCE(a.reason, 'IZIN')
          ELSE 'ALPHA'
        END AS "statusLabel"
      FROM attendances a
      JOIN users u ON a.user_id = u.id
      JOIN sites s ON a.site_id = s.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let idx = 1;

    if (query.startDate) {
      sql += ` AND a.attendance_date >= $${idx++}`;
      params.push(query.startDate);
    }

    if (query.endDate) {
      sql += ` AND a.attendance_date <= $${idx++}`;
      params.push(query.endDate);
    }

    if (query.siteId) {
      sql += ` AND a.site_id = $${idx++}`;
      params.push(query.siteId);
    }

    if (query.division) {
      sql += ` AND u.division = $${idx++}`;
      params.push(query.division);
    }

    sql += ` ORDER BY a.attendance_date DESC, u.full_name ASC`;

    return this.db.query(sql, params);
  }

  async exportCsv(query: { startDate?: string; endDate?: string; siteId?: string; division?: string }) {
    const data = await this.getHrisAttendanceRecap(query);

    const headers = [
      'NIK',
      'Nama Karyawan',
      'Divisi',
      'Fasilitas / Site',
      'Tanggal',
      'Shift',
      'Jam Masuk',
      'Jarak Masuk (m)',
      'Jam Pulang',
      'Jarak Pulang (m)',
      'Terlambat (menit)',
      'Durasi Kerja (jam)',
      'Lembur (jam)',
      'Status Kehadiran',
    ];

    const rows = data.map((d: any) => [
      `"${d.nik || '-'}"`,
      `"${d.fullName}"`,
      `"${d.division}"`,
      `"${d.siteName}"`,
      `"${d.date}"`,
      `"${d.shiftName || '-'}"`,
      `"${d.clockInTime || '-'}"`,
      d.clockInDistanceMeters ?? '-',
      `"${d.clockOutTime || '-'}"`,
      d.clockOutDistanceMeters ?? '-',
      d.lateMinutes || 0,
      d.effectiveWorkingHours || 0,
      d.overtimeHours || 0,
      `"${d.statusLabel}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  /**
   * 100% Parity with patroli.site: Laporan Gaji Personil & Rekap Absensi
   */
  async getPayrollSummary(query: { month?: number; year?: number; siteId?: string; division?: string }): Promise<any[]> {
    const targetMonth = query.month || new Date().getMonth() + 1;
    const targetYear = query.year || new Date().getFullYear();
    const startDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
    const totalDays = new Date(targetYear, targetMonth, 0).getDate();
    const endDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(totalDays).padStart(2, '0')}`;
    const todayStr = new Date().toISOString().slice(0, 10);

    let usersSql = `
      SELECT DISTINCT 
        u.id, u.full_name as "fullName", u.division, u.role,
        COALESCE(u.gaji_pokok, 3000000) as "gajiPokok",
        COALESCE(u.tunjangan, 500000) as "tunjangan",
        COALESCE(u.lembur_per_jam, 25000) as "lemburPerJam",
        COALESCE(u.potongan_bpjs, 150000) as "potonganBpjs",
        COALESCE(u.potongan_alpa, 100000) as "potonganAlpa",
        COALESCE(u.potongan_lupa_absen, 50000) as "potonganLupaAbsen",
        COALESCE(s.name, 'Site Proyek Demo') as "siteName"
      FROM users u
      LEFT JOIN user_site_assignments usa ON u.id = usa.user_id
      LEFT JOIN sites s ON usa.site_id = s.id
      WHERE u.is_active = true
    `;
    const userParams: any[] = [];
    let pIdx = 1;

    if (query.siteId) {
      usersSql += ` AND (usa.site_id = $${pIdx} OR u.site_id = $${pIdx})`;
      userParams.push(query.siteId);
      pIdx++;
    }
    if (query.division) {
      usersSql += ` AND u.division ILIKE $${pIdx}`;
      userParams.push(query.division);
      pIdx++;
    }
    usersSql += ` ORDER BY u.full_name ASC`;

    const users = await this.db.query<any>(usersSql, userParams);

    const attSql = `
      SELECT 
        a.user_id as "userId",
        to_char(a.attendance_date, 'YYYY-MM-DD') as "date",
        a.status_type as "statusType",
        COALESCE(a.overtime_minutes, 0) as "overtimeMinutes"
      FROM attendances a
      WHERE a.attendance_date >= $1 AND a.attendance_date <= $2
    `;
    const attendances = await this.db.query<any>(attSql, [startDate, endDate]);

    const userAttMap = new Map<string, any[]>();
    for (const att of attendances) {
      if (!userAttMap.has(att.userId)) userAttMap.set(att.userId, []);
      userAttMap.get(att.userId)!.push(att);
    }

    return users.map((u) => {
      const records = userAttMap.get(u.id) || [];
      let hadirCount = 0;
      let lupaAbsenCount = 0;
      let izinCount = 0;
      let totalOvertimeHours = 0;

      for (const r of records) {
        if (r.statusType === 2) {
          hadirCount++;
          totalOvertimeHours += Number(r.overtimeMinutes) / 60;
        } else if (r.statusType === 1) {
          if (r.date < todayStr) {
            lupaAbsenCount++;
          } else {
            hadirCount++;
          }
        } else if (r.statusType === 3) {
          izinCount++;
        }
      }

      const gajiPokok = Number(u.gajiPokok);
      const tunjangan = Number(u.tunjangan);
      const lemburNominal = Math.round(totalOvertimeHours * Number(u.lemburPerJam));
      const potonganLupa = lupaAbsenCount * Number(u.potonganLupaAbsen);
      const potonganBpjs = Number(u.potonganBpjs);
      const totalPotongan = potonganLupa + potonganBpjs;
      const gajiDiterima = Math.max(0, gajiPokok + tunjangan + lemburNominal - totalPotongan);

      return {
        userId: u.id,
        fullName: u.fullName,
        division: u.division,
        role: u.role,
        siteName: u.siteName,
        month: targetMonth,
        year: targetYear,
        hadirCount,
        lupaAbsenCount,
        izinCount,
        gajiPokok,
        tunjangan,
        lemburNominal,
        totalPotongan,
        gajiDiterima,
      };
    });
  }

  /**
   * Chief Supervisory Evaluations
   */
  async getChiefEvaluations(siteId?: string) {
    let sql = `
      SELECT 
        ce.id, ce.site_id as "siteId", s.name as "siteName",
        ce.chief_id as "chiefId", u_chief.full_name as "chiefName",
        ce.komandan_id as "komandanId", u_kom.full_name as "komandanName",
        ce.discipline_score as "disciplineScore",
        ce.coordination_score as "coordinationScore",
        ce.attendance_score as "attendanceScore",
        ce.incident_notes as "incidentNotes",
        ce.created_at as "createdAt"
      FROM chief_evaluations ce
      JOIN sites s ON ce.site_id = s.id
      JOIN users u_chief ON ce.chief_id = u_chief.id
      JOIN users u_kom ON ce.komandan_id = u_kom.id
    `;
    const params: any[] = [];
    if (siteId) {
      sql += ` WHERE ce.site_id = $1`;
      params.push(siteId);
    }
    sql += ` ORDER BY ce.created_at DESC`;
    return this.db.query(sql, params);
  }

  async createChiefEvaluation(chiefId: string, dto: any) {
    const sql = `
      INSERT INTO chief_evaluations (
        site_id, chief_id, komandan_id, discipline_score, coordination_score, attendance_score, incident_notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    return this.db.queryOne(sql, [
      dto.siteId,
      chiefId,
      dto.komandanId,
      dto.disciplineScore || 100,
      dto.coordinationScore || 100,
      dto.attendanceScore || 100,
      dto.incidentNotes || null,
    ]);
  }

  /**
   * Komandan Shift / Handover Logs
   */
  async getKomandanLogs(siteId?: string) {
    let sql = `
      SELECT 
        sh.id, sh.site_id as "siteId", s.name as "siteName",
        sh.danru_id as "danruId", u.full_name as "danruName",
        sh.shift_name as "shiftName",
        sh.handover_time as "handoverTime",
        sh.personnel_on_duty_count as "personnelOnDutyCount",
        sh.general_notes as "generalNotes"
      FROM shift_handovers sh
      JOIN sites s ON sh.site_id = s.id
      JOIN users u ON sh.danru_id = u.id
    `;
    const params: any[] = [];
    if (siteId) {
      sql += ` WHERE sh.site_id = $1`;
      params.push(siteId);
    }
    sql += ` ORDER BY sh.handover_time DESC`;
    return this.db.query(sql, params);
  }

  /**
   * Staff Activity Logs
   */
  async getStaffActivities(siteId?: string) {
    let sql = `
      SELECT 
        sal.id, sal.site_id as "siteId", s.name as "siteName",
        sal.user_id as "userId", u.full_name as "staffName",
        sal.activity_type as "activityType",
        sal.description,
        sal.status,
        sal.created_at as "createdAt"
      FROM staff_activity_logs sal
      JOIN sites s ON sal.site_id = s.id
      JOIN users u ON sal.user_id = u.id
    `;
    const params: any[] = [];
    if (siteId) {
      sql += ` WHERE sal.site_id = $1`;
      params.push(siteId);
    }
    sql += ` ORDER BY sal.created_at DESC`;
    return this.db.query(sql, params);
  }

  async createStaffActivity(userId: string, dto: any) {
    const sql = `
      INSERT INTO staff_activity_logs (site_id, user_id, activity_type, description, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    return this.db.queryOne(sql, [
      dto.siteId,
      userId,
      dto.activityType,
      dto.description || '',
      dto.status || 'COMPLETED',
    ]);
  }
}

