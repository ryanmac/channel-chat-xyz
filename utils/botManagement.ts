import prisma from '@/lib/prisma';

export interface BotAttributes {
  tier: string;
  isActive: boolean;
  boosts: string[];
  totalEmbeddings: number;
  totalChannelVideos: number;
  totalEmbeddedVideos: number;
  model: string;
  maxTokens: number;
  chatsCreated: number;
  creditBalance: number;
  maxCredits: number;
  isFineTuned: boolean;
  botScore: number;
}

interface BotScoreFactors {
  tier: string;
  totalEmbeddings: number;
  totalChannelVideos: number;
  totalEmbeddedVideos: number;
  chatsCreated: number;
  creditBalance: number;
  maxCredits: number;
  isFineTuned: boolean;
}

export async function getActivationFunding(channelId: string): Promise<number> {
  const result = await prisma.transaction.aggregate({
    where: {
      channelId,
      type: 'ACTIVATION',
    },
    _sum: {
      amount: true,
    },
  });
  return result._sum.amount || 0;
}

export async function getCreditBalance(channelId: string): Promise<number> {
  // Get total credits purchased
  const creditPurchaseResult = await prisma.transaction.aggregate({
    where: {
      channelId,
      type: 'CREDIT_PURCHASE',
    },
    _sum: {
      amount: true,
    },
  });

  const totalCreditsPurchased = creditPurchaseResult._sum.amount || 0;

  // Get total chats created (used credits)
  const totalChatsCreated = await prisma.chatSession.count({
    where: {
      channelId,
    },
  });

  // Calculate remaining credits
  const remainingCredits = totalCreditsPurchased - totalChatsCreated;

  // Return the balance, ensuring it is not negative
  return Math.max(remainingCredits, 0);
}

export async function getBotTier(channelId: string): Promise<string> {
  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
  });

  if (!channel) {
    return 'Inactive';
  }

  if (channel.activationFunding >= 10000) {
    return 'Enhanced';
  } else if (channel.activationFunding >= 1000 || channel.status === 'ACTIVE') {
    return 'New';
  } else {
    return 'Inactive';
  }
}

export async function getChannelBoosts(channelId: string): Promise<string[]> {
  const boosts = await prisma.channelBoost.findMany({
    where: { channelId },
  });

  return boosts.map((boost) => boost.boostType);
}

export async function activateBot(channelId: string): Promise<boolean> {
  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
  });

  if (!channel) {
    return false;
  }

  if (channel.status !== 'PENDING') {
    return false;
  }

  const activationFunding = await getActivationFunding(channelId);

  if (activationFunding < channel.activationGoal) {
    return false;
  }

  await prisma.channel.update({
    where: { id: channelId },
    data: { status: 'ACTIVE' },
  });

  return true;
}

export async function getChatsCreated(channelId: string): Promise<number> {
  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
  });
  return channel?.chatsCreated ?? 0;
}

export async function getCreditsRemaining(channelId: string): Promise<number> {
  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
  });
  return channel?.creditBalance ?? 0;
}

export async function getMaxCredits(channelId: string): Promise<number> {
  return 1000 * 100; // 1000 credits per $1, Max $100
  // const channel = await prisma.channel.findUnique({
  //   where: { id: channelId },
  // });
  // return channel?.activationGoal ?? 1000;
}

export async function isFineTuned(channelId: string): Promise<boolean> {
  const boosts = await getChannelBoosts(channelId);
  return boosts.includes('FINE_TUNING');
}

export function calculateBotScore(factors: BotScoreFactors): number {
  let score = 0;

  // Base score based on tier
  switch (factors.tier) {
    case 'Premium':
      score += 500;
      break;
    case 'Enhanced':
      score += 300;
      break;
    case 'New':
      score += 100;
      break;
    default:
      score += 0;
  }

  // Score based on embedded transcripts (percentage of total videos)
  const transcriptPercentage =
    factors.totalChannelVideos > 0
      ? (factors.totalEmbeddedVideos / factors.totalChannelVideos) * 100
      : 0;
  score += Math.min(transcriptPercentage, 100); // Max 100 points

  // Score based on chats created (engagement)
  score += Math.min(factors.chatsCreated, 200); // Max 200 points

  // Score based on credits remaining (health)
  const creditPercentage = (factors.creditBalance / factors.maxCredits) * 100;
  score += Math.min(creditPercentage, 100); // Max 100 points

  // Bonus for fine-tuning
  if (factors.isFineTuned) {
    score += 100;
  }

  return Math.min(Math.round(score), 1000); // Cap at 1000 points
}