import type { LoaderFunctionArgs } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { data, redirect, useFetcher, useLoaderData, useNavigate } from 'react-router';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '~/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { prisma } from '~/db.server';

const FormSchema = z.object({
  eventId: z.string(),
});

export async function loader({ params }: LoaderFunctionArgs) {
  return { eventId: params.eventId };
}

export async function action({ request }: LoaderFunctionArgs) {
  const formData = await request.formData();
  const eventId = formData.get('eventId');

  // Check wish ID
  if (eventId == null || typeof eventId !== 'string' || eventId.length === 0) {
    return data(
      { ok: false, errors: { eventID: 'Event ID is required' } },
      { status: 400 },
    );
  }

  await prisma.event.delete({
    where: {
      id: eventId,
    },
  });

  return redirect('..');
}

export default function DeleteWishDialog() {
  const { eventId } = useLoaderData<typeof loader>();

  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      eventId,
    },
  });
  const fetcher = useFetcher();

  return (
    <Dialog open onOpenChange={isOpen => isOpen || navigate('..')}>
      <DialogContent>
        <DialogTitle>Delete Event</DialogTitle>
        <p>Are you sure you want to delete this event?</p>
        <DialogFooter>
          <Form {...form}>
            <fetcher.Form method="delete" className="space-y-4">
              <FormField
                control={form.control}
                name="eventId"
                render={({ field }) => (
                  <FormItem hidden>
                    <FormLabel>Event ID</FormLabel>
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
