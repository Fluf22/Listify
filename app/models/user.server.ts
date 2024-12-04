import type { User } from '@prisma/client';
import { randomBytes } from 'node:crypto';

import bcrypt from 'bcryptjs';
import { prisma } from '~/db.server';
import { resend } from '~/emails.server';

export async function getUserById(id: User['id']) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: User['email']) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(
  email: User['email'],
  name: User['name'],
  password: string,
): Promise<User> {
  const hashedPassword = await bcrypt.hash(password, 10);
  // Create a token that includes timestamp for expiration
  const timestamp = Date.now();
  const verificationToken = `${randomBytes(32).toString('hex')}.${timestamp}`;

  let user: User;
  try {
    user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        emailToken: verificationToken,
      },
    });
  } catch (e) {
    throw new Error('Failed to create user', { cause: e });
  }

  try {
    await resend.emails.send({
      from: 'noreply@caudex.fr',
      to: email,
      subject: 'Verify your email',
      html: `Click <a href="https://${process.env.APP_URL}/verify-email?token=${verificationToken}">here</a> to verify your email`,
    });
  } catch (e) {
    throw new Error('Failed to send verification email', { cause: e });
  }

  return user;
}

export async function deleteUserByEmail(email: User['email']) {
  return prisma.user.delete({ where: { email } });
}

export async function verifyLogin(
  email: User['email'],
  password: User['password'],
) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (user == null || user.password == null) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    return null;
  }

  const { password: _password, ...userWithoutPassword } = user;

  return userWithoutPassword;
}
