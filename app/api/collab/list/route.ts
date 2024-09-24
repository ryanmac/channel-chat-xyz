// api/collab/list/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const debates = await prisma.debate.findMany({
      where: { status: 'CONCLUDED' },
      orderBy: { createdAt: 'desc' },
      include: {
        channel1: { select: { id: true, name: true, title: true, imageUrl: true } },
        channel2: { select: { id: true, name: true, title: true, imageUrl: true } },
      },
    });

    const formattedDebates = debates.map((debate) => ({
      id: debate.id,
      channel1: debate.channel1,
      channel2: debate.channel2,
      topicTitle: debate.topicTitle || 'Unknown Topic',
      topicDescription: debate.topicDescription || 'No description available.',
    }));

    return NextResponse.json(formattedDebates);
  } catch (error) {
    console.error('Error fetching debates:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}