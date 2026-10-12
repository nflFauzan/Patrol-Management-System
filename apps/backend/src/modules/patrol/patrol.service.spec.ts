import { PatrolService } from './patrol.service';
import { DatabaseService } from '../../database/database.service';
import { EventsGateway } from '../gateway/events.gateway';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PatrolService (QR Code Checkpoint Patrol & Incident Tracking)', () => {
  let service: PatrolService;
  let dbMock: Partial<DatabaseService>;
  let gatewayMock: Partial<EventsGateway>;

  beforeEach(() => {
    dbMock = {
      queryOne: jest.fn(),
      query: jest.fn(),
      checkCheckpointProximity: jest.fn(),
    };

    gatewayMock = {
      broadcastPatrolScan: jest.fn(),
    };

    service = new PatrolService(dbMock as any, gatewayMock as any);
  });

  describe('TC-PAT-01: Valid Checkpoint QR Scan within Geofence', () => {
    it('should successfully record a patrol scan when officer is within geofence', async () => {
      // 1. Mock checkpoint lookup
      (dbMock.queryOne as jest.Mock)
        .mockResolvedValueOnce({
          id: 'c1111111-1111-1111-1111-111111111101',
          site_id: '11111111-1111-1111-1111-111111111111',
          name: 'Pos Utama Gerbang Masuk',
          qr_code_token: 'QR-HQ-GATE-01',
          category: 'Security',
          location_detail: 'Gate A Pintu Barat',
        })
        // 2. Mock patrol_logs insertion
        .mockResolvedValueOnce({
          id: 'patrol-log-01',
          siteId: '11111111-1111-1111-1111-111111111111',
          checkpointId: 'c1111111-1111-1111-1111-111111111101',
          userId: 'user-01',
          scannedAt: new Date().toISOString(),
          latitude: -6.2215,
          longitude: 106.8055,
          statusResult: 'Situasi Aman Terkendali',
          notes: 'Pos gerbang aman terkendali',
        })
        // 3. Mock user query for broadcast
        .mockResolvedValueOnce({
          full_name: 'Ahmad Fauzi',
          username: 'fauzi_sec',
          division: 'Security',
        });

      // Mock PostGIS proximity check
      (dbMock.checkCheckpointProximity as jest.Mock).mockResolvedValueOnce({
        isWithin: true,
        distanceMeters: 18,
        checkpointName: 'Pos Utama Gerbang Masuk',
        siteName: 'Head Office Sudirman',
        geofenceRadiusMeters: 100,
      });

      const result = await service.recordScan('user-01', {
        siteId: '11111111-1111-1111-1111-111111111111',
        qrPayload: 'QR-HQ-GATE-01',
        latitude: -6.2215,
        longitude: 106.8055,
        statusResult: 'Situasi Aman Terkendali',
        notes: 'Pos gerbang aman terkendali',
      });

      expect(result).toBeDefined();
      expect(result.id).toBe('patrol-log-01');
      expect(result.statusResult).toBe('Situasi Aman Terkendali');
      expect(result.proximity.isWithin).toBe(true);
      expect(result.incidentTicket).toBeNull();
      expect(gatewayMock.broadcastPatrolScan).toHaveBeenCalledWith(
        '11111111-1111-1111-1111-111111111111',
        expect.objectContaining({
          checkpointName: 'Pos Utama Gerbang Masuk',
          isIncident: false,
        }),
      );
    });
  });

  describe('TC-PAT-02: Checkpoint Scan with Anomaly (Perlu Tindak Lanjut)', () => {
    it('should automatically generate an incident ticket when statusResult is Perlu Tindak Lanjut', async () => {
      // 1. Mock checkpoint lookup
      (dbMock.queryOne as jest.Mock)
        .mockResolvedValueOnce({
          id: 'c1111111-1111-1111-1111-111111111103',
          site_id: '11111111-1111-1111-1111-111111111111',
          name: 'Ruang Server IT Lt 3',
          qr_code_token: 'QR-HQ-SERVER-03',
          category: 'Security',
          location_detail: 'Ruang 304 Khusus IT',
        })
        // 2. Mock patrol_logs insertion
        .mockResolvedValueOnce({
          id: 'patrol-log-02',
          siteId: '11111111-1111-1111-1111-111111111111',
          checkpointId: 'c1111111-1111-1111-1111-111111111103',
          userId: 'user-01',
          scannedAt: new Date().toISOString(),
          latitude: -6.2215,
          longitude: 106.8055,
          statusResult: 'Perlu Tindak Lanjut',
          notes: 'AC Server mati, suhu ruangan 32 derajat',
        })
        // 3. Mock incident_tickets insertion
        .mockResolvedValueOnce({
          id: 'inc-ticket-01',
          ticketStatus: 'OPEN',
          createdAt: new Date().toISOString(),
        })
        // 4. Mock user query for broadcast
        .mockResolvedValueOnce({
          full_name: 'Ahmad Fauzi',
          username: 'fauzi_sec',
          division: 'Security',
        });

      (dbMock.checkCheckpointProximity as jest.Mock).mockResolvedValueOnce({
        isWithin: true,
        distanceMeters: 25,
        checkpointName: 'Ruang Server IT Lt 3',
        siteName: 'Head Office Sudirman',
        geofenceRadiusMeters: 100,
      });

      const result = await service.recordScan('user-01', {
        siteId: '11111111-1111-1111-1111-111111111111',
        qrPayload: 'QR-HQ-SERVER-03',
        latitude: -6.2215,
        longitude: 106.8055,
        statusResult: 'Perlu Tindak Lanjut',
        notes: 'AC Server mati, suhu ruangan 32 derajat',
      });

      expect(result).toBeDefined();
      expect(result.incidentTicket).toBeDefined();
      expect(result.incidentTicket.id).toBe('inc-ticket-01');
      expect(result.incidentTicket.ticketStatus).toBe('OPEN');
      expect(gatewayMock.broadcastPatrolScan).toHaveBeenCalledWith(
        '11111111-1111-1111-1111-111111111111',
        expect.objectContaining({
          isIncident: true,
          incidentTicketId: 'inc-ticket-01',
        }),
      );
    });
  });

  describe('TC-PAT-03: Invalid or Mismatched QR Payload', () => {
    it('should throw NotFoundException when checkpoint token does not exist', async () => {
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        service.recordScan('user-01', {
          siteId: '11111111-1111-1111-1111-111111111111',
          qrPayload: 'QR-FAKE-UNKNOWN',
          latitude: -6.2215,
          longitude: 106.8055,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when neither checkpointId nor qrPayload is given', async () => {
      await expect(
        service.recordScan('user-01', {
          siteId: '11111111-1111-1111-1111-111111111111',
          latitude: -6.2215,
          longitude: 106.8055,
        } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
