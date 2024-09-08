// app/api/bot/info/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getBotTier, getChannelBoosts, getEmbeddedTranscripts, getTotalVideos, getChatsCreated, getCreditsRemaining, getMaxCredits, isFineTuned, calculateBotScore } from '@/utils/botManagement'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const channelId = searchParams.get('channelId')

  if (!channelId) {
    console.error('Channel ID is required')
    return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 })
  }

  try {
    const tier = await getBotTier(channelId)
    const boosts = await getChannelBoosts(channelId)
    const isActive = tier !== 'Inactive'
    const embeddedTranscripts = await getEmbeddedTranscripts(channelId)
    const totalVideos = await getTotalVideos(channelId)
    const chatsCreated = await getChatsCreated(channelId)
    const creditsRemaining = await getCreditsRemaining(channelId)
    const maxCredits = await getMaxCredits(channelId)
    const fineTunedStatus = await isFineTuned(channelId)
    
    // You might want to implement logic to determine the model and maxTokens based on the tier or other factors
    const model = tier === 'Premium' ? 'gpt-4o-mini' : 'gpt-3.5-turbo'
    const maxTokens = tier === 'Premium' ? 1000 : 200

    const botScore = calculateBotScore({
      tier,
      embeddedTranscripts,
      totalVideos,
      chatsCreated,
      creditsRemaining,
      maxCredits,
      isFineTuned: fineTunedStatus,
    })

    console.log('Bot info:', { tier, isActive, boosts, embeddedTranscripts, totalVideos, model, maxTokens, chatsCreated, creditsRemaining, maxCredits, isFineTuned: fineTunedStatus, botScore })

    return NextResponse.json({
      tier,
      isActive,
      boosts,
      embeddedTranscripts,
      totalVideos,
      model,
      maxTokens,
      chatsCreated,
      creditsRemaining,
      maxCredits,
      isFineTuned,
      botScore
    })
  } catch (error) {
    console.error('Error fetching bot info:', error)
    return NextResponse.json({ error: 'Failed to fetch bot info' }, { status: 500 })
  }
}