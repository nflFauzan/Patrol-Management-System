import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { DriverService, StartTripDto, CompleteTripDto } from './driver.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@patrol/types';

@Controller('driver')
@UseGuards(JwtAuthGuard)
export class DriverController {
  constructor(private driverService: DriverService) {}

  @Post('trips/start')
  async startTrip(
    @CurrentUser() user: User,
    @Body() body: StartTripDto,
  ) {
    return this.driverService.startTrip(user.id, body);
  }

  @Post('trips/:id/complete')
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
