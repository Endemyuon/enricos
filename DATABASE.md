# SQLite Database Setup

## Overview
Enrico's Loyalty Program uses SQLite with **separate database files** for different concerns: Accounts, Rewards, Point Ledger, and Redemption Logs. This modular approach improves organization, scalability, and data integrity.

## Database Files

All databases are located in the `/data` directory:

- **accounts.db** - Customer profiles, user accounts, and RFID cards
- **rewards.db** - Reward catalog and items
- **point_ledger.db** - Complete point transaction history
- **redemption_logs.db** - Reward redemption requests and status

## Database Structure

### Accounts Database (`accounts.db`)

#### `customers` Table
- `id` (TEXT PRIMARY KEY) - Unique customer identifier
- `name` (TEXT) - Customer name
- `email` (TEXT UNIQUE) - Customer email
- `phone` (TEXT) - Customer phone number
- `rfidCard` (TEXT UNIQUE) - RFID card serial number
- `points` (INTEGER) - Current loyalty points balance
- `joinDate` (TEXT) - Date customer joined
- `createdAt` (TEXT) - When record was created
- `updatedAt` (TEXT) - When record was last updated

#### `users` Table
- `id` (TEXT PRIMARY KEY) - User identifier
- `email` (TEXT UNIQUE) - User email
- `password` (TEXT) - User password (should be hashed in production)
- `role` (TEXT) - User role: 'admin' or 'customer'
- `createdAt` (TEXT) - When account was created

### Rewards Database (`rewards.db`)

#### `rewards` Table
- `id` (TEXT PRIMARY KEY) - Unique reward identifier
- `title` (TEXT) - Reward title/name
- `description` (TEXT) - Reward description (optional)
- `expiry` (TEXT) - Expiration date (optional)
- `imgUrl` (TEXT) - Image URL for reward (optional)
- `points` (INTEGER) - Points required to redeem
- `quantity` (INTEGER) - Available quantity (optional)
- `category` (TEXT) - Reward category (optional)
- `createdAt` (TEXT) - When reward was created
- `updatedAt` (TEXT) - When reward was last updated

### Point Ledger Database (`point_ledger.db`)

#### `point_ledger` Table
- `id` (TEXT PRIMARY KEY) - Unique ledger entry identifier
- `customerId` (TEXT) - Customer ID (foreign reference)
- `email` (TEXT) - Customer email
- `amount` (INTEGER) - Points added or deducted
- `type` (TEXT) - Transaction type: 'earned', 'redeemed', 'adjusted'
- `description` (TEXT) - Details about the transaction
- `reference` (TEXT) - Reference ID (order/redemption ID)
- `balanceBefore` (INTEGER) - Points balance before transaction
- `balanceAfter` (INTEGER) - Points balance after transaction
- `createdAt` (TEXT) - When transaction occurred

### Redemption Logs Database (`redemption_logs.db`)

#### `redemptions` Table
- `id` (TEXT PRIMARY KEY) - Unique redemption entry identifier
- `customerId` (TEXT) - Customer ID (foreign reference)
- `customerName` (TEXT) - Customer name
- `email` (TEXT) - Customer email
- `rewardId` (TEXT) - Reward ID (foreign reference)
- `rewardTitle` (TEXT) - Reward title
- `pointsRedeemed` (INTEGER) - Points used for redemption
- `status` (TEXT) - Redemption status: 'pending', 'completed', 'cancelled'
- `notes` (TEXT) - Admin notes (optional)
- `redeemedAt` (TEXT) - When redemption was requested
- `completedAt` (TEXT) - When reward was delivered (optional)
- `createdAt` (TEXT) - When log entry was created
- `updatedAt` (TEXT) - When log entry was last updated

## API Endpoints

### Customers API (`/api/customers`)

**GET** - Fetch all customers
- Query parameter: `action=stats` - Get statistics instead

**POST** - Create, update, or delete customers
- Actions:
  - `create` - Create new customer
  - `update` - Update existing customer
  - `delete` - Delete customer
  - `updateByEmail` - Update customer by email address

### Auth API (`/api/auth`)

**POST** - Handle authentication
- Actions:
  - `login` - Authenticate user
  - `register` - Register new customer account

### Rewards API (`/api/rewards`)

**GET** - Fetch all rewards

**POST** - Create, update, or delete rewards
- Actions:
  - `create` - Create new reward
  - `update` - Update existing reward
  - `delete` - Delete reward

## Database Location
All SQLite database files are stored in the `/data` directory:
```
data/
  ├── accounts.db         # Customer and user accounts with RFID records
  ├── rewards.db          # Loyalty rewards catalog
  ├── point_ledger.db     # Point transaction history
  └── redemption_logs.db  # Redemption request logs
```

## Features

✅ **Modular Database Design** - Separate databases for different concerns (accounts, rewards, ledger, logs)
✅ **Persistent Storage** - All data saved to SQLite databases
✅ **Admin Management** - Full CRUD operations for customers and rewards
✅ **Authentication** - Secure user login and registration with role-based access
✅ **RFID Integration** - Customer RFID cards stored and linked to accounts
✅ **Point Tracking** - Complete ledger of all point transactions with balances
✅ **Redemption Management** - Track all reward redemptions with status
✅ **Statistics** - Query customer and point statistics
✅ **Transaction History** - Full audit trail of point activity

## Initial Setup

1. Database is automatically created on first run
2. Tables are automatically initialized
3. Indexes are created for faster queries

## Usage Examples

### Adding a Customer
```javascript
fetch('/api/customers', {
  method: 'POST',
  body: JSON.stringify({
    action: 'create',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    rfidCard: 'RF00123456',
    points: 0,
  })
})
```

### Updating a Customer
```javascript
fetch('/api/customers', {
  method: 'POST',
  body: JSON.stringify({
    action: 'update',
    id: 'customer-id',
    points: 150,
    phone: '+0987654321',
  })
})
```

### Deleting a Customer
```javascript
fetch('/api/customers', {
  method: 'POST',
  body: JSON.stringify({
    action: 'delete',
    id: 'customer-id',
  })
})
```

### Adding a Reward
```javascript
fetch('/api/rewards', {
  method: 'POST',
  body: JSON.stringify({
    action: 'create',
    title: 'Free Coffee',
    description: 'Get a free medium coffee',
    points: 100,
    imgUrl: '/reward-coffee.jpg',
    category: 'Beverages',
    expiry: '2025-12-31',
  })
})
```

### Updating a Reward
```javascript
fetch('/api/rewards', {
  method: 'POST',
  body: JSON.stringify({
    action: 'update',
    id: 'reward-id',
    title: 'Free Coffee',
    points: 150,
    expiry: '2025-12-31',
  })
})
```

### Deleting a Reward
```javascript
fetch('/api/rewards', {
  method: 'POST',
  body: JSON.stringify({
    action: 'delete',
    id: 'reward-id',
  })
})
```

### Recording a Point Transaction
```javascript
// In backend code
import { addPointLedgerEntry } from '@/lib/db';

addPointLedgerEntry({
  id: Date.now().toString(),
  customerId: 'customer-id',
  email: 'customer@example.com',
  amount: 10,
  type: 'earned',
  description: 'Purchase of ₱1000',
  reference: 'ORDER-123',
  balanceBefore: 100,
  balanceAfter: 110,
});
```

### Recording a Redemption
```javascript
// In backend code
import { createRedemptionLog } from '@/lib/db';

createRedemptionLog({
  id: Date.now().toString(),
  customerId: 'customer-id',
  customerName: 'John Doe',
  email: 'john@example.com',
  rewardId: 'reward-id',
  rewardTitle: 'Free Coffee',
  pointsRedeemed: 100,
  status: 'pending',
  redeemedAt: new Date().toISOString(),
});
```

## Admin Credentials
- Email: `admin@example.com` or `enricocatolco03@gmail.com`
- Password: Any password (6+ characters for demo)

## Development Notes

- All databases use WAL (Write-Ahead Logging) mode for better concurrency
- Databases are created in the `/data` directory which is ignored by git
- Each database file is independent and can be backed up separately
- **Point Ledger** provides complete audit trail of all point operations
- **Redemption Logs** track all reward requests with status tracking
- Implement password hashing in production (use bcrypt or similar)
- Consider adding foreign key constraints for data integrity
- Implement rate limiting on API endpoints for security
- Set up regular backups for the `/data` directory
