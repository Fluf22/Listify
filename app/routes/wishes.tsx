import type { LoaderFunctionArgs } from 'react-router';
import { Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, Outlet, useLoaderData } from 'react-router';
import { Button } from '~/components/ui/button';
import WishList from '~/components/wish-list';
import { getUserDefaultList } from '~/models/user.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const recipientList = await getUserDefaultList(request);
  if (recipientList == null) {
    throw new Error('Failed to get recipient list');
  }

  return { recipientListID: recipientList.id };
}

export default function Wishes() {
  const { recipientListID } = useLoaderData<typeof loader>();

  const [wishes, setWishes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const deleteWish = useCallback(async (id) => {}, []);

  useEffect(() => {
    const timeoutID = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => {
      clearTimeout(timeoutID);
    };
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">My Wishlist</h1>
        <Link to="/wishes/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Wish
          </Button>
        </Link>
      </div>

      <WishList wishes={wishes} isLoading={isLoading} onDelete={deleteWish} />

      <Outlet context={{ index: wishes.length, recipientListID }} />
    </div>
  );
}
