/**
 * Admin Account Creator - Node.js Version
 * Usage: node scripts/create-admin.js
 */

const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(process.cwd(), 'data', 'enricos.sqlite');
const db = new Database(dbPath);

// Initialize database tables if they don't exist
function initializeDatabase() {
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      firstName TEXT,
      lastName TEXT,
      role TEXT DEFAULT 'customer',
      emailVerified INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL
    )
  `);

  // Create customers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      rfidCard TEXT UNIQUE,
      points INTEGER DEFAULT 0,
      joinDate TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);

  console.log('✓ Database tables initialized');
}

async function createAdmin() {
  const adminEmail = 'admin@enricos.shop';
  const adminPassword = 'Admin@123'; // Change to your desired password
  
  try {
    initializeDatabase();

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
      1, // Email already verified
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
