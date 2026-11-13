import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { UserRole } from '@patrol/types';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User context not found');
    }

    // Super Admin has universal access
    if (user.role === UserRole.ADMIN_SUPER || (user.role as string) === 'ADMIN_SUPER' || (user.role as string) === 'SUPER_ADMIN') {
      return true;
    }

    const userPermissions: string[] = user.permissions || [];
    const hasPermission = requiredPermissions.some((perm) => userPermissions.includes(perm));

    if (!hasPermission) {
      throw new ForbiddenException('Anda tidak memiliki hak akses yang memadai untuk tindakan ini.');
    }

    return true;
  }
}
