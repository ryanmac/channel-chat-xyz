// app/api/webhook/stripe/route.ts
import { headers } from "next/headers";
import { NextRequest, NextResponse } from 'next/server';
import Stripe from "stripe";
import { getTotalChannelFunding, createTransaction } from '@/utils/transactionManagement';
import { processChannelAsync } from '@/utils/yesService';
import prisma from "@/lib/prisma";
import configEnv from "@/config";
import { determineBadges } from '@/utils/badgeManagement';
import { create } from "domain";
import config from "@/config";

const stripe = new Stripe(config.stripe.secret!, {
  apiVersion: config.stripe.apiVersion,
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get("Stripe-Signature") ?? "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      configEnv.stripe.webhook || ""
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  try {
    if (event.type === "checkout.session.completed") {
      const { channelId, channelName, amount, userId } = session.metadata || {};

      if (channelId && channelName && amount) {
        const amountInDollars = Number(amount);

        // Ensure the channel exists
        const channel = await prisma.channel.findUnique({ where: { id: channelId } });
        if (!channel) {
          throw new Error(`Channel not found: ${channelId}`);
        }

        // Get current activation funding
        const { activation: currentActivationFunding } = await getTotalChannelFunding(channelId);
        const remainingToActivate = Math.max(channel.activationGoal - currentActivationFunding, 0);

        const activationAmount = Math.min(amountInDollars, remainingToActivate);
        const creditAmount = Math.max(amountInDollars - activationAmount, 0);

        let creditsToAdd = 0;
        let wasActivated = false;

        // Handle activation
        if (activationAmount > 0) {
          await createTransaction(channelId, userId || null, session.id, activationAmount, 'ACTIVATION');
          
          // Check if this transaction activates the channel
          if (currentActivationFunding + activationAmount >= channel.activationGoal) {
            creditsToAdd += 1000; // Initial 1000 credits for activation
            await createTransaction(channelId, userId || null, session.id, 1000, 'CREDIT_PURCHASE');
            wasActivated = true;
          }
        }

        // Handle credit purchase
        if (creditAmount > 0) {
          await createTransaction(channelId, userId || null, session.id, creditAmount * 1000, 'CREDIT_PURCHASE');
          creditsToAdd += creditAmount * 1000; // 1000 credits per $1
        }

        // Update Channel model
        const updatedChannel = await prisma.channel.update({
          where: { id: channelId },
          data: {
            activationFunding: { increment: activationAmount },
            creditBalance: { increment: creditsToAdd },
            status: wasActivated ? 'ACTIVE' : undefined,
            isProcessing: wasActivated ? true : undefined,
          },
        });

        console.log(`Updated channel ${channelId}: +$${activationAmount} activation, +$${creditAmount} credits, +${creditsToAdd} credit balance`);

        // Calculate and store badges
        const badgeTypes = determineBadges(amountInDollars, currentActivationFunding, remainingToActivate, wasActivated, {
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
        });

        await prisma.sessionBadge.create({
          data: {
            sessionId: session.id,
            badges: badgeTypes.join(','),
          },
        });

        console.log(`Earned badges stored for session ${session.id}: ${badgeTypes.join(',')}`);

        // Trigger async processing if channel was activated
        // if (wasActivated) {
        console.log(`Activating channel ${channelName} (${channelId})`);
        const totalFundingInDollars = currentActivationFunding + activationAmount + creditAmount;
        processChannelAsync(channelId, channelName, totalFundingInDollars).catch((error) => {
          console.error('Error in async channel processing:', error);
        });
        // }

        console.log(`Channel ${channelName} (${channelId}) updated. Current activation funding: $${updatedChannel.activationFunding}, Credit balance: ${updatedChannel.creditBalance}`);
      } else {
        console.error('Missing required metadata:', session.metadata);
      }
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