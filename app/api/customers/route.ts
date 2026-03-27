import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'stats') {
      // Get statistics
      const totalCustomers = await prisma.customer.count();
      const totalPoints = await prisma.customer.aggregate({
        _sum: { points: true },
      });
      const totalRedeemed = await prisma.redemption.count({
        where: { status: 'completed' },
      });

      return NextResponse.json({
        totalCustomers,
        totalPoints: totalPoints._sum.points || 0,
        totalRedeemed,
      });
    }

    // Get all customers with their data
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        pointLedger: true,
        redemptions: true,
      },
    });

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
      const customer = await prisma.customer.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          rfidCard: data.rfidCard || undefined,
          points: data.points || 0,
          joinDate: new Date().toISOString().split('T')[0],
        },
      });
      return NextResponse.json(customer);
    }

    if (action === 'update') {
      try {
        console.log(`API: Updating customer ${data.id} with points=${data.points}`);

        const customer = await prisma.customer.update({
          where: { id: data.id },
          data: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            rfidCard: data.rfidCard || undefined,
            points: data.points,
            joinDate: data.joinDate,
          },
        });

        console.log(`✅ Customer ${data.id} updated successfully with ${data.points} points`);
        return NextResponse.json(customer);
      } catch (error) {
        console.error(`❌ Failed to update customer ${data.id}:`, error);
        return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
      }
    }

    if (action === 'delete') {
      try {
        const deletedCustomer = await prisma.customer.delete({
          where: { id: data.id },
        });
        return NextResponse.json(deletedCustomer);
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
