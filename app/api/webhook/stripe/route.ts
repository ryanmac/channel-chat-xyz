// app/api/webhook/stripe/route.ts
import { headers } from "next/headers";
import { NextRequest, NextResponse } from 'next/server';
import Stripe from "stripe";
import { getChannelFundingImpact, createTransaction } from '@/utils/transactionManagement';
import { processChannelAsync } from '@/utils/yesService';
import prisma from "@/lib/prisma";
import configEnv from "@/config";
import { determineBadges } from '@/utils/badgeManagement';
import config from "@/config";

const stripe = new Stripe(config.stripe.secret!, {
  apiVersion: config.stripe.apiVersion,
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get("Stripe-Signature") ?? "";

  let event: Stripe.Event;

  // Step 1: Verify the Stripe Signature
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      configEnv.stripe.webhook || ""
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 401 }
    );
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // Step 2: Process the Stripe Event
  try {
    if (event.type === "checkout.session.completed") {
      const { channelId, channelName, amount, userId } = session.metadata || {};

      // Step 3: Validate Metadata
      if (!channelId || !channelName || isNaN(Number(amount))) {
        console.error('Invalid metadata in the session:', session.metadata);
        return NextResponse.json(
          { error: 'Invalid metadata in the session' },
          { status: 402 }
        );
      }

      // Step 4: Check if Session is Already Processed
      const existingTransaction = await prisma.transaction.findFirst({
        where: { sessionId: session.id },
      });

      if (existingTransaction) {
        console.log(`Session ${session.id} already processed, skipping.`);
        return NextResponse.json({ received: true });
      }

      const amountInDollars = Number(amount);

      // Step 5: Verify Channel Exists
      const channel = await prisma.channel.findUnique({ where: { id: channelId } });
      if (!channel) {
        console.log(`Channel not found: ${channelId}`);
        return NextResponse.json(
          { error: `Channel not found: ${channelId}` },
          { status: 403 }
        );
      }

      // Step 6: Calculate Funding Impact
      const impact = await getChannelFundingImpact(channel, amountInDollars);
      const { before, contribution, after } = impact;
      console.log(`Impact for channel ${channelId}:`, impact);

      let wasActivated = false;

      // Step 7: Handle Activation Transaction
      if (contribution.activation > 0) {
        await createTransaction(channelId, userId || null, session.id, contribution.activation, 'ACTIVATION');

        // Check if this transaction activates the channel
        if (before.activation < channel.activationGoal && after.activation >= channel.activationGoal) {
          console.log(`Channel ${channelName} (${channelId}) activated!`);
          await createTransaction(channelId, userId || null, session.id, 1000, 'CREDIT_PURCHASE'); // Initial 1000 credits for activation
          wasActivated = true;
        }
      }

      // Step 8: Handle Credit Purchase Transaction
      if (contribution.credits > 0) {
        await createTransaction(channelId, userId || null, session.id, contribution.credits, 'CREDIT_PURCHASE');
      }

      // Step 9: Update Channel Information
      const updatedChannel = await prisma.channel.update({
        where: { id: channelId },
        data: {
          activationFunding: after.activation, // Update with the total activation funding
          creditBalance: after.credits,        // Update with the total credit balance
          status: after.activation >= channel.activationGoal && channel.status === 'PENDING' ? 'ACTIVE' : undefined,
        },
      });

      console.log(`Updated channel ${channelId}: +$${contribution.activation} activation, +${contribution.credits} credits.`);
      console.log(`Updated channel ${channelId}: Activation funding: $${after.total}, Credit balance: ${after.credits}`);

      // Step 10: Calculate and Store Badges
      const badgeTypes = determineBadges(
        amountInDollars,
        after.activation,
        Math.max(channel.activationGoal - before.activation, 0),
        wasActivated,
        {
          totalChats: 0,
          shares: 0,
          daysActive: 0,
          earlyMorningChats: 0,
          lateNightChats: 0,
          uniqueChannels: 0,
          uniqueQueries: 0,
          longConversations: 0,
          conversationsStarted: 0,
          factChecks: 0,
          trendingConversations: 0,
          complexQueries: 0,
        }
      );
      
      await prisma.sessionBadge.create({
        data: {
          sessionId: session.id,
          badges: badgeTypes.join(','),
        },
      });

      console.log(`Earned badges stored for session ${session.id}: ${badgeTypes.join(',')}`);

      // Step 11: Trigger Async Processing if Channel was Activated
      if (channel.status === 'PENDING' && updatedChannel.status === 'ACTIVE') {
        const totalFundingInDollars = updatedChannel.activationFunding + updatedChannel.creditBalance / 1000;
        processChannelAsync(channelId, channelName, totalFundingInDollars).catch((error) => {
          console.error('Error in async channel processing:', error);
        });
      }

      console.log(`Channel ${channelName} (${channelId}) updated. Current activation funding: $${updatedChannel.activationFunding}, Credit balance: ${updatedChannel.creditBalance}`);
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}