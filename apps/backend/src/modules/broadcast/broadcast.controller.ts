import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { BroadcastService } from './broadcast.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, BroadcastMessage } from '@patrol/types';

@Controller('broadcast')
@UseGuards(JwtAuthGuard)
export class BroadcastController {
  constructor(private broadcastService: BroadcastService) {}

  @Get()
  async getAll(@Query('siteId') siteId?: string): Promise<BroadcastMessage[]> {
    return this.broadcastService.getAll(siteId);
  }

  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() body: { siteId?: string; content: string; title?: string },
  ): Promise<BroadcastMessage> {
    return this.broadcastService.create(user.id, user.fullName, body);
  }
}
