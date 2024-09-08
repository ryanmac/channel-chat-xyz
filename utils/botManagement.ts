// utils/botManagement.ts
import prisma from '@/lib/prisma'

export interface BotAttributes {
  tier: string
  isActive: boolean
  boosts: string[]
  embeddedTranscripts: number
  totalVideos: number
  model: string
  maxTokens: number
  chatsCreated: number
  creditsRemaining: number
  maxCredits: number
  isFineTuned: boolean
  botScore: number
}

interface BotScoreFactors {
  tier: string
  embeddedTranscripts: number
  totalVideos: number
  chatsCreated: number
  creditsRemaining: number
  maxCredits: number
  isFineTuned: boolean
}

export async function getBotTier(channelId: string): Promise<string> {
  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
    include: { credits: true }
  })

  if (!channel || !channel.credits) {
    return 'Inactive'
  }

  // Define tier thresholds
  const basicThreshold = 1000 // 1000 credits for Basic tier
  const enhancedThreshold = 10000 // 10000 credits for Enhanced tier

  if (channel.credits.balance >= enhancedThreshold) {
    return 'Enhanced'
  } else if (channel.credits.balance >= basicThreshold) {
    return 'New'
  } else {
    return 'Inactive'
  }
}

export async function getChannelBoosts(channelId: string): Promise<string[]> {
  const boosts = await prisma.channelBoost.findMany({
    where: { channelId }
  })

  return boosts.map(boost => boost.boostType)
}

export async function activateBot(channelId: string): Promise<boolean> {
  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
    include: { credits: true }
  })

  if (!channel || !channel.credits || channel.credits.balance < 1000) {
    return false
  }

  await prisma.channelCredit.update({
    where: { channelId },
    data: { balance: { decrement: 1000 } }
  })

  return true
}

export async function fetchBotAttributes(channelId: string): Promise<BotAttributes> {
  try {
    const response = await fetch(`/api/bot/info?channelId=${channelId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch bot attributes')
    }
    const data: BotAttributes = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching bot attributes:', error)
    throw new Error('Failed to fetch bot attributes')
  }
}

// Add these new functions to match the API expectations

export async function getEmbeddedTranscripts(channelId: string): Promise<number> {
  const channel = await prisma.channel.findUnique({
    where: { id: channelId }
  })
  return channel?.embeddedTranscripts ?? 0
}

export async function getTotalVideos(channelId: string): Promise<number> {
  const channel = await prisma.channel.findUnique({
    where: { id: channelId }
  })
  return channel?.totalVideos ?? 0
}

export async function getChatsCreated(channelId: string): Promise<number> {
  const channel = await prisma.channel.findUnique({
    where: { id: channelId }
  })
  return channel?.chatsCreated ?? 0
}

export async function getCreditsRemaining(channelId: string): Promise<number> {
  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
    include: { credits: true }
  })

  return channel?.credits?.balance ?? 0
}

export async function getMaxCredits(channelId: string): Promise<number> {
  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
    include: { credits: true }
  })

  return channel?.credits?.maxCredits ?? 1000
}

export async function isFineTuned(channelId: string): Promise<boolean> {
  const channel = await prisma.channel.findUnique({
    where: { id: channelId }
  })
  return channel?.isFineTuned ?? false
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
  const transcriptPercentage = factors.totalVideos > 0 ? 
    (factors.embeddedTranscripts / factors.totalVideos) * 100 : 0;
  score += Math.min(transcriptPercentage, 100); // Max 100 points

  // Score based on chats created (engagement)
  score += Math.min(factors.chatsCreated, 200); // Max 200 points

  // Score based on credits remaining (health)
  const creditPercentage = (factors.creditsRemaining / factors.maxCredits) * 100;
  score += Math.min(creditPercentage, 100); // Max 100 points

  // Bonus for fine-tuning
  if (factors.isFineTuned) {
    score += 100;
  }

  return Math.min(Math.round(score), 1000); // Cap at 1000 points
}