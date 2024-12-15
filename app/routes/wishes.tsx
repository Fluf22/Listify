import type { LoaderFunctionArgs } from 'react-router';
import { Plus } from 'lucide-react';
import { Link, Outlet, useLoaderData } from 'react-router';
import { Button } from '~/components/ui/button';
import WishList from '~/components/wish-list';
import { prisma } from '~/db.server';
import { DEFAULT_EVENT_TITLE } from '~/models/event.server';
import { requireUserId } from '~/session.server';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const creatorId = await requireUserId(request);
  let { recipientId, eventId } = params;

  if (recipientId == null || recipientId === 'me') {
    recipientId = creatorId;
  }

  if (eventId == null || eventId === 'default') {
    const { id } = await prisma.event.findUnique({
      where: {
        ownerId_title: {
          title: DEFAULT_EVENT_TITLE,
          ownerId: recipientId,
        },
      },
      select: {
        id: true,
      },
    }) ?? {};
    eventId = id;
  }

  const wishes = await prisma.wish.findMany({
    where: {
      recipientId,
      creatorId,
      eventId,
    },
  });

  return { recipientId, eventId, wishes };
}

export default function Wishes() {
  const { recipientId, eventId, wishes } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">My Wishlist</h1>
        <Link to="./new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Wish
          </Button>
        </Link>
      </div>

      <WishList wishes={wishes} />

      <Outlet context={{ index: wishes.length, recipientId, eventId }} />
    </div>
  );
}
