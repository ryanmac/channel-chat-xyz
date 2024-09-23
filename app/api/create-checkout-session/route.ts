// server/api/create-checkout-session.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import config from '@/config';
import { getChannelFundingImpact } from '@/utils/transactionManagement';
import { ChannelData } from '@/utils/channelManagement'; // Import correct type definition

const stripe = new Stripe(config.stripe.secret!, {
  apiVersion: config.stripe.apiVersion,
});

export async function POST(req: NextRequest) {
  try {
    const { channelData, amount } = await req.json();

    // Validate the incoming data
    if (!channelData || typeof amount !== 'number') {
      console.error('Invalid request payload:', { channelData, amount });
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
    }

    console.log(`Creating Stripe Checkout Session for ${channelData.name} with amount $${amount}`);

    // Fetch the funding impact using the complete ChannelData object
    const impact = await getChannelFundingImpact(channelData, amount);
    const { before, contribution, after } = impact;

    let description = '';

    // Determine description based on funding state before and after contribution
    if (before.activation < channelData.activationGoal) {
      // Case 1: Channel is not yet activated, AND amount will not activate it
      if (after.activation < channelData.activationGoal) {
        description = `+$${amount} toward the $${channelData.activationGoal} goal to activate ${channelData.name}`;
      } 
      // Case 2: Channel is not yet activated, AND amount WILL activate it
      else {
        const chatsAdded = 1000 + Math.max(0, contribution.credits / 1000);
        description = `+$${amount} to activate ${channelData.name}, +${chatsAdded.toLocaleString()} chats`;
      }
    } else {
      // Case 3: Channel is already activated, all amount goes toward adding chats
      const chatsAdded = contribution.credits / 1000;
      description = `+$${amount} sponsors ${chatsAdded.toLocaleString()} AI-powered @${channelData.name} chats`;
    }

    // Create Stripe checkout session with the determined description
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `ChannelChat: @${channelData.name}`,
              images: ['https://channelchat.xyz/logomark2.png'],
              description: description,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/channel/@${channelData.name}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/channel/@${channelData.name}`,
      metadata: {
        channelId: channelData.id,
        channelName: channelData.name,
        amount: amount.toString(), // Send amount as a string to ensure proper parsing
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    return NextResponse.json({ error: 'Error creating checkout session' }, { status: 500 });
  }
}