import type { ActionFunctionArgs } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { data, redirect, useFetcher, useNavigate, useOutletContext } from 'react-router';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { useToast } from '~/hooks/use-toast';
import { addWish } from '~/models/wish.server';
import { requireUser } from '~/session.server';

const FormSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1).max(255).optional(),
  price: z.number().min(0).optional(),
  order: z.number().min(0),
  recipientListID: z.string(),
  eventID: z.string(),
});

export async function action({ request }: ActionFunctionArgs) {
  // Check form data
  const formData = await request.formData();
  const title = formData.get('title');
  const description = formData.get('description');
  const price = formData.get('price');
  const order = formData.get('order');
  const recipientId = formData.get('recipientId');
  const eventId = formData.get('eventId');

  // Check title
  if (title == null || typeof title !== 'string' || title.length === 0) {
    return data(
      { ok: false, errors: { title: 'Title is required' } },
      { status: 400 },
    );
  }

  if (title.length > 255) {
    return data(
      { ok: false, errors: { title: 'Title is too long' } },
      { status: 400 },
    );
  }

  // Check description
  if (description != null) {
    if (typeof description !== 'string') {
      return data(
        { ok: false, errors: { description: 'Description is invalid' } },
        { status: 400 },
      );
    }

    if (description.length > 255) {
      return data(
        { ok: false, errors: { description: 'Description is too long' } },
        { status: 400 },
      );
    }
  }

  // Check estimated cost
  let priceNumber = null;
  if (price != null && typeof price !== 'string') {
    return data(
      { ok: false, errors: { estimatedCost: 'Estimated cost must be a string' } },
      { status: 400 },
    );
  }
  if (price != null) {
    try {
      priceNumber = Number.parseFloat(price);
    } catch {
      return data(
        { ok: false, errors: { estimatedCost: 'Estimated cost is invalid' } },
        { status: 400 },
      );
    }

    if (priceNumber < 0) {
      return data(
        { ok: false, errors: { estimatedCost: 'Estimated cost must be positive' } },
        { status: 400 },
      );
    }
  }

  // Check order
  let orderNumber = null;
  if (order == null || typeof order !== 'string') {
    return data(
      { ok: false, errors: { order: 'Order must be a string' } },
      { status: 400 },
    );
  }
  try {
    orderNumber = Number.parseFloat(order);
  } catch {
    return data(
      { ok: false, errors: { order: 'Order is invalid' } },
      { status: 400 },
    );
  }

  // Check recipient ID
  if (recipientId == null || typeof recipientId !== 'string' || recipientId.length === 0) {
    return data(
      { ok: false, errors: { recipientListID: 'Recipient list ID is required' } },
      { status: 400 },
    );
  }

  // Check event ID
  if (eventId == null || typeof eventId !== 'string' || eventId.length === 0) {
    return data(
      { ok: false, errors: { eventID: 'Event ID is required' } },
      { status: 400 },
    );
  }

  // Retrieve creator ID
  const creator = await requireUser(request);

  // Add wish
  await addWish({
    title,
    description,
    price: priceNumber,
    order: orderNumber,
    recipient: {
      connect: {
        id: recipientId,
      },
    },
    creator: {
      connect: {
        id: creator.id,
      },
    },
    event: {
      connect: {
        id: eventId,
      },
    },
  });

  throw redirect(`..`);
}

interface AddWishDialogOutletContextProps {
  index: number;
  recipientId: string;
  eventId: string;
}

export default function AddWishDialog() {
  const { index, recipientId, eventId } = useOutletContext<AddWishDialogOutletContextProps>();
  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: '',
      description: undefined,
      price: undefined,
      order: index,
      recipientId,
      eventId,
    },
  });
  const fetcher = useFetcher();
  const { toast } = useToast();

  useEffect(() => {
    if (fetcher.data?.message == null) {
      return;
    }

    toast({
      variant: fetcher.data.ok === true ? 'default' : 'destructive',
      ...fetcher.data.message,
    });

    if (fetcher.data.ok === true) {
      form.reset();
    }
  }, [fetcher.data, form, navigate, toast]);

  return (
    <Dialog open onOpenChange={isOpen => isOpen || navigate('..')}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Wish</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Describe the wish you would like to add to your list.
        </DialogDescription>
        <Form {...form}>
          <fetcher.Form method="post" className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Cost (€)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...field}
                      onChange={e => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="order"
              control={form.control}
              render={({ field }) => (
                <FormItem hidden>
                  <FormLabel>Order</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="recipientId"
              control={form.control}
              render={({ field }) => (
                <FormItem hidden>
                  <FormLabel>Recipient ID</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} value={recipientId} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="eventId"
              control={form.control}
              render={({ field }) => (
                <FormItem hidden>
                  <FormLabel>Event ID</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} value={eventId} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">Add Wish</Button>
            <FormMessage>{fetcher.data?.errors?.submit}</FormMessage>
          </fetcher.Form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
