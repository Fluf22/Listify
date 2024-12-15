import type { Wish } from '@prisma/client';
import { Trash2 } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';

interface WishListProps {
  wishes: Wish[];
}

export default function WishList({
  wishes,
}: WishListProps) {
  // if (isLoading) {
  //   return (
  //     <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  //       {[1, 2, 3].map(i => (
  //         <Card key={i}>
  //           <CardHeader>
  //             <Skeleton className="h-6 w-3/4" />
  //             <Skeleton className="h-4 w-1/2" />
  //           </CardHeader>
  //           <CardContent>
  //             <Skeleton className="h-20" />
  //           </CardContent>
  //         </Card>
  //       ))}
  //     </div>
  //   );
  // }

  if (wishes.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        No wishes added yet.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {wishes.map(wish => (
        <Card key={wish.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{wish.title}</CardTitle>
                <CardDescription>
                  Estimated: $
                  {typeof wish.price === 'number' ? wish.price.toFixed(2) : 'N/A'}
                </CardDescription>
              </div>

              <Button
                asChild
                variant="ghost"
                size="icon"
              >
                <Link to={`${wish.id}/delete`}>
                  <Trash2 className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {wish.description}
            </p>
            {/* {showGiftProgress && <GiftProgress wishId={wish.id} />} */}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
