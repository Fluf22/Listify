import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { FusionAuthClient, User, UUID } from '@fusionauth/typescript-client';
import { ConfigService } from '@nestjs/config';
import { isUUID } from 'class-validator';
import pkceChallenge from 'pkce-challenge';
import { Session } from 'express-session';

@Injectable()
export class FusionAuthService {
  private readonly logger = new Logger(FusionAuthService.name);

  client: FusionAuthClient = null;
  clientId: string = null;
  clientSecret: string = null;
  redirectURI: string = null;

  constructor(private readonly configService: ConfigService) {
    const authHost: string = configService.get('FUSIONAUTH_APP_URL');
    const apiKey: string = configService.get('FUSIONAUTH_API_KEY');
    this.client = new FusionAuthClient(apiKey, authHost);
    this.clientId = configService.get('CLIENT_ID');
    this.clientSecret = configService.get('CLIENT_SECRET');
    this.redirectURI = configService.get('REDIRECT_URI');
  }

  async findUserById(userId: string): Promise<User> {
    if (!isUUID(userId)) {
      throw new BadRequestException('invalid_user_id');
    }
    const clientResponse = await this.client.retrieveUser(userId as UUID);
    return clientResponse.response.user;
  }

  async initLoginFlow(session: Session): Promise<string> {
    (session as any).stateValue =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    const pkce_pair = pkceChallenge();
    (session as any).verifier = pkce_pair.code_verifier;

    return pkce_pair.code_challenge;
  }

  async wrapUpLoginFlow(
    session: Session,
    state: string,
    code: string,
  ): Promise<void> {
    const codeVerifier: string = (session as any).verifier;
    try {
      const { response: jwtResponse } =
        await this.client.exchangeOAuthCodeForAccessTokenUsingPKCE(
          code,
          this.clientId,
          this.clientSecret,
          this.redirectURI,
          codeVerifier,
        );
      const {
        response: { user },
      } = await this.client.retrieveUserUsingJWT(jwtResponse.access_token);

      (session as any).user = user;
      (session as any).jwt = jwtResponse;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async logoutAuthSessions(session: Session): Promise<void> {
    try {
      await this.client.logoutWithRequest({
        global: true,
        refreshToken: (session as any).jwt.refresh_token,
      });
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
