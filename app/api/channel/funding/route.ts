// app/api/channel/funding/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getTotalChannelFunding } from '@/utils/transactionManagement';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const channelId = searchParams.get('channelId');

  if (!channelId) {
    return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 });
  }

  try {
    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      select: { activationFunding: true, activationGoal: true },
    });

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    const { activation: currentActivationFunding } = await getTotalChannelFunding(channelId);

    return NextResponse.json({
      currentFunding: currentActivationFunding,
      goalFunding: channel.activationGoal,
    });
  } catch (error) {
    console.error('Error fetching channel funding:', error);
    return NextResponse.json({ error: 'Failed to fetch channel funding' }, { status: 500 });
  }
}