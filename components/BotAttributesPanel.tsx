// components/BotAttributesPanel.tsx
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MemoryDisplay } from '@/components/MemoryDisplay'
import { ModelInfo } from '@/components/ModelInfo'
import { ChatStats } from '@/components/ChatStats'
import { FuelGauge } from '@/components/FuelGauge'
import { FineTuningStatus } from '@/components/FineTuningStatus'
import { BotScore } from '@/components/BotScore'
import { createCheckoutSession } from "@/utils/stripePayments";
import { fetchBotAttributes, BotAttributes } from '@/utils/botManagement'
import { Loader2 } from 'lucide-react'

interface BotAttributesPanelProps {
  channelId: string
  botTier: string
  isActive: boolean
  onActivate: () => Promise<void>
}

export function BotAttributesPanel({ 
  channelId, 
  botTier, 
  isActive, 
  onActivate 
}: BotAttributesPanelProps) {
  const [botAttributes, setBotAttributes] = useState({
    embeddedTranscripts: 0,
    totalVideos: 0,
    model: 'gpt-3.5-turbo',
    maxTokens: 200,
    chatsCreated: 0,
    creditsRemaining: 0,
    maxCredits: 1000,
    isFineTuned: false,
    botScore: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadBotAttributes = async () => {
      setIsLoading(true)
      try {
        const data = await fetchBotAttributes(channelId)
        setBotAttributes(data)
      } catch (err) {
        setError('Failed to load bot attributes')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    loadBotAttributes()
  }, [channelId])

  const handleBoost = async (type: 'memory' | 'model' | 'fineTuning') => {
    try {
      const amount = 10 // Example amount, adjust as needed
      await createCheckoutSession(channelId, `Boost ${type}`, amount)
      // Refresh bot attributes after successful boost
      const updatedData = await fetchBotAttributes(channelId)
      setBotAttributes(updatedData)
    } catch (err) {
      console.error(`Failed to boost ${type}:`, err)
      setError(`Failed to boost ${type}`)
    }
  }

  const handleRefuel = async () => {
    try {
      const amount = 50 // Example amount for refueling
      await createCheckoutSession(channelId, 'Refuel credits', amount)
      // Refresh bot attributes after successful refuel
      const updatedData = await fetchBotAttributes(channelId)
      setBotAttributes(updatedData)
    } catch (err) {
      console.error('Failed to refuel:', err)
      setError('Failed to refuel')
    }
  }

  if (isLoading) return <Card className="w-full p-6"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></Card>
  if (error) return <Card className="w-full p-6 text-red-500">Error: {error}</Card>

  return (
    <Card className="w-full mb-8">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Attributes{/* : {botTier} */}</span>
          <Button 
            variant={isActive ? "secondary" : "default"}
            onClick={onActivate}
          >
            {isActive ? "Active" : "Activate"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <BotScore score={botAttributes.botScore} />
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <MemoryDisplay 
            embeddedTranscripts={botAttributes.embeddedTranscripts}
            totalVideos={botAttributes.totalVideos}
            onBoost={() => handleBoost('memory')}
          />
          <ModelInfo 
            model={botAttributes.model}
            maxTokens={botAttributes.maxTokens}
            onBoost={() => handleBoost('model')}
          />
          <ChatStats chatsCreated={botAttributes.chatsCreated} />
          <FuelGauge 
            creditsRemaining={botAttributes.creditsRemaining}
            maxCredits={botAttributes.maxCredits}
            onRefuel={handleRefuel}
          />
          <FineTuningStatus 
            isFineTuned={botAttributes.isFineTuned}
            onToggleFineTuning={() => handleBoost('fineTuning')}
          />
        </div>
      </CardContent>
    </Card>
  )
}