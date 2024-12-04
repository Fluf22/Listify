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
import { verifyLogin } from '~/models/user.server';
import { createUserSession, getUser } from '~/session.server';
import { safeRedirect, validateEmail } from '~/utils';

const FormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  address: z.string(), // Honeypot field
  redirectTo: z.string().optional().nullable(),
});

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  if (user?.emailVerified === true) {
    return redirect('/dashboard');
  }

  return {};
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get('email');
  const address = formData.get('address');
  const password = formData.get('password');
  const redirectTo = safeRedirect(formData.get('redirectTo'), '/dashboard');

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

  const user = await verifyLogin(email, password);

  if (!user) {
    return data(
      { errors: { submit: 'Invalid email or password' } },
      { status: 400 },
    );
  }

  return createUserSession({
    redirectTo,
    request,
    userId: user.id,
  });
}

export const meta: MetaFunction = () => [{ title: 'Login' }];

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');
  const verify = searchParams.get('verify');
  const fetcher = useFetcher();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      password: '',
      address: '',
      redirectTo,
    },
  });
  const { toast } = useToast();

  useEffect(() => {
    if (verify != null) {
      toast({
        variant: 'default',
        title: 'Success',
        description: 'Please check your email to verify your account',
      });
    }
  }, [verify, toast]);

  useEffect(() => {
    form.clearErrors();
    if (fetcher.data?.errors) {
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
                Login
              </Button>
              <FormMessage>{fetcher.data?.errors?.submit}</FormMessage>
              <div className="w-full flex flex-row justify-end">
                <Link
                  to={`/register${redirectTo != null ? `?redirectTo=${redirectTo}` : ''}`}
                >
                  Create an account
                </Link>
              </div>
            </fetcher.Form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
