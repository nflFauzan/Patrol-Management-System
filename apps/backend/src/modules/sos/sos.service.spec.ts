import { SosService } from './sos.service';
import { DatabaseService } from '../../database/database.service';
import { ConfigService } from '@nestjs/config';
import { EventsGateway } from '../gateway/events.gateway';
import { NotFoundException } from '@nestjs/common';

describe('SosService (Panic Button SOS & WhatsApp Gateway Integration)', () => {
  let service: SosService;
  let dbMock: Partial<DatabaseService>;
  let configMock: Partial<ConfigService>;
  let gatewayMock: Partial<EventsGateway>;

  beforeEach(() => {
    dbMock = {
      queryOne: jest.fn(),
      query: jest.fn(),
    };

    configMock = {
      get: jest.fn(),
    };

    gatewayMock = {
      broadcastSosAlert: jest.fn(),
      server: {
        emit: jest.fn(),
      } as any,
    };

    service = new SosService(dbMock as any, configMock as any, gatewayMock as any);
  });

  describe('TC-SOS-01: Trigger Panic Button SOS with Precision Coordinates', () => {
    it('should insert active emergency alert and format precise Google Maps link', async () => {
      // 1. Mock user query
      (dbMock.queryOne as jest.Mock)
        .mockResolvedValueOnce({
          full_name: 'Ahmad Fauzi',
          phone_number: '0812-9988-7766',
          division: 'Security',
        })
        // 2. Mock site query
        .mockResolvedValueOnce({
          name: 'Head Office Sudirman',
          address: 'SCBD Lot 28 Jakarta Selatan',
        })
        // 3. Mock emergency_alerts insert
        .mockResolvedValueOnce({
          id: 'sos-alert-001',
          siteId: '11111111-1111-1111-1111-111111111111',
          userId: 'user-005',
          latitude: -6.2255,
          longitude: 106.809,
          triggeredAt: '2026-10-12T13:25:00Z',
          alertStatus: 'ACTIVE',
          isWhatsappDispatched: false,
        })
        // 4. Mock company_profile query
        .mockResolvedValueOnce({
          wa_gateway_provider: 'fonnte',
          wa_api_token: 'test_token',
          wa_emergency_group_id: '120363041234567890@g.us',
          is_wa_notifications_enabled: true,
        });

      (dbMock.query as jest.Mock).mockResolvedValueOnce([]); // update dispatch status

      const result = await service.triggerSos('user-005', {
        siteId: '11111111-1111-1111-1111-111111111111',
        latitude: -6.2255,
        longitude: 106.809,
        message: 'Petugas butuh bantuan di Pos Gerbang Barat!',
      });

      expect(result).toBeDefined();
      expect(result.id).toBe('sos-alert-001');
      expect(result.alertStatus).toBe('ACTIVE');
      expect(result.mapsUrl).toBe('https://www.google.com/maps?q=-6.2255,106.809');
      expect(result.officerName).toBe('Ahmad Fauzi');
      expect(result.division).toBe('Security');

      // Verify broadcast to Web Admin
      expect(gatewayMock.broadcastSosAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'sos-alert-001',
          mapsUrl: 'https://www.google.com/maps?q=-6.2255,106.809',
          siteName: 'Head Office Sudirman',
        }),
      );
    });
  });

  describe('TC-SOS-02: Status Escalation Lifecycle (Acknowledge & Resolve)', () => {
    it('should acknowledge an alert and emit status change event', async () => {
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce({
        id: 'sos-alert-001',
        alertStatus: 'ACKNOWLEDGED',
        acknowledgedAt: '2026-10-12T13:28:00Z',
      });

      const ack = await service.acknowledgeAlert('sos-alert-001', 'supervisor-001');
      expect(ack).toBeDefined();
      expect(ack.alertStatus).toBe('ACKNOWLEDGED');
      expect(gatewayMock.server?.emit).toHaveBeenCalledWith(
        'sos:status_changed',
        expect.objectContaining({
          alertId: 'sos-alert-001',
          alertStatus: 'ACKNOWLEDGED',
          acknowledgedBy: 'supervisor-001',
        }),
      );
    });

    it('should resolve an alert with resolution notes', async () => {
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce({
        id: 'sos-alert-001',
        alertStatus: 'RESOLVED',
        resolutionNotes: 'Situasi pos terkendali, alarm dicabut.',
      });

      const res = await service.resolveAlert('sos-alert-001', 'Situasi pos terkendali, alarm dicabut.');
      expect(res).toBeDefined();
      expect(res.alertStatus).toBe('RESOLVED');
      expect(gatewayMock.server?.emit).toHaveBeenCalledWith(
        'sos:status_changed',
        expect.objectContaining({
          alertId: 'sos-alert-001',
          alertStatus: 'RESOLVED',
        }),
      );
    });

    it('should throw NotFoundException if alert to acknowledge does not exist', async () => {
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce(null);
      await expect(service.acknowledgeAlert('invalid-id', 'sup-001')).rejects.toThrow(NotFoundException);
    });
  });

  describe('TC-SOS-03: Log Data Emergency Query (patroli.site #panic table)', () => {
    it('should query paginated emergency logs with formatted Indonesian datetime', async () => {
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce({ total: 1 });
      (dbMock.query as jest.Mock).mockResolvedValueOnce([
        {
          id: 'sos-alert-001',
          siteId: 'site-001',
          siteName: 'kantor pusat',
          userId: 'user-001',
          officerName: 'budi santoso',
          officerPhone: '0812-1111-2222',
          division: 'Security',
          photoUrl: null,
          latitude: -6.20912,
          longitude: 106.84621,
          triggeredAt: '2026-11-02T00:11:00Z',
          alertStatus: 'ACTIVE',
          isWhatsappDispatched: true,
          acknowledgedBy: null,
          acknowledgedAt: null,
          resolutionNotes: null,
        },
      ]);

      const result = await service.getEmergencyLogs({ page: 1, limit: 10, search: 'budi' });

      expect(result).toBeDefined();
      expect(result.total).toBe(1);
      expect(result.data.length).toBe(1);
      expect(result.data[0].officerName).toBe('budi santoso');
      expect(result.data[0].siteName).toBe('kantor pusat');
      expect(result.data[0].mapsUrl).toContain('-6.20912,106.84621');
      expect(result.data[0].formattedTime).toBeDefined();
    });
  });

  describe('TC-SOS-04: Detail Log Emergency (patroli.site modal detail)', () => {
    it('should return complete emergency detail for Leaflet map & profile card', async () => {
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce({
        id: 'sos-alert-001',
        siteId: 'site-001',
        siteName: 'kantor pusat',
        siteAddress: 'Jl. Sudirman Kav. 1',
        userId: 'user-001',
        officerName: 'budi santoso',
        officerPhone: '0812-1111-2222',
        division: 'Security',
        role: 'DANRU',
        photoUrl: null,
        latitude: -6.20912,
        longitude: 106.84621,
        triggeredAt: '2026-11-02T00:11:00Z',
        alertStatus: 'ACTIVE',
        isWhatsappDispatched: true,
        whatsappDispatchResponse: 'OK',
        acknowledgedBy: null,
        acknowledgedAt: null,
        resolutionNotes: null,
      });

      const detail = await service.getSosDetail('sos-alert-001');

      expect(detail).toBeDefined();
      expect(detail.officerName).toBe('budi santoso');
      expect(detail.latitude).toBe(-6.20912);
      expect(detail.longitude).toBe(106.84621);
      expect(detail.dayName).toBeDefined();
      expect(detail.timeOnly).toBeDefined();
    });

    it('should throw NotFoundException if detail id not found', async () => {
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce(null);
      await expect(service.getSosDetail('invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('MON-05: getEmergencyLogs and getSosDetail should format timeOnly in Asia/Jakarta (WIB) regardless of host TZ', async () => {
      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce({ total: 1 });
      (dbMock.query as jest.Mock).mockResolvedValueOnce([
        {
          id: 'sos-wib',
          siteId: 'site-1',
          siteName: 'Bogor',
          userId: 'usr-1',
          officerName: 'Hendra Wijaya',
          officerPhone: '0812',
          division: 'SECURITY',
          latitude: -6.56,
          longitude: 106.85,
          triggeredAt: '2026-11-22T09:45:25.168Z',
          alertStatus: 'ACTIVE',
          isWhatsappDispatched: true,
        },
      ]);

      const logs = await service.getEmergencyLogs({ page: 1, limit: 10 });
      expect(logs.data[0].timeOnly).toBe('16:45:25');

      (dbMock.queryOne as jest.Mock).mockResolvedValueOnce({
        id: 'sos-wib',
        siteId: 'site-1',
        siteName: 'Bogor',
        userId: 'usr-1',
        officerName: 'Hendra Wijaya',
        officerPhone: '0812',
        division: 'SECURITY',
        latitude: -6.56,
        longitude: 106.85,
        triggeredAt: '2026-11-22T09:45:25.168Z',
        alertStatus: 'ACTIVE',
        isWhatsappDispatched: true,
      });

      const detail = await service.getSosDetail('sos-wib');
      expect(detail.timeOnly).toBe('16:45:25');
    });
  });
});
