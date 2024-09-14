// utils/transactionManagement.ts
/**
 * Credits are used to fund the bot and are used to pay for various services.
 * 1 credit is equivalent to 0.1 cents. But may be adjusted in the configuration settings under CREDITS_PER_DOLLAR.
 * 1 credit buys 1 "chat"
 * 1 "chat" is equivalent to 3400 to 50k tokens depending on the model.
 * Every time a user interacts with the ChatInterface, a "chat" is consumed, whether the conversation was 2 messages or 200.
 */
import prisma from '../lib/prisma';
import { TransactionType } from '@prisma/client';

export async function getCreditsPerDollar(): Promise<number> {
  const setting = await prisma.configurationSetting.findUnique({
    where: { key: 'CREDITS_PER_DOLLAR' },
  });
  return setting ? parseInt(setting.value) : 100;
}

export async function getChannelCredits(channelId: string): Promise<number> {
  const result = await prisma.transaction.aggregate({
    where: {
      channelId,
      type: 'CREDIT_PURCHASE',
    },
    _sum: {
      amount: true,
    },
  });
  return result._sum.amount || 0;
}

export async function createTransaction(
  channelId: string,
  userId: string | null,
  sessionId: string,
  amount: number,
  type: TransactionType,
  description?: string
): Promise<void> {
  await prisma.transaction.create({
    data: {
      channelId,
      userId,
      sessionId,
      amount,
      type,
      description,
    },
  });

  if (type === 'ACTIVATION') {
    await prisma.channel.update({
      where: { id: channelId },
      data: { activationFunding: { increment: amount } },
    });
  }
}

export async function getFuelPercentage(channelId: string): Promise<number> {
  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
    select: { activationFunding: true, activationGoal: true },
  });

  if (!channel) return 0;

  return Math.min((channel.activationFunding / channel.activationGoal) * 100, 100);
}

export async function getTotalChannelFunding(channelId: string): Promise<{ activation: number; credits: number; total: number }> {
  // Fetch the conversion rate from ConfigurationSetting table
  const creditConversion = await prisma.configurationSetting.findUnique({
    where: { key: 'CREDITS_PER_DOLLAR' },
    select: { value: true },
  });

  const creditsPerDollar = creditConversion ? parseFloat(creditConversion.value) : 1000; // Default to 1000 if not found or invalid

  // Fetch the sum of activation and credit purchase amounts separately
  const result = await prisma.transaction.groupBy({
    by: ['type'],
    where: {
      channelId,
      type: {
        in: ['ACTIVATION', 'CREDIT_PURCHASE'], // Include both transaction types
      },
    },
    _sum: {
      amount: true,
    },
  });

  // Calculate activation sum in dollars and credit purchases in credits
  const activationSum = result.find(r => r.type === 'ACTIVATION')?._sum.amount || 0;
  const creditsSum = result.find(r => r.type === 'CREDIT_PURCHASE')?._sum.amount || 0;

  // Convert credits to dollars using the conversion rate
  const creditsInDollars = creditsSum / creditsPerDollar;

  // Calculate the total amount in dollars
  const total = activationSum + creditsInDollars;

  // Return the result object
  return {
    activation: activationSum, // in dollars
    credits: creditsSum,       // in credits
    total,                     // total in dollars
  };
}

export async function associateTransactionsWithUser(sessionId: string, userId: string): Promise<void> {
  await prisma.transaction.updateMany({
    where: {
      sessionId,
      userId: null,
    },
    data: {
      userId,
    },
  });
}

export async function getChannelTransactions(channelId: string): Promise<any[]> {
  return prisma.transaction.findMany({
    where: { channelId },
    include: { user: true },
  });
}