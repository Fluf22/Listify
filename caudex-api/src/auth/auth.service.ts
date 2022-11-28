import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Session } from 'express-session';
import { BaseClient, generators, Issuer, TokenSet } from 'openid-client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  static async create(configService: ConfigService): Promise<AuthService> {
    const keycloakRealmUrl: string = configService.get('KEYCLOAK_REALM_URL');
    const redirectUri: string = configService.get('REDIRECT_URI');
    const clientId: string = configService.get('CLIENT_ID');
    const clientSecret: string = configService.get('CLIENT_SECRET');

    const issuer = await Issuer.discover(keycloakRealmUrl);
    const client = new issuer.Client({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uris: [redirectUri],
      response_types: ['code'],
      id_token_signed_response_alg: 'RS256',
    });

    return new AuthService(client, configService);
  }

  constructor(
    private client: BaseClient,
    private configService: ConfigService,
  ) {}

  async initLoginFlow(session: Session): Promise<string> {
    const code_verifier = generators.codeVerifier();
    const code_challenge = generators.codeChallenge(code_verifier);
    const state = generators.state();

    (session as any).stateValue = state;
    (session as any).codeVerifier = code_verifier;

    return this.client.authorizationUrl({
      state,
      scope: 'openid offline_access',
      code_challenge,
      code_challenge_method: 'S256',
    });
  }

  async wrapUpLoginFlow(
    session: Session,
    stateFromServer: string,
    code: string,
  ): Promise<string> {
    const { stateValue, codeVerifier } = session as any;
    if (stateFromServer !== stateValue) {
      this.logger.log(
        `OAuth states don't match ${stateFromServer}/${stateValue}`,
      );
      throw new BadRequestException('oauth_failure');
    }

    try {
      const tokenSet = await this.client.callback(
        'http://localhost:3000/api/v1/auth/oauth-callback',
        {
          code,
          state: stateValue,
        },
        {
          code_verifier: codeVerifier,
          state: stateValue,
        },
      );

      (session as any).user = await this.client.userinfo(tokenSet.access_token);
      (session as any).tokenSet = new TokenSet(tokenSet);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }

    return this.configService.get('APP_URL');
  }

  async logout(session: Session): Promise<string> {
    return new Promise(async (resolve) => {
      const { tokenSet }: { tokenSet: TokenSet } = session as any;
      session.destroy(() => {
        this.logger.log('Server-side session destroyed');
        const redirectURL: string = this.configService.get('APP_URL');
        const endSessionUrl: string = this.client.endSessionUrl({
          id_token_hint: tokenSet.id_token,
          post_logout_redirect_uri: redirectURL,
        });

        resolve(endSessionUrl);
      });
    });
  }

  async refreshToken(tokenSet: TokenSet): Promise<TokenSet> {
    return this.client.refresh(tokenSet);
  }
}
