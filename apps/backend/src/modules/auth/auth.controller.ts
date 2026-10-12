import { Controller, Post, Body, Get, Patch, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequestDto, LoginResponseDto, User } from '@patrol/types';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginRequestDto): Promise<LoginResponseDto> {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: User): Promise<User> {
    return this.authService.getProfile(user.id);
  }

  @Get('users')
  @UseGuards(JwtAuthGuard)
  async getUsers(
    @Query('siteId') siteId?: string,
    @Query('division') division?: string,
  ): Promise<User[]> {
    return this.authService.getAllUsers(siteId, division);
  }

  @Post('users')
  @UseGuards(JwtAuthGuard)
  async createUser(@Body() body: any): Promise<User> {
    return this.authService.createUser(body);
  }

  @Post('bulk-import')
  @UseGuards(JwtAuthGuard)
  async bulkImport(@Body() body: { items: any[] }) {
    return this.authService.bulkImportPersonil(body.items || []);
  }

  @Get('template/csv')
  async getTemplate() {
    return { templateCsv: this.authService.getPersonilTemplate() };
  }

  @Patch('users/:id/password')
  @UseGuards(JwtAuthGuard)
  async updatePassword(
    @Param('id') userId: string,
    @Body('password') password: string,
  ) {
    const success = await this.authService.updatePassword(userId, password);
    return { success };
  }

  @Patch('users/:id/photo')
  @UseGuards(JwtAuthGuard)
  async updatePhoto(
    @Param('id') userId: string,
    @Body('photoKey') photoKey: string,
  ) {
    const success = await this.authService.updatePhoto(userId, photoKey);
    return { success };
  }
}

