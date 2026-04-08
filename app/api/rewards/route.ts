import { NextRequest, NextResponse } from 'next/server';
import { getRewardsDatabase } from '@/lib/db';

const db = getRewardsDatabase();

export async function GET(request: NextRequest) {
  try {
    const rewards = db.prepare('SELECT * FROM rewards ORDER BY createdAt DESC').all();
    return NextResponse.json(rewards);
  } catch (error) {
    console.error('Error fetching rewards:', error);
    return NextResponse.json({ error: 'Failed to fetch rewards' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === 'create') {
      const id = Math.random().toString(36).substr(2, 9);
      const now = new Date().toISOString();

      db.prepare(`
        INSERT INTO rewards (id, title, description, expiry, imgUrl, points, quantity, category, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, data.title, data.description || null, data.expiry || null, data.imgUrl || null, data.points || 0, data.quantity || 0, data.category || null, now, now);

      const reward = db.prepare('SELECT * FROM rewards WHERE id = ?').get(id);
      return NextResponse.json(reward);
    }

    if (action === 'update') {
      const now = new Date().toISOString();
      db.prepare(`
        UPDATE rewards
        SET title = ?, description = ?, expiry = ?, imgUrl = ?, points = ?, quantity = ?, category = ?, updatedAt = ?
        WHERE id = ?
      `).run(data.title, data.description || null, data.expiry || null, data.imgUrl || null, data.points, data.quantity, data.category || null, now, data.id);

      const reward = db.prepare('SELECT * FROM rewards WHERE id = ?').get(data.id);
      return NextResponse.json(reward);
    }

    if (action === 'delete') {
      try {
        db.prepare('DELETE FROM rewards WHERE id = ?').run(data.id);
        return NextResponse.json({ success: true });
      } catch (error) {
        return NextResponse.json({ error: 'Reward not found' }, { status: 404 });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Rewards API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
