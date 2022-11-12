import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserinfoResponse } from 'openid-client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: UserinfoResponse = request.session.user;
    if (!user) {
      return true;
    }

    const userRoles: string[] = [
      ...(request.session.user.resource_access?.account?.roles ?? []),
    ];

    return roles.some((role: string) => userRoles.includes(role));
  }
}
