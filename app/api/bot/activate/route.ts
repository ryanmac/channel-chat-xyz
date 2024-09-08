// app/api/bot/activate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { activateBot } from '@/utils/botManagement'

export async function POST(req: NextRequest) {
  const { channelId } = await req.json()

  try {
    const success = await activateBot(channelId)
    if (success) {
      return NextResponse.json({ message: 'Bot activated successfully' })
    } else {
      return NextResponse.json({ message: 'Insufficient credits to activate bot' }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ message: 'Failed to activate bot' }, { status: 500 })
  }
}