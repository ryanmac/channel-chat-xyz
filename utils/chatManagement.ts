// utils/chatManagement.ts
import prisma from '@/lib/prisma'

export async function getTokensPerChat(channelId: string): Promise<number> {
  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
    include: { boosts: true },
  })

  if (!channel) return 0

  const memoryBoost = channel.boosts.find(boost => boost.boostType === 'MEMORY')
  return 200 + (memoryBoost ? 50 : 0)
}

export async function getRagContextSnippets(channelId: string): Promise<number> {
  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
    include: { boosts: true },
  })

  if (!channel) return 0

  const memoryBoost = channel.boosts.find(boost => boost.boostType === 'MEMORY')
  return 5 + (memoryBoost ? 2 : 0)
}