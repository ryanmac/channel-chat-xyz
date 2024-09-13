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
    const sessionBadge = await prisma.sessionBadge.findUnique({
      where: { sessionId },
    });

    if (!sessionBadge) {
      console.log(`No SessionBadge found for session: ${sessionId}`);
      return NextResponse.json({ message: 'No badges found for this session' });
    }

    const badgeNames = sessionBadge.badges.split(',');
    console.log(`Found badges to transfer: ${badgeNames.join(', ')}`);

    await userController.assignBadgesToUser(userId, badgeNames);
    await userController.assignTransactionsToUser(userId, sessionId);

    // Delete the SessionBadge after transfer
    if (sessionBadge) {
      await prisma.sessionBadge.delete({
        where: { id: sessionBadge.id },
      });
    }

    console.log(`Successfully transferred all badges for session ${sessionId}`);
    return NextResponse.json({ message: 'Badges transferred successfully' });
  } catch (error) {
    console.error('Error transferring badges:', error);
    return NextResponse.json({ error: 'Failed to transfer badges', details: error }, { status: 500 });
  }
}