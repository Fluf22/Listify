import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
  const email = 'local@caudex.fr';

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  const hashedPassword = await bcrypt.hash('local76', 10);

  await prisma.user.create({
    data: {
      email,
      name: 'Local User',
      password: hashedPassword,
    },
  });

  // eslint-disable-next-line no-console
  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch(async (e) => {
    console.error(e);
    (await import('node:process')).exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
