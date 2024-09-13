// components/ModelInfo.tsx
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Cpu } from 'lucide-react'

interface ModelInfoProps {
  model: string
  maxTokens: number
  onBoost: () => void
}

export function ModelInfo({ model, maxTokens, onBoost }: ModelInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Model</span>
          <Cpu className="w-6 h-6" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Current Model:</span>
            <code>{model}</code>
          </div>
          <div className="flex justify-between">
            <span>Max Tokens:</span>
            <span>{maxTokens}</span>
          </div>
          {/* <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={onBoost} className="w-full mt-2">Add New Model</Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Upgrade to a more powerful language model</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider> */}
        </div>
      </CardContent>
    </Card>
  )
}