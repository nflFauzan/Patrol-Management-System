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
        // 1.5 Mock user division check
        .mockResolvedValueOnce({
          division: 'Security',
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
        // 1.5 Mock user division check
        .mockResolvedValueOnce({
          division: 'Security',
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

  describe('TC-PAT-04: Laporan Security Anggota Records & Detail Parity', () => {
    it('should fetch paginated patrol records with formatted date and asset information', async () => {
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce({ total: 1 });
      (dbMock.query as jest.Mock).mockResolvedValueOnce([
        {
          id: '7545',
          siteName: 'site proyek demo',
          officerName: 'budi satpam test',
          avatarUrl: 'foto/6acbcdd59a172.jpg',
          position: 'anggota',
          assetName: 'pos gerbang utama',
          assetType: 'keamanan',
          assetLocation: 'gerbang utama depan - site proyek demo',
          taskDescription: 'pemeriksaan akses masuk tamu',
          statusResult: 'Situasi Aman Terkendali',
          notes: 'Situasi Aman Terkendali',
          scannedAt: '2026-10-12T11:01:00.000Z',
          latitude: -6.562732,
          longitude: 106.856083,
          photoKey: 'foto-patroli/6accbe1ba279e',
          ticketStatus: null,
          resolutionNotes: null,
        },
      ]);

      const result = await service.getPatrolRecords({ page: 1, limit: 5 });

      expect(result.recordsTotal).toBe(1);
      expect(result.data.length).toBe(1);
      expect(result.data[0].officerName).toBe('budi satpam test');
      expect(result.data[0].assetName).toBe('pos gerbang utama');
      expect(result.data[0].statusResult).toBe('Situasi Aman Terkendali');
      expect(result.data[0].timeFormatted).toBe('18:01:00');
    });

    it('should fetch exact detail-patroli for a specific ID with map coordinate links', async () => {
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce({
        id: '7545',
        siteName: 'site proyek demo',
        officerName: 'budi satpam test',
        avatarUrl: 'foto/6acbcdd59a172.jpg',
        position: 'anggota',
        assetName: 'pos gerbang utama',
        assetType: 'keamanan',
        assetLocation: 'gerbang utama depan - site proyek demo',
        taskDescription: 'pemeriksaan akses masuk tamu',
        statusResult: 'Situasi Aman Terkendali',
        notes: 'Situasi Aman Terkendali',
        scannedAt: '2026-10-12T11:01:00.000Z',
        latitude: -6.562732,
        longitude: 106.856083,
        photoKey: 'foto-patroli/6accbe1ba279e',
        ticketStatus: null,
        resolutionNotes: null,
      });

      const detail = await service.getPatrolDetail('7545');

      expect(detail.id).toBe('7545');
      expect(detail.officerName).toBe('budi satpam test');
      expect(detail.patrolCode).toBe('#7545');
      expect(detail.activityStatus).toBe('Selesai');
      expect(detail.latitude).toBeCloseTo(-6.562732);
      expect(detail.longitude).toBeCloseTo(106.856083);
      expect(detail.googleMapsUrl).toContain('https://www.google.com/maps?q=-6.562732%2C106.856083');
    });
  });

  describe('MON-03, MON-05, MON-08: Monitoring Filters, WIB Timezone & Role/Notes Integrity', () => {
    it('MON-03: getLogs should support siteId, userId, checkpointId, dateFrom, dateTo (WIB), and sanitize non-numeric/negative limit', async () => {
      (dbMock.query as jest.Mock).mockResolvedValueOnce([]);

      await (service.getLogs as any)({
        siteId: '11111111-1111-1111-1111-111111111111',
        userId: 'a0000000-0000-0000-0000-000000000001',
        checkpointId: 'c1111111-1111-1111-1111-111111111101',
        dateFrom: '2026-11-27',
        dateTo: '2026-11-27',
        limit: 'abc',
      });

      const [sql, params] = (dbMock.query as jest.Mock).mock.calls[0];
      expect(sql).toContain("AT TIME ZONE 'Asia/Jakarta'");
      expect(sql).toContain('p.site_id = $1');
      expect(sql).toContain('p.user_id = $2');
      expect(sql).toContain('p.checkpoint_id = $3');
      expect(sql).toContain('LIMIT 50');
      expect(sql).not.toContain('LIMIT NaN');
      expect(params).toEqual([
        '11111111-1111-1111-1111-111111111111',
        'a0000000-0000-0000-0000-000000000001',
        'c1111111-1111-1111-1111-111111111101',
        '2026-11-27',
        '2026-11-27',
      ]);
    });

    it('MON-05: getHourlyMonitoringMatrix should query and extract hours in Asia/Jakarta WIB timezone', async () => {
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce({ id: '11111111-1111-1111-1111-111111111111', name: 'Site Bogor' });
      (dbMock.query as jest.Mock)
        .mockResolvedValueOnce([{ id: 'c1111111-1111-1111-1111-111111111101', name: 'Pos 1', location_detail: 'Gate', category: 'Security' }])
        .mockResolvedValueOnce([{ checkpointId: 'c1111111-1111-1111-1111-111111111101', hour: 23 }]);

      const res = await service.getHourlyMonitoringMatrix('2026-11-27', '11111111-1111-1111-1111-111111111111');
      const [logsSql] = (dbMock.query as jest.Mock).mock.calls[1];

      expect(logsSql).toContain("AT TIME ZONE 'Asia/Jakarta'");
      expect(res.rows[0].hours[23]).toBe(true);
    });

    it('MON-08: getPatrolRecords and getPatrolDetail should preserve actual position and notes instead of hardcoding anggota', async () => {
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce({ total: '1' });
      (dbMock.query as jest.Mock).mockResolvedValueOnce([
        {
          id: 'log-1',
          siteName: 'Site Bogor',
          officerName: 'Ahmad Fauzi',
          avatarUrl: null,
          position: 'SECURITY_OFFICER',
          assetName: 'Pos 1',
          assetType: 'Security',
          assetLocation: 'Gate',
          taskDescription: 'Cek',
          statusResult: 'Perlu Tindak Lanjut',
          notes: 'Lampu mati',
          scannedAt: '2026-11-27T01:00:00.000Z',
          latitude: -6.56,
          longitude: 106.81,
          photoKey: null,
          ticketStatus: 'OPEN',
          resolutionNotes: null,
        },
      ]);

      const records = await service.getPatrolRecords({ page: 1, limit: 5 });
      expect(records.data[0].position).toBe('SECURITY_OFFICER');

      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce({
        id: 'log-1',
        siteName: 'Site Bogor',
        officerName: 'Ahmad Fauzi',
        avatarUrl: null,
        position: 'KOMANDAN',
        assetName: 'Pos 1',
        assetType: 'Security',
        assetLocation: 'Gate',
        taskDescription: 'Cek',
        statusResult: 'Perlu Tindak Lanjut',
        notes: 'Lampu mati',
        scannedAt: '2026-11-27T01:00:00.000Z',
        latitude: -6.56,
        longitude: 106.81,
        photoKey: null,
        ticketStatus: 'OPEN',
        resolutionNotes: null,
      });

      const detail = await service.getPatrolDetail('log-1');
      expect(detail.position).toBe('KOMANDAN');
      expect((detail as any).notes).toBe('Lampu mati');
    });

    it('FINAL-FIX-02: getLogs should reject invalid UUID or date format with BadRequestException, and updateTindakLanjut should not crash on non-UUID', async () => {
      await expect(
        service.getLogs({ siteId: 'not-a-uuid' }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.getLogs({ dateFrom: '2026-99-99-invalid' }),
      ).rejects.toThrow(BadRequestException);

      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce(null);
      (dbMock.query as jest.Mock).mockResolvedValueOnce([]);
      const res = await service.updateTindakLanjut('non-uuid-id', 'Sudah dicek');
      expect(res.success).toBe(true);
      const [tlSql] = (dbMock.queryOne as jest.Mock).mock.calls[0];
      expect(tlSql).not.toContain('$1::uuid');
    });
  });
});
