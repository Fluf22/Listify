import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { data, redirect, useFetcher, useSearchParams } from 'react-router';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { useToast } from '~/hooks/use-toast';
import { verifyLogin } from '~/models/user.server';
import { createUserSession, getUserId } from '~/session.server';
import { safeRedirect, validateEmail } from '~/utils';

const FormSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255).optional(),
  password: z.string().min(6),
  address: z.string().optional(), // Honeypot field
  mode: z.string().regex(/login|register/),
  redirectTo: z.string().optional(),
});

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  if (userId) {
    return redirect('/dashboard');
  }

  return {};
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get('email');
  const name = formData.get('name');
  const mode = formData.get('mode');
  const address = formData.get('address');
  const password = formData.get('password');
  const redirectTo = safeRedirect(formData.get('redirectTo'), '/');

  if (address) {
    return data(
      { errors: { submit: 'Invalid form' } },
      { status: 200 },
    );
  }

  if (mode !== 'login' && mode !== 'register') {
    return data(
      { errors: { submit: 'Invalid form' } },
      { status: 400 },
    );
  }

  if (!validateEmail(email)) {
    return data(
      { errors: { email: 'Email is invalid' } },
      { status: 400 },
    );
  }

  if (mode === 'register' && (name == null || typeof name !== 'string' || name.length === 0)) {
    return data(
      { errors: { name: 'Name is required' } },
      { status: 400 },
    );
  }

  if (mode === 'register' && (name as string).length > 255) {
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

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dons';
  const fetcher = useFetcher();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      password: '',
      mode: 'login',
      redirectTo,
    },
  });
  const { toast } = useToast();

  const [mode, setMode] = useState<'login' | 'register'>('login');

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
    if (mode === 'register' && fetcher.data?.errors?.name) {
      form.setError('name', { message: fetcher.data.errors.name });
      form.setFocus('name');
    }
    if (fetcher.data?.errors?.password) {
      form.setError('password', { message: fetcher.data.errors.password });
      form.setFocus('password');
    }
  }, [fetcher.data, form, mode, toast]);

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
          <Tabs
            value={mode}
            onValueChange={v => setMode(v as 'login' | 'register')}
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

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

                {mode === 'register' && (
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input autoComplete="given-name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

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

                <FormField
                  control={form.control}
                  name="mode"
                  render={({ field }) => (
                    <input type="hidden" {...field} value={mode} />
                  )}
                />

                <Button type="submit" className="w-full">
                  {mode === 'login' ? 'Login' : 'Register'}
                </Button>
                <FormMessage>{fetcher.data?.errors?.submit}</FormMessage>
              </fetcher.Form>
            </Form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
