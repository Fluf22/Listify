import type { LoaderFunctionArgs } from 'react-router';
import { redirect } from 'react-router';

export async function loader({ request }: LoaderFunctionArgs) {
  const redirectTo = new URL(request.url).searchParams.get('redirectTo');
  throw redirect(`/wishes${redirectTo != null ? `?redirectTo=${redirectTo}` : ''}`);
}
