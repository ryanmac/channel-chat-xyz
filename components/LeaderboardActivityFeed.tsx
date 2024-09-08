'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function LeaderboardActivityFeed() {
  const activities = [
    { user: "Alice", action: "sponsored", target: "@TechTalks", amount: "$50" },
    { user: "Bob", action: "started a new chat with", target: "@GamingGurus" },
    { user: "Charlie", action: "became a top contributor for", target: "@CookingCorner" },
  ]

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-bold text-center mb-8">Community Activity</h2>
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {activities.map((activity, index) => (
              <li key={index} className="p-4 flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={`/public/vercel?height=40&width=40&text=${activity.user[0]}`} />
                  <AvatarFallback>{activity.user[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {activity.user} {activity.action} {activity.target}
                  </p>
                  {activity.amount && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{activity.amount}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}