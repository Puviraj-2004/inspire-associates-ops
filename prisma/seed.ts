// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Inspire Associates database seed...');

  // 1. Seed Categories
  const categories = [
    'Development',
    'Video Generating',
    'Car Annotation',
    'Exam Paper Adding',
    'Deployments',
    'Social media Post creation',
  ];

  for (const catName of categories) {
    await prisma.category.upsert({
      where: { name: catName },
      update: {},
      create: { name: catName },
    });
  }
  console.log('✅ Categories seeded successfully.');

  // 2. Seed Default Admin User
  const adminEmail = 'admin@inspire.com';
  const defaultPassword = 'AdminPassword@123'; // Seed aana piragu neenga change pannikkalam
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      fullName: 'Super Admin',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  // Seed Initial Audit Log
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      userName: admin.fullName,
      action: 'SYSTEM_INIT',
      details: 'System initialized with default Admin and Work Categories',
    },
  });

  console.log('✅ Default Admin created:');
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Password: ${defaultPassword}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });