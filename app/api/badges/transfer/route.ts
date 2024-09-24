// app/api/badges/transfer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import UserController from "@/controllers/UserController";
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const { sessionId, userId } = await request.json();
  const userController = new UserController();
  console.log(`Attempting to transfer badges for session ${sessionId} to user ${userId}`);

  if (!sessionId || !userId) {
    return NextResponse.json({ error: 'Session ID and User ID are required' }, { status: 400 });
  }

  try {
    // Find the session badge
    const sessionBadge = await prisma.sessionBadge.findUnique({
      where: { sessionId },
    });

    if (!sessionBadge) {
      console.log(`No SessionBadge found for session: ${sessionId}`);
      return NextResponse.json({ message: 'No badges found for this session' });
    }

    // Extract and log the badge names
    const badgeNames = sessionBadge.badges.split(',');
    console.log(`Found badges to transfer: ${badgeNames.join(', ')}`);

    // Assign badges and transactions to the user with session details
    const transactions = await userController.assignTransactionsToUser(userId, sessionId);
    // console.log(`Transactions assigned to user ${userId}:`, transactions);
    await userController.assignBadgesToUser(userId, badgeNames, sessionId);

    // Delete the SessionBadge after transfer
    try {
      const sessionBadgeUpdated = await prisma.sessionBadge.findUnique({
        where: { sessionId },
      });
      if (sessionBadgeUpdated) {
        await prisma.sessionBadge.delete({
          where: { id: sessionBadge.id },
        });
        console.log(`Deleted SessionBadge for session ${sessionId}`);
      }
    } catch (deleteError) {
      console.error(`transfer/route: Failed to delete SessionBadge for session ${sessionId}:`, deleteError);
    }

    console.log(`Successfully transferred all badges for session ${sessionId}`);
    return NextResponse.json({ message: 'Badges transferred successfully' });
  } catch (error) {
    console.error('Error transferring badges:', error);
    // return NextResponse.json({ error: 'Failed to transfer badges', details: error }, { status: 500 });
  }
}