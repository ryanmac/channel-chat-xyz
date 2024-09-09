// app/api/admin/boost/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { updateChannelCredits, getTotalChannelFunding } from '@/utils/creditManagement';
import { processChannelAsync } from '@/utils/yesService';

/**
 * Usage:
  curl -X POST http://localhost:3000/api/admin/boost \
    -H "Content-Type: application/json" \
    -d '{
      "channelId": "UC1l7wYrva1qCH-wgqcHaaRg",
      "channelName": "davidguetta",
      "amountInDollars": 1
    }'
 *
 */

export async function POST(request: NextRequest) {
  try {
    const { channelId, channelName, amountInDollars } = await request.json();

    if (!channelId || !channelName || !amountInDollars) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Check if the channel exists, if not create it
    let channel = await prisma.channel.findUnique({ where: { id: channelId } });
    if (!channel) {
      console.log(`Channel ${channelId} not found. Creating new channel record.`);
      channel = await prisma.channel.create({
        data: {
          id: channelId,
          name: channelName,
          isActive: false,
        },
      });
    }

    // Update channel credits
    await updateChannelCredits(channelId, amountInDollars);
    console.log(`Credits updated for channel ${channelId}: ${amountInDollars}`);

    // Check if the channel has reached the funding goal
    const totalFunding = await getTotalChannelFunding(channelId);
    const fundingGoal = 10; // Set this to your desired funding goal

    console.log(`Channel ${channelName} (${channelId}) has received $${totalFunding} in funding`);

    if (totalFunding >= fundingGoal) {
      // Start processing asynchronously
      processChannelAsync(channelId, channelName, totalFunding).catch((error) => {
        console.error('Error in async channel processing:', error);
      });

      // Update channel status to processing
      await prisma.channel.update({
        where: { id: channelId },
        data: { isActive: false },
      });
      console.log(`Channel ${channelName} (${channelId}) set to processing`);
    } else {
      console.log(`Channel ${channelName} (${channelId}) not yet fully funded. Current: $${totalFunding}, Goal: $${fundingGoal}`);
    }

    // Fetch the updated channel data
    const updatedChannel = await prisma.channel.findUnique({
      where: { id: channelId },
      include: { credits: true },
    });

    return NextResponse.json({
      message: 'Channel updated successfully',
      channel: updatedChannel,
      totalFunding,
      isFunded: totalFunding >= fundingGoal,
    });

  } catch (error) {
    console.error('Error processing channel activation:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }
    return NextResponse.json({ error: 'Channel activation failed' }, { status: 500 });
  }
}