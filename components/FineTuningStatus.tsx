// components/FineTuningStatus.tsx
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Zap } from 'lucide-react'

interface FineTuningStatusProps {
  isFineTuned: boolean
  onToggleFineTuning: () => void
}

export function FineTuningStatus({ isFineTuned, onToggleFineTuning }: FineTuningStatusProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Fine-Tuning</span>
          <Zap className="w-6 h-6" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span>Status:</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Switch
                  checked={isFineTuned}
                  onCheckedChange={onToggleFineTuning}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>{isFineTuned ? 'Disable' : 'Enable'} fine-tuning for your bot</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="text-sm text-muted-foreground mt-2">
          {isFineTuned ? 'Fine-tuning is active' : 'Fine-tuning is not active'}
        </div>
      </CardContent>
    </Card>
  )
}