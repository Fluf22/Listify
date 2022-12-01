import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Put,
  Session,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { RedeemWishDto } from './dto/redeem-wish.dto';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { SessionGuard } from '../../auth/session.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { UserinfoResponse } from 'openid-client';
import { WishEntity } from './entities/wish.entity';

@ApiTags('wishes')
@Controller({
  path: 'lists/:userId/wishes',
  version: '1',
})
export class WishesController {
  private readonly logger: Logger = new Logger(WishesController.name);

  constructor(private readonly wishesService: WishesService) {}

  @ApiCookieAuth()
  @Post()
  @UseGuards(SessionGuard, RolesGuard)
  create(
    @Session() session,
    @Param('userId') userId: string,
    @Body() createWishDto: CreateWishDto,
  ): Promise<WishEntity> {
    return this.wishesService.create(
      userId,
      (session as any).user,
      createWishDto,
    );
  }

  @ApiCookieAuth()
  @Get()
  @UseGuards(SessionGuard, RolesGuard)
  findAll(
    @Session() session,
    @Param('userId') userId: string,
  ): Promise<WishEntity[]> {
    return this.wishesService.findAll(userId, (session as any).user);
  }

  @ApiCookieAuth()
  @Put(':id')
  @UseGuards(SessionGuard, RolesGuard)
  update(
    @Session() session,
    @Param('userId') userId: string,
    @Param('id') wishId: string,
    @Body() updateWishDto: UpdateWishDto,
  ): Promise<WishEntity> {
    return this.wishesService.update(
      userId,
      wishId,
      updateWishDto,
      (session as any).user,
    );
  }

  @ApiCookieAuth()
  @Patch(':id')
  @UseGuards(SessionGuard, RolesGuard)
  redeem(
    @Session() session,
    @Param('userId') userId: string,
    @Param('id') wishId: string,
    @Body() redeemWishDto: RedeemWishDto,
  ): Promise<WishEntity> {
    const loggedUser: UserinfoResponse = (session as any).user;
    if (userId === loggedUser.sub) {
      this.logger.error(
        `User '${loggedUser.sub}' can't redeem its own wish '${wishId}'`,
      );
      throw new UnauthorizedException();
    }

    return this.wishesService.redeem(userId, wishId, redeemWishDto, loggedUser);
  }

  @ApiCookieAuth()
  @Delete(':id')
  @UseGuards(SessionGuard, RolesGuard)
  remove(
    @Session() session,
    @Param('userId') userId: string,
    @Param('id') wishId: string,
  ): Promise<WishEntity> {
    return this.wishesService.remove(userId, wishId, (session as any).user);
  }
}
