import { prisma } from '../src/lib/prisma.js';

async function main() {
  const email = process.argv[2] ?? 'christosmylonas82@gmail.com';

  const user = await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' },
  });

  console.log(`Made ${user.email} an admin (role: ${user.role})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
