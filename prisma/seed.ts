// prisma/seed.ts
// This file seeds your database with initial data

import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'enricocatolico03@gmail.com' },
    update: {},
    create: {
      email: 'enricocatolico03@gmail.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create sample rewards
  const reward1 = await prisma.reward.upsert({
    where: { id: 'reward-1' },
    update: {},
    create: {
      id: 'reward-1',
      title: 'Free Pasta',
      description: 'Complimentary pasta dish of your choice',
      points: 500,
      category: 'Free Item',
      imgUrl: '/items/pasta.jpg',
    },
  });

  const reward2 = await prisma.reward.upsert({
    where: { id: 'reward-2' },
    update: {},
    create: {
      id: 'reward-2',
      title: '50% Off',
      description: '50% discount on your next order',
      points: 300,
      category: 'Discount',
      imgUrl: '/items/discount.jpg',
    },
  });

  const reward3 = await prisma.reward.upsert({
    where: { id: 'reward-3' },
    update: {},
    create: {
      id: 'reward-3',
      title: 'Free Dessert',
      description: 'Free dessert of your choice',
      points: 200,
      category: 'Free Item',
      imgUrl: '/items/dessert.jpg',
    },
  });

  console.log('✅ Sample rewards created');

  console.log('🌱 Seeding completed!');
}

main()
  .then(async () => {
    console.log('✅ Database seeding complete');
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  });
