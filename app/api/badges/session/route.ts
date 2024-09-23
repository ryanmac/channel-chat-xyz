// app/api/badges/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('sessionId');
  const userId = request.nextUrl.searchParams.get('userId');
  const channelId = request.nextUrl.searchParams.get('channelId') || '';

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
  }

  try {
    let sessionBadges: string[] = [];
    let userBadges: string[] = [];

    // Fetch badges from SessionBadge if sessionId is provided
    const sessionBadge = await prisma.sessionBadge.findUnique({
      where: { sessionId },
    });

    if (sessionBadge) {
      sessionBadges = sessionBadge.badges ? sessionBadge.badges.split(',') : [];
    }

    // Fetch badges from UserBadge for the authenticated user and the specified channel
    if (userId && channelId) {
      const userBadgeRecords = await prisma.userBadge.findMany({
        where: {
          userId,
          channelId,
        },
        include: {
          badge: true,
        },
      });

      userBadges = userBadgeRecords.map((ub) => ub.badge.name);
    }

    // Combine and deduplicate badges from both SessionBadge and UserBadge
    const allBadgesSet = new Set([...sessionBadges, ...userBadges]);
    const allBadges = Array.from(allBadgesSet);

    // If the user is authenticated, transfer SessionBadges to UserBadges
    if (userId && sessionBadge && sessionBadges.length > 0) {
      const transaction = await prisma.transaction.findFirst({
        where: { sessionId },
      });

      if (!transaction) {
        console.error('Transaction not found for session:', sessionId);
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
      }

      let badgesAdded = 0;
      try {
        // Start a transaction for the badge transfer and deletion process
        await prisma.$transaction(async (prisma) => {
          for (const badgeName of sessionBadges) {
            const badge = await prisma.badge.findFirst({
              where: { name: badgeName },
            });

            if (badge) {
              await prisma.userBadge.create({
                data: {
                  userId: userId,
                  badgeId: badge.id,
                  transactionId: transaction.id,
                  channelId: channelId,
                },
              });
              console.log(`Successfully assigned badge ${badgeName} to user ${userId}`);
              badgesAdded++;
            } else {
              console.error(`Badge not found: ${badgeName}`);
            }
          }

          // Delete the session badge after transferring
          if (badgesAdded > 0) {
            await prisma.sessionBadge.delete({
              where: { id: sessionBadge.id },
            });
            console.log(`Deleted SessionBadge for session ${sessionId}`);
          }
        });
      } catch (error) {
        console.error('Error transferring session badges to user:', error);
        // return NextResponse.json({ error: 'Failed to transfer session badges', details: error }, { status: 500 });
      }
    }

    // Return the combined badges
    return NextResponse.json({ badges: allBadges });
  } catch (error) {
    console.error('Error fetching session badges:', error);
    return NextResponse.json({ error: 'Failed to fetch session badges' }, { status: 500 });
  }
}