// components/ChatStats.tsx
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare } from 'lucide-react'

interface ChatStatsProps {
  chatsCreated: number
}

export function ChatStats({ chatsCreated }: ChatStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Chat Stats</span>
          <MessageSquare className="w-6 h-6" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="text-4xl font-bold">{chatsCreated}</div>
          <div className="text-sm text-muted-foreground">Chats Created</div>
        </div>
      </CardContent>
    </Card>
  )
}