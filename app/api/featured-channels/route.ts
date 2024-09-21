// app/api/featured-channels/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch 10 active channels from the database
    const channels = await prisma.channel.findMany({
      where: {
        status: 'ACTIVE',
        featured: true,
      }, // Use the correct field for filtering
      // take: 100, // Fetch 10 records
      select: {
        id: true,
        name: true,
        title: true,
        imageUrl: true,
        subscriberCount: true,
        chatsCreated: true,
        creditBalance: true,
        featured: true,
      },
    });

    // Randomly shuffle the fetched channels and take the first 3
    const shuffledChannels = channels.sort(() => 0.5 - Math.random()).slice(0, 3);

    const formattedChannels = shuffledChannels.map((channel) => ({
      id: channel.id,
      name: channel.name,
      title: channel.title,
      avatarUrl: channel.imageUrl,
      subscribers: channel.subscriberCount?.toString() || '0',
      chats: channel.chatsCreated,
      tokensUsed: channel.chatsCreated,
      tokensRemaining: channel.creditBalance,
    }));

    return NextResponse.json(formattedChannels);
  } catch (error) {
    console.error('Error fetching featured channels:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}