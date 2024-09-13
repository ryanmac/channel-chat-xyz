import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import config from '@/config';

const stripe = new Stripe(config.stripe.secret!, {
  apiVersion: config.stripe.apiVersion,
});

export async function POST(req: NextRequest) {
  try {
    const { channelId, channelName, amount } = await req.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `ChannelChat: @${channelName}`,
              images: ['https://channelchat.xyz/logomark2.png'],
              description: `Sponsors ${(amount*1000).toLocaleString()} AI-powered @${channelName} chats`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents and ensure it's an integer
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/channel/@${channelName}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/channel/@${channelName}`,
      metadata: {
        channelId,
        channelName,
        amount: amount.toString(),
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    return NextResponse.json({ error: 'Error creating checkout session' }, { status: 500 });
  }
}