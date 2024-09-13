// app/api/badges/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('sessionId');
  const userId = request.nextUrl.searchParams.get('userId');
  console.log('badges/session/route.ts GET request:', sessionId, userId);
  console.log('Session ID:', sessionId);
  console.log('User ID:', userId);

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
  }

  try {
    const sessionBadge = await prisma.sessionBadge.findUnique({
      where: { sessionId },
    });

    if (!sessionBadge) {
      console.log('No badges found for this session');
      return NextResponse.json({ badges: '' });
    }

    if (userId) {
      // Transfer badges to user if userId is provided
      const badgeNames = sessionBadge.badges.split(',');
      for (const badgeName of badgeNames) {
        const badge = await prisma.badge.findFirst({
          where: { name: badgeName },
        });

        if (badge) {
          await prisma.userBadge.create({
            data: {
              userId: userId,
              badgeId: badge.id,
            },
          });
        }
      }

      // Delete the SessionBadge after transfer
      await prisma.sessionBadge.delete({
        where: { id: sessionBadge.id },
      });

      return NextResponse.json({ message: 'Badges transferred to user' });
    }

    return NextResponse.json({ badges: sessionBadge.badges });
  } catch (error) {
    console.error('Error fetching session badges:', error);
    return NextResponse.json({ error: 'Failed to fetch session badges' }, { status: 500 });
  }
}