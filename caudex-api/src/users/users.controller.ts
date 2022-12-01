import {
  CACHE_MANAGER,
  Controller,
  Get,
  Inject,
  Logger,
  Session,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { Cache } from 'cache-manager';
import { UsersService } from './users.service';
import { UserPublic } from './models/user.model';
import { SessionGuard } from '../auth/session.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Reflector } from '@nestjs/core';
import { Wish } from '@prisma/client';
import { WishEntity } from '../lists/wishes/entities/wish.entity';

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

  @ApiCookieAuth()
  @Get('me')
  @UseGuards(SessionGuard, RolesGuard)
  async me(@Session() session): Promise<UserPublic> {
    return session.user;
  }

  @ApiCookieAuth()
  @Get('me/cart')
  @UseGuards(SessionGuard, RolesGuard)
  async selfCart(@Session() session): Promise<WishEntity[]> {
    return this.usersService.getCart((session as any).user);
  }
}
