import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserinfoResponse } from 'openid-client';
import { Prisma, Wish } from '@prisma/client';
import SortOrder = Prisma.SortOrder;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getCart(user: UserinfoResponse): Promise<Wish[]> {
    return this.prisma.wish.findMany({
      where: {
        giftedBy: {
          some: {
            gifterId: user.sub,
          },
        },
        deletedAt: null,
      },
      orderBy: {
        order: SortOrder.asc,
      },
    });
  }
}
