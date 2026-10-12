import { AttendanceService } from './attendance.service';
import { DatabaseService } from '../../database/database.service';
import { BadRequestException } from '@nestjs/common';
import { AttendanceStatus } from '@patrol/types';

describe('AttendanceService (HRIS Attendance & Shift Engine)', () => {
  let service: AttendanceService;
  let dbMock: Partial<DatabaseService>;

  beforeEach(() => {
    dbMock = {
      queryOne: jest.fn(),
      query: jest.fn(),
      checkSiteGeofence: jest.fn(),
    };

    service = new AttendanceService(dbMock as any);
  });

  describe('Geofence & Clock-In Business Logic', () => {
    it('TC-ATT-01: should successfully clock in within geofence radius', async () => {
      // 1. getTodayStatus returns null
      (dbMock.queryOne as jest.Mock)
        .mockResolvedValueOnce(null)
        // 2. user query
        .mockResolvedValueOnce({ full_name: 'Ahmad Fauzi', division: 'SECURITY' })
        // 3. site query
        .mockResolvedValueOnce({
          name: 'Head Office Sudirman',
          shift_pagi_in: '07:00:00',
          geofence_radius_meters: 100,
        })
        // 4. insert into attendances returning row
        .mockResolvedValueOnce({
          id: 'att-01',
          userId: 'user-01',
          siteId: 'site-01',
          date: '2026-10-12',
          statusType: 1,
          shiftName: 'Shift Pagi (07:00 - 15:00)',
          clockInTime: '2026-10-12T06:55:00Z',
          clockInLatitude: -6.2215,
          clockInLongitude: 106.8055,
          clockInDistanceMeters: 35,
          isLate: false,
          lateMinutes: 0,
        });

      (dbMock.checkSiteGeofence as jest.Mock).mockResolvedValueOnce({
        isWithin: true,
        distanceMeters: 35,
        siteName: 'Head Office Sudirman',
        geofenceRadiusMeters: 100,
      });

      const result = await service.clockIn('user-01', {
        siteId: 'site-01',
        latitude: -6.2215,
        longitude: 106.8055,
      });

      expect(result).toBeDefined();
      expect(result.clockInWithinGeofence).toBe(true);
      expect(result.lateMinutes).toBe(0);
      expect(result.status).toBe(AttendanceStatus.IN);
      expect(dbMock.checkSiteGeofence).toHaveBeenCalledWith('site-01', -6.2215, 106.8055);
    });

    it('TC-ATT-02: should flag clock-in when outside geofence radius', async () => {
      (dbMock.queryOne as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ full_name: 'Ahmad Fauzi', division: 'SECURITY' })
        .mockResolvedValueOnce({
          name: 'Head Office Sudirman',
          shift_pagi_in: '07:00:00',
          geofence_radius_meters: 100,
        })
        .mockResolvedValueOnce({
          id: 'att-02',
          userId: 'user-01',
          siteId: 'site-01',
          date: '2026-10-12',
          statusType: 1,
          shiftName: 'Shift Pagi (07:00 - 15:00)',
          clockInTime: '2026-10-12T06:55:00Z',
          clockInLatitude: -6.2300,
          clockInLongitude: 106.8100,
          clockInDistanceMeters: 250, // > 100m
          isLate: false,
          lateMinutes: 0,
        });

      (dbMock.checkSiteGeofence as jest.Mock).mockResolvedValueOnce({
        isWithin: false,
        distanceMeters: 250,
        siteName: 'Head Office Sudirman',
        geofenceRadiusMeters: 100,
      });

      const result = await service.clockIn('user-01', {
        siteId: 'site-01',
        latitude: -6.2300,
        longitude: 106.8100,
      });

      expect(result.clockInWithinGeofence).toBe(false);
      expect(result.clockInDistanceMeters).toBe(250);
    });

    it('should reject duplicate clock-in on the same day', async () => {
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce({
        id: 'att-existing',
        userId: 'user-01',
        siteId: 'site-01',
        date: '2026-10-12',
        statusType: 1,
        clockInTime: '2026-10-12T06:55:00Z',
      });

      await expect(
        service.clockIn('user-01', {
          siteId: 'site-01',
          latitude: -6.2215,
          longitude: 106.8055,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('HRIS Calculation Formulas (Late & Overtime Math)', () => {
    it('TC-ATT-03: should calculate 0 late minutes when arriving within grace period (15 mins)', () => {
      const checkInTime = new Date('2026-10-12T07:12:00'); // 12 minutes after 07:00
      const lateMins = service.calculateLateMinutes(checkInTime, '07:00:00', 15);
      expect(lateMins).toBe(0);
    });

    it('TC-ATT-04: should calculate late minutes exceeding grace period (35 mins late - 15 = 20 mins)', () => {
      const checkInTime = new Date('2026-10-12T07:35:00'); // 35 minutes after 07:00
      const lateMins = service.calculateLateMinutes(checkInTime, '07:00:00', 15);
      expect(lateMins).toBe(20);
    });

    it('TC-ATT-05: should calculate standard 8 hours without overtime', () => {
      const clockIn = new Date('2026-10-12T07:00:00');
      const clockOut = new Date('2026-10-12T15:00:00'); // Exactly 8 hours (480 mins)
      const { durationMinutes, overtimeMinutes } = service.calculateWorkingHours(clockIn, clockOut);

      expect(durationMinutes).toBe(480);
      expect(overtimeMinutes).toBe(0);
    });

    it('TC-ATT-06: should calculate overtime when shift exceeds 8 hours (10.5 hours -> 2.5 hours OT)', () => {
      const clockIn = new Date('2026-10-12T07:00:00');
      const clockOut = new Date('2026-10-12T17:30:00'); // 10.5 hours (630 mins)
      const { durationMinutes, overtimeMinutes } = service.calculateWorkingHours(clockIn, clockOut);

      expect(durationMinutes).toBe(630);
      expect(overtimeMinutes).toBe(150); // 150 minutes = 2.5 hours
    });

    it('TC-ATT-07: should correctly calculate night shift crossing midnight (23:00 to 07:00)', () => {
      const clockIn = new Date('2026-10-12T23:00:00');
      const clockOut = new Date('2026-10-13T07:00:00'); // Next day 07:00 (8 hours)
      const { durationMinutes, overtimeMinutes } = service.calculateWorkingHours(clockIn, clockOut);

      expect(durationMinutes).toBe(480);
      expect(overtimeMinutes).toBe(0);
    });
  });
});
