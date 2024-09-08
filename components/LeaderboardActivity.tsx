'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LeaderboardList } from "@/components/LeaderboardList"
import { ActivityList } from "@/components/ActivityList"
import { motion } from "framer-motion"
import { Trophy, Activity } from "lucide-react"

interface LeaderboardEntry {
  username: string
  amount: number
  badge?: string
}

interface ActivityEntry {
  username: string
  action: string
  timestamp: string
}

interface LeaderboardActivityProps {
  leaderboard: LeaderboardEntry[]
  recentActivity: ActivityEntry[]
}

export function LeaderboardActivity({ leaderboard, recentActivity }: LeaderboardActivityProps) {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 pt-0 bg-gradient-to-br">
      <motion.div {...fadeInUp}>
        <Card className="h-full border-0 shadow-md hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-t-xl">
            <CardTitle className="flex items-center text-2xl font-bold">
              <Trophy className="w-6 h-6 mr-2" />
              Top Sponsors
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <LeaderboardList leaderboard={leaderboard} />
          </CardContent>
        </Card>
      </motion.div>
      <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
        <Card className="h-full border-0 shadow-md hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white rounded-t-xl">
            <CardTitle className="flex items-center text-2xl font-bold">
              <Activity className="w-6 h-6 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ActivityList recentActivity={recentActivity} />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
