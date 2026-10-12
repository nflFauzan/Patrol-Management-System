import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { PatrolService } from './patrol.service';
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
    @Body() body: {
      siteId: string;
      checkpointId: string;
      qrPayload: string;
      latitude: number;
      longitude: number;
      statusResult?: string;
      notes?: string;
      photoKey?: string;
    },
  ) {
    return this.patrolService.recordScan(user.id, body);
  }
}
