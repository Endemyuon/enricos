import { NextRequest, NextResponse } from 'next/server';
import {
  createRedemptionLog,
  getRedemptionLogsByCustomerId,
  getAllRedemptionLogs,
  updateRedemptionLog,
} from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const status = searchParams.get('status');

    let logs;

    if (customerId) {
      logs = getRedemptionLogsByCustomerId(customerId);
    } else {
      logs = getAllRedemptionLogs();
    }

    // Filter by status if provided
    if (status) {
      logs = logs.filter(log => log.status === status);
    }

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching redemption logs:', error);
    return NextResponse.json({ error: 'Failed to fetch redemption logs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === 'create') {
      try {
        console.log(`API: Creating redemption for customer ${data.customerId}, reward ${data.rewardId}`);
        const log = createRedemptionLog({
          id: data.id || Date.now().toString(),
          customerId: data.customerId,
          customerName: data.customerName,
          email: data.email,
          rewardId: data.rewardId,
          rewardTitle: data.rewardTitle,
          pointsRedeemed: data.pointsRedeemed,
          status: data.status || 'pending',
          notes: data.notes,
          redeemedAt: data.redeemedAt || new Date().toISOString(),
        });
        console.log(`API: Redemption created successfully`, log);
        return NextResponse.json(log);
      } catch (createError) {
        console.error(`API: Create redemption failed:`, createError);
        return NextResponse.json({ 
          error: createError instanceof Error ? createError.message : 'Failed to create redemption' 
        }, { status: 400 });
      }
    }

    if (action === 'update') {
      try {
        console.log(`API: Updating redemption ${data.id}`);
        const log = updateRedemptionLog(data.id, {
          status: data.status,
          notes: data.notes,
          completedAt: data.completedAt,
        });
        console.log(`API: Redemption updated successfully`, log);
        return NextResponse.json(log);
      } catch (updateError) {
        console.error(`API: Update redemption failed:`, updateError);
        return NextResponse.json({ 
          error: updateError instanceof Error ? updateError.message : 'Failed to update redemption' 
        }, { status: 400 });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error processing redemption log request:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to process request' 
    }, { status: 500 });
  }
}
