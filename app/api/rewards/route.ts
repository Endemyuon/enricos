import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const rewards = await prisma.reward.findMany({
      orderBy: { createdAt: 'desc' },
    });
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
      const reward = await prisma.reward.create({
        data: {
          title: data.title,
          description: data.description,
          expiry: data.expiry,
          imgUrl: data.imgUrl,
          points: data.points || 0,
          quantity: data.quantity || 0,
          category: data.category,
        },
      });
      return NextResponse.json(reward);
    }

    if (action === 'update') {
      const reward = await prisma.reward.update({
        where: { id: data.id },
        data: {
          title: data.title,
          description: data.description,
          expiry: data.expiry,
          imgUrl: data.imgUrl,
          points: data.points,
          quantity: data.quantity,
          category: data.category,
        },
      });
      return NextResponse.json(reward);
    }

    if (action === 'delete') {
      try {
        await prisma.reward.delete({
          where: { id: data.id },
        });
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
