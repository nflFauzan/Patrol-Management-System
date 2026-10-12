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

  describe('TC-ATT-01 & TC-ATT-02: Geofence Validation', () => {
    it('TC-ATT-01: should successfully clock in when user is within geofence radius', async () => {
      // Mock existing attendance check (not yet clocked in today)
      (dbMock.queryOne as jest.Mock)
        .mockResolvedValueOnce(null) // getTodayStatus -> null
        .mockResolvedValueOnce({ division: 'Security' }) // user division
        .mockResolvedValueOnce({
          id: 'shift-1',
          start_time: '07:00:00',
          grace_period_minutes: 15,
        }) // shift
        .mockResolvedValueOnce({
          id: 'att-1',
          userId: 'user-1',
          siteId: 'site-1',
          clockInWithinGeofence: true,
          clockInDistanceMeters: 35,
          status: AttendanceStatus.IN,
          lateMinutes: 0,
        }); // insert returning

      (dbMock.checkSiteGeofence as jest.Mock).mockResolvedValueOnce({
        isWithin: true,
        distanceMeters: 35,
        siteName: 'Head Office Sudirman',
        geofenceRadiusMeters: 100,
      });

      const result = await service.clockIn('user-1', {
        siteId: 'site-1',
        latitude: -6.2215,
        longitude: 106.8055,
      });

      expect(result).toBeDefined();
      expect(result.clockInWithinGeofence).toBe(true);
      expect(dbMock.checkSiteGeofence).toHaveBeenCalledWith('site-1', -6.2215, 106.8055);
    });

    it('should throw BadRequestException if already clocked in today', async () => {
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce({
        id: 'att-existing',
        clockInTime: '2026-10-12T07:00:00Z',
      });

      await expect(
        service.clockIn('user-1', {
          siteId: 'site-1',
          latitude: -6.2215,
          longitude: 106.8055,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('TC-ATT-05 & TC-ATT-06: Effective Working Hours & Overtime Calculation', () => {
    it('TC-ATT-05: should calculate standard 8 hours without overtime', async () => {
      const clockInTime = new Date(Date.now() - 480 * 60 * 1000).toISOString(); // 8 hours ago

      (dbMock.queryOne as jest.Mock)
        .mockResolvedValueOnce({
          id: 'att-1',
          site_id: 'site-1',
          clock_in_time: clockInTime,
          clock_out_time: null,
        }) // existing attendance
        .mockResolvedValueOnce({
          id: 'att-1',
          status: AttendanceStatus.OUT,
          effectiveWorkingMinutes: 480,
          isOvertime: false,
          overtimeMinutes: 0,
        }); // update returning

      (dbMock.checkSiteGeofence as jest.Mock).mockResolvedValueOnce({
        isWithin: true,
        distanceMeters: 20,
      });

      const result = await service.clockOut('user-1', {
        attendanceId: 'att-1',
        latitude: -6.2215,
        longitude: 106.8055,
      });

      expect(result.status).toBe(AttendanceStatus.OUT);
      expect(result.isOvertime).toBe(false);
      expect(result.overtimeMinutes).toBe(0);
    });

    it('TC-ATT-06: should calculate overtime when working duration exceeds 480 minutes', async () => {
      const clockInTime = new Date(Date.now() - 630 * 60 * 1000).toISOString(); // 10.5 hours ago (630 mins)

      (dbMock.queryOne as jest.Mock)
        .mockResolvedValueOnce({
          id: 'att-1',
          site_id: 'site-1',
          clock_in_time: clockInTime,
          clock_out_time: null,
        })
        .mockResolvedValueOnce({
          id: 'att-1',
          status: AttendanceStatus.OUT,
          effectiveWorkingMinutes: 630,
          isOvertime: true,
          overtimeMinutes: 150, // 630 - 480 = 150 mins (2.5 hours)
        });

      (dbMock.checkSiteGeofence as jest.Mock).mockResolvedValueOnce({
        isWithin: true,
        distanceMeters: 15,
      });

      const result = await service.clockOut('user-1', {
        attendanceId: 'att-1',
        latitude: -6.2215,
        longitude: 106.8055,
      });

      expect(result.isOvertime).toBe(true);
      expect(result.overtimeMinutes).toBe(150);
    });
  });
});
