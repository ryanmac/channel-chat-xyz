// components/BotScore.tsx
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface BotScoreProps {
  score: number
}

export function BotScore({ score }: BotScoreProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bot Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-center">{score}</div>
        <Progress value={score} max={1000} className="mt-2" />
      </CardContent>
    </Card>
  )
}