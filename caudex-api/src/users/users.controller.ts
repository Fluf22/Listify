import {
  CACHE_MANAGER,
  Controller,
  Get,
  Inject,
  Logger,
  Session,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Cache } from 'cache-manager';
import { UsersService } from './users.service';
import { UserPublic } from './models/user.model';
import { SessionGuard } from '../auth/session.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Reflector } from '@nestjs/core';

@ApiTags('users')
@Controller({
  version: '1',
  path: 'users',
})
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly usersService: UsersService,
  ) {}

  @ApiBearerAuth()
  @Get('me')
  @UseGuards(new SessionGuard(), new RolesGuard(new Reflector()))
  async me(@Session() session): Promise<UserPublic> {
    return session.user;
  }
}
