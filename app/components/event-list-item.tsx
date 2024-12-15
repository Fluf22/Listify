import type { Event } from '@prisma/client';
import { Link } from 'react-router';

interface EventListItemProps {
  event: Event;
}

export default function EventListItem({ event }: EventListItemProps) {
  return (
    <Link to={`/events/${event.id}`} className="block bg-white rounded-lg shadow p-4">
      <h3 className="text-xl font-bold">{event.title}</h3>
      <p>{event.description}</p>
    </Link>
  );
}
