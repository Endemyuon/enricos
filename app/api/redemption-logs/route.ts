import { NextRequest, NextResponse } from 'next/server';
import { getAccountsDatabase, getRewardsDatabase, getRedemptioneLogsDatabase } from '@/lib/db';

const accountsDb = getAccountsDatabase();
const rewardsDb = getRewardsDatabase();
const logsDb = getRedemptioneLogsDatabase();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const status = searchParams.get('status');

    let query = 'SELECT * FROM redemptions';
    const params = [];

    if (customerId || status) {
      const conditions = [];
      if (customerId) {
        conditions.push('customerId = ?');
        params.push(customerId);
      }
      if (status) {
        conditions.push('status = ?');
        params.push(status);
      }
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY redeemedAt DESC';

    const redemptions = logsDb.prepare(query).all(...params);

    return NextResponse.json(redemptions);
  } catch (error) {
    console.error('Error fetching redemptions:', error);
    return NextResponse.json({ error: 'Failed to fetch redemptions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === 'create') {
      // Verify customer has enough points
      const customer = accountsDb.prepare('SELECT * FROM customers WHERE id = ?').get(data.customerId) as any;
      const reward = rewardsDb.prepare('SELECT * FROM rewards WHERE id = ?').get(data.rewardId) as any;

      if (!customer || !reward) {
        return NextResponse.json({ error: 'Customer or reward not found' }, { status: 404 });
      }

      if (customer.points < reward.points) {
        return NextResponse.json({ error: 'Insufficient points' }, { status: 400 });
      }

      // Create redemption and deduct points in transaction
      const transaction = logsDb.transaction(() => {
        const redemptionId = Math.random().toString(36).substr(2, 9);
        const now = new Date().toISOString();

        // Create redemption
        logsDb.prepare(`
          INSERT INTO redemptions (id, customerId, customerName, email, rewardId, rewardTitle, pointsRedeemed, status, notes, redeemedAt, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(redemptionId, data.customerId, customer.name, customer.email, data.rewardId, reward.title, reward.points, 'pending', data.notes || null, now, now, now);

        // Deduct points from customer
        const newPoints = customer.points - reward.points;
        accountsDb.prepare(`
          UPDATE customers SET points = ?, updatedAt = ? WHERE id = ?
        `).run(newPoints, now, data.customerId);

        // Create point ledger entry
        const ledgerId = Math.random().toString(36).substr(2, 9);
        logsDb.prepare(`
          INSERT INTO pointLedger (id, customerId, email, amount, type, description, reference, balanceBefore, balanceAfter, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(ledgerId, data.customerId, customer.email, -reward.points, 'redemption', `Redeemed: ${reward.title}`, redemptionId, customer.points, newPoints, now);

        return logsDb.prepare('SELECT * FROM redemptions WHERE id = ?').get(redemptionId);
      });

      const result = transaction();
      return NextResponse.json(result);
    }

    if (action === 'update') {
      const now = new Date().toISOString();
      const completedAt = data.status === 'completed' ? now : null;

      logsDb.prepare(`
        UPDATE redemptions SET status = ?, notes = ?, completedAt = ?, updatedAt = ? WHERE id = ?
      `).run(data.status, data.notes || null, completedAt, now, data.id);

      const redemption = logsDb.prepare('SELECT * FROM redemptions WHERE id = ?').get(data.id);
      return NextResponse.json(redemption);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Redemption logs API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
