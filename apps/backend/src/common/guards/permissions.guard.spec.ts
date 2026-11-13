import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new PermissionsGuard(reflector);
  });

  const createMockContext = (user: any): ExecutionContext => ({
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
      getResponse: jest.fn(),
      getNext: jest.fn(),
    }),
  } as unknown as ExecutionContext);

  it('should return true if no permissions metadata is defined', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
    const context = createMockContext({ id: '1', role: 'SECURITY_OFFICER', permissions: [] });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should return true if user is ADMIN_SUPER regardless of permissions', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['RBAC:MANAGE']);
    const context = createMockContext({ id: '1', role: 'ADMIN_SUPER', permissions: [] });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should return true if user has the required permission', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['USER:APPROVE']);
    const context = createMockContext({ id: '2', role: 'OPS_MANAGER', permissions: ['USER:APPROVE', 'DATA_INDUK:VIEW'] });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException if user lacks the required permission', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['USER:APPROVE']);
    const context = createMockContext({ id: '3', role: 'SECURITY_OFFICER', permissions: ['PATROL:VALIDATE'] });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
