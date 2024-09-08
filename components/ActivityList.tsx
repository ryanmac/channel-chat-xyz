import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ActivityEntry {
  username: string
  action: string
  timestamp: string
}

interface ActivityListProps {
  recentActivity: ActivityEntry[]
}

export function ActivityList({ recentActivity }: ActivityListProps) {
  return (
    <ul className="space-y-4">
      {recentActivity.map((activity, index) => (
        <li key={index} className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={`/placeholder.svg?height=32&width=32&text=${activity.username[0]}`} />
            <AvatarFallback>{activity.username[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm">
              <span className="font-semibold">{activity.username}</span> {activity.action}
            </p>
            <p className="text-xs text-gray-500">{activity.timestamp}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}