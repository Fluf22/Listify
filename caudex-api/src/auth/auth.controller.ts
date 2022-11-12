import {
  Controller,
  Get,
  HttpStatus,
  Inject,
  Logger,
  Query,
  Redirect,
  Session,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { CookieGuard } from './cookie.guard';
import { Session as ExpressSession } from 'express-session';
import { RedirectResponse } from '@nestjs/core/router/router-response-controller';
import { Public } from 'nest-keycloak-connect';
import { AUTH_SERVICE } from '../constants';

@ApiTags('auth')
@Controller({
  version: '1',
  path: 'auth',
})
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    @Inject(AUTH_SERVICE) private readonly authService: AuthService,
  ) {}

  @Get('login')
  @Public()
  @Redirect()
  async initLoginFlow(
    @Session() session: ExpressSession,
  ): Promise<RedirectResponse> {
    this.logger.log('Init login flow');
    const url = await this.authService.initLoginFlow(session);
    return {
      url,
      statusCode: HttpStatus.FOUND,
    };
  }

  @Get('oauth-callback')
  @Public()
  @Redirect()
  async wrapUpLoginFlow(
    @Session() session: ExpressSession,
    @Query('state') stateFromServer: string,
    @Query('userState') userState: string,
    @Query('code') code: string,
  ): Promise<RedirectResponse> {
    this.logger.log(`Wrap-up login flow`);
    const url = await this.authService.wrapUpLoginFlow(
      session,
      stateFromServer,
      code,
    );
    return {
      url,
      statusCode: HttpStatus.FOUND,
    };
  }

  @Get('logout')
  @Redirect()
  async logout(@Session() session: ExpressSession): Promise<RedirectResponse> {
    this.logger.log('User called logout');
    const url = await this.authService.logout(session);
    return {
      url,
      statusCode: HttpStatus.FOUND,
    };
  }
}
