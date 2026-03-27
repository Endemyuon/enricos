import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const status = searchParams.get('status');

    let where = {};
    if (customerId) where = { customerId };
    if (status) where = { ...where, status };

    const redemptions = await prisma.redemption.findMany({
      where,
      orderBy: { redeemedAt: 'desc' },
      include: {
        customer: true,
        reward: true,
      },
    });

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
      const customer = await prisma.customer.findUnique({
        where: { id: data.customerId },
      });

      const reward = await prisma.reward.findUnique({
        where: { id: data.rewardId },
      });

      if (!customer || !reward) {
        return NextResponse.json({ error: 'Customer or reward not found' }, { status: 404 });
      }

      if (customer.points < reward.points) {
        return NextResponse.json({ error: 'Insufficient points' }, { status: 400 });
      }

      // Create redemption and deduct points in transaction
      const result = await prisma.$transaction(async (tx) => {
        const redemption = await tx.redemption.create({
          data: {
            customerId: data.customerId,
            customerName: customer.name,
            email: customer.email,
            rewardId: data.rewardId,
            rewardTitle: reward.title,
            pointsRedeemed: reward.points,
            status: 'pending',
            notes: data.notes,
            redeemedAt: new Date().toISOString(),
          },
        });

        // Deduct points from customer
        await tx.customer.update({
          where: { id: data.customerId },
          data: { points: { decrement: reward.points } },
        });

        // Create point ledger entry
        await tx.pointLedger.create({
          data: {
            customerId: data.customerId,
            email: customer.email,
            amount: -reward.points,
            type: 'redemption',
            description: `Redeemed: ${reward.title}`,
            reference: redemption.id,
            balanceBefore: customer.points,
            balanceAfter: customer.points - reward.points,
          },
        });

        return redemption;
      });

      return NextResponse.json(result);
    }

    if (action === 'update') {
      const redemption = await prisma.redemption.update({
        where: { id: data.id },
        data: {
          status: data.status,
          notes: data.notes,
          completedAt: data.status === 'completed' ? new Date().toISOString() : undefined,
        },
      });
      return NextResponse.json(redemption);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Redemption logs API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
