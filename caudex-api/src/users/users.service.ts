import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserinfoResponse } from 'openid-client';
import { Prisma } from '@prisma/client';
import { WishEntity } from '../lists/wishes/entities/wish.entity';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getCart(user: UserinfoResponse): Promise<WishEntity[]> {
    return this.prisma.wish.findMany({
      where: {
        giftedBy: {
          some: {
            gifterList: {
              userId: user.sub,
            },
          },
        },
        deletedAt: null,
      },
      orderBy: {
        order: Prisma.SortOrder.asc,
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
}
