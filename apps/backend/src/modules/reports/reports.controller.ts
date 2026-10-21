import { Controller, Get, Post, Body, Query, Param, Res, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
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

  @Get('payroll')
  @Roles(UserRole.ADMIN_SUPER, UserRole.OPS_MANAGER, UserRole.SITE_SUPERVISOR)
  async getPayroll(
    @Query('month') month?: string,
    @Query('year') year?: string,
    @Query('siteId') siteId?: string,
    @Query('division') division?: string,
  ) {
    return this.reportsService.getPayrollSummary({
      month: month ? parseInt(month, 10) : undefined,
      year: year ? parseInt(year, 10) : undefined,
      siteId,
      division,
    });
  }

  @Get('chief-evaluations')
  @Roles(UserRole.ADMIN_SUPER, UserRole.OPS_MANAGER, UserRole.SITE_SUPERVISOR)
  async getChiefEvaluations(@Query('siteId') siteId?: string) {
    return this.reportsService.getChiefEvaluations(siteId);
  }

  @Get('chief-evaluations/:id')
  @Roles(UserRole.ADMIN_SUPER, UserRole.OPS_MANAGER, UserRole.SITE_SUPERVISOR)
  async getChiefEvaluationDetail(@Param('id') id: string) {
    return this.reportsService.getChiefEvaluationDetail(id);
  }

  @Post('chief-evaluations')
  @Roles(UserRole.ADMIN_SUPER, UserRole.OPS_MANAGER, UserRole.SITE_SUPERVISOR)
  async createChiefEvaluation(@Body() body: any, @CurrentUser() user: any) {
    return this.reportsService.createChiefEvaluation(user.id, body);
  }

  @Get('komandan-logs')
  @Roles(UserRole.ADMIN_SUPER, UserRole.OPS_MANAGER, UserRole.SITE_SUPERVISOR)
  async getKomandanLogs(@Query('siteId') siteId?: string) {
    return this.reportsService.getKomandanLogs(siteId);
  }

  @Get('staff-activities')
  @Roles(UserRole.ADMIN_SUPER, UserRole.OPS_MANAGER, UserRole.SITE_SUPERVISOR)
  async getStaffActivities(@Query('siteId') siteId?: string) {
    return this.reportsService.getStaffActivities(siteId);
  }

  @Post('staff-activities')
  @Roles(UserRole.ADMIN_SUPER, UserRole.OPS_MANAGER, UserRole.STAFF)
  async createStaffActivity(@Body() body: any, @CurrentUser() user: any) {
    return this.reportsService.createStaffActivity(user.id, body);
  }
}

