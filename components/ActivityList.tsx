// components/ActivityList.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link"; // Import the Link component from Next.js

interface ActivityEntry {
  id: string;
  user: {
    username: string;
    image?: string | null;
  };
  channel: {
    name: string;
  };
  amount: number;
  type: string;
  createdAt: Date;
}

interface ActivityListProps {
  recentActivity: ActivityEntry[];
}

export function ActivityList({ recentActivity }: ActivityListProps) {
  return (
    <ul className="space-y-4">
      {recentActivity.map((activity) => {
        const message =
          activity.type === "ACTIVATION"
            ? `${activity.user.username} contributed to activate ${activity.channel.name}`
            : `${activity.user.username} sponsored ${activity.amount.toLocaleString()} chats for ${activity.channel.name}`;

        return (
          <li key={activity.id} className="flex items-center space-x-3">
            {/* Wrap the entire content in a Link to the channel URL */}
            <Link href={`/channel/${activity.channel.name}`} className="flex items-center space-x-3">
              <Avatar className="rounded-full">
                <AvatarImage src={activity.user.image || undefined} />
                <AvatarFallback>{activity.user.username[0]}</AvatarFallback>
              </Avatar>
              <p className="text-sm">{message}</p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}