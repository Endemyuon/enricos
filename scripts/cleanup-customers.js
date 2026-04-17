const Database = require('better-sqlite3');
const path = require('path');

// Open database
const dbPath = path.join(process.cwd(), 'data', 'enricos.sqlite');
const db = new Database(dbPath);

try {
  console.log('🗑️ Deleting all customer accounts...');
  
  // Delete customer records
  const deleted1 = db.prepare('DELETE FROM customers').run();
  console.log(`✓ Deleted ${deleted1.changes} customer records`);
  
  // Delete customer users (keep admin role)
  const deleted2 = db.prepare("DELETE FROM users WHERE role = 'customer'").run();
  console.log(`✓ Deleted ${deleted2.changes} customer user accounts`);
  
  // Delete point ledger entries
  const deleted3 = db.prepare('DELETE FROM pointLedger').run();
  console.log(`✓ Deleted ${deleted3.changes} point ledger entries`);
  
  // Delete redemption records
  const deleted4 = db.prepare('DELETE FROM redemptions').run();
  console.log(`✓ Deleted ${deleted4.changes} redemption records`);
  
  console.log('\n✅ All customer data cleared successfully!');
  console.log('Admin accounts preserved.');
  
} catch (error) {
  console.error('❌ Error:', error);
} finally {
  db.close();
}
