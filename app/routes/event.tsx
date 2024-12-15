import type { LoaderFunctionArgs } from 'react-router';
import type { Route } from '../../.react-router/types/app/routes/+types/event';
import { Link, redirect } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { prisma } from '~/db.server';
import { DEFAULT_EVENT_TITLE } from '~/models/event.server';
import { requireUserId } from '~/session.server';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);

  const { eventId } = params;
  const event = await prisma.event.findUnique({
    where: {
      id: eventId,
    },
    select: {
      id: true,
      ownerId: true,
      title: true,
      description: true,
      participants: {
        select: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!event) {
    throw redirect('/events');
  }

  if (event.title === DEFAULT_EVENT_TITLE && event.ownerId === userId) {
    throw redirect(`/events/${eventId}/lists/${userId}/wishes`);
  }

  return event;
}

export default function Event({ loaderData }: Route.ComponentProps) {
  const { id, title, description, participants } = loaderData;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{description}</p>
        <ul>
          {participants.map(({ user }) => (
            <li key={user.id}>
              <Link to={`/events/${id}/lists/${user.id}/wishes`}>
                {user.name}
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
