// components/FuelGauge.tsx
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Fuel } from 'lucide-react';

interface FuelGaugeProps {
  creditBalance: number;
  maxCredits: number;
}

export function FuelGauge({ creditBalance, maxCredits }: FuelGaugeProps) {
  const fuelPercentage = (creditBalance / maxCredits) * 100;

  return (
    <Card className="bg-background/60 border-none py-2">
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
  );
}