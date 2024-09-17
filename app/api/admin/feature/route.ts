// app/api/admin/feature/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { channelName } = await request.json();

  if (!channelName) {
    return NextResponse.json({ error: 'Missing required parameter: channelName' }, { status: 400 });
  }

  try {
    // Find the channel by name
    let channel = await prisma.channel.findFirst({
      where: { name: channelName },
    });

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    // Toggle the featured status
    const updatedChannel = await prisma.channel.update({
      where: { id: channel.id },
      data: {
        featured: !channel.featured,
      },
    });

    return NextResponse.json({
      message: 'Channel featured status toggled successfully',
      channel: updatedChannel,
    });

  } catch (error) {
    console.error('Error toggling channel featured status:', error);
    return NextResponse.json({ error: 'Failed to toggle channel featured status' }, { status: 500 });
  }
}