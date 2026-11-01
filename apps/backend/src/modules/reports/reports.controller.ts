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
    @Query('lokasi') lokasi?: string,
    @Query('posisi') posisi?: string,
    @Query('bulan') bulan?: string,
    @Query('tahun') tahun?: string,
  ) {
    const finalMonth = month || bulan;
    const finalYear = year || tahun;
    const finalSite = siteId || (lokasi && lokasi !== 'Semua Lokasi' ? lokasi : undefined);
    const finalDiv = division || (posisi && posisi !== 'Semua Posisi' ? posisi : undefined);

    const rows = await this.reportsService.getPayrollSummary({
      month: finalMonth ? parseInt(finalMonth, 10) : undefined,
      year: finalYear ? parseInt(finalYear, 10) : undefined,
      siteId: finalSite,
      division: finalDiv,
    });

    return {
      rows,
      data: rows,
      recordsTotal: String(rows.length),
      recordsFiltered: String(rows.length),
    };
  }

  @Post('fetch_absensi.php')
  @Get('fetch_absensi.php')
  @Post('fetch-absensi')
  @Get('fetch-absensi')
  @Roles(UserRole.ADMIN_SUPER, UserRole.OPS_MANAGER, UserRole.SITE_SUPERVISOR)
  async fetchAbsensiParity(@Body() body: any = {}, @Query() query: any = {}) {
    const p = { ...query, ...body };
    const month = p.bulan || p.month;
    const year = p.tahun || p.year;
    const site = p.lokasi || p.siteId;
    const division = p.posisi || p.division;

    const rows = await this.reportsService.getPayrollSummary({
      month: month ? parseInt(month, 10) : undefined,
      year: year ? parseInt(year, 10) : undefined,
      siteId: site && site !== 'Semua Lokasi' ? site : undefined,
      division: division && division !== 'Semua Posisi' ? division : undefined,
    });

    return {
      draw: p.draw ? Number(p.draw) : 1,
      recordsTotal: String(rows.length),
      recordsFiltered: String(rows.length),
      data: rows,
      rows,
    };
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

  // ============================================================================
  // EXPORT LAPORAN ENDPOINTS (100% PARITY DENGAN PATROLI.SITE)
  // ============================================================================

  @Get('export/categories')
  @Roles(UserRole.ADMIN_SUPER, UserRole.OPS_MANAGER, UserRole.SITE_SUPERVISOR, UserRole.ADMIN_AREA)
  async getExportCategories(@Query('siteId') siteId?: string, @Query('area') area?: string) {
    const categories = await this.reportsService.getCategoriesForExport(siteId || area);
    return { success: true, data: categories };
  }

  @Post('get_kategori.php')
  @Get('get_kategori.php')
  @Roles(UserRole.ADMIN_SUPER, UserRole.OPS_MANAGER, UserRole.SITE_SUPERVISOR, UserRole.ADMIN_AREA)
  async getKategoriPhp(@Body() body: any = {}, @Query() query: any = {}, @Res() reply?: FastifyReply) {
    const area = body.area || query.area || '';
    const categories = await this.reportsService.getCategoriesForExport(area);
    let html = '<option value="">-- PILIH KATEGORI --</option>';
    categories.forEach((cat) => {
      html += `<option value="${cat}">${cat.toUpperCase()}</option>`;
    });
    if (reply) {
      reply.header('Content-Type', 'text/html; charset=UTF-8');
      return reply.send(html);
    }
    return html;
  }

  @Get('export/personnel')
  @Roles(UserRole.ADMIN_SUPER, UserRole.OPS_MANAGER, UserRole.SITE_SUPERVISOR, UserRole.ADMIN_AREA)
  async getExportPersonnel(
    @Query('siteId') siteId?: string,
    @Query('area') area?: string,
    @Query('category') category?: string,
    @Query('kategori') kategori?: string,
  ) {
    const personnel = await this.reportsService.getPersonnelForExport(siteId || area, category || kategori);
    return { success: true, data: personnel };
  }

  @Post('get_personil.php')
  @Get('get_personil.php')
  @Roles(UserRole.ADMIN_SUPER, UserRole.OPS_MANAGER, UserRole.SITE_SUPERVISOR, UserRole.ADMIN_AREA)
  async getPersonilPhp(@Body() body: any = {}, @Query() query: any = {}, @Res() reply?: FastifyReply) {
    const area = body.area || query.area || '';
    const kategori = body.kategori || query.kategori || '';
    const personnel = await this.reportsService.getPersonnelForExport(area, kategori);
    let html = '<option value="">-- PILIH PERSONIL --</option>';
    personnel.forEach((p) => {
      html += `<option value="${p.fullName.toLowerCase()}">${p.fullName.toUpperCase()}</option>`;
    });
    if (reply) {
      reply.header('Content-Type', 'text/html; charset=UTF-8');
      return reply.send(html);
    }
    return html;
  }

  @Get('export/attendance-personnel')
  @Post('export/attendance-personnel')
  @Roles(UserRole.ADMIN_SUPER, UserRole.OPS_MANAGER, UserRole.SITE_SUPERVISOR, UserRole.ADMIN_AREA)
  async getExportAttendancePersonnel(
    @Query() query: any = {},
    @Body() body: any = {},
  ) {
    const p = { ...query, ...body };
    return this.reportsService.getExportAttendancePersonnel({
      siteId: p.siteId || p.lokasi_area,
      areaName: p.areaName || p.lokasi_area,
      category: p.category || p.kategori,
      userId: p.userId,
      personnelName: p.personnelName || p.nama_personil,
      fromDate: p.fromDate || p.dari,
      toDate: p.toDate || p.sampai,
    });
  }

  @Get('export/attendance-area')
  @Post('export/attendance-area')
  @Roles(UserRole.ADMIN_SUPER, UserRole.OPS_MANAGER, UserRole.SITE_SUPERVISOR, UserRole.ADMIN_AREA)
  async getExportAttendanceArea(
    @Query() query: any = {},
    @Body() body: any = {},
  ) {
    const p = { ...query, ...body };
    return this.reportsService.getExportAttendanceArea({
      siteId: p.siteId || p.lokasi_area,
      areaName: p.areaName || p.lokasi_area,
      category: p.category || p.kategori,
      fromDate: p.fromDate || p.dari,
      toDate: p.toDate || p.sampai,
    });
  }

  @Get('export/activity-personnel')
  @Post('export/activity-personnel')
  @Roles(UserRole.ADMIN_SUPER, UserRole.OPS_MANAGER, UserRole.SITE_SUPERVISOR, UserRole.ADMIN_AREA)
  async getExportActivityPersonnel(
    @Query() query: any = {},
    @Body() body: any = {},
  ) {
    const p = { ...query, ...body };
    return this.reportsService.getExportActivityPersonnel({
      siteId: p.siteId || p.lokasi_area,
      areaName: p.areaName || p.lokasi_area,
      category: p.category || p.kategori,
      userId: p.userId,
      personnelName: p.personnelName || p.nama_personil,
      fromDate: p.fromDate || p.dari,
      toDate: p.toDate || p.sampai,
    });
  }

  @Get('export/activity-area')
  @Post('export/activity-area')
  @Roles(UserRole.ADMIN_SUPER, UserRole.OPS_MANAGER, UserRole.SITE_SUPERVISOR, UserRole.ADMIN_AREA)
  async getExportActivityArea(
    @Query() query: any = {},
    @Body() body: any = {},
  ) {
    const p = { ...query, ...body };
    return this.reportsService.getExportActivityArea({
      siteId: p.siteId || p.lokasi_area,
      areaName: p.areaName || p.lokasi_area,
      category: p.category || p.kategori,
      fromDate: p.fromDate || p.dari,
      toDate: p.toDate || p.sampai,
    });
  }

  @Post('cetak_absensi_personil')
  @Roles(UserRole.ADMIN_SUPER, UserRole.OPS_MANAGER, UserRole.SITE_SUPERVISOR, UserRole.ADMIN_AREA)
  async cetakAbsensiPersonil(@Body() body: any = {}, @Res() reply: FastifyReply) {
    const data = await this.reportsService.getExportAttendancePersonnel({
      areaName: body.lokasi_area,
      category: body.kategori,
      personnelName: body.nama_personil,
      fromDate: body.dari,
      toDate: body.sampai,
    });
    return reply.send(data);
  }

  @Post('cetak_absensi_area')
  @Roles(UserRole.ADMIN_SUPER, UserRole.OPS_MANAGER, UserRole.SITE_SUPERVISOR, UserRole.ADMIN_AREA)
  async cetakAbsensiArea(@Body() body: any = {}, @Res() reply: FastifyReply) {
    const data = await this.reportsService.getExportAttendanceArea({
      areaName: body.lokasi_area,
      category: body.kategori,
      fromDate: body.dari,
      toDate: body.sampai,
    });
    return reply.send(data);
  }

  @Post('cetak_patroli_personil')
  @Roles(UserRole.ADMIN_SUPER, UserRole.OPS_MANAGER, UserRole.SITE_SUPERVISOR, UserRole.ADMIN_AREA)
  async cetakPatroliPersonil(@Body() body: any = {}, @Res() reply: FastifyReply) {
    const data = await this.reportsService.getExportActivityPersonnel({
      areaName: body.lokasi_area,
      category: body.kategori,
      personnelName: body.nama_personil,
      fromDate: body.dari,
      toDate: body.sampai,
    });
    return reply.send(data);
  }

  @Post('cetak_patroli_area')
  @Roles(UserRole.ADMIN_SUPER, UserRole.OPS_MANAGER, UserRole.SITE_SUPERVISOR, UserRole.ADMIN_AREA)
  async cetakPatroliArea(@Body() body: any = {}, @Res() reply: FastifyReply) {
    const data = await this.reportsService.getExportActivityArea({
      areaName: body.lokasi_area,
      category: body.kategori,
      fromDate: body.dari,
      toDate: body.sampai,
    });
    return reply.send(data);
  }
}


