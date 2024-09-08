// app/api/boost/purchase/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { purchaseBoost } from '@/utils/boostManagement'

export async function POST(req: NextRequest) {
  const { channelId, boostType } = await req.json()

  try {
    const success = await purchaseBoost(channelId, boostType)
    if (success) {
      return NextResponse.json({ message: 'Boost purchased successfully' })
    } else {
      return NextResponse.json({ message: 'Insufficient credits to purchase boost' }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ message: 'Failed to purchase boost' }, { status: 500 })
  }
}