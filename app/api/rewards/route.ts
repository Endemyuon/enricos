import { NextRequest, NextResponse } from 'next/server';
import {
  getAllRewards,
  createReward,
  updateReward,
  deleteReward,
} from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const rewards = getAllRewards();
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
      const reward = createReward({
        id: Date.now().toString(),
        title: data.title,
        expiry: data.expiry,
        imgUrl: data.imgUrl,
        points: data.points || 0,
      });
      return NextResponse.json(reward);
    }

    if (action === 'update') {
      const reward = updateReward(data.id, {
        title: data.title,
        expiry: data.expiry,
        imgUrl: data.imgUrl,
        points: data.points,
      });
      return NextResponse.json(reward);
    }

    if (action === 'delete') {
      const success = deleteReward(data.id);
      if (success) {
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: 'Reward not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error processing reward request:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
