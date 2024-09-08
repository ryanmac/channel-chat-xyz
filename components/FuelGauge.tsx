// components/FuelGauge.tsx
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Fuel } from 'lucide-react'

interface FuelGaugeProps {
  creditsRemaining: number
  maxCredits: number
  onRefuel: () => void
}

export function FuelGauge({ creditsRemaining, maxCredits, onRefuel }: FuelGaugeProps) {
  const fuelPercentage = (creditsRemaining / maxCredits) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Fuel</span>
          <Fuel className="w-6 h-6" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Credits Remaining:</span>
            <span>{creditsRemaining}</span>
          </div>
          <Progress value={fuelPercentage} className="mt-2" />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={onRefuel} className="w-full mt-2">Refuel</Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add more credits to keep your bot running</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  )
}