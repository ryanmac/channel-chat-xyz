// utils/chatManagement.ts
import prisma from '@/lib/prisma'

export async function embedVideo(channelId: string, videoId: string): Promise<boolean> {
  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
    include: { usage: true, boosts: true },
  })

  if (!channel) return false

  const transcriptBoost = channel.boosts.find(boost => boost.boostType === 'TRANSCRIPT')
  const embeddedVideosLimit = 20 + (transcriptBoost ? 20 : 0)

  if (channel.usage[0].embeddedVideos >= embeddedVideosLimit) {
    return false
  }

  // Logic for embedding video goes here
  // This would involve calling your YouTube Extraction Service

  await prisma.channelUsage.update({
    where: { id: channel.usage[0].id },
    data: { embeddedVideos: { increment: 1 } },
  })

  return true
}

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