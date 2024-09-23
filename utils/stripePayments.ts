// utils/stripePayments.ts
import { loadStripe } from '@stripe/stripe-js';
import { ChannelData } from '@/utils/channelManagement'; // Ensure this import matches your data structure
import config from '@/config';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export async function createCheckoutSession(channelData: ChannelData, amount: number) {
  const stripe = await stripePromise;

  if (!stripe) {
    throw new Error('Stripe failed to initialize');
  }

  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channelData,
        amount,
      }),
    });

    const responseText = await response.text();
    const session = JSON.parse(responseText);

    if (session.sessionId) {
      const result = await stripe.redirectToCheckout({
        sessionId: session.sessionId,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } else {
      throw new Error('Failed to create checkout session');
    }
  } catch (error) {
    console.error('Error in createCheckoutSession:', error);
    throw error;
  }
}