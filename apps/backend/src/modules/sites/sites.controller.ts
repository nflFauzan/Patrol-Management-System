import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { SitesService } from './sites.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, Site } from '@patrol/types';

@Controller('sites')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SitesController {
  constructor(private sitesService: SitesService) {}

  @Get()
  async getAll(): Promise<Site[]> {
    return this.sitesService.findAll();
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<Site> {
    return this.sitesService.findById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN_SUPER, UserRole.OPS_MANAGER)
  async create(@Body() body: Partial<Site>): Promise<Site> {
    return this.sitesService.create(body);
  }

  @Post(':id/verify-geofence')
  async verifyGeofence(
    @Param('id') id: string,
    @Body() body: { latitude: number; longitude: number },
  ) {
    return this.sitesService.verifyGeofence(id, body.latitude, body.longitude);
  }
}
