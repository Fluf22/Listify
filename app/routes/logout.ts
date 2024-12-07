import type { ActionFunctionArgs } from 'react-router';
import { logout } from '~/session.server';

export async function action({ request }: ActionFunctionArgs) {
  throw await logout(request);
}
