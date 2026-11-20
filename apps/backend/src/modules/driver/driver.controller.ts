import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { DriverService, StartTripDto, CompleteTripDto } from './driver.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '@patrol/types';

@Controller('driver')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DriverController {
  constructor(private driverService: DriverService) {}

  @Post('trips/start')
  @Roles(UserRole.DRIVER, UserRole.ADMIN_SUPER)
  async startTrip(
    @CurrentUser() user: User,
    @Body() body: StartTripDto,
  ) {
    return this.driverService.startTrip(user.id, body);
  }

  @Post('trips/:id/complete')
  @Roles(UserRole.DRIVER, UserRole.ADMIN_SUPER)
  async completeTrip(
    @Param('id') tripId: string,
    @CurrentUser() user: User,
    @Body() body: CompleteTripDto,
  ) {
    return this.driverService.completeTrip(tripId, user.id, body);
  }

  @Get('trips/active')
  async getActiveTrip(@CurrentUser() user: User) {
    return this.driverService.getActiveTrip(user.id);
  }

  @Get('trips')
  async getTrips(
    @Query('siteId') siteId?: string,
    @Query('limit') limit?: number,
  ) {
    return this.driverService.getTrips(siteId, limit);
  }
}
