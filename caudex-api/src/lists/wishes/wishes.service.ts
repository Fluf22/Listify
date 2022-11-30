import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { UserinfoResponse } from 'openid-client';
import { List, Prisma, Wish } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import { ListsService } from '../lists.service';
import { RedeemType, RedeemWishDto } from './dto/redeem-wish.dto';
import { CaudexError } from '../../interfaces';

@Injectable()
export class WishesService {
  private readonly logger: Logger = new Logger(WishesService.name);

  constructor(
    private prisma: PrismaService,
    private listsService: ListsService,
  ) {}

  async create(
    userId: string,
    user: UserinfoResponse,
    createWishDto: CreateWishDto,
  ): Promise<Wish> {
    return this.prisma.wish.create({
      data: {
        list: {
          connect: {
            userId,
          },
        },
        addedBy: user.sub,
        ...createWishDto,
      },
    });
  }

  async findAll(userId: string, user: UserinfoResponse): Promise<Wish[]> {
    const list: List & { wishes: Wish[] } = await this.prisma.list.findFirst({
      where: {
        deletedAt: null,
        userId: user?.sub,
      },
      include: {
        wishes: {
          orderBy: {
            order: Prisma.SortOrder.asc,
          },
          ...(userId === user?.sub
            ? {
                where: {
                  addedBy: user?.sub,
                },
              }
            : {}),
        },
      },
    });
    if (list == null) {
      await this.listsService.create({
        userId: user?.sub,
        firstName: user?.firstName as string | null,
        lastName: user?.lastName as string | null,
      });
      return [];
    }

    return list.wishes;
  }

  async update(
    userId: string,
    wishId: string,
    updateWishDto: UpdateWishDto,
    user: UserinfoResponse,
  ): Promise<Wish> {
    const wish: Wish = await this.prisma.wish.findFirst({
      where: {
        list: {
          userId,
        },
        addedBy: user.sub,
        deletedAt: null,
      },
    });
    if (wish == null) {
      this.logger.error(
        `User '${user?.sub}' doesn't have the rights to update wish '${wishId}' in list of user '${userId}'`,
      );
      throw new UnauthorizedException();
    }

    return this.prisma.wish.update({
      data: updateWishDto,
      where: {
        id: wishId,
      },
    });
  }

  async redeem(
    userId: string,
    wishId: string,
    redeemWishDto: RedeemWishDto,
    user: UserinfoResponse,
  ): Promise<Wish> {
    const wish = await this.prisma.wish.findFirst({
      where: {
        list: {
          userId,
        },
        addedBy: {
          not: userId,
        },
        deletedAt: null,
      },
      include: {
        giftedBy: true,
      },
    });

    if (wish == null) {
      this.logger.error(
        `User '${user?.sub}' doesn't have the rights to delete wish '${wishId}' in list of user '${userId}'`,
      );
      throw new UnauthorizedException();
    }

    const totalGiftedAmount: number = wish.giftedBy.reduce(
      (acc, cur) => acc + cur.amount,
      0,
    );
    const personalGiftedAmount: number =
      wish.giftedBy.find((giftedBy) => giftedBy.gifterId === user.sub)
        ?.amount ?? 0;
    if (
      redeemWishDto.type === RedeemType.REDEEM &&
      totalGiftedAmount + redeemWishDto.amount > 100
    ) {
      throw new BadRequestException(
        new CaudexError(
          'gifted_amount_threshold',
          `Can't redeem more than ${
            100 - totalGiftedAmount - personalGiftedAmount
          }% of the wish`,
        ),
      );
    } else if (
      redeemWishDto.type === RedeemType.REMOVE &&
      totalGiftedAmount - redeemWishDto.amount < 0
    ) {
      throw new BadRequestException(
        new CaudexError(
          'gifted_amount_threshold',
          `Can't remove more than ${
            totalGiftedAmount - personalGiftedAmount
          }% of the wish`,
        ),
      );
    } else if (
      redeemWishDto.type === RedeemType.REMOVE &&
      redeemWishDto.amount > personalGiftedAmount
    ) {
      throw new BadRequestException(
        new CaudexError(
          'gifted_amount_threshold',
          `Can't remove unbound donation`,
        ),
      );
    }

    return this.prisma.wish.update({
      data: {
        giftedBy: {
          upsert: {
            where: {
              wishId_gifterId: {
                wishId: wishId,
                gifterId: user?.sub,
              },
            },
            create: {
              amount: redeemWishDto.amount,
              gifterId: user.sub,
            },
            update: {
              amount:
                redeemWishDto.type === RedeemType.REDEEM
                  ? {
                      increment: redeemWishDto.amount,
                    }
                  : {
                      decrement: redeemWishDto.amount,
                    },
            },
          },
        },
      },
      where: {
        id: wishId,
      },
    });
  }

  async remove(
    userId: string,
    wishId: string,
    user: UserinfoResponse,
  ): Promise<Wish> {
    const wish: Wish = await this.prisma.wish.findFirst({
      where: {
        list: {
          userId,
        },
        addedBy: user.sub,
        deletedAt: null,
      },
    });
    if (wish == null) {
      this.logger.error(
        `User '${user?.sub}' doesn't have the rights to delete wish '${wishId}' in list of user '${userId}'`,
      );
      throw new UnauthorizedException();
    }

    return this.prisma.wish.update({
      data: {
        deletedAt: new Date(),
      },
      where: {
        id: wishId,
      },
    });
  }
}
