import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@patrol/types';

@Controller('rbac')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class RbacController {
  constructor(private readonly usersService: UsersService) {}

  @Get('roles')
  @Roles(UserRole.ADMIN_SUPER, UserRole.ADMIN_AREA, UserRole.OPS_MANAGER)
  @Permissions('RBAC:MANAGE')
  async getRoles() {
    return this.usersService.getAllRoles();
  }

  @Post('roles')
  @Roles(UserRole.ADMIN_SUPER, UserRole.OPS_MANAGER)
  @Permissions('RBAC:MANAGE')
  async createRole(
    @Body() body: { code: string; name: string; description?: string; permissionIds?: string[] },
  ) {
    return this.usersService.createRole(body);
  }

  @Get('permissions')
  @Roles(UserRole.ADMIN_SUPER, UserRole.ADMIN_AREA, UserRole.OPS_MANAGER)
  @Permissions('RBAC:MANAGE')
  async getPermissions() {
    return this.usersService.getAllPermissions();
  }
}
