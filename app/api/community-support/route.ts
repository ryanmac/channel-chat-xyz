// app/api/community-support/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const channelsNearActivation = await prisma.channel.findMany({
      where: { status: 'PENDING' },
      orderBy: [
        { activationFunding: 'desc' },
        { updatedAt: 'desc' }
      ],
      take: 20,
      select: {
        id: true,
        name: true,
        title: true,
        imageUrl: true,
        activationFunding: true,
        activationGoal: true,
      },
    });
    // console.log('Channels near activation:', channelsNearActivation);

    return NextResponse.json(channelsNearActivation);
  } catch (error) {
    console.error('Error fetching channels near activation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}