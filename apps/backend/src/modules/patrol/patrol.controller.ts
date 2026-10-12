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

  @Patch('incidents/:id/resolve')
  async resolveIncident(
    @Param('id') ticketId: string,
    @CurrentUser() user: User,
    @Body('notes') notes: string,
  ) {
    return this.patrolService.resolveIncidentTicket(ticketId, user.id, notes || 'Insiden selesai ditangani.');
  }
}
