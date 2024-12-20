import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { randomBytes } from 'node:crypto';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { data, redirect, useFetcher, useLoaderData, useNavigate } from 'react-router';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { prisma } from '~/db.server';
import { EMAIL_FROM, resend } from '~/emails.server';
import { useToast } from '~/hooks/use-toast';
import { getUserByEmail } from '~/models/user.server';
import { getUser } from '~/session.server';
import { validateEmail } from '~/utils';

const resendSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  if (user == null) {
    throw redirect('/login');
  }

  if (user.emailVerified) {
    throw redirect('/');
  }

  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  if (token == null) {
    return { ok: false, email: user.email, message: { title: 'Verification failed', description: 'Invalid verification link' } };
  }

  if (token === user.emailToken) {
    await prisma
      .user
      .update({
        where: { id: user.id },
        data: { emailVerified: true, emailToken: null },
      });
    return { ok: true, message: { title: 'Email verified', description: 'Your email has been verified successfully. Please login to continue.' } };
  }

  return {
    ok: false,
    message: { title: 'Verification failed', description: 'Please try resending the verification email' },
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get('email');

  if (!validateEmail(email)) {
    return data(
      { ok: false, message: { title: 'Error', description: 'Email is invalid' } },
      { status: 400 },
    );
  }

  const user = await getUserByEmail(email);
  if (user == null) {
    return data(
      { ok: false, message: { title: 'Error', description: 'User not found' } },
      { status: 400 },
    );
  }

  if (user.emailVerified === true) {
    throw redirect('/login');
  }

  // Generate new verification token
  const timestamp = Date.now();
  const newToken = `${randomBytes(32).toString('hex')}.${timestamp}`;

  // Update user's token
  await prisma
    .user
    .update({
      where: { id: user.id },
      data: { emailToken: newToken },
    });

  // Send new verification email
  await resend.emails.send({
    from: EMAIL_FROM,
    to: user.email,
    subject: 'New verification email',
    html: `Click <a href="${process.env.APP_URL}/verify-email?token=${newToken}">here</a> to verify your email`,
  });

  return { ok: true, message: { title: 'Email verification link sent', description: 'Please check your mailbox!' } };
}

export default function VerifyEmailPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const data = useLoaderData();
  const fetcher = useFetcher();
  const form = useForm<z.infer<typeof resendSchema>>({
    resolver: zodResolver(resendSchema),
    defaultValues: {
      email: '',
    },
  });

  const [isLoading, setIsLoading] = useState(true);
  const [showResendForm, setShowResendForm] = useState(false);

  useEffect(() => {
    toast({
      variant: data.ok ? 'default' : 'destructive',
      ...data.message,
    });

    if (data.ok) {
      setTimeout(() => {
        navigate('/');
      }, 1000);
      return;
    }

    setShowResendForm(true);
    setIsLoading(false);
  }, [data, navigate, toast]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Verifying Email</CardTitle>
            <CardDescription>Please wait while we verify your email address</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResendForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Resend Verification Email</CardTitle>
            <CardDescription>
              Enter your email address to receive a new verification link
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <fetcher.Form method="post">
              <CardContent>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={fetcher.state !== 'idle'}
                >
                  {fetcher.state === 'submitting'
                    ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      )
                    : (
                        <Mail className="h-4 w-4 mr-2" />
                      )}
                  Resend Verification Email
                </Button>
              </CardFooter>
            </fetcher.Form>
          </Form>
        </Card>
      </div>
    );
  }

  return null;
}
