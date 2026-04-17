import { NextRequest, NextResponse } from 'next/server';
import { getAccountsDatabase } from '@/lib/db';

const db = getAccountsDatabase();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'stats') {
      // Get statistics
      const totalCustomersResult = db.prepare('SELECT COUNT(*) as count FROM customers').get() as { count: number };
      const totalPointsResult = db.prepare('SELECT SUM(points) as total FROM customers').get() as { total: number | null };

      return NextResponse.json({
        totalCustomers: totalCustomersResult.count,
        totalPoints: totalPointsResult.total || 0,
        totalRedeemed: 0,
      });
    }

    // Get all customers
    const customers = db.prepare('SELECT * FROM customers ORDER BY createdAt DESC').all();

    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === 'create') {
      const id = Math.random().toString(36).substr(2, 9);
      const now = new Date().toISOString();
      const joinDate = data.joinDate || new Date().toISOString().split('T')[0];
      const initialPoints = data.points !== undefined ? data.points : 1; // Default to 1 point

      db.prepare(`
        INSERT INTO customers (id, name, email, phone, rfidCard, points, joinDate, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, data.name, data.email, data.phone || null, data.rfidCard || null, initialPoints, joinDate, now, now);

      const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
      return NextResponse.json(customer);
    }

    if (action === 'update') {
      try {
        console.log(`API: Updating customer ${data.id} with points=${data.points}`);

        const now = new Date().toISOString();
        db.prepare(`
          UPDATE customers
          SET name = ?, email = ?, phone = ?, rfidCard = ?, points = ?, joinDate = ?, updatedAt = ?
          WHERE id = ?
        `).run(data.name, data.email, data.phone || null, data.rfidCard || null, data.points, data.joinDate, now, data.id);

        const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(data.id);
        console.log(`✅ Customer ${data.id} updated successfully with ${data.points} points`);
        return NextResponse.json(customer);
      } catch (error) {
        console.error(`❌ Failed to update customer ${data.id}:`, error);
        return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
      }
    }

    if (action === 'delete') {
      try {
        const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(data.id);
        db.prepare('DELETE FROM customers WHERE id = ?').run(data.id);
        return NextResponse.json(customer);
      } catch (error) {
        console.error(`Failed to delete customer ${data.id}:`, error);
        return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Customers API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
