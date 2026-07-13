require('dotenv').config();

const bcrypt = require('bcryptjs');
const { prisma } = require('../src/config/prisma');

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@teacherlesson.local';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123';
  const name = process.env.ADMIN_NAME || 'Administrator';

  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log(`Admin already exists: ${email}`);
    return;
  }

  const admin = await prisma.user.create({
    data: {
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role: 'ADMIN',
    },
  });

  console.log(`Admin seeded successfully: ${admin.email} (id=${admin.id})`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
