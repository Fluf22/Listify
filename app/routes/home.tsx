import type { Event } from '@prisma/client';
import type { LoaderFunctionArgs } from 'react-router';
import { Link, redirect, useLoaderData } from 'react-router';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { prisma } from '~/db.server';
import { DEFAULT_EVENT_TITLE } from '~/models/event.server';
import { logout, requireUserId } from '~/session.server';
import { safeRedirect } from '~/utils';

type EventOverview = Partial<Event> & { _count: { participants: number } };

export async function loader({ request }: LoaderFunctionArgs) {
  const redirectTo = new URL(request.url).searchParams.get('redirectTo');
  if (redirectTo != null) {
    throw redirect(safeRedirect(redirectTo));
  }

  const userId = await requireUserId(request);

  const defaultList = await prisma.event.findUnique({
    where: {
      ownerId_title: {
        title: DEFAULT_EVENT_TITLE,
        ownerId: userId,
      },
    },
    select: {
      wishes: {
        select: {
          title: true,
          price: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
        take: 5,
      },
    },
  });
  if (defaultList == null) {
    console.error('No default list found');
    throw await logout(request);
  }

  const events = await prisma.event.findMany({
    where: {
      AND: [
        {
          OR: [
            {
              ownerId: userId,
            },
            {
              participants: {
                some: {
                  userId,
                },
              },
            },
          ],
        },
        {
          title: {
            notIn: [DEFAULT_EVENT_TITLE],
          },
        },
      ],
    },
    select: {
      id: true,
      title: true,
      description: true,
      date: true,
      _count: {
        select: {
          participants: true,
        },
      },
      ownerId: true,
    },
    take: 5,
  });

  const { managedEvents, participantEvents } = events.reduce(
    (acc, event) => {
      if (event.ownerId === userId) {
        acc.managedEvents.push(event);
      } else {
        acc.participantEvents.push(event);
      }
      return acc;
    },
    { managedEvents: [], participantEvents: [] } as {
      managedEvents: EventOverview[];
      participantEvents: EventOverview[];
    },
  );

  const giftsToBuy = await prisma.gifter.findMany({
    where: {
      gifterId: userId,
    },
    select: {
      amount: true,
      wish: {
        select: {
          title: true,
          price: true,
          recipient: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  const invitations = await prisma.participation.findMany({
    where: {
      userId,
      status: 'PENDING',
    },
    select: {
      id: true,
      event: {
        select: {
          title: true,
        },
      },
    },
  });

  return { defaultList, managedEvents, participantEvents, giftsToBuy, invitations };
}

export default function Home() {
  const { defaultList, managedEvents, participantEvents, giftsToBuy, invitations } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-8 p-6">
      <div>
        <Link to="/events/default/lists/me/wishes">
          <Card>
            <CardHeader>
              <h3 className="font-bold text-lg">Your wishes</h3>
              <Badge>Private</Badge>
            </CardHeader>
            <CardContent>
              <ul className="mt-2 space-y-1">
                {defaultList.wishes.map((wish, index) => (
                  <li key={index} className="text-gray-700">
                    {wish.title}
                  </li>
                ))}
              </ul>
              {defaultList.wishes.length === 5 && (
                <p className="text-sm text-gray-400 mt-2">...and more</p>
              )}
            </CardContent>
          </Card>
        </Link>
      </div>
      {/* Managed and Participating Events Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Events</h2>
        {managedEvents.length === 0 && participantEvents.length === 0
          ? (
              <p className="text-gray-500">You are not participating in any events yet.</p>
            )
          : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {managedEvents.map(event => (
                  <Card key={event.id}>
                    <CardHeader>
                      <h3 className="font-bold text-lg">{event.title}</h3>
                      <Badge>Managed</Badge>
                    </CardHeader>
                    <CardContent>
                      <p>{event.description}</p>
                      <p className="text-sm text-gray-500">
                        Participants:
                        {event._count?.participants}
                      </p>
                    </CardContent>
                  </Card>
                ))}
                {participantEvents.map(event => (
                  <Card key={event.id}>
                    <CardHeader>
                      <h3 className="font-bold text-lg">{event.title}</h3>
                      <Badge>Participant</Badge>
                    </CardHeader>
                    <CardContent>
                      <p>{event.description}</p>
                      <p className="text-sm text-gray-500">
                        Participants:
                        {event._count?.participants}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
      </div>

      {/* Invitations Section */}
      {invitations.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Invitations</h2>
          <div className="space-y-4">
            {invitations.map(invitation => (
              <Card key={invitation.id}>
                <CardHeader>
                  <h3 className="font-bold text-lg">{invitation.event.title}</h3>
                </CardHeader>
                <CardContent>
                  <Button>Respond to Invitation</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Gifts to Buy Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Gifts to Buy</h2>
        {giftsToBuy.length > 0
          ? (
              <div className="space-y-4">
                {giftsToBuy.map((gift, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <h3 className="font-bold text-lg">{gift.wish.title}</h3>
                      <p className="text-sm text-gray-500">
                        For:
                        {gift.wish.recipient.name}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <p>
                        Price: $
                        {gift.wish.price}
                      </p>
                      <p>
                        Amount:
                        {gift.amount}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          : (
              <p className="text-gray-500">No gifts to buy at the moment.</p>
            )}
      </div>
    </div>
  );
}
