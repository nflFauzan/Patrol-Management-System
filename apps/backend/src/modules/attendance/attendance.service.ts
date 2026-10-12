import { Injectable, BadRequestException, NotFoundException, Optional, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { EventsGateway } from '../gateway/events.gateway';
import { ClockInRequestDto, ClockOutRequestDto, LeaveRequestDto, Attendance, AttendanceStatus } from '@patrol/types';

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
      clockInPhotoUrl: row.clockInPhotoUrl || null,
      clockInWithinGeofence: isClockInWithinGeofence,
      clockInDistanceMeters: row.clockInDistanceMeters !== null ? Number(row.clockInDistanceMeters) : null,
      clockOutTime: row.clockOutTime || null,
      clockOutLatitude: row.clockOutLatitude ? Number(row.clockOutLatitude) : null,
      clockOutLongitude: row.clockOutLongitude ? Number(row.clockOutLongitude) : null,
      clockOutPhotoUrl: row.clockOutPhotoUrl || null,
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
    const photoKey = dto.photoBase64 ? `selfie_in_${userId}_${Date.now()}.jpg` : null;

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

    const photoKey = dto.photoBase64 ? `selfie_out_${userId}_${Date.now()}.jpg` : null;

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

    const attachmentKey = dto.attachmentBase64 ? `leave_${userId}_${Date.now()}.jpg` : null;

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
}
