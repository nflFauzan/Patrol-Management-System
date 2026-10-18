import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PatrolService, RecordScanDto } from './patrol.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@patrol/types';

@Controller('patrol')
@UseGuards(JwtAuthGuard)
export class PatrolController {
  constructor(private patrolService: PatrolService) {}

  @Get('logs')
  async getLogs(
    @Query('siteId') siteId?: string,
    @Query('limit') limit?: number,
  ) {
    return this.patrolService.getLogs(siteId, limit);
  }

  @Get('hourly-monitoring')
  async getHourlyMonitoring(
    @Query('date') date?: string,
    @Query('siteId') siteId?: string,
  ) {
    return this.patrolService.getHourlyMonitoringMatrix(date, siteId);
  }

  @Post('scan')
  async recordScan(
    @CurrentUser() user: User,
    @Body() body: RecordScanDto,
  ) {
    return this.patrolService.recordScan(user.id, body);
  }

  @Get('incidents')
  async getIncidents(@Query('siteId') siteId?: string) {
    return this.patrolService.getIncidentTickets(siteId);
  }

  @Get('records')
  async getRecords(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('siteName') siteName?: string,
    @Query('search') search?: string,
  ) {
    return this.patrolService.getPatrolRecords({ page, limit, siteName, search });
  }

  @Get(':id/detail')
  async getDetail(@Param('id') id: string) {
    return this.patrolService.getPatrolDetail(id);
  }

  @Post(':id/tl')
  async updateTl(
    @Param('id') id: string,
    @Body('notes') notes?: string,
  ) {
    return this.patrolService.updateTindakLanjut(id, notes);
  }

  @Patch('incidents/:id/resolve')
  async resolveIncident(
    @Param('id') ticketId: string,
    @CurrentUser() user: User,
    @Body('notes') notes: string,
  ) {
    return this.patrolService.resolveIncidentTicket(ticketId, user.id, notes || 'Insiden selesai ditangani.');
  }
}
