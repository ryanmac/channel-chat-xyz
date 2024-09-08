// app/api/credit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const channelId = searchParams.get('channelId');

  if (!channelId) {
    return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 });
  }

  try {
    const channelCredit = await prisma.channelCredit.findUnique({
      where: { channelId },
    });

    const creditsPerDollar = await prisma.configurationSetting.findUnique({
      where: { key: 'CREDITS_PER_DOLLAR' },
    });

    const credits = channelCredit ? channelCredit.balance : 0;
    const creditsPerDollarValue = creditsPerDollar ? parseInt(creditsPerDollar.value) : 100;
    const fuelPercentage = Math.min((credits / (100 * creditsPerDollarValue)) * 100, 100);

    return NextResponse.json({ credits, fuelPercentage });
  } catch (error) {
    console.error('Error fetching credit info:', error);
    return NextResponse.json({ error: 'Failed to fetch credit info' }, { status: 500 });
  }
}