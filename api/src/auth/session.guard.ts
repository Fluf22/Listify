import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class SessionGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    return true;
  }
}
