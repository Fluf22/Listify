import { Prisma } from '@prisma/client';
import { prisma } from '~/db.server';
import WishCreateInput = Prisma.WishCreateInput;

export async function addWish(candidate: WishCreateInput) {
  return prisma.wish.create({ data: candidate });
}
