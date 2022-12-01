import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { UserinfoResponse } from 'openid-client';
import { Prisma, Wish } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import { ListsService } from '../lists.service';
import { RedeemType, RedeemWishDto } from './dto/redeem-wish.dto';
import { CaudexError } from '../../interfaces';
import { WishEntity } from './entities/wish.entity';
import { ListEntity } from '../entities/list.entity';

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
  ): Promise<WishEntity> {
    return this.prisma.wish.create({
      data: {
        recipientList: {
          connect: {
            userId,
          },
        },
        addedByList: {
          connect: {
            userId: user.sub,
          },
        },
        ...createWishDto,
      },
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        link: true,
        price: true,
        order: true,
        createdAt: true,
        giftedBy: {
          select: {
            amount: true,
            gifterList: {
              select: {
                userId: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll(userId: string, user: UserinfoResponse): Promise<WishEntity[]> {
    const list: ListEntity & { wishes: WishEntity[] } =
      await this.prisma.list.findUnique({
        where: {
          deletedAt: null,
          userId: user?.sub,
        },
        select: {
          userId: true,
          firstName: true,
          lastName: true,
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
            select: {
              id: true,
              title: true,
              description: true,
              image: true,
              link: true,
              price: true,
              order: true,
              createdAt: true,
              giftedBy: {
                select: {
                  amount: true,
                  gifterList: {
                    select: {
                      userId: true,
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
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
  ): Promise<WishEntity> {
    const wish: Wish = await this.prisma.wish.findUnique({
      where: {
        id: wishId,
        recipientList: {
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
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        link: true,
        price: true,
        order: true,
        createdAt: true,
        giftedBy: {
          select: {
            amount: true,
            gifterList: {
              select: {
                userId: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  async redeem(
    userId: string,
    wishId: string,
    redeemWishDto: RedeemWishDto,
    user: UserinfoResponse,
  ): Promise<WishEntity> {
    const wish = await this.prisma.wish.findUnique({
      where: {
        id: wishId,
        recipientList: {
          userId,
        },
        addedBy: {
          not: userId,
        },
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        link: true,
        price: true,
        order: true,
        createdAt: true,
        giftedBy: {
          select: {
            amount: true,
            gifterList: {
              select: {
                userId: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (wish == null) {
      this.logger.error(
        `User '${user?.sub}' doesn't have the rights to delete wish '${wishId}' in list of user '${userId}'`,
      );
      throw new ForbiddenException();
    }

    const totalGiftedAmount: number = wish.giftedBy.reduce(
      (acc, cur) => acc + cur.amount,
      0,
    );
    const personalGiftedAmount: number =
      wish.giftedBy.find((giftedBy) => giftedBy.gifterList.userId === user.sub)
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
      where: {
        id: wishId,
      },
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
              gifterList: {
                connect: {
                  userId: user.sub,
                },
              },
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
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        link: true,
        price: true,
        order: true,
        createdAt: true,
        giftedBy: {
          select: {
            amount: true,
            gifterList: {
              select: {
                userId: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(
    userId: string,
    wishId: string,
    user: UserinfoResponse,
  ): Promise<WishEntity & { deletedAt: Date }> {
    const wish: WishEntity = await this.prisma.wish.findUnique({
      where: {
        id: wishId,
        recipientList: {
          userId,
        },
        addedBy: user.sub,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        link: true,
        price: true,
        order: true,
        createdAt: true,
        giftedBy: {
          select: {
            amount: true,
            gifterList: {
              select: {
                userId: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
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
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        link: true,
        price: true,
        order: true,
        createdAt: true,
        deletedAt: true,
        giftedBy: {
          select: {
            amount: true,
            gifterList: {
              select: {
                userId: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }
}
