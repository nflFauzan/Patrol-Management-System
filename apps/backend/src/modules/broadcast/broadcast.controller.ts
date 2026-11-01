import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
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

  @Get('history')
  async getHistory(@Query('siteId') siteId?: string): Promise<BroadcastMessage[]> {
    return this.broadcastService.getAll(siteId);
  }

  @Get('active')
  async getActive(@Query('siteId') siteId?: string): Promise<BroadcastMessage[]> {
    return this.broadcastService.getAll(siteId);
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<BroadcastMessage> {
    return this.broadcastService.getById(id);
  }

  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() body: { siteId?: string | null; content: string; title?: string; priority?: string },
  ): Promise<BroadcastMessage> {
    return this.broadcastService.create(user.id, user.fullName || user.username, body);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { siteId?: string | null; content?: string; title?: string; priority?: string },
  ): Promise<BroadcastMessage> {
    return this.broadcastService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ success: boolean; id: string }> {
    return this.broadcastService.delete(id);
  }
}
