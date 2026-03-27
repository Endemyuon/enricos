import { NextRequest, NextResponse } from 'next/server';
import {
  addPointLedgerEntry,
  getPointLedgerByCustomerId,
  getAllPointLedger,
  getPointLedgerEntryById,
} from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (customerId) {
      const entries = getPointLedgerByCustomerId(customerId);
      return NextResponse.json(entries);
    }

    const allEntries = getAllPointLedger();
    return NextResponse.json(allEntries);
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
      const entry = addPointLedgerEntry({
        id: data.id || Date.now().toString(),
        customerId: data.customerId,
        email: data.email,
        amount: data.amount,
        type: data.type, // 'earned', 'redeemed', 'adjusted'
        description: data.description,
        reference: data.reference,
        balanceBefore: data.balanceBefore,
        balanceAfter: data.balanceAfter,
      });
      return NextResponse.json(entry);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error processing point ledger request:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
