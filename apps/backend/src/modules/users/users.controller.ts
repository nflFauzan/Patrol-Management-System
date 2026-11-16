import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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

  // RBAC Role & Permission Management Endpoints
  @Get('rbac/roles')
  @Permissions('RBAC:MANAGE', 'DATA_INDUK:VIEW')
  async getRoles(): Promise<any[]> {
    return this.usersService.getAllRoles();
  }

  @Post('rbac/roles')
  @Permissions('RBAC:MANAGE')
  async createRole(
    @Body() dto: { code: string; name: string; description?: string; permissions?: string[] },
  ): Promise<any> {
    return this.usersService.createRole(dto);
  }

  @Put('rbac/roles/:id')
  @Permissions('RBAC:MANAGE')
  async updateRole(
    @Param('id') id: string,
    @Body() dto: { name?: string; description?: string; permissions?: string[]; isActive?: boolean },
  ): Promise<any> {
    return this.usersService.updateRole(id, dto);
  }

  @Delete('rbac/roles/:id')
  @Permissions('RBAC:MANAGE')
  async deactivateRole(@Param('id') id: string): Promise<any> {
    return this.usersService.deactivateRole(id);
  }

  @Get('rbac/permissions')
  @Permissions('RBAC:MANAGE', 'DATA_INDUK:VIEW')
  async getPermissions(): Promise<any[]> {
    return this.usersService.getAllPermissions();
  }

  @Put(':id/role')
  @Permissions('RBAC:MANAGE')
  async assignUserRole(
    @Param('id') userId: string,
    @Body('roleId') roleId: string,
  ): Promise<User> {
    return this.usersService.assignUserRole(userId, roleId);
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
