// components/BotTierDisplay.tsx
import { useEffect, useState } from 'react'
import { getBotTier } from '@/utils/botManagement'

interface BotTierDisplayProps {
  channelId: string
  botTier: string
}

export function BotTierDisplay({ channelId, botTier }: BotTierDisplayProps) {
  return (
    <div className="p-4 bg-secondary rounded-lg">
      <h3 className="text-lg font-semibold">Bot Tier</h3>
      <p className="text-xl">{botTier}</p>
    </div>
  )
}