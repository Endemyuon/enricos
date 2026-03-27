import { NextRequest, NextResponse } from 'next/server';
import { getAllCustomers, createCustomer, updateCustomer, updateCustomerByEmail, deleteCustomer, getStatistics } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'stats') {
      const stats = getStatistics();
      return NextResponse.json(stats);
    }

    const customers = getAllCustomers();
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
      const customer = createCustomer({
        id: Date.now().toString(),
        name: data.name,
        email: data.email,
        phone: data.phone,
        rfidCard: data.rfidCard || undefined,
        points: data.points || 0,
        joinDate: new Date().toISOString().split('T')[0],
      });
      return NextResponse.json(customer);
    }

    if (action === 'update') {
      try {
        console.log(`API: Updating customer ${data.id} with points=${data.points}`);
        const customer = updateCustomer(data.id, {
          name: data.name,
          email: data.email,
          phone: data.phone,
          rfidCard: data.rfidCard || undefined,
          points: data.points,
          joinDate: data.joinDate,
        });
        console.log(`API: Customer updated successfully`, customer);
        return NextResponse.json(customer);
      } catch (updateError) {
        console.error(`API: Update failed for customer ${data.id}:`, updateError);
        return NextResponse.json({ 
          error: updateError instanceof Error ? updateError.message : 'Failed to update customer' 
        }, { status: 400 });
      }
    }

    if (action === 'delete') {
      const success = deleteCustomer(data.id);
      if (success) {
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    if (action === 'updateByEmail') {
      const updateData: any = {
        rfidCard: data.rfidCard || undefined,
      };
      
      // Only add points if it was explicitly provided
      if (typeof data.points === 'number') {
        updateData.points = data.points;
      }
      
      const customer = updateCustomerByEmail(data.email, updateData);
      return NextResponse.json(customer);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to process request' 
    }, { status: 500 });
  }
}
