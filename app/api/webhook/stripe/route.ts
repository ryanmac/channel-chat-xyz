// app/api/webhook/stripe/route.ts
import stripeInstance from "@/lib/stripe";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from 'next/server';
import Stripe from "stripe";
import { updateChannelCredits } from '@/utils/creditManagement';
import { processChannel } from '@/utils/yesService';
import prisma from "@/lib/prisma";
import configEnv from "@/config"
import { processChannelAsync } from '@/utils/yesService';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

async function getTotalChannelFunding(channelId: string): Promise<number> {
  const channelCredit = await prisma.channelCredit.findUnique({
    where: { channelId },
  });
  return channelCredit ? channelCredit.balance / 100 : 0; // Assuming balance is stored in cents
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get("Stripe-Signature") ?? "";

  let event: Stripe.Event;

  const stripeInstanceHandler = new stripeInstance();

  try {
    event = stripeInstanceHandler.getStripe().webhooks.constructEvent(
      body,
      signature,
      configEnv.stripe.webhook || ""
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  console.log("Session metadata:", session.metadata);

  try {
    if (event.type === "checkout.session.completed") {
      if (session.mode === 'subscription') {
        // Handle subscription payment
        const subscription = await stripeInstanceHandler.getStripe().subscriptions.retrieve(
          session.subscription as string
        );
        const updatedData = {
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
        };

        if (session?.metadata?.userId != null) {
          await prisma.subscription.upsert({
            where: { userId: session.metadata.userId },
            update: { ...updatedData, userId: session.metadata.userId },
            create: { ...updatedData, userId: session.metadata.userId },
          });
        } else if (
          typeof session.customer === "string" &&
          session.customer != null
        ) {
          await prisma.subscription.update({
            where: { stripeCustomerId: session.customer },
            data: updatedData,
          });
        }
      } else {
        // Handle single checkout payment
        const { channelId, channelName, amount } = session.metadata || {};
        if (channelId && channelName && amount) {
          const amountInDollars = Number(amount);
  
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

            // try {
            //   // Initiate YES processing
            //   const channelUrl = `https://www.youtube.com/@${channelName}`;
            //   const videoLimit = Math.floor(totalFunding * 10); // Assuming 10 videos per dollar
            //   await processChannel(channelId, channelUrl, videoLimit);
            //   console.log(`YES processing completed for channel ${channelId}`);

            //   // Update channel status to active
            //   await prisma.channel.update({
            //     where: { id: channelId },
            //     data: { isActive: true },
            //   });
            //   console.log(`Channel ${channelName} (${channelId}) activated`);
            // } catch (yesError) {
            //   console.error('Error processing channel with YES:', yesError);
            //   // Don't throw here, we still want to return a 200 to Stripe
            // }
          } else {
            console.log(`Channel ${channelName} (${channelId}) not yet fully funded. Current: $${totalFunding}, Goal: $${fundingGoal}`);
          }
        } else {
          console.error('Missing required metadata:', session.metadata);
        }
      }
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }

  if (event.type === "invoice.payment_succeeded") {
    // Handle subscription renewal
    const subscription = await stripeInstanceHandler.getStripe().subscriptions.retrieve(
      session.subscription as string
    );

    await prisma.subscription.update({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      data: {
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000
        ),
      },
    });
  }

  return NextResponse.json({ received: true });
}