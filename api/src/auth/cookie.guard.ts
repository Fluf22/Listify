import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class CookieGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    return context.switchToHttp().getRequest().isAuthenticated();
  }
}
