import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenSet } from 'openid-client';
import { AUTH_SERVICE } from '../constants';
import { AuthService } from './auth.service';
import { CaudexError } from '../interfaces';

@Injectable()
export class SessionGuard implements CanActivate {
  private readonly logger: Logger = new Logger(SessionGuard.name);

  constructor(
    @Inject(AUTH_SERVICE) private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    request.session.tokenSet = new TokenSet(request.session.tokenSet);

    const isAuthenticated: boolean =
      request.session.tokenSet != null && request.session.user != null;
    if (isAuthenticated && request.session.tokenSet.expired()) {
      try {
        request.session.tokenSet = await this.authService.refreshToken(
          request.session.tokenSet,
        );
      } catch (e) {
        this.logger.error('Error while trying to refresh token', e);
        throw new UnauthorizedException(
          new CaudexError(
            'login_required',
            'You must be logged in to continue',
          ),
        );
      }
    }

    return isAuthenticated;
  }
}
