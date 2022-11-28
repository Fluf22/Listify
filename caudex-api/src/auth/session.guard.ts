import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { TokenSet } from 'openid-client';
import { AUTH_SERVICE } from '../constants';
import { AuthService } from './auth.service';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    @Inject(AUTH_SERVICE) private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    request.session.tokenSet = new TokenSet(request.session.tokenSet);

    const isAuthenticated: boolean =
      request.session.tokenSet != null && request.session.user != null;
    if (isAuthenticated && request.session.tokenSet.expired()) {
      request.session.tokenSet = await this.authService.refreshToken(
        request.session.tokenSet,
      );
    }

    return isAuthenticated;
  }
}
