const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function makeAdmin() {
  const email = 'enricocatolico03@gmail.com';
  
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Update existing user to admin
      const updatedUser = await prisma.user.update({
        where: { email },
        data: { role: 'admin' },
      });
      console.log('✅ User updated to admin:', updatedUser.email);
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName: 'Enrico',
          lastName: 'Admin',
          role: 'admin',
        },
      });
      console.log('✅ New admin account created:', newUser.email);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();
