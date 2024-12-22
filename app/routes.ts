import { index, layout, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  layout('components/layouts/main.tsx', [
    index('routes/home.tsx'),
    route('events', 'routes/events.tsx', [
      route('new', 'routes/add-event-dialog.tsx'),
    ]),
    route('events/:eventId', 'routes/event.tsx', [
      route('delete', 'routes/delete-event-dialog.tsx'),
    ]),
    route('events/:eventId/lists/:recipientId/wishes', 'routes/wishes.tsx', [
      route('new', 'routes/add-wish-dialog.tsx'),
      route(':wishId/delete', 'routes/delete-wish-dialog.tsx'),
    ]),
  ]),
  route('login', 'routes/login.tsx'),
  route('register', 'routes/register.tsx'),
  route('verify-email', 'routes/verify-email.tsx'),
  route('logout', 'routes/logout.ts'),
] satisfies RouteConfig;
