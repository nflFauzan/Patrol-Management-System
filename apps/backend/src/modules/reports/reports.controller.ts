import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@patrol/types';
import { FastifyReply } from 'fastify';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('hris-attendance')
  @Roles(UserRole.ADMIN_SUPER, UserRole.OPS_MANAGER, UserRole.SITE_SUPERVISOR)
  async getHrisRecap(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('siteId') siteId?: string,
    @Query('division') division?: string,
  ) {
    return this.reportsService.getHrisAttendanceRecap({ startDate, endDate, siteId, division });
  }

  @Get('export-hris-csv')
  @Roles(UserRole.ADMIN_SUPER, UserRole.OPS_MANAGER, UserRole.SITE_SUPERVISOR)
  async exportCsv(
    @Res() reply: FastifyReply,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('siteId') siteId?: string,
    @Query('division') division?: string,
  ) {
    const csvContent = await this.reportsService.exportCsv({ startDate, endDate, siteId, division });

    reply.header('Content-Type', 'text/csv');
    reply.header('Content-Disposition', `attachment; filename="rekap_hris_${new Date().toISOString().split('T')[0]}.csv"`);
    return reply.send(csvContent);
  }
}
