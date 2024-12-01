import type { LoaderFunctionArgs } from 'react-router';
import { Outlet, redirect } from 'react-router';
import { getUserId } from '~/session.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  if (userId == null) {
    return redirect('/login');
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
