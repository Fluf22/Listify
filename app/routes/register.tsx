import type { User } from '@prisma/client';
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { data, Link, redirect, useFetcher, useSearchParams } from 'react-router';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { useToast } from '~/hooks/use-toast';
import { createUser, getUserByEmail } from '~/models/user.server';
import { createUserSession, getUserId } from '~/session.server';
import { safeRedirect, validateEmail } from '~/utils';

const FormSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255),
  password: z.string().min(6),
  address: z.string(), // Honeypot field
  redirectTo: z.string().optional().nullable(),
});

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  if (userId) {
    return redirect('/wishes');
  }

  return {};
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get('email');
  const name = formData.get('name');
  const address = formData.get('address');
  const password = formData.get('password');
  const redirectTo = safeRedirect(formData.get('redirectTo'), '/wishes');

  if (address == null || typeof address !== 'string' || address.length !== 0) {
    return data(
      { errors: { submit: 'Invalid form' } },
      { status: 200 },
    );
  }

  if (!validateEmail(email)) {
    return data(
      { errors: { email: 'Email is invalid' } },
      { status: 400 },
    );
  }

  if (name == null || typeof name !== 'string' || name.length === 0) {
    return data(
      { errors: { name: 'Name is required' } },
      { status: 400 },
    );
  }

  if ((name as string).length > 255) {
    return data(
      { errors: { name: 'Name is too long' } },
      { status: 400 },
    );
  }

  if (typeof password !== 'string' || password.length === 0) {
    return data(
      { errors: { password: 'Password is required' } },
      { status: 400 },
    );
  }

  if (password.length < 6) {
    return data(
      { errors: { password: 'Password is too short' } },
      { status: 400 },
    );
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser != null) {
    return data(
      { errors: { email: 'Email is already in use' } },
      { status: 400 },
    );
  }

  let user: User;
  try {
    user = await createUser(email, name, password);
  } catch {
    return data(
      { errors: { submit: 'Failed to create user' } },
      { status: 500 },
    );
  }

  return createUserSession({
    redirectTo: `/login?verify=1${redirectTo != null ? `&redirectTo=${redirectTo}` : ''}`,
    request,
    userId: user.id,
  });
}

export const meta: MetaFunction = () => [{ title: 'Register' }];

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');
  const fetcher = useFetcher();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      name: '',
      password: '',
      address: '',
      redirectTo,
    },
  });
  const { toast } = useToast();

  useEffect(() => {
    form.clearErrors();
    if (fetcher.data?.errors?.errors) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Invalid credentials',
      });
    }
    if (fetcher.data?.errors?.email) {
      form.setError('email', { message: fetcher.data.errors.email });
      form.setFocus('email');
    }
    if (fetcher.data?.errors?.name) {
      form.setError('name', { message: fetcher.data.errors.name });
      form.setFocus('name');
    }
    if (fetcher.data?.errors?.password) {
      form.setError('password', { message: fetcher.data.errors.password });
      form.setFocus('password');
    }
  }, [fetcher.data, form, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl text-center font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Wishlist
          </CardTitle>
          <CardDescription className="text-center">
            Share your wishes with friends and family
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <fetcher.Form
              method="post"
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input autoComplete="name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem hidden>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input autoComplete="off" type="text" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Register
              </Button>
              <FormMessage>{fetcher.data?.errors?.submit}</FormMessage>
              <div className="w-full flex flex-row justify-end">
                <Link
                  to={`/login${redirectTo != null ? `?redirectTo=${redirectTo}` : ''}`}
                >
                  Already have an account? Login
                </Link>
              </div>
            </fetcher.Form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
