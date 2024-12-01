import { index, layout, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  layout('components/layout.tsx', [
    index('routes/home.tsx'),
  ]),
  route('login', 'routes/login.tsx'),
  route('register', 'routes/register.tsx'),
  route('verify-email', 'routes/verify-email.tsx'),
] satisfies RouteConfig;
