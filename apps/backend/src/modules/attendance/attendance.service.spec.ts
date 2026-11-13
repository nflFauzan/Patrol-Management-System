import { AttendanceService } from './attendance.service';
import { DatabaseService } from '../../database/database.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
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

  describe('TC-ATT-11: Clock-in duplicate & Clock-out without clock-in', () => {
    it('TC-ATT-11a: should throw BadRequestException when already clocked in today', async () => {
      // getTodayStatus returns existing record with clockInTime set
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce({
        id: 'att-existing',
        userId: 'user-01',
        siteId: 'site-01',
        date: '2026-10-12',
        statusType: 1,
        clockInTime: '2026-10-12T06:55:00Z',
        clockInLatitude: -6.2215,
        clockInLongitude: 106.8055,
        clockInDistanceMeters: 35,
        isLate: false,
        lateMinutes: 0,
        geofenceRadiusMeters: 100,
        division: 'SECURITY',
      });

      await expect(
        service.clockIn('user-01', {
          siteId: 'site-01',
          latitude: -6.2215,
          longitude: 106.8055,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('TC-ATT-11b: should throw NotFoundException when clocking out without prior clock-in record', async () => {
      // The clockOut method queries attendance by attendanceId + userId → null means not found
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        service.clockOut('user-01', {
          attendanceId: 'non-existent-att-id',
          latitude: -6.2215,
          longitude: 106.8055,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('TC-ATT-12: calculateWorkingHours edge cases', () => {
    it('TC-ATT-12a: standard 8-hour shift returns 480 minutes, 0 overtime', () => {
      const clockIn = new Date('2026-10-12T07:00:00');
      const clockOut = new Date('2026-10-12T15:00:00');
      const { durationMinutes, overtimeMinutes } = service.calculateWorkingHours(clockIn, clockOut);
      expect(durationMinutes).toBe(480);
      expect(overtimeMinutes).toBe(0);
    });

    it('TC-ATT-12b: 10-hour shift yields 600 minutes total and 120 minutes overtime', () => {
      const clockIn = new Date('2026-10-12T07:00:00');
      const clockOut = new Date('2026-10-12T17:00:00');
      const { durationMinutes, overtimeMinutes } = service.calculateWorkingHours(clockIn, clockOut);
      expect(durationMinutes).toBe(600);
      expect(overtimeMinutes).toBe(120);
    });

    it('TC-ATT-12c: night shift crossing midnight (23:00 → 07:00) = 480 minutes, NOT negative', () => {
      const clockIn = new Date('2026-10-12T23:00:00');
      const clockOut = new Date('2026-10-13T07:00:00');
      const { durationMinutes, overtimeMinutes } = service.calculateWorkingHours(clockIn, clockOut);
      expect(durationMinutes).toBe(480);
      expect(overtimeMinutes).toBe(0);
    });
  });

  describe('TC-ATT-13: calculateLateMinutes grace period boundary', () => {
    it('TC-ATT-13a: arriving exactly at grace period boundary (15 mins) → 0 late minutes', () => {
      const checkInTime = new Date('2026-10-12T07:15:00'); // exactly 15 mins late
      const lateMins = service.calculateLateMinutes(checkInTime, '07:00:00', 15);
      expect(lateMins).toBe(0);
    });

    it('TC-ATT-13b: arriving 1 minute within grace period (14 mins late) → 0 late minutes', () => {
      const checkInTime = new Date('2026-10-12T07:14:00');
      const lateMins = service.calculateLateMinutes(checkInTime, '07:00:00', 15);
      expect(lateMins).toBe(0);
    });

    it('TC-ATT-13c: arriving 30 minutes late (> 15 grace) → 15 charged late minutes', () => {
      const checkInTime = new Date('2026-10-12T07:30:00');
      const lateMins = service.calculateLateMinutes(checkInTime, '07:00:00', 15);
      expect(lateMins).toBe(15);
    });

    it('TC-ATT-13d: arriving on time → 0 late minutes', () => {
      const checkInTime = new Date('2026-10-12T07:00:00');
      const lateMins = service.calculateLateMinutes(checkInTime, '07:00:00', 15);
      expect(lateMins).toBe(0);
    });
  });

  describe('Server-side Presensi & Detail (100% Parity patroli.site)', () => {
    it('TC-ATT-08: should retrieve formatted attendance records with Indonesian date and late status', async () => {
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce({ total: '1' });
      (dbMock.query as jest.Mock).mockResolvedValueOnce([
        {
          id: 'att-2034',
          userId: 'usr-1',
          siteId: 'site-1',
          siteName: 'site proyek demo',
          personilName: 'budi satpam test',
          division: 'Security',
          userAvatar: null,
          date: '2026-10-17',
          clockInTime: '2026-10-17T00:46:13Z',
          clockInLatitude: -6.562719,
          clockInLongitude: 106.856125,
          clockInPhotoUrl: 'foto/6acbcdd59a172.jpg',
          clockInDistanceMeters: 45,
          isLate: false,
          lateMinutes: 0,
          clockOutTime: null,
          clockOutLatitude: null,
          clockOutLongitude: null,
          clockOutPhotoUrl: null,
          clockOutDistanceMeters: null,
          geofenceRadiusMeters: 100,
          siteLatitude: -6.566873,
          siteLongitude: 106.857802,
        },
      ]);

      const response = await service.getAttendanceRecords({
        siteName: 'site proyek demo',
        division: 'Security',
        page: 1,
        limit: 5,
      });

      expect(response.recordsTotal).toBe(1);
      expect(response.data.length).toBe(1);
      const item = response.data[0];
      expect(item.siteName).toBe('site proyek demo');
      expect(item.personilName).toBe('budi satpam test');
      expect(item.division).toBe('Security');
      expect(item.clockInWithinGeofence).toBe(true);
      expect(item.isLate).toBe(false);
      expect(item.isClockedOut).toBe(false);
    });

    it('TC-ATT-09: should return complete attendance detail with Leaflet polyline points', async () => {
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce({
        id: 'att-2030',
        userId: 'usr-2',
        personilName: 'akmal',
        userAvatar: 'foto/6accb7f71da6d.jpg',
        division: 'Cleaning Service',
        siteName: 'site proyek demo',
        clockInTime: '2026-10-12T17:36:20Z',
        clockInLatitude: -6.56269,
        clockInLongitude: 106.856161,
        clockInPhotoUrl: 'foto-patroli/6accb8240bdd2',
        clockInDistanceMeters: 480,
        clockOutTime: '2026-10-12T17:38:02Z',
        clockOutLatitude: -6.56269,
        clockOutLongitude: 106.856161,
        clockOutPhotoUrl: 'foto-patroli/6accb88a48052',
        clockOutDistanceMeters: 480,
        geofenceRadiusMeters: 100,
        siteLatitude: -6.566873,
        siteLongitude: 106.857802,
      });

      const detail = await service.getAttendanceDetail('att-2030');

      expect(detail.id).toBe('att-2030');
      expect(detail.personilName).toBe('akmal');
      expect(detail.locationsIn.length).toBe(2);
      expect(detail.locationsIn[0].label).toContain('Lokasi absen masuk akmal');
      expect(detail.locationsIn[1].label).toBe('Lokasi Area / Site');
      expect(detail.locationsOut.length).toBe(2);
      expect(detail.distanceInMeters).toBe(480);
    });

    it('TC-ATT-10: should return filtered personil options list', async () => {
      (dbMock.query as jest.Mock).mockResolvedValueOnce([
        { id: 'usr-1', name: 'budi satpam test', division: 'Security', siteName: 'site proyek demo' },
      ]);

      const options = await service.getPersonilOptions('site proyek demo', 'Security');

      expect(options.length).toBe(1);
      expect(options[0].name).toBe('budi satpam test');
      expect(options[0].division).toBe('Security');
    });
  });
});
