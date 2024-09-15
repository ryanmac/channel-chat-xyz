// app/api/transactions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
  }

  try {
    const transactions = await prisma.transaction.findMany({
      where: { sessionId },
    });

    if (transactions.length === 0) {
      return NextResponse.json({ error: 'No transactions found for this session ID' }, { status: 404 });
    }

    const activationAmount = transactions
      .filter(t => t.type === 'ACTIVATION')
      .reduce((sum, t) => sum + t.amount, 0);

    const creditPurchaseAmount = transactions
      .filter(t => t.type === 'CREDIT_PURCHASE')
      .reduce((sum, t) => sum + t.amount, 0);

    const channelId = transactions[0].channelId;

    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      select: { activationFunding: true, activationGoal: true },
    });

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    // Updated logic to ensure accurate calculation
    const remainingToActivate = Math.max(channel.activationGoal - (channel.activationFunding + activationAmount), 0);
    const totalAmountInDollars = activationAmount + (creditPurchaseAmount / 1000);

    return NextResponse.json({
      activationAmount,
      creditPurchaseAmount,
      totalAmountInDollars,
      remainingToActivate,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transaction data' }, { status: 500 });
  }
}