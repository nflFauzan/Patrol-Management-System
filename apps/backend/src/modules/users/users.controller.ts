import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { VerifyDeleteDto } from './dto/verify-delete.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { UserRole, User, ApproveUserDto, RejectUserDto } from '@patrol/types';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('approval-queue')
  @Permissions('USER:APPROVE')
  async getApprovalQueue(): Promise<any[]> {
    return this.usersService.getApprovalQueue();
  }

  @Post(':id/approve')
  @Permissions('USER:APPROVE')
  async approveUser(
    @Param('id') id: string,
    @Body() dto: ApproveUserDto,
    @Request() req: any,
  ): Promise<any> {
    const adminId = req.user?.id || req.user?.sub;
    return this.usersService.approveUser(id, dto, adminId);
  }

  @Post(':id/reject')
  @Permissions('USER:APPROVE')
  async rejectUser(
    @Param('id') id: string,
    @Body() dto: RejectUserDto,
    @Request() req: any,
  ): Promise<any> {
    const adminId = req.user?.id || req.user?.sub;
    return this.usersService.rejectUser(id, dto, adminId);
  }

  @Get('id-card-batch')
  async getIdCardBatch(
    @Query('siteId') siteId?: string,
    @Query('division') division?: string,
    @Query('securityRank') securityRank?: string,
  ) {
    return this.usersService.getIdCardBatch({ siteId, division, securityRank });
  }

  @Get()
  async getAll(
    @Query('siteId') siteId?: string,
    @Query('division') division?: string,
    @Query('search') search?: string,
  ): Promise<User[]> {
    return this.usersService.findAll({ siteId, division, search });
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<User> {
    return this.usersService.findById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN_SUPER, UserRole.ADMIN_AREA, UserRole.OPS_MANAGER)
  async create(@Body() dto: CreateUserDto): Promise<User> {
    return this.usersService.create(dto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN_SUPER, UserRole.ADMIN_AREA, UserRole.OPS_MANAGER)
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto): Promise<User> {
    return this.usersService.update(id, dto);
  }

  @Post('verify-delete')
  @Roles(UserRole.ADMIN_SUPER, UserRole.ADMIN_AREA, UserRole.OPS_MANAGER)
  async verifyAndDelete(
    @Request() req: any,
    @Body() dto: { targetUserId: string; passwordConfirm: string; adminId?: string },
  ) {
    const adminId = dto.adminId || req.user?.id || req.user?.sub;
    return this.usersService.verifyAndDeleteUser({
      adminId,
      targetUserId: dto.targetUserId,
      passwordConfirm: dto.passwordConfirm,
    });
  }
}
