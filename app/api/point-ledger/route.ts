import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const email = searchParams.get('email');

    let where = {};
    if (customerId) where = { customerId };
    if (email) where = { email };

    const ledger = await prisma.pointLedger.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { customer: true },
    });

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
      const customer = await prisma.customer.findUnique({
        where: { id: data.customerId },
      });

      if (!customer) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      }

      const balanceBefore = customer.points;
      const balanceAfter = balanceBefore + data.amount;

      // Create ledger entry and update customer points in transaction
      const result = await prisma.$transaction(async (tx) => {
        const ledgerEntry = await tx.pointLedger.create({
          data: {
            customerId: data.customerId,
            email: data.email,
            amount: data.amount,
            type: data.type,
            description: data.description,
            reference: data.reference,
            balanceBefore,
            balanceAfter,
          },
        });

        await tx.customer.update({
          where: { id: data.customerId },
          data: { points: balanceAfter },
        });

        return ledgerEntry;
      });

      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Point ledger API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
