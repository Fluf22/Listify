import type { User } from '@prisma/client';
import { prisma } from '~/db.server';

export const DEFAULT_EVENT_TITLE = 'Default list';

export async function getDefaultEvent(user: User) {
  return prisma.event.findUnique({
    where: {
      id: user.id,
      title: DEFAULT_EVENT_TITLE,
    },
  });
}
