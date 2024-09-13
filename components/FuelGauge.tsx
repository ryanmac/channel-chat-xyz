// components/FuelGauge.tsx
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Fuel } from 'lucide-react'

interface FuelGaugeProps {
  creditBalance: number
  maxCredits: number
}

export function FuelGauge({ creditBalance, maxCredits }: FuelGaugeProps) {
  const fuelPercentage = (creditBalance / maxCredits) * 100
  console.log('fuelPercentage:', fuelPercentage, 'creditBalance:', creditBalance, 'maxCredits:', maxCredits)

  return (
    <Card>
      {/* <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Chats Remaining</span>
          <Fuel className="w-6 h-6" />
        </CardTitle>
      </CardHeader> */}
      <CardContent className="mt-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Chats Remaining:</span>
            <span>{creditBalance.toLocaleString()}</span>
          </div>
          <Progress value={fuelPercentage} className="mt-2" />
        </div>
      </CardContent>
    </Card>
  )
}