const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(process.cwd(), 'data', 'accounts.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

const email = 'enricocatolico03@gmail.com';

try {
  // Check if user exists
  const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (existingUser) {
    // Update existing user to admin
    db.prepare('UPDATE users SET role = ? WHERE email = ?').run('admin', email);
    console.log('✅ User updated to admin:', email);
  } else {
    // Create new admin user
    const id = 'user_' + Date.now();
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    const createdAt = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO users (id, email, password, role, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, email, hashedPassword, 'admin', createdAt);
    
    console.log('✅ New admin account created:', email);
  }
  
  // Verify the change
  const updatedUser = db.prepare('SELECT email, role FROM users WHERE email = ?').get(email);
  console.log('✅ Verification - User role:', updatedUser?.role);
} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  db.close();
}
