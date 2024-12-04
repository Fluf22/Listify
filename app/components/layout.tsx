import type { LoaderFunctionArgs } from 'react-router';
import { Outlet, redirect } from 'react-router';
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

  return {};
}

export default function Layout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
