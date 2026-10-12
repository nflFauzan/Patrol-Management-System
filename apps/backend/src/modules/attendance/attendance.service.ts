import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { ClockInRequestDto, ClockOutRequestDto, LeaveRequestDto, Attendance, AttendanceStatus } from '@patrol/types';

@Injectable()
export class AttendanceService {
  constructor(private db: DatabaseService) {}

  async getTodayStatus(userId: string): Promise<Attendance | null> {
    const today = new Date().toISOString().split('T')[0];
    const row = await this.db.queryOne<any>(
      `
      SELECT 
        id, user_id AS "userId", site_id AS "siteId", shift_id AS "shiftId", division,
        date, clock_in_time AS "clockInTime", clock_in_latitude AS "clockInLatitude",
        clock_in_longitude AS "clockInLongitude", clock_in_photo_url AS "clockInPhotoUrl",
        clock_in_within_geofence AS "clockInWithinGeofence", clock_in_distance_meters AS "clockInDistanceMeters",
        clock_out_time AS "clockOutTime", clock_out_latitude AS "clockOutLatitude",
        clock_out_longitude AS "clockOutLongitude", clock_out_photo_url AS "clockOutPhotoUrl",
        clock_out_within_geofence AS "clockOutWithinGeofence", clock_out_distance_meters AS "clockOutDistanceMeters",
        status, leave_reason AS "leaveReason", leave_attachment_url AS "leaveAttachmentUrl",
        late_minutes AS "lateMinutes", early_departure_minutes AS "earlyDepartureMinutes",
        effective_working_minutes AS "effectiveWorkingMinutes", is_overtime AS "isOvertime",
        overtime_minutes AS "overtimeMinutes", notes, created_at AS "createdAt", updated_at AS "updatedAt"
      FROM attendance
      WHERE user_id = $1 AND date = $2
      ORDER BY created_at DESC
      LIMIT 1
    `,
      [userId, today],
    );

    return row || null;
  }

  async clockIn(userId: string, dto: ClockInRequestDto): Promise<Attendance> {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if already clocked in today
    const existing = await this.getTodayStatus(userId);
    if (existing && existing.clockInTime) {
      throw new BadRequestException('You have already clocked in today');
    }

    // Verify Geofence via PostGIS
    const geofence = await this.db.checkSiteGeofence(dto.siteId, dto.latitude, dto.longitude);

    // Get user division
    const user = await this.db.queryOne<any>(`SELECT division FROM users WHERE id = $1`, [userId]);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get site shift schedule if available to calculate late minutes
    const shift = await this.db.queryOne<any>(
      `SELECT id, start_time, grace_period_minutes FROM shift_schedules WHERE site_id = $1 AND division = $2 AND is_active = true LIMIT 1`,
      [dto.siteId, user.division],
    );

    let lateMinutes = 0;
    if (shift) {
      const now = new Date();
      const [shiftHours, shiftMins] = shift.start_time.split(':').map(Number);
      const shiftStartTime = new Date();
      shiftStartTime.setHours(shiftHours, shiftMins, 0, 0);

      const diffMs = now.getTime() - shiftStartTime.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins > shift.grace_period_minutes) {
        lateMinutes = diffMins - shift.grace_period_minutes;
      }
    }

    const row = await this.db.queryOne<any>(
      `
      INSERT INTO attendance (
        user_id, site_id, shift_id, division, date, clock_in_time,
        clock_in_latitude, clock_in_longitude, clock_in_photo_url,
        clock_in_within_geofence, clock_in_distance_meters, status,
        late_minutes, notes
      )
      VALUES (
        $1, $2, $3, $4, $5, CURRENT_TIMESTAMP,
        $6, $7, $8,
        $9, $10, $11,
        $12, $13
      )
      RETURNING 
        id, user_id AS "userId", site_id AS "siteId", shift_id AS "shiftId", division,
        date, clock_in_time AS "clockInTime", clock_in_latitude AS "clockInLatitude",
        clock_in_longitude AS "clockInLongitude", clock_in_photo_url AS "clockInPhotoUrl",
        clock_in_within_geofence AS "clockInWithinGeofence", clock_in_distance_meters AS "clockInDistanceMeters",
        clock_out_time AS "clockOutTime", clock_out_latitude AS "clockOutLatitude",
        clock_out_longitude AS "clockOutLongitude", clock_out_photo_url AS "clockOutPhotoUrl",
        clock_out_within_geofence AS "clockOutWithinGeofence", clock_out_distance_meters AS "clockOutDistanceMeters",
        status, leave_reason AS "leaveReason", leave_attachment_url AS "leaveAttachmentUrl",
        late_minutes AS "lateMinutes", early_departure_minutes AS "earlyDepartureMinutes",
        effective_working_minutes AS "effectiveWorkingMinutes", is_overtime AS "isOvertime",
        overtime_minutes AS "overtimeMinutes", notes, created_at AS "createdAt", updated_at AS "updatedAt"
    `,
      [
        userId,
        dto.siteId,
        shift?.id || null,
        user.division,
        today,
        dto.latitude,
        dto.longitude,
        dto.photoBase64 ? 'stored_photo_url' : null,
        geofence.isWithin,
        geofence.distanceMeters,
        AttendanceStatus.IN,
        lateMinutes,
        dto.notes || null,
      ],
    );

    return row;
  }

  async clockOut(userId: string, dto: ClockOutRequestDto): Promise<Attendance> {
    const existing = await this.db.queryOne<any>(
      `SELECT * FROM attendance WHERE id = $1 AND user_id = $2`,
      [dto.attendanceId, userId],
    );

    if (!existing) {
      throw new NotFoundException('Attendance record not found');
    }

    if (existing.clock_out_time) {
      throw new BadRequestException('You have already clocked out for this attendance record');
    }

    const geofence = await this.db.checkSiteGeofence(existing.site_id, dto.latitude, dto.longitude);

    // Calculate effective working minutes
    const clockInDate = new Date(existing.clock_in_time);
    const now = new Date();
    const workingMinutes = Math.max(0, Math.floor((now.getTime() - clockInDate.getTime()) / (1000 * 60)));
    const standardShiftMinutes = 480; // 8 hours standard
    const isOvertime = workingMinutes > standardShiftMinutes;
    const overtimeMinutes = isOvertime ? workingMinutes - standardShiftMinutes : 0;

    const row = await this.db.queryOne<any>(
      `
      UPDATE attendance
      SET 
        clock_out_time = CURRENT_TIMESTAMP,
        clock_out_latitude = $2,
        clock_out_longitude = $3,
        clock_out_photo_url = $4,
        clock_out_within_geofence = $5,
        clock_out_distance_meters = $6,
        status = $7,
        effective_working_minutes = $8,
        is_overtime = $9,
        overtime_minutes = $10,
        notes = COALESCE($11, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING 
        id, user_id AS "userId", site_id AS "siteId", shift_id AS "shiftId", division,
        date, clock_in_time AS "clockInTime", clock_in_latitude AS "clockInLatitude",
        clock_in_longitude AS "clockInLongitude", clock_in_photo_url AS "clockInPhotoUrl",
        clock_in_within_geofence AS "clockInWithinGeofence", clock_in_distance_meters AS "clockInDistanceMeters",
        clock_out_time AS "clockOutTime", clock_out_latitude AS "clockOutLatitude",
        clock_out_longitude AS "clockOutLongitude", clock_out_photo_url AS "clockOutPhotoUrl",
        clock_out_within_geofence AS "clockOutWithinGeofence", clock_out_distance_meters AS "clockOutDistanceMeters",
        status, leave_reason AS "leaveReason", leave_attachment_url AS "leaveAttachmentUrl",
        late_minutes AS "lateMinutes", early_departure_minutes AS "earlyDepartureMinutes",
        effective_working_minutes AS "effectiveWorkingMinutes", is_overtime AS "isOvertime",
        overtime_minutes AS "overtimeMinutes", notes, created_at AS "createdAt", updated_at AS "updatedAt"
    `,
      [
        dto.attendanceId,
        dto.latitude,
        dto.longitude,
        dto.photoBase64 ? 'stored_photo_url' : null,
        geofence.isWithin,
        geofence.distanceMeters,
        AttendanceStatus.OUT,
        workingMinutes,
        isOvertime,
        overtimeMinutes,
        dto.notes || null,
      ],
    );

    return row;
  }

  async leaveRequest(userId: string, dto: LeaveRequestDto): Promise<Attendance> {
    const user = await this.db.queryOne<any>(`SELECT division FROM users WHERE id = $1`, [userId]);
    if (!user) throw new NotFoundException('User not found');

    const row = await this.db.queryOne<any>(
      `
      INSERT INTO attendance (
        user_id, site_id, division, date, status, leave_reason, leave_attachment_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING 
        id, user_id AS "userId", site_id AS "siteId", shift_id AS "shiftId", division,
        date, status, leave_reason AS "leaveReason", leave_attachment_url AS "leaveAttachmentUrl",
        late_minutes AS "lateMinutes", early_departure_minutes AS "earlyDepartureMinutes",
        effective_working_minutes AS "effectiveWorkingMinutes", is_overtime AS "isOvertime",
        overtime_minutes AS "overtimeMinutes", notes, created_at AS "createdAt", updated_at AS "updatedAt"
    `,
      [
        userId,
        dto.siteId,
        user.division,
        dto.date,
        dto.status,
        dto.leaveReason,
        dto.attachmentBase64 ? 'stored_attachment_url' : null,
      ],
    );

    return row;
  }
}
