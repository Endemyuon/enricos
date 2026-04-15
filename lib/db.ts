import Database from 'better-sqlite3';
import path from 'path';

let accountsDb: Database.Database | null = null;
let rewardsDb: Database.Database | null = null;
let redemptionLogsDb: Database.Database | null = null;

// Initialize data directory
function ensureDataDirectory() {
  const fs = require('fs');
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

export function getAccountsDatabase() {
  if (!accountsDb) {
    ensureDataDirectory();
    const dbPath = path.join(process.cwd(), 'data', 'accounts.sqlite');
    accountsDb = new Database(dbPath);
    accountsDb.pragma('journal_mode = WAL');
    accountsDb.pragma('foreign_keys = ON');
    initializeAccountsDatabase(accountsDb);
  }
  return accountsDb;
}

export function getRewardsDatabase() {
  if (!rewardsDb) {
    ensureDataDirectory();
    const dbPath = path.join(process.cwd(), 'data', 'rewards.sqlite');
    rewardsDb = new Database(dbPath);
    rewardsDb.pragma('journal_mode = WAL');
    rewardsDb.pragma('foreign_keys = ON');
    initializeRewardsDatabase(rewardsDb);
  }
  return rewardsDb;
}

export function getRedemptioneLogsDatabase() {
  if (!redemptionLogsDb) {
    ensureDataDirectory();
    const dbPath = path.join(process.cwd(), 'data', 'redemption_logs.sqlite');
    redemptionLogsDb = new Database(dbPath);
    redemptionLogsDb.pragma('journal_mode = WAL');
    redemptionLogsDb.pragma('foreign_keys = ON');
    initializeRedemptioneLogsDatabase(redemptionLogsDb);
  }
  return redemptionLogsDb;
}

export function initializeAccountsDatabase(database: Database.Database) {
  // Create customers table
  database.exec(`
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

  // Create users table for authentication
  database.exec(`
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

  // Create email verification tokens table
  database.exec(`
    CREATE TABLE IF NOT EXISTS emailVerificationTokens (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      userId TEXT,
      expiresAt TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      verifiedAt TEXT
    )
  `);

  // Create password reset tokens table
  database.exec(`
    CREATE TABLE IF NOT EXISTS passwordResetTokens (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      userId TEXT,
      expiresAt TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      usedAt TEXT
    )
  `);

  // Create indexes
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
    CREATE INDEX IF NOT EXISTS idx_customers_rfid ON customers(rfidCard);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_verify_token ON emailVerificationTokens(token);
    CREATE INDEX IF NOT EXISTS idx_verify_email ON emailVerificationTokens(email);
    CREATE INDEX IF NOT EXISTS idx_reset_token ON passwordResetTokens(token);
    CREATE INDEX IF NOT EXISTS idx_reset_email ON passwordResetTokens(email);
  `);
}

export function initializeRewardsDatabase(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS rewards (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      expiry TEXT,
      imgUrl TEXT,
      points INTEGER DEFAULT 0,
      quantity INTEGER DEFAULT 0,
      category TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_rewards_points ON rewards(points);
    CREATE INDEX IF NOT EXISTS idx_rewards_category ON rewards(category);
  `);
}

export function initializeRedemptioneLogsDatabase(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS redemptions (
      id TEXT PRIMARY KEY,
      customerId TEXT NOT NULL,
      customerName TEXT NOT NULL,
      email TEXT NOT NULL,
      rewardId TEXT NOT NULL,
      rewardTitle TEXT NOT NULL,
      pointsRedeemed INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      notes TEXT,
      redeemedAt TEXT NOT NULL,
      completedAt TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);

  database.exec(`
    CREATE TABLE IF NOT EXISTS pointLedger (
      id TEXT PRIMARY KEY,
      customerId TEXT NOT NULL,
      email TEXT NOT NULL,
      amount INTEGER NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      reference TEXT,
      balanceBefore INTEGER DEFAULT 0,
      balanceAfter INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL
    )
  `);

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_redemptions_customer ON redemptions(customerId);
    CREATE INDEX IF NOT EXISTS idx_redemptions_email ON redemptions(email);
    CREATE INDEX IF NOT EXISTS idx_redemptions_reward ON redemptions(rewardId);
    CREATE INDEX IF NOT EXISTS idx_redemptions_status ON redemptions(status);
    CREATE INDEX IF NOT EXISTS idx_redemptions_date ON redemptions(redeemedAt);
    CREATE INDEX IF NOT EXISTS idx_ledger_customer ON pointLedger(customerId);
    CREATE INDEX IF NOT EXISTS idx_ledger_email ON pointLedger(email);
    CREATE INDEX IF NOT EXISTS idx_ledger_type ON pointLedger(type);
    CREATE INDEX IF NOT EXISTS idx_ledger_date ON pointLedger(createdAt);
  `);
}

// TypeScript interfaces
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  rfidCard?: string;
  points: number;
  joinDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: string;
  createdAt: string;
}

export interface Reward {
  id: string;
  title: string;
  description?: string;
  expiry?: string;
  imgUrl?: string;
  points: number;
  quantity: number;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PointLedger {
  id: string;
  customerId: string;
  email: string;
  amount: number;
  type: string;
  description?: string;
  reference?: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
}

export interface Redemption {
  id: string;
  customerId: string;
  customerName: string;
  email: string;
  rewardId: string;
  rewardTitle: string;
  pointsRedeemed: number;
  status: string;
  notes?: string;
  redeemedAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}