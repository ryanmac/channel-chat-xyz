// components/ActivateBotButton.tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import axios from 'axios'

interface ActivateBotButtonProps {
  channelId: string
  onActivate: () => void
}

export function ActivateBotButton({ channelId, onActivate }: ActivateBotButtonProps) {
  const [isActivating, setIsActivating] = useState(false)

  const handleActivate = async () => {
    setIsActivating(true)
    try {
      await axios.post('/api/bot/activate', { channelId })
      onActivate()
    } catch (error) {
      console.error('Failed to activate bot:', error)
    } finally {
      setIsActivating(false)
    }
  }

  return (
    <Button onClick={handleActivate} disabled={isActivating}>
      {isActivating ? 'Activating...' : 'Activate Bot'}
    </Button>
  )
}