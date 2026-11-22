import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  DashboardSummary,
  ShiftComplianceData,
  DashboardNotificationItem,
  PatrolHourlyActivity,
} from '@patrol/types';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('summary')
  async getSummary(@Query('siteId') siteId?: string): Promise<DashboardSummary> {
    return this.dashboardService.getDashboardSummary(siteId);
  }

  @Get('shift-compliance')
  async getShiftCompliance(
    @Query('siteId') siteId?: string,
    @Query('shift') shift: 'PAGI' | 'SIANG' | 'MALAM' = 'PAGI',
  ): Promise<ShiftComplianceData> {
    return this.dashboardService.getShiftCompliance(siteId, shift);
  }

  @Get('notifications')
  async getNotifications(@Query('limit') limit?: string): Promise<DashboardNotificationItem[]> {
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    return this.dashboardService.getRecentNotifications(isNaN(parsedLimit) ? 10 : parsedLimit);
  }

  @Get('patrol-activity')
  async getPatrolActivity(
    @Query('date') date?: string,
    @Query('siteId') siteId?: string,
  ): Promise<PatrolHourlyActivity[]> {
    return this.dashboardService.getHourlyPatrolActivity(date, siteId);
  }
}
