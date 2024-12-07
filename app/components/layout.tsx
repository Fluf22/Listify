import type { LoaderFunctionArgs } from 'react-router';
import { Gift, LogOut, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, Outlet, redirect, useFetcher, useLoaderData } from 'react-router';
import { Button } from '~/components/ui/button';
import { Form } from '~/components/ui/form';
import { getUser } from '~/session.server';
import { safeRedirect } from '~/utils';

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  const url = new URL(request.url);
  if (user == null) {
    throw redirect(safeRedirect(`/login?redirectTo=${url.pathname}`));
  }

  if (user.emailVerified === false) {
    throw redirect(safeRedirect(`/login?redirectTo=${url.pathname}&verify=1`));
  }

  return { user, currentPath: url.pathname };
}

export default function Layout() {
  const { user, currentPath } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const form = useForm();

  return (
    <div>
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent"
            >
              Wishlist
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className={`flex items-center space-x-2 ${currentPath === '/wishes' ? 'text-primary' : 'text-muted-foreground'}`}
              >
                <Gift className="h-4 w-4" />
                <span>My Wishes</span>
              </Link>
              <Link
                to="/events"
                className={`flex items-center space-x-2 ${currentPath === '/events' ? 'text-primary' : 'text-muted-foreground'}`}
              >
                <Users className="h-4 w-4" />
                <span>Events</span>
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {user.name}
            </span>
            <Form {...form}>
              <fetcher.Form method="post" action="/logout">
                <Button variant="ghost" size="sm" type="submit">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </fetcher.Form>
            </Form>
          </div>
        </div>
      </nav>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
