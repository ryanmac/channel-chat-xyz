// app/api/channel/leaderboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const channelId = request.nextUrl.searchParams.get('channelId');

  if (!channelId) {
    return NextResponse.json({ error: 'channelId is required' }, { status: 400 });
  }

  try {
    // Fetch total credits purchased grouped by user
    const topContributors = await prisma.transaction.groupBy({
      by: ['userId'],
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 5,
      where: {
        channelId,
        type: 'CREDIT_PURCHASE' // Only consider CREDIT_PURCHASE type
      }
    });

    // Filter out any null userId values
    const userIds = topContributors.map(c => c.userId).filter(userId => userId !== null);

    const users = await prisma.user.findMany({
      where: { 
        id: { in: userIds }, // Use filtered array
        username: { not: null }
      },
      select: { id: true, username: true, image: true }
    });

    // Calculate the total chats sponsored by each user
    const leaderboard = topContributors
      .map(contributor => {
        const user = users.find(u => u.id === contributor.userId);
        if (user && user.username) {
          return {
            user: {
              username: user.username,
              image: user.image
            },
            totalAmount: contributor._sum.amount || 0,
            totalChatsSponsored: contributor._sum.amount || 0 // Add total chats sponsored
          };
        }
        return null;
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

    const recentActivity = await prisma.transaction.findMany({
      include: { 
        user: {
          select: { username: true, image: true }
        }, 
        channel: {
          select: { name: true, title: true, imageUrl: true }
        } 
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      where: {
        channelId,
        user: {
          username: { not: null }
        }
      }
    });

    return NextResponse.json({ leaderboard, recentActivity });
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}