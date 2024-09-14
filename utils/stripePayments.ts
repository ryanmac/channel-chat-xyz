// utils/stripePayments.ts
import { loadStripe } from '@stripe/stripe-js';
import config from '@/config';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export async function createCheckoutSession(channelId: string, channelName: string, amount: number) {
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
      body: JSON.stringify({ channelId, channelName, amount }),
    });

    console.log('Response status:', response.status);
    const responseText = await response.text();
    console.log('Response text:', responseText);

    let session;
    try {
      session = JSON.parse(responseText);
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      throw new Error('Invalid response from server');
    }

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