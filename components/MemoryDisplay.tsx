// components/MemoryDisplay.tsx
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Brain } from 'lucide-react'

interface MemoryDisplayProps {
  totalEmbeddings: number
  totalEmbeddedVideos: number
  totalChannelVideos: number
  onBoost: () => void
}

export function MemoryDisplay({ totalEmbeddings, totalEmbeddedVideos, totalChannelVideos, onBoost }: MemoryDisplayProps) {
  const memoryPercentage = (totalEmbeddedVideos / totalChannelVideos) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Memory</span>
          <Brain className="w-6 h-6" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Total Embeddings:</span>
            <span>{totalEmbeddings}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Embedded Videos:</span>
            <span>{totalEmbeddedVideos}</span>
          </div>          <div className="flex justify-between">
            <span>Total Channel Videos:</span>
            <span>{totalChannelVideos}</span>
          </div>
          <Progress value={memoryPercentage} className="mt-2" />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={onBoost} className="w-full mt-2">Boost Memory</Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Increase the number of videos your bot can remember</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  )
}