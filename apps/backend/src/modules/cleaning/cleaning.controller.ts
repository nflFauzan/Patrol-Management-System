import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { CleaningService, SubmitCleaningChecklistDto } from './cleaning.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@patrol/types';

@Controller('cleaning')
@UseGuards(JwtAuthGuard)
export class CleaningController {
  constructor(private cleaningService: CleaningService) {}

  @Get('checklists')
  async getChecklists(
    @Query('siteId') siteId?: string,
    @Query('limit') limit?: number,
  ) {
    return this.cleaningService.getChecklists(siteId, limit);
  }

  @Post('checklist')
  async submitChecklist(
    @CurrentUser() user: User,
    @Body() body: SubmitCleaningChecklistDto,
  ) {
    return this.cleaningService.submitChecklist(user.id, body);
  }
}
