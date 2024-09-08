import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface LeaderboardEntry {
  username: string
  amount: number
  badge?: string
}

interface LeaderboardListProps {
  leaderboard: LeaderboardEntry[]
}

export function LeaderboardList({ leaderboard }: LeaderboardListProps) {
  return (
    <ul className="space-y-4">
      {leaderboard.map((entry, index) => (
        <li key={index} className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={`/public/vercel?height=32&width=32&text=${entry.username[0]}`} />
              <AvatarFallback>{entry.username[0]}</AvatarFallback>
            </Avatar>
            <span>{entry.username}</span>
          </div>
          <div className="flex items-center space-x-2">
            {entry.badge && <Badge variant="secondary">{entry.badge}</Badge>}
            <span>${entry.amount}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}