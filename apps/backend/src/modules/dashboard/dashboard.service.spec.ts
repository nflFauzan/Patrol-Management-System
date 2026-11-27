import { DashboardService } from './dashboard.service';
import { DatabaseService } from '../../database/database.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let dbMock: { queryOne: jest.Mock; query: jest.Mock };

  beforeEach(() => {
    dbMock = {
      queryOne: jest.fn(),
      query: jest.fn(),
    };
    service = new DashboardService(dbMock as any);
  });

  it('getDashboardSummary returns 0% when hadir=0 totalPersonnel=0', async () => {
    dbMock.queryOne.mockResolvedValue({
      totalPersonnel: '0',
      totalSites: '2',
      totalCheckpoints: '3',
      hadir: '0',
      activePatrol: '0',
      securityPersonnel: '0',
      cleaningPersonnel: '0',
      driverPersonnel: '0',
      staffPersonnel: '0',
      securityCheckpoints: '0',
      cleaningCheckpoints: '0',
      activeDriverTrips: '0',
    });
    const result = await service.getDashboardSummary();
    expect(result.attendanceToday.percentageStr).toBe('0%');
    expect(result.activePatrol.count).toBe(0);
    expect(result.totalPersonnel).toBe(0);
  });

  it('getDashboardSummary calculates 96% for 24 hadir of 25', async () => {
    dbMock.queryOne.mockResolvedValue({
      totalPersonnel: '25',
      totalSites: '2',
      totalCheckpoints: '10',
      hadir: '24',
      activePatrol: '7',
      securityPersonnel: '15',
      cleaningPersonnel: '7',
      driverPersonnel: '3',
      staffPersonnel: '0',
      securityCheckpoints: '7',
      cleaningCheckpoints: '3',
      activeDriverTrips: '2',
    });
    const result = await service.getDashboardSummary();
    expect(result.attendanceToday.percentageStr).toBe('96%');
    expect(result.totalPersonnel).toBe(25);
    expect(result.activePatrol.count).toBe(7);
    expect(result.divisionCounts.security).toBe(15);
  });

  it('getHourlyPatrolActivity returns 24 slots', async () => {
    dbMock.query.mockResolvedValue([
      { hour: 7, scanCount: 4, checkpointName: 'Pos Gerbang' },
      { hour: 8, scanCount: 8, checkpointName: 'Ruang Server' },
    ]);
    const result = await service.getHourlyPatrolActivity('2026-11-23');
    expect(result).toHaveLength(24);
    expect(result[7].scanCount).toBe(4);
    expect(result[7].checkpointName).toBe('Pos Gerbang');
    expect(result[0].scanCount).toBe(0); // empty slot
    expect(result[0].checkpointName).toBeNull();
  });

  it('MON-10: getShiftCompliance deduplicates double-scanned checkpoints within the same round', async () => {
    dbMock.queryOne
      .mockResolvedValueOnce({ name: 'Kantor Pusat', shift_pagi_in: '07:00', shift_pagi_out: '15:00' })
      .mockResolvedValueOnce({ count: '2' }); // totalCheckpoints = 2

    dbMock.query
      .mockResolvedValueOnce([
        { id: 'cp-1', name: 'Pos 1', location_detail: 'Gate' },
        { id: 'cp-2', name: 'Pos 2', location_detail: 'Lobby' },
      ])
      .mockResolvedValueOnce([
        // Same checkpoint cp-1 scanned twice in round 1 (07:30 and 07:45 WIB)
        { checkpoint_id: 'cp-1', scanned_at_wib: '2026-11-27T07:30:00' },
        { checkpoint_id: 'cp-1', scanned_at_wib: '2026-11-27T07:45:00' },
      ])
      .mockResolvedValueOnce([]); // recentScans

    const result = await service.getShiftCompliance('site-1', 'PAGI');
    expect(result.scannedCount).toBe(1);
    expect(result.rounds[0].scannedCount).toBe(1);
    expect(result.rounds[0].scannedCount).toBeLessThanOrEqual(result.totalCheckpoints);
  });
});
