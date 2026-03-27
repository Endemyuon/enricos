import Database from 'better-sqlite3';
import path from 'path';

let accountsDb: Database.Database | null = null;
let rewardsDb: Database.Database | null = null;
let pointLedgerDb: Database.Database | null = null;
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
    const dbPath = path.join(process.cwd(), 'data', 'accounts.db');
    accountsDb = new Database(dbPath);
    accountsDb.pragma('journal_mode = WAL');
    initializeAccountsDatabase(accountsDb);
  }
  return accountsDb;
}

export function getRewardsDatabase() {
  if (!rewardsDb) {
    ensureDataDirectory();
    const dbPath = path.join(process.cwd(), 'data', 'rewards.db');
    rewardsDb = new Database(dbPath);
    rewardsDb.pragma('journal_mode = WAL');
    initializeRewardsDatabase(rewardsDb);
  }
  return rewardsDb;
}

export function getPointLedgerDatabase() {
  if (!pointLedgerDb) {
    ensureDataDirectory();
    const dbPath = path.join(process.cwd(), 'data', 'point_ledger.db');
    pointLedgerDb = new Database(dbPath);
    pointLedgerDb.pragma('journal_mode = WAL');
    initializePointLedgerDatabase(pointLedgerDb);
  }
  return pointLedgerDb;
}

export function getRedemptioneLogsDatabase() {
  if (!redemptionLogsDb) {
    ensureDataDirectory();
    const dbPath = path.join(process.cwd(), 'data', 'redemption_logs.db');
    redemptionLogsDb = new Database(dbPath);
    redemptionLogsDb.pragma('journal_mode = WAL');
    initializeRedemptioneLogsDatabase(redemptionLogsDb);
  }
  return redemptionLogsDb;
}

// Legacy function for backward compatibility
export function getDatabase() {
  return getAccountsDatabase();
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
      role TEXT DEFAULT 'customer',
      createdAt TEXT NOT NULL
    )
  `);

  // Create indexes
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
    CREATE INDEX IF NOT EXISTS idx_customers_rfid ON customers(rfidCard);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
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

export function initializePointLedgerDatabase(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS point_ledger (
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
    CREATE INDEX IF NOT EXISTS idx_ledger_customer ON point_ledger(customerId);
    CREATE INDEX IF NOT EXISTS idx_ledger_email ON point_ledger(email);
    CREATE INDEX IF NOT EXISTS idx_ledger_type ON point_ledger(type);
    CREATE INDEX IF NOT EXISTS idx_ledger_date ON point_ledger(createdAt);
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
    CREATE INDEX IF NOT EXISTS idx_redemptions_customer ON redemptions(customerId);
    CREATE INDEX IF NOT EXISTS idx_redemptions_email ON redemptions(email);
    CREATE INDEX IF NOT EXISTS idx_redemptions_reward ON redemptions(rewardId);
    CREATE INDEX IF NOT EXISTS idx_redemptions_status ON redemptions(status);
    CREATE INDEX IF NOT EXISTS idx_redemptions_date ON redemptions(redeemedAt);
  `);
}

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
  quantity?: number;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PointLedgerEntry {
  id: string;
  customerId: string;
  email: string;
  amount: number;
  type: string; // 'earned', 'redeemed', 'adjusted'
  description: string;
  reference?: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
}

export interface RedemptionLog {
  id: string;
  customerId: string;
  customerName: string;
  email: string;
  rewardId: string;
  rewardTitle: string;
  pointsRedeemed: number;
  status: string; // 'pending', 'completed', 'cancelled'
  notes?: string;
  redeemedAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Customers operations
export function getAllCustomers(): Customer[] {
  const database = getAccountsDatabase();
  const stmt = database.prepare('SELECT * FROM customers ORDER BY createdAt DESC');
  return stmt.all() as Customer[];
}

export function getCustomerById(id: string): Customer | undefined {
  const database = getAccountsDatabase();
  const stmt = database.prepare('SELECT * FROM customers WHERE id = ?');
  return stmt.get(id) as Customer | undefined;
}

export function getCustomerByEmail(email: string): Customer | undefined {
  const database = getAccountsDatabase();
  const stmt = database.prepare('SELECT * FROM customers WHERE email = ?');
  return stmt.get(email) as Customer | undefined;
}

export function createCustomer(customer: Omit<Customer, 'createdAt' | 'updatedAt'>): Customer {
  const database = getAccountsDatabase();
  const now = new Date().toISOString();
  const stmt = database.prepare(`
    INSERT INTO customers (id, name, email, phone, rfidCard, points, joinDate, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    customer.id,
    customer.name,
    customer.email,
    customer.phone || null,
    customer.rfidCard || null,
    customer.points,
    customer.joinDate,
    now,
    now
  );

  return getCustomerById(customer.id)!;
}

export function updateCustomer(id: string, updates: Partial<Customer>): Customer {
  const database = getAccountsDatabase();
  const customer = getCustomerById(id);
  if (!customer) throw new Error('Customer not found');

  const now = new Date().toISOString();
  const updated = { ...customer, ...updates, updatedAt: now };

  const stmt = database.prepare(`
    UPDATE customers 
    SET name = ?, email = ?, phone = ?, rfidCard = ?, points = ?, joinDate = ?, updatedAt = ?
    WHERE id = ?
  `);

  stmt.run(
    updated.name,
    updated.email,
    updated.phone || null,
    updated.rfidCard || null,
    updated.points,
    updated.joinDate,
    now,
    id
  );

  return getCustomerById(id)!;
}

export function updateCustomerByEmail(email: string, updates: Partial<Customer>): Customer {
  const customer = getCustomerByEmail(email);
  if (!customer) throw new Error('Customer not found');
  return updateCustomer(customer.id, updates);
}

export function deleteCustomer(id: string): boolean {
  const database = getAccountsDatabase();
  
  // First get the customer to retrieve the email
  const customer = getCustomerById(id);
  if (!customer) return false;
  
  // Delete from customers table
  const deleteCustomerStmt = database.prepare('DELETE FROM customers WHERE id = ?');
  const customerResult = deleteCustomerStmt.run(id);
  
  // Also delete the associated user by email
  const deleteUserStmt = database.prepare('DELETE FROM users WHERE email = ?');
  deleteUserStmt.run(customer.email);
  
  return (customerResult.changes || 0) > 0;
}

// Users operations
export function getUserByEmail(email: string): User | undefined {
  const database = getAccountsDatabase();
  const stmt = database.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email) as User | undefined;
}

export function createUser(id: string, email: string, password: string, role: string = 'customer'): User {
  const database = getAccountsDatabase();
  const now = new Date().toISOString();
  const stmt = database.prepare(`
    INSERT INTO users (id, email, password, role, createdAt)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(id, email, password, role, now);
  
  const user = database.prepare('SELECT * FROM users WHERE id = ?').get(id) as User;
  return user;
}

export function getStatistics() {
  const database = getAccountsDatabase();
  const customers = database.prepare('SELECT COUNT(*) as count FROM customers').get() as { count: number };
  const totalPoints = database.prepare('SELECT SUM(points) as total FROM customers').get() as { total: number };

  return {
    totalCustomers: customers.count,
    totalPoints: totalPoints.total || 0,
  };
}
// Rewards operations
export function getAllRewards(): Reward[] {
  const database = getRewardsDatabase();
  const stmt = database.prepare('SELECT * FROM rewards ORDER BY createdAt DESC');
  return stmt.all() as Reward[];
}

export function getRewardById(id: string): Reward | undefined {
  const database = getRewardsDatabase();
  const stmt = database.prepare('SELECT * FROM rewards WHERE id = ?');
  return stmt.get(id) as Reward | undefined;
}

export function createReward(data: Omit<Reward, 'createdAt' | 'updatedAt'>): Reward {
  const database = getRewardsDatabase();
  const now = new Date().toISOString();
  const stmt = database.prepare(`
    INSERT INTO rewards (id, title, description, expiry, imgUrl, points, quantity, category, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    data.id,
    data.title,
    data.description || null,
    data.expiry || null,
    data.imgUrl || null,
    data.points || 0,
    data.quantity || 0,
    data.category || null,
    now,
    now
  );
  return getRewardById(data.id)!;
}

export function updateReward(id: string, updates: Partial<Reward>): Reward {
  const database = getRewardsDatabase();
  const reward = getRewardById(id);
  if (!reward) throw new Error('Reward not found');
  const now = new Date().toISOString();
  const updated = { ...reward, ...updates, updatedAt: now } as Reward;

  const stmt = database.prepare(`
    UPDATE rewards
    SET title = ?, description = ?, expiry = ?, imgUrl = ?, points = ?, quantity = ?, category = ?, updatedAt = ?
    WHERE id = ?
  `);

  stmt.run(
    updated.title,
    updated.description || null,
    updated.expiry || null,
    updated.imgUrl || null,
    updated.points,
    updated.quantity || 0,
    updated.category || null,
    now,
    id
  );
  return getRewardById(id)!;
}

export function deleteReward(id: string): boolean {
  const database = getRewardsDatabase();
  const stmt = database.prepare('DELETE FROM rewards WHERE id = ?');
  const result = stmt.run(id);
  return (result.changes || 0) > 0;
}

// Point Ledger operations
export function addPointLedgerEntry(entry: Omit<PointLedgerEntry, 'createdAt'>): PointLedgerEntry {
  const database = getPointLedgerDatabase();
  const now = new Date().toISOString();
  const stmt = database.prepare(`
    INSERT INTO point_ledger (id, customerId, email, amount, type, description, reference, balanceBefore, balanceAfter, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    entry.id,
    entry.customerId,
    entry.email,
    entry.amount,
    entry.type,
    entry.description,
    entry.reference || null,
    entry.balanceBefore,
    entry.balanceAfter,
    now
  );

  return getPointLedgerEntryById(entry.id)!;
}

export function getPointLedgerEntryById(id: string): PointLedgerEntry | undefined {
  const database = getPointLedgerDatabase();
  const stmt = database.prepare('SELECT * FROM point_ledger WHERE id = ?');
  return stmt.get(id) as PointLedgerEntry | undefined;
}

export function getPointLedgerByCustomerId(customerId: string): PointLedgerEntry[] {
  const database = getPointLedgerDatabase();
  const stmt = database.prepare('SELECT * FROM point_ledger WHERE customerId = ? ORDER BY createdAt DESC');
  return stmt.all(customerId) as PointLedgerEntry[];
}

export function getAllPointLedger(): PointLedgerEntry[] {
  const database = getPointLedgerDatabase();
  const stmt = database.prepare('SELECT * FROM point_ledger ORDER BY createdAt DESC');
  return stmt.all() as PointLedgerEntry[];
}

// Redemption Logs operations
export function createRedemptionLog(log: Omit<RedemptionLog, 'createdAt' | 'updatedAt'>): RedemptionLog {
  const database = getRedemptioneLogsDatabase();
  const now = new Date().toISOString();
  const stmt = database.prepare(`
    INSERT INTO redemptions (id, customerId, customerName, email, rewardId, rewardTitle, pointsRedeemed, status, notes, redeemedAt, completedAt, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    log.id,
    log.customerId,
    log.customerName,
    log.email,
    log.rewardId,
    log.rewardTitle,
    log.pointsRedeemed,
    log.status || 'pending',
    log.notes || null,
    log.redeemedAt,
    log.completedAt || null,
    now,
    now
  );

  return getRedemptionLogById(log.id)!;
}

export function getRedemptionLogById(id: string): RedemptionLog | undefined {
  const database = getRedemptioneLogsDatabase();
  const stmt = database.prepare('SELECT * FROM redemptions WHERE id = ?');
  return stmt.get(id) as RedemptionLog | undefined;
}

export function getRedemptionLogsByCustomerId(customerId: string): RedemptionLog[] {
  const database = getRedemptioneLogsDatabase();
  const stmt = database.prepare('SELECT * FROM redemptions WHERE customerId = ? ORDER BY redeemedAt DESC');
  return stmt.all(customerId) as RedemptionLog[];
}

export function getAllRedemptionLogs(): RedemptionLog[] {
  const database = getRedemptioneLogsDatabase();
  const stmt = database.prepare('SELECT * FROM redemptions ORDER BY redeemedAt DESC');
  return stmt.all() as RedemptionLog[];
}

export function updateRedemptionLog(id: string, updates: Partial<RedemptionLog>): RedemptionLog {
  const database = getRedemptioneLogsDatabase();
  const log = getRedemptionLogById(id);
  if (!log) throw new Error('Redemption log not found');

  const now = new Date().toISOString();
  const updated = { ...log, ...updates, updatedAt: now };

  const stmt = database.prepare(`
    UPDATE redemptions
    SET status = ?, notes = ?, completedAt = ?, updatedAt = ?
    WHERE id = ?
  `);

  stmt.run(
    updated.status,
    updated.notes || null,
    updated.completedAt || null,
    now,
    id
  );

  return getRedemptionLogById(id)!;
}