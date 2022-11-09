import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';

import { MAIL_WORKER } from '../constants';
import { PrismaService } from '../prisma.service';
import { UsersService } from '../users/users.service';
import { Session } from 'express-session';
import { FusionAuthService } from '../fusionauth.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private prismaService: PrismaService,
    private configService: ConfigService,
    private fusionAuthService: FusionAuthService,
    @Inject(MAIL_WORKER) private mailWorker: ClientProxy,
  ) {}

  async initLoginFlow(session: Session): Promise<string> {
    const codeChallenge: string = await this.fusionAuthService.initLoginFlow(
      session,
    );
    const authAppURL = this.configService.get('FUSIONAUTH_APP_URL');
    const clientId = this.fusionAuthService.clientId;
    const redirectUri = this.fusionAuthService.redirectURI;
    return (
      `${authAppURL}/oauth2/authorize?` +
      `client_id=${clientId}` +
      `&response_type=code` +
      `&redirect_uri=${redirectUri}` +
      `&state=${(session as any).stateValue}` +
      `&code_challenge=${codeChallenge}` +
      `&code_challenge_method=S256` +
      `&scope=offline_access`
    );
  }

  async wrapUpLoginFlow(
    session: Session,
    stateFromServer: string,
    code: string,
  ): Promise<string> {
    const sessionState = (session as any).stateValue;
    if (stateFromServer !== sessionState) {
      this.logger.log(
        `OAuth states don't match ${stateFromServer}/${sessionState}`,
      );
      throw new BadRequestException('oauth_failure');
    }

    await this.fusionAuthService.wrapUpLoginFlow(
      session,
      stateFromServer,
      code,
    );
    return this.configService.get('APP_URL');
  }

  async logout(session: Session): Promise<string> {
    return new Promise(async (resolve) => {
      await this.fusionAuthService.logoutAuthSessions(session);
      session.destroy(() => {
        this.logger.log('Server-side session destroyed');
        const redirectURL: string = this.configService.get('APP_URL');
        resolve(redirectURL);
      });
    });
  }
}
