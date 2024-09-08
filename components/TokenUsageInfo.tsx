import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface TokenUsageInfoProps {
  tokensUsed: number
  tokensRemaining: number
  chatsCreated: number
}

export function TokenUsageInfo({ tokensUsed, tokensRemaining, chatsCreated }: TokenUsageInfoProps = { tokensUsed: 0, tokensRemaining: 1000, chatsCreated: 0 }) {
  const totalTokens = tokensUsed + tokensRemaining
  const usedPercentage = (tokensUsed / totalTokens) * 100
  const remainingPercentage = (tokensRemaining / totalTokens) * 100

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Token Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span>Tokens Used</span>
              <span>{tokensUsed.toLocaleString()}</span>
            </div>
            <Progress value={usedPercentage} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span>Tokens Remaining</span>
              <span>{tokensRemaining.toLocaleString()}</span>
            </div>
            <Progress value={remainingPercentage} className="h-2" />
          </div>
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm font-medium">Chats Created</span>
            <span className="text-lg font-bold">{chatsCreated.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}