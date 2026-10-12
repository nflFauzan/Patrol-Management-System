import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CheckpointsService } from './checkpoints.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, Division, Checkpoint } from '@patrol/types';

@Controller('checkpoints')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CheckpointsController {
  constructor(private checkpointsService: CheckpointsService) {}

  @Get('site/:siteId')
  async getBySite(
    @Param('siteId') siteId: string,
    @Query('division') division?: Division,
  ): Promise<Checkpoint[]> {
    return this.checkpointsService.findBySite(siteId, division);
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<Checkpoint> {
    return this.checkpointsService.findById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN_SUPER, UserRole.OPS_MANAGER, UserRole.SITE_SUPERVISOR)
  async create(@Body() body: Partial<Checkpoint>): Promise<Checkpoint> {
    return this.checkpointsService.create(body);
  }
}
