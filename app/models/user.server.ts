import type { User } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { prisma } from '~/db.server';

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
): Promise<{ user: User }> {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });

  return { user };
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
