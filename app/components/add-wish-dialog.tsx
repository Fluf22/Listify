import type { Wish } from '@prisma/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useFetcher } from 'react-router';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
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

const FormSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1).max(255).optional(),
  estimatedCost: z.number().optional(),
});

interface AddWishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: Wish) => Promise<void>;
}

export default function AddWishDialog({
  open,
  onOpenChange,
  onAdd,
}: AddWishDialogProps) {
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: '',
      description: undefined,
      estimatedCost: undefined,
    },
  });
  const fetcher = useFetcher();

  const onSubmit = async (data) => {
    console.log('onSubmit', data);
    await onAdd({
      ...data,
      estimatedCost: data.estimatedCost ? Number.parseFloat(data.estimatedCost) : null,
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Wish</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <fetcher.Form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              name="estimatedCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Cost ($)</FormLabel>
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

            <Button type="submit">Add Wish</Button>
          </fetcher.Form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
