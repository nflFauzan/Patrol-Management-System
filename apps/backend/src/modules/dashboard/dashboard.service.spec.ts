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
});
