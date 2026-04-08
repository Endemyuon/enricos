import { NextRequest, NextResponse } from 'next/server';
import { getAccountsDatabase, getRedemptioneLogsDatabase } from '@/lib/db';

const accountsDb = getAccountsDatabase();
const logsDb = getRedemptioneLogsDatabase();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const email = searchParams.get('email');

    let query = 'SELECT * FROM pointLedger';
    const params = [];

    if (customerId || email) {
      const conditions = [];
      if (customerId) {
        conditions.push('customerId = ?');
        params.push(customerId);
      }
      if (email) {
        conditions.push('email = ?');
        params.push(email);
      }
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY createdAt DESC';

    const ledger = logsDb.prepare(query).all(...params);

    return NextResponse.json(ledger);
  } catch (error) {
    console.error('Error fetching point ledger:', error);
    return NextResponse.json({ error: 'Failed to fetch point ledger' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === 'add') {
      // Get current customer points
      const customer = accountsDb.prepare('SELECT * FROM customers WHERE id = ?').get(data.customerId) as any;

      if (!customer) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      }

      const balanceBefore = customer.points;
      const balanceAfter = balanceBefore + data.amount;

      // Create ledger entry and update customer points in transaction
      const transaction = logsDb.transaction(() => {
        const ledgerId = Math.random().toString(36).substr(2, 9);
        const now = new Date().toISOString();

        logsDb.prepare(`
          INSERT INTO pointLedger (id, customerId, email, amount, type, description, reference, balanceBefore, balanceAfter, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(ledgerId, data.customerId, data.email, data.amount, data.type, data.description || null, data.reference || null, balanceBefore, balanceAfter, now);

        accountsDb.prepare(`
          UPDATE customers SET points = ?, updatedAt = ? WHERE id = ?
        `).run(balanceAfter, now, data.customerId);

        return logsDb.prepare('SELECT * FROM pointLedger WHERE id = ?').get(ledgerId);
      });

      const result = transaction();
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Point ledger API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
