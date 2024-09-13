// components/LeaderboardList.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface LeaderboardEntry {
  user: {
    username: string;
    image?: string | null;
  };
  totalAmount: number;
  totalChatsSponsored: number; // Include totalChatsSponsored in the interface
}

interface LeaderboardListProps {
  leaderboard: LeaderboardEntry[];
}

export function LeaderboardList({ leaderboard }: LeaderboardListProps) {
  return (
    <ul className="space-y-4">
      {leaderboard.map((entry) => (
        <li key={entry.user.username} className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={entry.user.image || undefined} />
              <AvatarFallback>{entry.user.username[0]}</AvatarFallback>
            </Avatar>
            <span>{entry.user.username}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>{(entry.totalChatsSponsored/1000).toFixed(0)}k chats</span>
          </div>
        </li>
      ))}
    </ul>
  );
}