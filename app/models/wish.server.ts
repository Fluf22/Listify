import { Prisma } from '@prisma/client';
import { prisma } from '~/db.server';
import WishCreateInput = Prisma.WishCreateInput;

export async function addWish(candidate: WishCreateInput) {
  return prisma.wish.create({ data: candidate });
}

export async function updateWish(id: string, candidate: WishCreateInput) {
  return prisma.wish.update({ where: { id }, data: candidate });
}

export async function deleteWish(id: string) {
  return prisma.wish.delete({ where: { id } });
}
