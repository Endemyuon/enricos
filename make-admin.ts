import { getAccountsDatabase } from './lib/db';
import bcrypt from 'bcryptjs';

const db = getAccountsDatabase();

async function makeAdmin() {
  const email = 'enricocatolico03@gmail.com';
  
  try {
    // Check if user exists
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

    if (existingUser) {
      // Update existing user to admin
      db.prepare('UPDATE users SET role = ? WHERE email = ?').run('admin', email);
      console.log('✅ User updated to admin:', email);
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const userId = 'admin_' + Date.now();
      const now = new Date().toISOString();
      
      db.prepare('INSERT INTO users (id, email, password, firstName, lastName, role, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
        userId, email, hashedPassword, 'Enrico', 'Admin', 'admin', now
      );
      console.log('✅ New admin account created:', email);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

makeAdmin();
