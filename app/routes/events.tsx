import type { Event } from '@prisma/client';
import type { LoaderFunctionArgs } from 'react-router';
import type { Route } from '../../.react-router/types/app/routes/+types/events';
import { Plus } from 'lucide-react';
import { Link, Outlet } from 'react-router';
import EventListItem from '~/components/event-list-item';
import { Button } from '~/components/ui/button';
import { prisma } from '~/db.server';
import { DEFAULT_EVENT_TITLE } from '~/models/event.server';
import { requireUser } from '~/session.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const events = await prisma.event.findMany({
    where: {
      participants: {
        some: {
          email: user.email,
        },
      },
    },
  });

  const { defaultList, managedEvents, participantEvents } = events.reduce(
    (acc, event) => {
      if (event.ownerId === user.id && event.title === DEFAULT_EVENT_TITLE) {
        acc.defaultList = event;
      } else if (event.ownerId === user.id) {
        acc.managedEvents.push(event);
      } else {
        acc.participantEvents.push(event);
      }
      return acc;
    },
    { defaultList: undefined, managedEvents: [], participantEvents: [] } as {
      defaultList?: Event;
      managedEvents: Event[];
      participantEvents: Event[];
    },
  );

  return { defaultList, managedEvents, participantEvents };
}

export default function Events({ loaderData }: Route.ComponentProps) {
  const { defaultList, managedEvents, participantEvents } = loaderData;

  return (
    <div>
      <div className="space-y-8">
        <div className="flex flex-row justify-between">
          <h1 className="text-4xl font-bold">Events</h1>
          <Link to="./new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </Link>
        </div>
        {defaultList && (
          <div>
            <EventListItem event={defaultList} />
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold">Managed Events</h2>
          <ul className="space-y-4">
            {managedEvents.map(event => (
              <li key={event.id}>
                <EventListItem event={event} />
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-bold">Participant Events</h2>
          <ul className="space-y-4">
            {participantEvents.map(event => (
              <li key={event.id}>
                <EventListItem event={event} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Outlet />
    </div>
  );
}
