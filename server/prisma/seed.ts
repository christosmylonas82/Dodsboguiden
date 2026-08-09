import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@dodsboguiden.se';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'changeme123';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin',
        passwordHash: await bcrypt.hash(adminPassword, 12),
        role: 'ADMIN',
        gdprConsent: true,
        consentDate: new Date(),
      },
    });
    console.log(
      process.env.ADMIN_PASSWORD
        ? `Seeded admin user: ${adminEmail} (password from ADMIN_PASSWORD)`
        : `Seeded admin user: ${adminEmail} / changeme123 (change this password)`,
    );
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
