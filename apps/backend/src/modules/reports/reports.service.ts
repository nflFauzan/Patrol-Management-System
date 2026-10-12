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
}
