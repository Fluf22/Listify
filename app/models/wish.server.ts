import { Prisma } from '@prisma/client';
import WishCreateInput = Prisma.WishCreateInput;

export async function addWish(candidate: WishCreateInput) {
  console.log('addWish', candidate);
}
