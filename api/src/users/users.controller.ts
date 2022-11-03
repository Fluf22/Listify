import {
  Body,
  CACHE_MANAGER,
  Controller,
  Get,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Cache } from 'cache-manager';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User, UserPublic } from './models/user.model';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { toUserPublic } from './users.helpers';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ROLES } from '../constants';

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
  @Roles(ROLES.User)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('me')
  async me(@Req() req): Promise<UserPublic> {
    const cachedUser: UserPublic = await this.cacheManager.get<
      UserPublic | undefined
    >(req.user.email);
    if (cachedUser != null) {
      return cachedUser;
    } else {
      const userPublic: UserPublic = toUserPublic(req.user);
      await this.cacheManager.set<UserPublic>(req.user.email, userPublic);
      return userPublic;
    }
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('update')
  async update(
    @Req() req: any,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserPublic> {
    const user: User = req.user;
    return this.usersService.updateUser(user, updateUserDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @Req() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<UserPublic> {
    const user: User = req.user;
    return await this.usersService.changePassword(
      user.email,
      user.password,
      changePasswordDto,
    );
  }
}
