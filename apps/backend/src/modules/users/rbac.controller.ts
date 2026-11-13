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

@Controller('rbac')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class RbacController {
  constructor(private readonly usersService: UsersService) {}

  @Get('roles')
  async getRoles() {
    return this.usersService.getAllRoles();
  }

  @Post('roles')
  @Permissions('RBAC:MANAGE')
  async createRole(
    @Body() body: { code: string; name: string; description?: string; permissionIds?: string[] },
  ) {
    return this.usersService.createRole(body);
  }

  @Get('permissions')
  async getPermissions() {
    return this.usersService.getAllPermissions();
  }
}
