/**
 * Admin Account Creator Script
 * Usage: npx ts-node scripts/create-admin.ts
 */

import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const dbPath = path.join(process.cwd(), 'data', 'enricos.sqlite');
const db = new Database(dbPath);

async function createAdmin() {
  const adminEmail = 'admin@enricos.shop';
  const adminPassword = 'Admin@123456'; // Change this to your desired password
  
  try {
    // Check if admin already exists
    const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(adminEmail);
    
    if (existing) {
      console.log('✅ Admin account already exists:', adminEmail);
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const userId = 'admin_' + uuidv4();
    const now = new Date().toISOString();

    // Insert admin user
    db.prepare(`
      INSERT INTO users (id, email, password, firstName, lastName, role, emailVerified, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      adminEmail,
      hashedPassword,
      'Admin',
      'Account',
      'admin',
      1, // Email verified
      now
    );

    // Insert admin customer record
    db.prepare(`
      INSERT INTO customers (id, name, email, points, joinDate, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      'Admin Account',
      adminEmail,
      0,
      now.split('T')[0],
      now,
      now
    );

    console.log('✅ Admin account created successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔐 Password:', adminPassword);
    console.log('\n⚠️  Please change this password after first login!');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

createAdmin();
