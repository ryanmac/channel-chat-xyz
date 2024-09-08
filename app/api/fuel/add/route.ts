// app/api/fuel/add/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { addFuel } from '@/utils/fuelManagement'

export async function POST(req: NextRequest) {
  const { channelId, amountInDollars } = await req.json()

  try {
    await addFuel(channelId, amountInDollars)
    return NextResponse.json({ message: 'Fuel added successfully' })
  } catch (error) {
    return NextResponse.json({ message: 'Failed to add fuel' }, { status: 500 })
  }
}