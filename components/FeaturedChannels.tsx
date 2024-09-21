// components/FeaturedChannels.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Youtube, MessageCircle, Zap } from "lucide-react";
import { abbreviateNumber } from '@/utils/numberUtils';

interface Channel {
  id: string;
  name: string;
  title: string;
  avatarUrl: string;
  subscribers: string;
  chats: number;
  tokensUsed: number;
  tokensRemaining: number;
}

interface FeaturedChannelsProps {
  showStats?: boolean; // Optional prop to show or hide stats
}

export function FeaturedChannels({ showStats = true }: FeaturedChannelsProps) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    async function fetchFeaturedChannels() {
      try {
        const response = await fetch('/api/featured-channels');
        if (!response.ok) {
          throw new Error('Failed to fetch featured channels');
        }
        const data = await response.json();
        setChannels(data);
      } catch (err) {
        setError('Failed to load featured channels. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFeaturedChannels();
  }, []);

  if (isLoading) {
    return <div></div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8">
      {channels.map((channel, index) => (
        <motion.div
          key={channel.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg bg-background/50">
            <CardHeader className="p-6">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16 border-2 border-primary rounded-full">
                  <AvatarImage src={channel.avatarUrl} alt={channel.name} />
                  <AvatarFallback>{channel.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl font-bold">{channel.title}</CardTitle>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                    <Youtube className="w-4 h-4 mr-1" />
                    {abbreviateNumber(parseInt(channel.subscribers))} subscribers
                  </p>
                </div>
              </div>
            </CardHeader>
            {showStats && (
              <CardContent className="p-6 pt-0">
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <MessageCircle className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="font-medium">Chats Created</span>
                    <span className="ml-auto">{channel.chats.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Zap className="w-4 h-4 mr-2 text-green-500" />
                    <span className="font-medium">Chats Remaining</span>
                    <span className="ml-auto">{channel.tokensRemaining.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            )}
            <CardFooter className="p-6 pt-0">
              <Link href={`/channel/@${channel.name.replace(/\s+/g, '-').toLowerCase()}`} passHref className="w-full">
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Chat Now
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}