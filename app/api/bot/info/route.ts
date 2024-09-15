// app/api/bot/info/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getBotTier, getChannelBoosts, getChatsCreated, getCreditBalance, getMaxCredits, isFineTuned, calculateBotScore } from '@/utils/botManagement'
import { getCache, setCache } from '@/utils/cache'
import { getChannelInfo } from '@/utils/yesService'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  // console.log('Query params:', searchParams.toString())
  // return NextResponse.json({ error: 'Query params:', query: searchParams.toString() }, { status: 400 })
  const channelId = searchParams.get('channelId')
  const channelUrl = searchParams.get('channelUrl')
  const channelName = searchParams.get('channelName')
  
  if (!channelId && !channelUrl && !channelName) {
    return NextResponse.json({ error: 'Missing channelId, channelUrl, or channelName parameter' }, { status: 400 })
  }

  const cacheKey = `bot-info-${channelId || channelUrl || channelName}`
  const cachedData = getCache(cacheKey)

  if (cachedData) {
    console.log('Returning cached bot info:', cachedData)
    return NextResponse.json(cachedData)
  }

  try {
    // Fetch channel info from YES API
    const channelInfo = await getChannelInfo({
      channelId: channelId || undefined,
      channelUrl: channelUrl || undefined,
      channelName: channelName || undefined
    });

    // Fetch channel data from database
    const channel = await prisma.channel.findUnique({
      where: { id: channelId || channelInfo.id },
    });

    if (!channel) {
      throw new Error('Channel not found in database');
    }

    const tier = await getBotTier(channel.id)
    const boosts = await getChannelBoosts(channel.id)
    const isActive = tier !== 'Inactive'
    const totalEmbeddings = channel.totalEmbeddings
    const totalChannelVideos = parseInt(channelInfo.metadata.statistics.videoCount) || 0
    const totalEmbeddedVideos = channel.totalVideos
    const chatsCreated = await getChatsCreated(channel.id)
    const creditBalance = await getCreditBalance(channel.id)
    const maxCredits = await getMaxCredits(channel.id)
    const fineTunedStatus = await isFineTuned(channel.id)
    
    // You might want to implement logic to determine the model and maxTokens based on the tier or other factors
    const model = channel.model || 'gpt-4o-mini'
    const maxTokens = channel.maxTokens || (tier === 'Premium' ? 1000 : 200)

    const botScore = calculateBotScore({
      tier,
      totalEmbeddings,
      totalChannelVideos,
      totalEmbeddedVideos,
      chatsCreated,
      creditBalance,
      maxCredits,
      isFineTuned: fineTunedStatus,
    })

    const botInfo = {
      tier,
      isActive,
      boosts,
      totalEmbeddings,
      totalChannelVideos,
      totalEmbeddedVideos,
      model,
      maxTokens,
      chatsCreated,
      creditBalance,
      maxCredits,
      isFineTuned: fineTunedStatus,
      botScore
    };

    console.log('Bot info:', botInfo)

    setCache(cacheKey, botInfo, 600000); // Cache the result for 10 minutes
    return NextResponse.json(botInfo)
  } catch (error) {
    console.error('Error fetching bot info:', error)
    return NextResponse.json({ error: 'Failed to fetch bot info' }, { status: 500 })
  }
}