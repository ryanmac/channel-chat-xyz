// app/api/featured-channels/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Adjust the filter condition to match your schema, for example, using `status`
    const featuredChannels = await prisma.channel.findMany({
      where: { status: 'ACTIVE' }, // Use the correct field for filtering
      take: 3,
      select: {
        id: true,
        name: true,
        title: true,
        imageUrl: true,
        subscriberCount: true,
        chatsCreated: true, // Total number of chats created
        creditBalance: true, // Current credit balance
      },
    });

    const formattedChannels = featuredChannels.map(channel => ({
      id: channel.id,
      name: channel.name,
      title: channel.title,
      avatarUrl: channel.imageUrl,
      subscribers: channel.subscriberCount?.toString() || '0',
      chats: channel.chatsCreated, // Directly use the chatsCreated field
      tokensUsed: channel.chatsCreated, // Tokens used is equivalent to chatsCreated
      tokensRemaining: channel.creditBalance, // Remaining tokens map to creditBalance
    }));

    return NextResponse.json(formattedChannels);
  } catch (error) {
    console.error('Error fetching featured channels:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}