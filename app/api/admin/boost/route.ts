// app/api/admin/boost/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { createTransaction, getTotalChannelFunding } from '@/utils/transactionManagement';
import { processChannelAsync } from '@/utils/yesService';
import config from "@/config";

export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { channelName, amount, type } = await request.json();

  if (!channelName || !type || (!amount && type !== 'PROCESS')) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    let channel = await prisma.channel.findFirst({
      where: { name: channelName },
    });

    if (!channel) {
      // Try to create the channel
      const response = await fetch(`${config.nextAuth.url}/api/yes/channel-info?channel_url=https://www.youtube.com/channel/@${channelName}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch channel data: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      const { channelInfo } = data;

      if (!channelInfo) {
        return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
      }

      // Refetch from Prisma to get the ID
      const newChannel = await prisma.channel.findFirst({
        where: { name: channelName },
      });

      if (!newChannel) {
        throw new Error('Failed to create channel');
      }

      channel = newChannel;
    }

    let activationAmount = 0;
    let creditAmount = 0;
    let creditsToAdd = 0;
    let wasActivated = false;
    const amountInDollars = parseFloat(amount);

    if (amountInDollars > 0) {
      const { activation: currentActivationFunding } = await getTotalChannelFunding(channel.id);
      const remainingToActivate = Math.max(channel.activationGoal - currentActivationFunding, 0);

      if (type === 'ACTIVATION') {
        activationAmount = Math.min(amountInDollars, remainingToActivate);
        creditAmount = amountInDollars - activationAmount;
      } else if (type === 'CREDIT_PURCHASE') {
        creditAmount = amountInDollars;
      }

      // Handle activation
      if (activationAmount > 0) {
        await createTransaction(channel.id, session.user.id, 'admin-boost', activationAmount, 'ACTIVATION');

        // Check if this transaction activates the channel
        if (currentActivationFunding + activationAmount >= channel.activationGoal) {
          creditsToAdd += 1000; // Initial 1000 credits for activation
          await createTransaction(channel.id, session.user.id, 'admin-boost', 1000, 'CREDIT_PURCHASE');
          wasActivated = true;
        }
      }

      // Handle credit purchase
      if (creditAmount > 0) {
        await createTransaction(channel.id, session.user.id, 'admin-boost', creditAmount * 1000, 'CREDIT_PURCHASE');
        creditsToAdd += creditAmount * 1000; // 1000 credits per $1
      }

      // Update Channel model
      const updatedChannelData: any = {};

      // Don't double count
      // if (activationAmount > 0) {
      //   updatedChannelData.activationFunding = { increment: activationAmount };
      // }

      if (creditsToAdd > 0) {
        updatedChannelData.creditBalance = { increment: creditsToAdd };
      }

      if (wasActivated) {
        updatedChannelData.status = 'ACTIVE';
        updatedChannelData.isProcessing = true;
      }

      if (Object.keys(updatedChannelData).length > 0) {
        channel = await prisma.channel.update({
          where: { id: channel.id },
          data: updatedChannelData,
        });
      }
    }

    // Trigger processing if necessary
    if ((amountInDollars > 0 && wasActivated) || (amountInDollars === 0 && type === 'PROCESS')) {
      const totalFundingInDollars = await getTotalChannelFunding(channel.id);
      processChannelAsync(channel.id, channel.name, totalFundingInDollars.total).catch((error) => {
        console.error('Error in async channel processing:', error);
      });
    }

    return NextResponse.json({
      message: 'Channel boosted successfully',
      channel: channel,
      activationFunding: channel.activationFunding,
      creditsPurchased: creditsToAdd,
      isActive: channel.status === 'ACTIVE',
    });

  } catch (error) {
    console.error('Error boosting channel:', error);
    return NextResponse.json({ error: 'Failed to boost channel' }, { status: 500 });
  }
}