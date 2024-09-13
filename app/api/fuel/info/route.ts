// app/api/fuel/info/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getChannelCredits, getFuelPercentage } from '@/utils/transactionManagement'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const channelId = searchParams.get('channelid')

  if (!channelId) {
    return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 })
  }

  try {
    const credits = await getChannelCredits(channelId)
    const percentage = await getFuelPercentage(channelId)

    return NextResponse.json({ credits, percentage })
  } catch (error) {
    console.error('Error fetching fuel info:', error)
    return NextResponse.json({ error: 'Failed to fetch fuel info' }, { status: 500 })
  }
}