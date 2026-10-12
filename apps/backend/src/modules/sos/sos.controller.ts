import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { SosService } from './sos.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '@patrol/types';

@Controller('sos')
@UseGuards(JwtAuthGuard)
export class SosController {
  constructor(private sosService: SosService) {}

  @Post('trigger')
  async trigger(
    @CurrentUser() user: User,
    @Body() body: { siteId: string; latitude: number; longitude: number; message?: string },
  ) {
    return this.sosService.triggerSos(user.id, body);
  }

  @Get('active')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN_SUPER, UserRole.OPS_MANAGER, UserRole.SITE_SUPERVISOR)
  async getActive() {
    return this.sosService.getActiveAlerts();
  }

  @Post(':id/acknowledge')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN_SUPER, UserRole.OPS_MANAGER, UserRole.SITE_SUPERVISOR)
  async acknowledge(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.sosService.acknowledgeAlert(id, user.id);
  }

  @Post(':id/resolve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN_SUPER, UserRole.OPS_MANAGER, UserRole.SITE_SUPERVISOR)
  async resolve(
    @Param('id') id: string,
    @Body() body: { resolutionNotes: string },
  ) {
    return this.sosService.resolveAlert(id, body.resolutionNotes);
  }
}
