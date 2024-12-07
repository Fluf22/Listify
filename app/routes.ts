import { index, layout, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  layout('components/layout.tsx', [
    index('routes/home.tsx'),
    route('wishes', 'routes/wishes.tsx', [
      route('new', 'routes/add-wish-dialog.tsx'),
    ]),
  ]),
  route('login', 'routes/login.tsx'),
  route('register', 'routes/register.tsx'),
  route('verify-email', 'routes/verify-email.tsx'),
  route('logout', 'routes/logout.ts'),
] satisfies RouteConfig;
