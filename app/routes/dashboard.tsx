import type { Wish } from '@prisma/client';
import { Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import AddWishDialog from '~/components/add-wish-dialog';
import { Button } from '~/components/ui/button';
import WishList from '~/components/wish-list';

export default function Dashboard() {
  const [isAddWishOpen, setIsAddWishOpen] = useState(false);
  const [wishes, setWishes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const addWish = useCallback(async (wish: Wish) => {}, []);
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
        <Button onClick={() => setIsAddWishOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Wish
        </Button>
      </div>

      <WishList wishes={wishes} isLoading={isLoading} onDelete={deleteWish} />

      <AddWishDialog
        open={isAddWishOpen}
        onOpenChange={setIsAddWishOpen}
        onAdd={addWish}
      />
    </div>
  );
}
