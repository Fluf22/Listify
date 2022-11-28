import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Session,
  UseGuards,
  Put,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { RedeemWishDto } from './dto/redeem-wish.dto';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { SessionGuard } from '../../auth/session.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Reflector } from '@nestjs/core';
import { Wish } from '@prisma/client';
import { UserinfoResponse } from 'openid-client';

@ApiTags('wishes')
@Controller({
  path: 'lists/:userId/wishes',
})
export class WishesController {
  private readonly logger: Logger = new Logger(WishesController.name);

  constructor(private readonly wishesService: WishesService) {}

  @Post()
  create(
    @Session() session,
    @Param('userId') userId: string,
    @Body() createWishDto: CreateWishDto,
  ) {
    return this.wishesService.create(
      userId,
      (session as any).user,
      createWishDto,
    );
  }

  @ApiCookieAuth()
  @Get()
  @UseGuards(new SessionGuard(), new RolesGuard(new Reflector()))
  findAll(@Session() session, @Param('userId') userId: string) {
    return this.wishesService.findAll(userId, (session as any).user);
  }

  @Put(':id')
  update(
    @Session() session,
    @Param('userId') userId: string,
    @Param('id') wishId: string,
    @Body() updateWishDto: UpdateWishDto,
  ) {
    return this.wishesService.update(
      userId,
      wishId,
      updateWishDto,
      (session as any).user,
    );
  }

  @Patch(':id')
  redeem(
    @Session() session,
    @Param('userId') userId: string,
    @Param('id') wishId: string,
    @Body() redeemWishDto: RedeemWishDto,
  ): Promise<Wish> {
    const loggedUser: UserinfoResponse = (session as any).user;
    if (userId === loggedUser.sub) {
      this.logger.error(
        `User '${loggedUser.sub}' can't redeem its own wish '${wishId}'`,
      );
      throw new UnauthorizedException();
    }

    return this.wishesService.redeem(userId, wishId, redeemWishDto, loggedUser);
  }

  @Delete(':id')
  remove(
    @Session() session,
    @Param('userId') userId: string,
    @Param('id') wishId: string,
  ): Promise<Wish> {
    return this.wishesService.remove(userId, wishId, (session as any).user);
  }
}
