import { Injectable, BadRequestException, NotFoundException, Optional, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { EventsGateway } from '../gateway/events.gateway';
import { saveBase64Image, normalizePhotoUrl } from '../../common/utils/file-upload.util';
import { 
  ClockInRequestDto, 
  ClockOutRequestDto, 
  LeaveRequestDto, 
  Attendance, 
  AttendanceStatus,
  AttendanceMatrixResponse,
  AttendanceMatrixRow,
  AttendanceMatrixDay,
  AttendanceMatrixStatusCode,
  UserRole,
  Division,
  AttendanceFilterDto,
  AttendanceRecordsResponse,
  AttendanceRecordItem,
  AttendanceDetailResponse,
  AttendancePersonilOption
} from '@patrol/types';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    private db: DatabaseService,
    @Optional() private eventsGateway?: EventsGateway,
  ) {}

  /**
   * Helper to map DB row to Attendance domain object
   */
  private mapRowToAttendance(row: any): Attendance {
    const isClockInWithinGeofence = row.clockInDistanceMeters !== null 
      ? Number(row.clockInDistanceMeters) <= (row.geofenceRadiusMeters || 100)
      : true;

    const isClockOutWithinGeofence = row.clockOutDistanceMeters !== null
      ? Number(row.clockOutDistanceMeters) <= (row.geofenceRadiusMeters || 100)
      : null;

    let status = AttendanceStatus.IN;
    if (row.statusType === 2) status = AttendanceStatus.OUT;
    else if (row.statusType === 3) {
      status = row.leaveReason?.toLowerCase().includes('sakit') 
        ? AttendanceStatus.SICK 
        : AttendanceStatus.PERMISSION;
    }

    const workDurationMins = Number(row.workDurationMinutes || 0);
    const overtimeMins = Number(row.overtimeMinutes || 0);

    return {
      id: row.id,
      userId: row.userId,
      siteId: row.siteId,
      shiftId: row.shiftName || 'SHIFT_PAGI',
      division: row.division || 'SECURITY',
      date: typeof row.date === 'string' ? row.date : row.date?.toISOString()?.split('T')[0],
      clockInTime: row.clockInTime || null,
      clockInLatitude: row.clockInLatitude ? Number(row.clockInLatitude) : null,
      clockInLongitude: row.clockInLongitude ? Number(row.clockInLongitude) : null,
      clockInPhotoUrl: normalizePhotoUrl(row.clockInPhotoUrl),
      clockInWithinGeofence: isClockInWithinGeofence,
      clockInDistanceMeters: row.clockInDistanceMeters !== null ? Number(row.clockInDistanceMeters) : null,
      clockOutTime: row.clockOutTime || null,
      clockOutLatitude: row.clockOutLatitude ? Number(row.clockOutLatitude) : null,
      clockOutLongitude: row.clockOutLongitude ? Number(row.clockOutLongitude) : null,
      clockOutPhotoUrl: normalizePhotoUrl(row.clockOutPhotoUrl),
      clockOutWithinGeofence: isClockOutWithinGeofence,
      clockOutDistanceMeters: row.clockOutDistanceMeters !== null ? Number(row.clockOutDistanceMeters) : null,
      status,
      leaveReason: row.leaveReason || null,
      leaveAttachmentUrl: row.attachmentKey || null,
      lateMinutes: Number(row.lateMinutes || 0),
      earlyDepartureMinutes: 0,
      effectiveWorkingMinutes: workDurationMins,
      isOvertime: overtimeMins > 0,
      overtimeMinutes: overtimeMins,
      notes: row.notes || null,
      createdAt: row.createdAt || new Date().toISOString(),
      updatedAt: row.createdAt || new Date().toISOString(),
    };
  }

  async getTodayStatus(userId: string): Promise<Attendance | null> {
    const sql = `
      SELECT 
        a.id, a.user_id AS "userId", a.site_id AS "siteId", a.attendance_date AS "date",
        a.status_type AS "statusType", a.shift_name AS "shiftName",
        a.clock_in_at AS "clockInTime",
        ST_Y(a.clock_in_coordinates::geometry) AS "clockInLatitude",
        ST_X(a.clock_in_coordinates::geometry) AS "clockInLongitude",
        a.clock_in_photo_key AS "clockInPhotoUrl",
        a.clock_in_distance_meters AS "clockInDistanceMeters",
        a.is_late AS "isLate", a.late_minutes AS "lateMinutes",
        a.clock_out_at AS "clockOutTime",
        ST_Y(a.clock_out_coordinates::geometry) AS "clockOutLatitude",
        ST_X(a.clock_out_coordinates::geometry) AS "clockOutLongitude",
        a.clock_out_photo_key AS "clockOutPhotoUrl",
        a.clock_out_distance_meters AS "clockOutDistanceMeters",
        a.work_duration_minutes AS "workDurationMinutes",
        a.overtime_minutes AS "overtimeMinutes",
        a.reason AS "leaveReason", a.notes, a.created_at AS "createdAt",
        u.division, s.geofence_radius_meters AS "geofenceRadiusMeters"
      FROM attendances a
      JOIN users u ON a.user_id = u.id
      JOIN sites s ON a.site_id = s.id
      WHERE a.user_id = $1 AND a.attendance_date = CURRENT_DATE
      ORDER BY a.created_at DESC
      LIMIT 1
    `;

    const row = await this.db.queryOne<any>(sql, [userId]);
    return row ? this.mapRowToAttendance(row) : null;
  }

  /**
   * Helper: Calculate late minutes based on shift time and grace period
   */
  calculateLateMinutes(checkInDate: Date, shiftStartTimeStr: string, gracePeriodMinutes = 15): number {
    const [hours, mins] = shiftStartTimeStr.split(':').map(Number);
    const shiftStart = new Date(checkInDate);
    shiftStart.setHours(hours, mins, 0, 0);

    const diffMs = checkInDate.getTime() - shiftStart.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins > gracePeriodMinutes) {
      return diffMins - gracePeriodMinutes;
    }
    return 0;
  }

  /**
   * Helper: Calculate working duration and overtime (handles night shifts)
   */
  calculateWorkingHours(clockInDate: Date, clockOutDate: Date): { durationMinutes: number; overtimeMinutes: number } {
    let diffMs = clockOutDate.getTime() - clockInDate.getTime();
    if (diffMs < 0) {
      // Cross-midnight adjustment
      diffMs += 24 * 60 * 60 * 1000;
    }

    const durationMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)));
    const standardShiftMinutes = 480; // 8 hours standard
    const overtimeMinutes = Math.max(0, durationMinutes - standardShiftMinutes);

    return { durationMinutes, overtimeMinutes };
  }

  async clockIn(userId: string, dto: ClockInRequestDto): Promise<Attendance> {
    // 1. Verify not already clocked in today
    const existing = await this.getTodayStatus(userId);
    if (existing && existing.clockInTime) {
      throw new BadRequestException('You have already clocked in today');
    }

    // 2. PostGIS Geofence Verification
    const geofence = await this.db.checkSiteGeofence(dto.siteId, dto.latitude, dto.longitude);

    // 3. User & Site details for shift
    const user = await this.db.queryOne<any>(`SELECT full_name, division FROM users WHERE id = $1`, [userId]);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const site = await this.db.queryOne<any>(
      `SELECT name, shift_pagi_in, geofence_radius_meters FROM sites WHERE id = $1`,
      [dto.siteId],
    );

    const shiftStartTime = site?.shift_pagi_in || '07:00:00';
    const now = new Date();
    const lateMinutes = this.calculateLateMinutes(now, shiftStartTime, 15);
    const isLate = lateMinutes > 0;

    // 4. Save photo key if provided
    const photoKey = dto.photoBase64 ? saveBase64Image(dto.photoBase64, 'selfie_in', userId) : null;

    // 5. Insert attendance record
    const insertSql = `
      INSERT INTO attendances (
        user_id, site_id, attendance_date, status_type, shift_name,
        clock_in_at, clock_in_coordinates, clock_in_photo_key,
        clock_in_distance_meters, is_late, late_minutes, notes
      )
      VALUES (
        $1, $2, CURRENT_DATE, 1, 'Shift Pagi (07:00 - 15:00)',
        CURRENT_TIMESTAMP, ST_SetSRID(ST_MakePoint($4, $3), 4326),
        $5, $6, $7, $8, $9
      )
      RETURNING 
        id, user_id AS "userId", site_id AS "siteId", attendance_date AS "date",
        status_type AS "statusType", shift_name AS "shiftName",
        clock_in_at AS "clockInTime",
        ST_Y(clock_in_coordinates::geometry) AS "clockInLatitude",
        ST_X(clock_in_coordinates::geometry) AS "clockInLongitude",
        clock_in_photo_key AS "clockInPhotoUrl",
        clock_in_distance_meters AS "clockInDistanceMeters",
        is_late AS "isLate", late_minutes AS "lateMinutes",
        clock_out_at AS "clockOutTime",
        clock_out_distance_meters AS "clockOutDistanceMeters",
        work_duration_minutes AS "workDurationMinutes",
        overtime_minutes AS "overtimeMinutes",
        reason AS "leaveReason", notes, created_at AS "createdAt"
    `;

    const row = await this.db.queryOne<any>(insertSql, [
      userId,
      dto.siteId,
      dto.latitude,
      dto.longitude,
      photoKey,
      geofence.distanceMeters,
      isLate,
      lateMinutes,
      dto.notes || null,
    ]);

    const attendance = this.mapRowToAttendance({
      ...row,
      division: user.division,
      geofenceRadiusMeters: site?.geofence_radius_meters || 100,
    });

    // 6. Broadcast real-time WebSocket event to Command Center
    if (this.eventsGateway?.server) {
      this.eventsGateway.server.emit('attendance:clock_in', {
        attendance,
        user,
        site: { name: site?.name },
      });
      this.logger.log(`Real-time WebSocket broadcast: attendance:clock_in for ${user.full_name}`);
    }

    return attendance;
  }

  async clockOut(userId: string, dto: ClockOutRequestDto): Promise<Attendance> {
    const existing = await this.db.queryOne<any>(
      `
      SELECT 
        a.*, u.full_name, u.division, s.name as site_name, s.geofence_radius_meters
      FROM attendances a
      JOIN users u ON a.user_id = u.id
      JOIN sites s ON a.site_id = s.id
      WHERE a.id = $1 AND a.user_id = $2
    `,
      [dto.attendanceId, userId],
    );

    if (!existing) {
      throw new NotFoundException('Attendance record not found');
    }

    if (existing.clock_out_at) {
      throw new BadRequestException('You have already clocked out for this attendance record');
    }

    // Geofence check on clock out
    const geofence = await this.db.checkSiteGeofence(existing.site_id, dto.latitude, dto.longitude);

    // Calculate effective working duration and overtime
    const clockInDate = new Date(existing.clock_in_at);
    const now = new Date();
    const { durationMinutes, overtimeMinutes } = this.calculateWorkingHours(clockInDate, now);

    const photoKey = dto.photoBase64 ? saveBase64Image(dto.photoBase64, 'selfie_out', userId) : null;

    const updateSql = `
      UPDATE attendances
      SET 
        clock_out_at = CURRENT_TIMESTAMP,
        clock_out_coordinates = ST_SetSRID(ST_MakePoint($3, $2), 4326),
        clock_out_photo_key = $4,
        clock_out_distance_meters = $5,
        status_type = 2,
        work_duration_minutes = $6,
        overtime_minutes = $7,
        notes = COALESCE($8, notes)
      WHERE id = $1
      RETURNING 
        id, user_id AS "userId", site_id AS "siteId", attendance_date AS "date",
        status_type AS "statusType", shift_name AS "shiftName",
        clock_in_at AS "clockInTime",
        ST_Y(clock_in_coordinates::geometry) AS "clockInLatitude",
        ST_X(clock_in_coordinates::geometry) AS "clockInLongitude",
        clock_in_photo_key AS "clockInPhotoUrl",
        clock_in_distance_meters AS "clockInDistanceMeters",
        is_late AS "isLate", late_minutes AS "lateMinutes",
        clock_out_at AS "clockOutTime",
        ST_Y(clock_out_coordinates::geometry) AS "clockOutLatitude",
        ST_X(clock_out_coordinates::geometry) AS "clockOutLongitude",
        clock_out_photo_key AS "clockOutPhotoUrl",
        clock_out_distance_meters AS "clockOutDistanceMeters",
        work_duration_minutes AS "workDurationMinutes",
        overtime_minutes AS "overtimeMinutes",
        reason AS "leaveReason", notes, created_at AS "createdAt"
    `;

    const row = await this.db.queryOne<any>(updateSql, [
      dto.attendanceId,
      dto.latitude,
      dto.longitude,
      photoKey,
      geofence.distanceMeters,
      durationMinutes,
      overtimeMinutes,
      dto.notes || null,
    ]);

    const attendance = this.mapRowToAttendance({
      ...row,
      division: existing.division,
      geofenceRadiusMeters: existing.geofence_radius_meters,
    });

    // Broadcast real-time WebSocket event
    if (this.eventsGateway?.server) {
      this.eventsGateway.server.emit('attendance:clock_out', {
        attendance,
        user: { full_name: existing.full_name, division: existing.division },
        site: { name: existing.site_name },
      });
      this.logger.log(`Real-time WebSocket broadcast: attendance:clock_out for ${existing.full_name}`);
    }

    return attendance;
  }

  async leaveRequest(userId: string, dto: LeaveRequestDto): Promise<Attendance> {
    const user = await this.db.queryOne<any>(`SELECT division FROM users WHERE id = $1`, [userId]);
    if (!user) throw new NotFoundException('User not found');

    const attachmentKey = dto.attachmentBase64 ? saveBase64Image(dto.attachmentBase64, 'leave', userId) : null;

    const sql = `
      INSERT INTO attendances (
        user_id, site_id, attendance_date, status_type, reason, attachment_key
      )
      VALUES ($1, $2, $3, 3, $4, $5)
      RETURNING 
        id, user_id AS "userId", site_id AS "siteId", attendance_date AS "date",
        status_type AS "statusType", shift_name AS "shiftName",
        reason AS "leaveReason", attachment_key AS "attachmentKey",
        created_at AS "createdAt"
    `;

    const row = await this.db.queryOne<any>(sql, [
      userId,
      dto.siteId,
      dto.date,
      dto.leaveReason,
      attachmentKey,
    ]);

    return this.mapRowToAttendance({
      ...row,
      division: user.division,
      geofenceRadiusMeters: 100,
    });
  }

  /**
   * 100% Parity with patroli.site: Monitoring Absensi Matriks 1-31 Hari
   */
  async getAttendanceMatrix(query: { month?: string; siteId?: string; division?: string }): Promise<AttendanceMatrixResponse> {
    const targetMonth = query.month || new Date().toISOString().slice(0, 7); // 'YYYY-MM'
    const [yearStr, monthStr] = targetMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const totalDays = new Date(year, month, 0).getDate();
    const startDate = `${targetMonth}-01`;
    const endDate = `${targetMonth}-${String(totalDays).padStart(2, '0')}`;
    const todayStr = new Date().toISOString().slice(0, 10);

    // 1. Fetch Users matching site/division filter
    let usersSql = `
      SELECT DISTINCT 
        u.id, u.full_name as "fullName", u.division, u.role,
        COALESCE(s.name, 'All Sites') as "siteName"
      FROM users u
      LEFT JOIN user_site_assignments usa ON u.id = usa.user_id
      LEFT JOIN sites s ON usa.site_id = s.id
      WHERE u.is_active = true
    `;
    const userParams: any[] = [];
    let pIdx = 1;

    if (query.siteId && query.siteId !== 'ALL') {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(query.siteId);
      if (isUuid) {
        usersSql += ` AND (usa.site_id = $${pIdx} OR u.site_id = $${pIdx})`;
        userParams.push(query.siteId);
        pIdx++;
      } else {
        usersSql += ` AND s.name ILIKE $${pIdx}`;
        userParams.push(`%${query.siteId}%`);
        pIdx++;
      }
    }
    if (query.division && query.division !== 'ALL') {
      usersSql += ` AND (u.division ILIKE $${pIdx} OR u.role ILIKE $${pIdx})`;
      userParams.push(`%${query.division}%`);
      pIdx++;
    }
    usersSql += ` ORDER BY u.full_name ASC`;

    const userRows = await this.db.query<any>(usersSql, userParams);

    // 2. Fetch all attendances in this date range
    const attSql = `
      SELECT 
        a.user_id as "userId",
        to_char(a.attendance_date, 'YYYY-MM-DD') as "date",
        EXTRACT(DAY FROM a.attendance_date)::int as "dayNumber",
        a.status_type as "statusType",
        to_char(a.clock_in_at, 'HH24:MI') as "clockInTime",
        to_char(a.clock_out_at, 'HH24:MI') as "clockOutTime"
      FROM attendances a
      WHERE a.attendance_date >= $1 AND a.attendance_date <= $2
    `;
    const attRows = await this.db.query<any>(attSql, [startDate, endDate]);

    // Map attendances: userId -> dayNumber -> record
    const attMap = new Map<string, Map<number, any>>();
    for (const row of attRows) {
      if (!attMap.has(row.userId)) {
        attMap.set(row.userId, new Map());
      }
      attMap.get(row.userId)!.set(row.dayNumber, row);
    }

    // 3. Build Matrix Rows
    const rows: AttendanceMatrixRow[] = userRows.map((u) => {
      const userAtt = attMap.get(u.id);
      const days: Record<number, AttendanceMatrixDay> = {};
      let totalHadir = 0;
      let totalLupaAbsen = 0;
      let totalIzin = 0;

      for (let d = 1; d <= totalDays; d++) {
        const rec = userAtt ? userAtt.get(d) : undefined;
        const currentDayStr = `${targetMonth}-${String(d).padStart(2, '0')}`;

        if (!rec) {
          days[d] = { day: d, status: AttendanceMatrixStatusCode.OFF };
        } else if (rec.statusType === 2) {
          const isCrossMidnight = rec.clockOutTime && rec.clockInTime && rec.clockOutTime < rec.clockInTime;
          const status = isCrossMidnight ? AttendanceMatrixStatusCode.PULANG_CROSS_MIDNIGHT : AttendanceMatrixStatusCode.PULANG;
          days[d] = {
            day: d,
            status,
            clockInTime: rec.clockInTime,
            clockOutTime: rec.clockOutTime,
            shiftColor: '#4caf50',
            logs: [
              { type: 'M', time: rec.clockInTime, shiftColor: '#4caf50' },
              { type: isCrossMidnight ? 'P+' : 'P', time: rec.clockOutTime, shiftColor: '#4caf50' },
            ],
          };
          totalHadir++;
        } else if (rec.statusType === 1) {
          if (currentDayStr < todayStr) {
            days[d] = {
              day: d,
              status: AttendanceMatrixStatusCode.LUPA_ABSEN,
              clockInTime: rec.clockInTime,
              shiftColor: '#607d8b',
              logs: [
                { type: 'M', time: rec.clockInTime, shiftColor: '#607d8b' },
                { type: 'X', shiftColor: '#607d8b' },
              ],
            };
            totalLupaAbsen++;
          } else {
            days[d] = {
              day: d,
              status: AttendanceMatrixStatusCode.MASUK,
              clockInTime: rec.clockInTime,
              shiftColor: '#03a9f4',
              logs: [
                { type: 'M', time: rec.clockInTime, shiftColor: '#03a9f4' },
              ],
            };
            totalHadir++;
          }
        } else if (rec.statusType === 3) {
          days[d] = { day: d, status: AttendanceMatrixStatusCode.OFF };
          totalIzin++;
        } else {
          days[d] = { day: d, status: AttendanceMatrixStatusCode.OFF };
        }
      }

      return {
        userId: u.id,
        fullName: u.fullName,
        siteName: u.siteName,
        division: u.division as Division,
        role: u.role as UserRole,
        days,
        totalHadir,
        totalLupaAbsen,
        totalIzin,
      };
    });

    return {
      month: targetMonth,
      siteId: query.siteId,
      division: query.division as Division,
      totalDays,
      rows,
    };
  }

  async getUserHistory(userId: string, limit = 30): Promise<Attendance[]> {
    const sql = `
      SELECT 
        a.id, a.user_id AS "userId", a.site_id AS "siteId", a.attendance_date AS "date",
        a.status_type AS "statusType", a.shift_name AS "shiftName",
        a.clock_in_at AS "clockInTime",
        ST_Y(a.clock_in_coordinates::geometry) AS "clockInLatitude",
        ST_X(a.clock_in_coordinates::geometry) AS "clockInLongitude",
        a.clock_in_photo_key AS "clockInPhotoUrl",
        a.clock_in_distance_meters AS "clockInDistanceMeters",
        a.is_late AS "isLate", a.late_minutes AS "lateMinutes",
        a.clock_out_at AS "clockOutTime",
        ST_Y(a.clock_out_coordinates::geometry) AS "clockOutLatitude",
        ST_X(a.clock_out_coordinates::geometry) AS "clockOutLongitude",
        a.clock_out_photo_key AS "clockOutPhotoUrl",
        a.clock_out_distance_meters AS "clockOutDistanceMeters",
        a.work_duration_minutes AS "workDurationMinutes",
        a.overtime_minutes AS "overtimeMinutes",
        a.reason AS "leaveReason", a.notes, a.created_at AS "createdAt",
        u.division, s.geofence_radius_meters AS "geofenceRadiusMeters"
      FROM attendances a
      JOIN users u ON a.user_id = u.id
      JOIN sites s ON a.site_id = s.id
      WHERE a.user_id = $1
      ORDER BY a.attendance_date DESC, a.created_at DESC
      LIMIT $2
    `;

    const rows = await this.db.query<any>(sql, [userId, limit]);
    return rows.map((r) => this.mapRowToAttendance(r));
  }

  private formatIndonesianDate(d: Date): string {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayName = days[d.getDay()];
    const day = d.getDate();
    const monthName = months[d.getMonth()];
    const year = d.getFullYear();
    return `${dayName}, ${day} ${monthName} ${year}`;
  }

  private formatTime(d: Date): string {
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }

  private formatLateDuration(minutes: number): string {
    if (!minutes || minutes <= 0) return '0 menit';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const parts: string[] = [];
    if (h > 0) parts.push(`${h} jam`);
    if (m > 0 || h === 0) parts.push(`${m} menit`);
    return parts.join(' ');
  }

  /**
   * 100% Parity Server-side Presensi (patroli.site/serverside-presensi.php)
   */
  async getAttendanceRecords(filter: AttendanceFilterDto): Promise<AttendanceRecordsResponse> {
    const page = Math.max(1, Number(filter.page) || 1);
    const limit = Math.max(1, Math.min(1000, Number(filter.limit) || 5));
    const offset = (page - 1) * limit;

    const conditions: string[] = ['1=1'];
    const params: any[] = [];
    let paramIndex = 1;

    if (filter.siteName && filter.siteName.trim()) {
      conditions.push(`s.name ILIKE $${paramIndex}`);
      params.push(`%${filter.siteName.trim()}%`);
      paramIndex++;
    }

    if (filter.division && filter.division.trim()) {
      conditions.push(`u.division ILIKE $${paramIndex}`);
      params.push(`%${filter.division.trim()}%`);
      paramIndex++;
    }

    if (filter.userName && filter.userName.trim()) {
      conditions.push(`u.full_name ILIKE $${paramIndex}`);
      params.push(`%${filter.userName.trim()}%`);
      paramIndex++;
    }

    if (filter.search && filter.search.trim()) {
      const q = `%${filter.search.trim()}%`;
      conditions.push(`(u.full_name ILIKE $${paramIndex} OR s.name ILIKE $${paramIndex} OR u.division ILIKE $${paramIndex})`);
      params.push(q);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    // Total records
    const countSql = `
      SELECT COUNT(*) as total
      FROM attendances a
      JOIN users u ON a.user_id = u.id
      JOIN sites s ON a.site_id = s.id
      WHERE ${whereClause}
    `;
    const countRes = await this.db.queryOne<{ total: string }>(countSql, params);
    const recordsTotal = countRes ? parseInt(countRes.total, 10) : 0;

    // Fetch records
    const dataSql = `
      SELECT 
        a.id,
        a.user_id AS "userId",
        a.site_id AS "siteId",
        s.name AS "siteName",
        u.full_name AS "personilName",
        u.division AS "division",
        u.photo_key AS "userAvatar",
        a.attendance_date AS "date",
        a.clock_in_at AS "clockInTime",
        ST_Y(a.clock_in_coordinates::geometry) AS "clockInLatitude",
        ST_X(a.clock_in_coordinates::geometry) AS "clockInLongitude",
        a.clock_in_photo_key AS "clockInPhotoUrl",
        a.clock_in_distance_meters AS "clockInDistanceMeters",
        a.is_late AS "isLate",
        a.late_minutes AS "lateMinutes",
        a.clock_out_at AS "clockOutTime",
        ST_Y(a.clock_out_coordinates::geometry) AS "clockOutLatitude",
        ST_X(a.clock_out_coordinates::geometry) AS "clockOutLongitude",
        a.clock_out_photo_key AS "clockOutPhotoUrl",
        a.clock_out_distance_meters AS "clockOutDistanceMeters",
        s.geofence_radius_meters AS "geofenceRadiusMeters",
        ST_Y(s.location_coordinates::geometry) AS "siteLatitude",
        ST_X(s.location_coordinates::geometry) AS "siteLongitude"
      FROM attendances a
      JOIN users u ON a.user_id = u.id
      JOIN sites s ON a.site_id = s.id
      WHERE ${whereClause}
      ORDER BY a.clock_in_at DESC, a.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const dataParams = [...params, limit, offset];
    const rows = await this.db.query<any>(dataSql, dataParams);

    const items: AttendanceRecordItem[] = rows.map((r) => {
      const clockInDate = r.clockInTime ? new Date(r.clockInTime) : new Date(r.date);
      const clockOutDate = r.clockOutTime ? new Date(r.clockOutTime) : null;
      const geofenceRadius = Number(r.geofenceRadiusMeters) || 100;

      const clockInDist = r.clockInDistanceMeters !== null ? Number(r.clockInDistanceMeters) : null;
      const clockInWithinGeofence = clockInDist !== null ? clockInDist <= geofenceRadius : true;

      const clockOutDist = r.clockOutDistanceMeters !== null ? Number(r.clockOutDistanceMeters) : null;
      const clockOutWithinGeofence = clockOutDist !== null ? clockOutDist <= geofenceRadius : null;

      const lateMins = Number(r.lateMinutes) || 0;
      const isLate = Boolean(r.isLate) || lateMins > 0;

      const isClockedOut = Boolean(r.clockOutTime);
      const isLupaAbsenPulang = !isClockedOut && (new Date().getTime() - clockInDate.getTime()) > 16 * 60 * 60 * 1000;

      return {
        id: r.id,
        siteName: r.siteName,
        division: r.division,
        personilName: r.personilName,
        userAvatar: r.userAvatar || null,
        clockInDateStr: this.formatIndonesianDate(clockInDate),
        clockInTimeStr: this.formatTime(clockInDate),
        isLate,
        lateText: isLate ? this.formatLateDuration(lateMins) : null,
        clockInWithinGeofence,
        clockInLatitude: r.clockInLatitude ? Number(r.clockInLatitude) : null,
        clockInLongitude: r.clockInLongitude ? Number(r.clockInLongitude) : null,
        clockInPhotoUrl: normalizePhotoUrl(r.clockInPhotoUrl),
        clockInDistanceMeters: clockInDist,
        isClockedOut,
        isLupaAbsenPulang,
        clockOutDateStr: clockOutDate ? this.formatIndonesianDate(clockOutDate) : null,
        clockOutTimeStr: clockOutDate ? this.formatTime(clockOutDate) : null,
        clockOutWithinGeofence,
        clockOutLatitude: r.clockOutLatitude ? Number(r.clockOutLatitude) : null,
        clockOutLongitude: r.clockOutLongitude ? Number(r.clockOutLongitude) : null,
        clockOutPhotoUrl: normalizePhotoUrl(r.clockOutPhotoUrl),
        clockOutDistanceMeters: clockOutDist,
        siteLatitude: r.siteLatitude ? Number(r.siteLatitude) : null,
        siteLongitude: r.siteLongitude ? Number(r.siteLongitude) : null,
      };
    });

    return {
      draw: 1,
      recordsTotal,
      recordsFiltered: recordsTotal,
      data: items,
    };
  }

  /**
   * 100% Parity Detail Absen (patroli.site/detail-absen.php)
   */
  async getAttendanceDetail(id: string): Promise<AttendanceDetailResponse> {
    const sql = `
      SELECT 
        a.id,
        a.user_id AS "userId",
        u.full_name AS "personilName",
        u.photo_key AS "userAvatar",
        u.division AS "division",
        s.name AS "siteName",
        a.clock_in_at AS "clockInTime",
        ST_Y(a.clock_in_coordinates::geometry) AS "clockInLatitude",
        ST_X(a.clock_in_coordinates::geometry) AS "clockInLongitude",
        a.clock_in_photo_key AS "clockInPhotoUrl",
        a.clock_in_distance_meters AS "clockInDistanceMeters",
        a.clock_out_at AS "clockOutTime",
        ST_Y(a.clock_out_coordinates::geometry) AS "clockOutLatitude",
        ST_X(a.clock_out_coordinates::geometry) AS "clockOutLongitude",
        a.clock_out_photo_key AS "clockOutPhotoUrl",
        a.clock_out_distance_meters AS "clockOutDistanceMeters",
        s.geofence_radius_meters AS "geofenceRadiusMeters",
        ST_Y(s.location_coordinates::geometry) AS "siteLatitude",
        ST_X(s.location_coordinates::geometry) AS "siteLongitude"
      FROM attendances a
      JOIN users u ON a.user_id = u.id
      JOIN sites s ON a.site_id = s.id
      WHERE a.id = $1
      LIMIT 1
    `;

    const row = await this.db.queryOne<any>(sql, [id]);
    if (!row) {
      throw new NotFoundException(`Data absensi dengan ID ${id} tidak ditemukan`);
    }

    const clockInDate = row.clockInTime ? new Date(row.clockInTime) : new Date();
    const clockOutDate = row.clockOutTime ? new Date(row.clockOutTime) : null;

    const clockInDateFull = `${this.formatIndonesianDate(clockInDate)} | ${this.formatTime(clockInDate)}`;
    const clockOutDateFull = clockOutDate 
      ? `${this.formatIndonesianDate(clockOutDate)} | ${this.formatTime(clockOutDate)}`
      : 'Hari tidak valid, 30 Nov -0001 | 00:00:00';

    const siteLat = Number(row.siteLatitude) || -6.2088;
    const siteLon = Number(row.siteLongitude) || 106.8456;

    const clockInLat = row.clockInLatitude ? Number(row.clockInLatitude) : siteLat;
    const clockInLon = row.clockInLongitude ? Number(row.clockInLongitude) : siteLon;

    const clockOutLat = row.clockOutLatitude ? Number(row.clockOutLatitude) : 0;
    const clockOutLon = row.clockOutLongitude ? Number(row.clockOutLongitude) : 0;

    const locationsIn = [
      {
        lat: clockInLat,
        lon: clockInLon,
        label: `Lokasi absen masuk ${row.personilName}`,
        personilName: row.personilName,
      },
      {
        lat: siteLat,
        lon: siteLon,
        label: 'Lokasi Area / Site',
      },
    ];

    const locationsOut = [
      {
        lat: clockOutLat,
        lon: clockOutLon,
        label: `Lokasi absen pulang ${row.personilName}`,
        personilName: row.personilName,
      },
      {
        lat: siteLat,
        lon: siteLon,
        label: 'Lokasi Area / Site',
      },
    ];

    return {
      id: row.id,
      userId: row.userId,
      personilName: row.personilName,
      siteName: row.siteName,
      division: row.division,
      userAvatar: row.userAvatar || null,
      clockInDateFull,
      clockOutDateFull,
      clockInPhotoUrl: row.clockInPhotoUrl || null,
      clockOutPhotoUrl: row.clockOutPhotoUrl || null,
      locationsIn,
      locationsOut,
      distanceInMeters: row.clockInDistanceMeters ? Number(row.clockInDistanceMeters) : null,
      distanceOutMeters: row.clockOutDistanceMeters ? Number(row.clockOutDistanceMeters) : null,
    };
  }

  /**
   * 100% Parity Load Personil Filter Dropdown (patroli.site/get_absen.php)
   */
  async getPersonilOptions(siteName?: string, division?: string): Promise<AttendancePersonilOption[]> {
    const conditions: string[] = ['u.is_active = true'];
    const params: any[] = [];
    let pIdx = 1;

    if (siteName && siteName.trim()) {
      conditions.push(`s.name ILIKE $${pIdx}`);
      params.push(`%${siteName.trim()}%`);
      pIdx++;
    }

    if (division && division.trim()) {
      conditions.push(`u.division ILIKE $${pIdx}`);
      params.push(`%${division.trim()}%`);
      pIdx++;
    }

    const sql = `
      SELECT DISTINCT
        u.id,
        u.full_name AS "name",
        u.division,
        COALESCE(s.name, '') AS "siteName"
      FROM users u
      LEFT JOIN user_site_assignments usa ON u.id = usa.user_id
      LEFT JOIN sites s ON usa.site_id = s.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY u.full_name ASC
    `;

    const rows = await this.db.query<any>(sql, params);
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      division: r.division,
      siteName: r.siteName,
    }));
  }
}

