// components/LeaderboardActivity.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeaderboardList } from "@/components/LeaderboardList";
import { ActivityList } from "@/components/ActivityList";
import { Trophy, Activity } from "lucide-react";
import { ChannelData } from '@/utils/channelManagement';

interface LeaderboardEntry {
  user: {
    username: string;
    image?: string | null;
  };
  totalAmount: number;
  totalChatsSponsored: number;
}

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

interface LeaderboardActivityProps {
  channelData: ChannelData;
}

export function LeaderboardActivity({ channelData }: LeaderboardActivityProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/channel/leaderboard?channelId=${channelData.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard data');
        }
        const data = await response.json();
        setLeaderboard(data.leaderboard);
        setRecentActivity(data.recentActivity);
      } catch (err) {
        setError('Failed to load leaderboard data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [channelData.id]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 pt-0 bg-gradient-to-br">
      {/* Top Sponsors Section */}
      <div>
        <Card className="h-full border-0 shadow-md hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="text-gray-700 dark:text-white rounded-t-xl">
            <CardTitle className="flex items-center text-xl font-bold">
              <Trophy className="w-6 h-6 mr-2" />
              Top Sponsors
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6">
            {leaderboard.length > 0 ? (
              <LeaderboardList leaderboard={leaderboard} />
            ) : (
              <p className="text-center text-gray-500">Be the first to sponsor this channel!</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <div>
        <Card className="h-full border-0 shadow-md hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="text-gray-700 dark:text-white rounded-t-xl">
            <CardTitle className="flex items-center text-xl font-bold">
              <Activity className="w-6 h-6 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6">
            {recentActivity.length > 0 ? (
              <ActivityList recentActivity={recentActivity} />
            ) : (
              <p className="text-center text-gray-500">Be the first to sponsor this channel!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}