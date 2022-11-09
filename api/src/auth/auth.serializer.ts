import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { FusionAuthService } from '../fusionauth.service';
import { User } from '@fusionauth/typescript-client';

@Injectable()
export class AuthSerializer extends PassportSerializer {
  constructor(
    private readonly authService: AuthService,
    private readonly fusionAuthService: FusionAuthService,
  ) {
    super();
  }
  serializeUser(
    user: User,
    done: (err: Error, user: { id: string; role: string }) => void,
  ) {
    done(null, { id: user.id, role: '' });
  }

  async deserializeUser(
    payload: { id: string; role: string },
    done: (err: Error, user: User) => void,
  ) {
    const user = await this.fusionAuthService.findUserById(payload.id);
    done(null, user);
  }
}
