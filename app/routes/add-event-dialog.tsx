import type { ActionFunctionArgs } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { data, redirect, useFetcher, useLoaderData, useNavigate } from 'react-router';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { Textarea } from '~/components/ui/textarea';
import { prisma } from '~/db.server';
import { EMAIL_FROM, resend } from '~/emails.server';
import { useToast } from '~/hooks/use-toast';
import { requireUser } from '~/session.server';

const FormSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1).max(255).optional(),
  date: z.string().date().optional(),
  invitations: z.array(z.object({ email: z.string().email() })).min(1),
});

export async function loader({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  return { email: user.email };
}

export async function action({ request }: ActionFunctionArgs) {
  // Check form data
  const { title, description, date, invitations: invitationList } = await request.json() as z.infer<typeof FormSchema>;

  // Check title
  if (title == null || title.length === 0) {
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
  if (description != null && description.length > 0) {
    if (description.length > 255) {
      return data(
        { ok: false, errors: { description: 'Description is too long' } },
        { status: 400 },
      );
    }
  }

  // Check date
  let dateValue = null;
  if (date != null && date !== '') {
    try {
      dateValue = new Date(date);
    } catch {
      return data(
        { ok: false, errors: { date: 'Date is invalid' } },
        { status: 400 },
      );
    }
  }

  // Retrieve owner ID
  const owner = await requireUser(request);

  // Check participants
  let invitationEmails = null;
  if (invitationList != null && (
    !Array.isArray(invitationList)
    || !invitationList.every(invitation => 'email' in invitation && typeof invitation.email === 'string' && invitation.email.length > 0)
    || !invitationList.find(invitation => invitation.email === owner.email)
  )) {
    return data(
      {
        ok: false,
        errors: {
          invitations: 'Invitations must be a list of strings, with at least the event creator\'s email',
        },
      },
      { status: 400 },
    );
  }

  try {
    invitationEmails = invitationList ?? [];
  } catch {
    return data(
      { ok: false, errors: { invitations: 'Invitations is invalid' } },
      { status: 400 },
    );
  }

  // Create event
  const { id, invitations } = await prisma.event.create({
    data: {
      title,
      description,
      date: dateValue != null ? dateValue.toISOString() : null,
      ownerId: owner.id,
      invitations: {
        createMany: {
          data: invitationEmails.map(({ email }) => {
            if (email === owner.email) {
              return {
                email,
                status: 'ACCEPTED',
              };
            } else {
              return {
                email,
              };
            }
          }),
        },
      },
      participants: {
        create: {
          userId: owner.id,
        },
      },
    },
    select: {
      id: true,
      invitations: {
        select: {
          email: true,
        },
      },
    },
  });

  if (invitations != null) {
    for (const invitation of invitations) {
      if (invitation.email === owner.email) {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: invitation.email,
          subject: 'You have created an event',
          html: `You have created an event. Click <a href="${process.env.APP_URL}/events/${id}">here</a> to view the event.`,
        });
      } else {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: invitation.email,
          subject: 'You have been invited to an event',
          html: `You have been invited to an event by ${owner.name}. Click <a href="${process.env.APP_URL}/events/${id}">here</a> to view the event.`,
        });
      }
    }
  }

  throw redirect(`/events/${id}`);
}

export default function AddEventDialog() {
  const { email } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: '',
      description: undefined,
      date: undefined,
      invitations: [{ email }],
    },
  });
  const fetcher = useFetcher();
  const { toast } = useToast();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'invitations',
  });

  const [emailToAdd, setEmailToAdd] = useState<string>('');
  const [isInputVisible, setIsInputVisible] = useState(false);

  const invitations = fields.map(field => field.email);

  const onSubmit = useCallback(async (data: any) => {
    await fetcher.submit(data, { method: 'post', encType: 'application/json' });
  }, [fetcher]);

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
          <DialogTitle>Add New Event</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Describe the event you would like to invite people to celebrate with you
        </DialogDescription>
        <Form {...form}>
          <fetcher.Form
            method="post"
            className="space-y-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
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
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      max={new Date(Date.now() + (1000 * 60 * 60 * 24 * 265 * 100)).toISOString().split('T')[0]}
                      {...field}
                      onChange={e => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="invitations"
              control={form.control}
              render={() => (
                <FormItem>
                  <div className="flex flex-row justify-between items-center">
                    <FormLabel>Invitations</FormLabel>
                    <div className="relative flex flex-row justify-end items-center w-full">
                      <Input
                        type="text"
                        onFocus={() => setIsInputVisible(true)}
                        onBlur={() => setIsInputVisible(false)}
                        value={emailToAdd}
                        onChange={e => setEmailToAdd(e.target.value)}
                        className={`transition duration-300 ease-in-out ${isInputVisible ? 'w-full' : 'w-30'} h-7 m-2`}
                        placeholder="Invite by email..."
                      />
                      <Button
                        className="h-7 w-7 z-30"
                        type="button"
                        onClick={() => {
                          append({ email: emailToAdd });
                          setEmailToAdd('');
                        }}
                      >
                        <Plus size="12px" className="h-2 w-2" />
                      </Button>
                    </div>
                  </div>
                  <FormControl>
                    <>
                      <Table>
                        <TableCaption>
                          You will be able to add participants later, from the event
                          page.
                        </TableCaption>
                        <TableHeader>
                          <TableRow>
                            <TableHead>email</TableHead>
                            <TableHead className="text-right">status</TableHead>
                            <TableHead className="text-right" />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {invitations?.map((invitation, idx) => (
                            <TableRow
                              key={invitation}
                              className={invitation === email ? 'bg-muted' : ''}
                            >
                              <TableCell>{`${invitation}${invitation === email ? ' (You)' : ''}`}</TableCell>
                              <TableCell className="text-right">pending</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  className={`h-7 w-7 z-30${invitation === email ? ' hidden' : ''}`}
                                  type="button"
                                  onClick={() => {
                                    remove(idx);
                                  }}
                                >
                                  <Trash size="12px" className="h-2 w-2" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {fields.map((field, idx) => (
                        <input
                          key={field.id}
                          type="email"
                          {...form.register(`invitations.${idx}.email`)}
                          defaultValue={field.email}
                          hidden
                          disabled
                          className="hidden"
                        />
                      ))}
                    </>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">Create Event</Button>
            <FormMessage>{fetcher.data?.errors?.submit}</FormMessage>
          </fetcher.Form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
