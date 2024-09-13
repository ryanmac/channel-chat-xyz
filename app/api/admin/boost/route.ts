// app/api/admin/boost/route.ts
/**
 * This is an API route that allows an admin to add activation funding or credits to a channel
 * The route is exclusive to admins.
 */
import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { createTransaction, getTotalChannelFunding } from '@/utils/transactionManagement';
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

    let channel = await prisma.channel.findUnique({ where: { id: channelId } });
    if (!channel) {
      channel = await prisma.channel.create({
        data: {
          id: channelId,
          name: channelName,
          title: channelName,
          subscriberCount: 0,
          videoCount: 0,
        },
      });
    }

    const { activation: currentActivationFunding } = await getTotalChannelFunding(channelId);
    const remainingToActivate = Math.max(channel.activationGoal - currentActivationFunding, 0);
    
    const activationAmount = Math.min(amountInDollars, remainingToActivate);
    const creditAmount = amountInDollars - activationAmount;

    if (activationAmount > 0) {
      await createTransaction(channelId, null, 'ADMIN_BOOST', activationAmount, 'ACTIVATION');
    }

    if (creditAmount > 0) {
      await createTransaction(channelId, null, 'ADMIN_BOOST', creditAmount, 'CREDIT_PURCHASE');
    }

    const { activation: totalActivationFunding } = await getTotalChannelFunding(channelId);

    if (totalActivationFunding >= channel.activationGoal) {
      processChannelAsync(channelId, channelName, totalActivationFunding).catch((error) => {
        console.error('Error in async channel processing:', error);
      });

      await prisma.channel.update({
        where: { id: channelId },
        data: { status: 'ACTIVE' },
      });
    }

    const updatedChannel = await prisma.channel.findUnique({
      where: { id: channelId },
    });

    return NextResponse.json({
      message: 'Channel updated successfully',
      channel: updatedChannel,
      totalActivationFunding,
      isFunded: totalActivationFunding >= channel.activationGoal,
    });

  } catch (error) {
    console.error('Error processing channel activation:', error);
    return NextResponse.json({ error: 'Channel activation failed' }, { status: 500 });
  }
}