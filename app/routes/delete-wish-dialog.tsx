import type { LoaderFunctionArgs } from 'react-router';
import type { Route } from '../../.react-router/types/app/routes/+types/delete-wish-dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { data, redirect, useFetcher, useNavigate } from 'react-router';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '~/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { deleteWish } from '~/models/wish.server';

const FormSchema = z.object({
  wishId: z.string(),
});

export async function loader({ params }: LoaderFunctionArgs) {
  return { wishId: params.wishId };
}

export async function action({ request }: LoaderFunctionArgs) {
  const formData = await request.formData();
  const wishId = formData.get('wishId');

  // Check wish ID
  if (wishId == null || typeof wishId !== 'string' || wishId.length === 0) {
    return data(
      { ok: false, errors: { eventID: 'Wish ID is required' } },
      { status: 400 },
    );
  }

  await deleteWish(wishId);

  return redirect('..');
}

export default function DeleteWishDialog({ loaderData }: Route.ComponentProps) {
  const { wishId } = loaderData;

  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      wishId,
    },
  });
  const fetcher = useFetcher();

  return (
    <Dialog open onOpenChange={isOpen => isOpen || navigate('..')}>
      <DialogContent>
        <DialogTitle>Delete Wish</DialogTitle>
        <p>Are you sure you want to delete this wish?</p>
        <DialogFooter>
          <Form {...form}>
            <fetcher.Form method="delete" className="space-y-4">
              <FormField
                control={form.control}
                name="wishId"
                render={({ field }) => (
                  <FormItem hidden>
                    <FormLabel>Wish ID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
              >
                Delete
              </Button>
            </fetcher.Form>
          </Form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
