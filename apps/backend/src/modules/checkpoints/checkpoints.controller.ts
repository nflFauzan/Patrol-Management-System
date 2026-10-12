import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CheckpointsService, CheckpointItem } from './checkpoints.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@patrol/types';

@Controller('checkpoints')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CheckpointsController {
  constructor(private checkpointsService: CheckpointsService) {}

  @Get('site/:siteId')
  async getBySite(
    @Param('siteId') siteId: string,
    @Query('category') category?: string,
  ): Promise<CheckpointItem[]> {
    return this.checkpointsService.findBySite(siteId, category);
  }

  @Get('scan/:qrToken')
  async getByQrToken(@Param('qrToken') qrToken: string): Promise<CheckpointItem> {
    return this.checkpointsService.findByQrToken(qrToken);
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<CheckpointItem> {
    return this.checkpointsService.findById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN_SUPER, UserRole.OPS_MANAGER, UserRole.SITE_SUPERVISOR)
  async create(@Body() body: any): Promise<CheckpointItem> {
    return this.checkpointsService.create(body);
  }

  @Post('bulk-import')
  @Roles(UserRole.ADMIN_SUPER, UserRole.OPS_MANAGER, UserRole.SITE_SUPERVISOR)
  async bulkImport(@Body() body: { items: any[] }) {
    return this.checkpointsService.bulkImport(body.items || []);
  }

  @Get('template/csv')
  async getTemplate() {
    return { templateCsv: this.checkpointsService.getImportTemplate() };
  }
}

