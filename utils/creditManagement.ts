// utils/creditManagement.ts
import prisma from '../lib/prisma';

export async function getCreditsPerDollar(): Promise<number> {
  const setting = await prisma.configurationSetting.findUnique({
    where: { key: 'CREDITS_PER_DOLLAR' },
  });
  return setting ? parseInt(setting.value) : 100;
}

export async function getChannelCredits(channelId: string): Promise<number> {
  const channelCredit = await prisma.channelCredit.findUnique({
    where: { channelId },
  });
  return channelCredit ? channelCredit.balance : 0;
}

export async function updateChannelCredits(
  channelId: string,
  amountInDollars: number = 0,
  amountInCredits: number = 0
): Promise<{ id: string; channelId: string; balance: number; createdAt: Date; updatedAt: Date; }> {
  try {
    // Validate that either amount in dollars or credits is provided
    if (amountInDollars === 0 && amountInCredits === 0) {
      throw new Error('Either amount in dollars or credits must be provided');
    }

    // Determine the credits to add
    const creditsToAdd =
      amountInDollars !== 0
        ? Math.floor(amountInDollars * (await getCreditsPerDollar()))
        : amountInCredits;

    // Upsert the channel credits
    const updatedCredit = await prisma.channelCredit.upsert({
      where: { channelId },
      update: { balance: { increment: creditsToAdd } },
      create: { channelId, balance: creditsToAdd },
    });

    console.log(`Updated credits for channel ${channelId}:`, updatedCredit);
    return updatedCredit;
  } catch (error) {
    console.error('Error updating channel credits:', error);
    throw error;
  }
}

export async function getFuelPercentage(channelId: string): Promise<number> {
  const credits = await getChannelCredits(channelId);
  const creditsPerDollar = await getCreditsPerDollar();
  return Math.min((credits / (100 * creditsPerDollar)) * 100, 100);
}

export async function getTotalChannelFunding(channelId: string): Promise<number> {
  const channelCredit = await prisma.channelCredit.findUnique({
    where: { channelId },
  });
  return channelCredit ? channelCredit.balance / 100 : 0; // Assuming balance is stored in cents
}