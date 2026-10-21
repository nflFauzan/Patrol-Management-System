import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
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

  @Get('records')
  async getCleaningRecords(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('siteName') siteName?: string,
    @Query('search') search?: string,
  ) {
    return this.cleaningService.getCleaningRecords({ page, limit, siteName, search });
  }

  @Get(':id/detail')
  async getCleaningDetail(@Param('id') id: string) {
    return this.cleaningService.getCleaningDetail(id);
  }

  @Post(':id/tl')
  async updateTindakLanjut(
    @Param('id') id: string,
    @Body() body: { notes?: string },
  ) {
    return this.cleaningService.updateTindakLanjut(id, body?.notes);
  }
}

