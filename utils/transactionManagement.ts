// utils/transactionManagement.ts
import prisma from '../lib/prisma';
import { TransactionType, Channel } from '@prisma/client';

// Retrieves the number of credits granted per dollar from the configuration settings.
export async function getCreditsPerDollar(): Promise<number> {
  const setting = await prisma.configurationSetting.findUnique({
    where: { key: 'CREDITS_PER_DOLLAR' },
  });
  return setting ? parseInt(setting.value, 10) : 1000; // Default to 1000 credits per dollar if not set
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

export async function getFuelPercentage(channelId: string): Promise<number> {
  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
    select: { activationFunding: true, activationGoal: true },
  });

  if (!channel) return 0;

  return Math.min((channel.activationFunding / channel.activationGoal) * 100, 100);
}

// Calculates the total activation and credit funding for a given channel.
export async function getTotalChannelFunding(channelId: string): Promise<{
  activation: number;
  credits: number;
  total: number;
  activationInDollars: number;
  creditsInDollars: number;
}> {
  const creditsPerDollar = await getCreditsPerDollar();

  // Aggregate activation and credit transactions by type
  const result = await prisma.transaction.groupBy({
    by: ['type'],
    where: {
      channelId,
      type: {
        in: ['ACTIVATION', 'CREDIT_PURCHASE'],
      },
    },
    _sum: {
      amount: true,
    },
  });

  const activationSum = result.find((r) => r.type === 'ACTIVATION')?._sum.amount || 0;
  const creditsSum = result.find((r) => r.type === 'CREDIT_PURCHASE')?._sum.amount || 0;
  const creditsInDollars = creditsSum / creditsPerDollar;

  return {
    activation: activationSum, // Activation funding in dollars
    credits: creditsSum,       // Total credits purchased
    total: activationSum + creditsInDollars, // Total funding in dollars
    activationInDollars: activationSum, // Activation amount in dollars
    creditsInDollars,                   // Credits amount in dollars
  };
}

// Creates a transaction and updates the channel's activation funding if necessary.
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

  // Update activation funding directly if the transaction type is ACTIVATION
  if (type === 'ACTIVATION') {
    await prisma.channel.update({
      where: { id: channelId },
      data: { activationFunding: { increment: amount } },
    });
  }
}

// Helper function to calculate funding impact based on the current state and contribution.
async function calculateFundingImpact(
  activationFunding: number,
  activationGoal: number,
  contribution: number,
  creditsPerDollar: number
): Promise<{
  activationContribution: number;
  creditContribution: number;
}> {
  const remainingToActivate = Math.max(activationGoal - activationFunding, 0);
  const activationContribution = Math.min(contribution, remainingToActivate);
  const creditContribution = Math.max(contribution - activationContribution, 0) * creditsPerDollar;

  return {
    activationContribution,
    creditContribution,
  };
}

// Calculates the impact of a new contribution on a channel's funding state.
export async function getChannelFundingImpact(
  channelData: Channel,
  amount: number
): Promise<{
  before: { activation: number; credits: number; total: number; activationInDollars: number; creditsInDollars: number };
  contribution: { activation: number; credits: number; total: number; activationInDollars: number; creditsInDollars: number };
  after: { activation: number; credits: number; total: number; activationInDollars: number; creditsInDollars: number };
}> {
  const numericAmount = Number(amount);
  const creditsPerDollar = await getCreditsPerDollar();
  const before = await getTotalChannelFunding(channelData.id);

  // Calculate the impact of the contribution
  const { activationContribution, creditContribution } = await calculateFundingImpact(
    channelData.activationFunding,
    channelData.activationGoal,
    numericAmount,
    creditsPerDollar
  );

  const contribution = {
    activation: activationContribution,
    credits: creditContribution,
    total: numericAmount,
    activationInDollars: activationContribution, // Same as activation since it's in dollars
    creditsInDollars: creditContribution / creditsPerDollar, // Convert credits back to dollar equivalent
  };

  // Calculate the funding state after the contribution
  const after = {
    activation: before.activation + activationContribution,
    credits: before.credits + creditContribution,
    total: before.total + numericAmount,
    activationInDollars: before.activationInDollars + activationContribution,
    creditsInDollars: before.creditsInDollars + creditContribution / creditsPerDollar,
  };

  // Check if the before state was not fully funded but the after state is fully funded
  const wasNotFullyFunded = before.activation < channelData.activationGoal;
  const isNowFullyFunded = after.activation >= channelData.activationGoal;

  // If the activation funding goal is met after the contribution, add 1000 initial credits
  if (wasNotFullyFunded && isNowFullyFunded) {
    after.credits += 1000; // Add the 1000 initial credits
    after.creditsInDollars = after.credits / creditsPerDollar; // Update the dollar equivalent
  }

  console.log('Funding impact:', { before, contribution, after });

  return { before, contribution, after };
}