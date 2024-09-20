// components/CommunitySupport.tsx
'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from 'next/link'

interface Channel {
  id: string;
  name: string;
  title: string;
  imageUrl: string;
  activationFunding: number;
  activationGoal: number;
}

export function CommunitySupport() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChannels() {
      try {
        const response = await fetch('/api/community-support');
        if (!response.ok) {
          throw new Error('Failed to fetch channels');
        }
        const data = await response.json();
        setChannels(data);
      } catch (err) {
        setError('Failed to load channels. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchChannels();
  }, []);

  if (isLoading) {
    // return <div>Loading...</div>;
    return <div></div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <section className="py-12">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-bold text-center mb-8">Activate a Channel</h2>
        <div className="max-w-3xl mx-auto space-y-6">
          <p className="text-center text-gray-600 dark:text-gray-300">
            Help keep our AI-powered chatbots running by sponsoring channels.
          </p>
          <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Channel Funding Progress</h3>
            <div className="space-y-4">
              {channels.map((channel) => (
                <Link key={channel.id} href={`/channel/@${channel.name}`} className="block transform transition-transform duration-200 hover:scale-105">
                  <div className="flex items-start space-x-4">
                    {/* Avatar on the left */}
                    <Avatar className="h-12 w-12 border-4 border-primary/20 rounded-full">
                      <AvatarImage src={channel.imageUrl || ""} alt={channel.name || ""} />
                      <AvatarFallback className="text-4xl">
                        {channel.name ? channel.name[0] : "U"}
                      </AvatarFallback>
                    </Avatar>

                    {/* Channel info and progress bar */}
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        {/* Channel Name */}
                        <span className="text-sm font-medium">{channel.name}</span>

                        {/* Percentage on the right */}
                        <span className="text-sm font-medium">
                          {Math.round((channel.activationFunding / channel.activationGoal) * 100)}%
                        </span>
                      </div>

                      {/* Progress Bar Below */}
                      <Progress
                        value={(channel.activationFunding / channel.activationGoal) * 100}
                        className="w-full"
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}