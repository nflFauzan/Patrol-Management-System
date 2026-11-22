import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { StaffService } from './staff.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, CreateStaffActivityDto } from '@patrol/types';

@Controller('staff')
@UseGuards(JwtAuthGuard)
export class StaffController {
  constructor(private staffService: StaffService) {}

  @Get('categories')
  getCategories() {
    return {
      success: true,
      categories: this.staffService.getCategories(),
    };
  }

  @Post('activities')
  async createActivity(
    @CurrentUser() user: User,
    @Body() body: CreateStaffActivityDto,
  ) {
    return this.staffService.createActivity(user.id, body);
  }

  @Get('activities')
  async getActivities(
    @Query('siteId') siteId?: string,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.staffService.getActivities({ siteId, limit, search });
  }
}

