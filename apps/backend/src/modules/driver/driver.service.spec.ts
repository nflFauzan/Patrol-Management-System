import { DriverService } from './driver.service';
import { DatabaseService } from '../../database/database.service';
import { EventsGateway } from '../gateway/events.gateway';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('DriverService (Logistics & Fleet Trip Logs)', () => {
  let service: DriverService;
  let dbMock: Partial<DatabaseService>;
  let gatewayMock: Partial<EventsGateway>;

  beforeEach(() => {
    dbMock = {
      queryOne: jest.fn(),
      query: jest.fn(),
    };

    gatewayMock = {
      server: {
        to: jest.fn().mockReturnValue({
          emit: jest.fn(),
        }),
      } as any,
    };

    service = new DriverService(dbMock as any, gatewayMock as any);
  });

  describe('TC-DRV-01: Start Fleet Trip Log', () => {
    it('should successfully record trip departure and broadcast event', async () => {
      // 1. Check existing trip -> null
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce(null);
      // 2. Insert returning trip
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce({
        id: 'trip-001',
        siteId: 'site-hq',
        driverId: 'driver-01',
        vehiclePlateNumber: 'B 1234 CD',
        vehicleType: 'Box Engkel',
        originLocation: 'HQ Sudirman',
        destinationLocation: 'Pabrik Cikarang',
        startedAt: '2026-10-12T08:00:00Z',
        tripStatus: 'IN_PROGRESS',
        odometerStart: 45000,
        tripNotes: 'Pengiriman sparepart batch 1',
      });
      // 3. Driver query
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce({
        full_name: 'Budi Santoso',
        username: 'driver.budi',
      });

      const res = await service.startTrip('driver-01', {
        siteId: 'site-hq',
        vehiclePlateNumber: 'B 1234 CD',
        vehicleType: 'Box Engkel',
        originLocation: 'HQ Sudirman',
        destinationLocation: 'Pabrik Cikarang',
        odometerStart: 45000,
        tripNotes: 'Pengiriman sparepart batch 1',
      });

      expect(res).toBeDefined();
      expect(res.id).toBe('trip-001');
      expect(res.tripStatus).toBe('IN_PROGRESS');
      expect(res.driverName).toBe('Budi Santoso');
      expect(gatewayMock.server?.to).toHaveBeenCalledWith('site_site-hq');
    });

    it('should reject trip start if driver already has an active trip', async () => {
      // Check existing trip -> returns active trip
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce({ id: 'existing-trip' });

      await expect(
        service.startTrip('driver-01', {
          siteId: 'site-hq',
          vehiclePlateNumber: 'B 1234 CD',
          vehicleType: 'Box Engkel',
          originLocation: 'HQ Sudirman',
          destinationLocation: 'Pabrik Cikarang',
          odometerStart: 45000,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('TC-DRV-02: Complete Fleet Trip Log & Distance Verification', () => {
    it('should complete trip, calculate distance km, and broadcast completed event', async () => {
      // 1. Query trip -> found
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce({
        id: 'trip-001',
        site_id: 'site-hq',
        odometer_start: 45000,
        trip_status: 'IN_PROGRESS',
      });

      // 2. Update trip -> returning
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce({
        id: 'trip-001',
        siteId: 'site-hq',
        driverId: 'driver-01',
        vehiclePlateNumber: 'B 1234 CD',
        tripStatus: 'COMPLETED',
        odometerStart: 45000,
        odometerEnd: 45085,
        arrivedAt: '2026-10-12T10:30:00Z',
      });

      const res = await service.completeTrip('trip-001', 'driver-01', {
        odometerEnd: 45085,
        tripNotes: 'Tiba dengan aman, muatan sudah dibongkar',
      });

      expect(res).toBeDefined();
      expect(res.tripStatus).toBe('COMPLETED');
      expect(res.totalDistanceKm).toBe(85);
      expect(gatewayMock.server?.to).toHaveBeenCalledWith('site_site-hq');
    });

    it('should reject completion if odometerEnd < odometerStart', async () => {
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce({
        id: 'trip-001',
        site_id: 'site-hq',
        odometer_start: 45000,
        trip_status: 'IN_PROGRESS',
      });

      await expect(
        service.completeTrip('trip-001', 'driver-01', {
          odometerEnd: 44900, // Invalid: less than start
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if trip is not found', async () => {
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        service.completeTrip('non-existent-trip', 'driver-01', {
          odometerEnd: 46000,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('TC-DRV-03: Active Trip & History Query', () => {
    it('should return active trip if exists', async () => {
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce({
        id: 'trip-active',
        tripStatus: 'IN_PROGRESS',
        vehiclePlateNumber: 'B 5678 EF',
      });

      const active = await service.getActiveTrip('driver-01');
      expect(active).toBeDefined();
      expect(active.id).toBe('trip-active');
    });

    it('should return null if no active trip', async () => {
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce(null);

      const active = await service.getActiveTrip('driver-01');
      expect(active).toBeNull();
    });
  });
});
