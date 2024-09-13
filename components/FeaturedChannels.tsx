// components/FeaturedChannels.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Youtube, MessageCircle, Zap } from "lucide-react";

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

export function FeaturedChannels() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
    // return <div>Loading...</div>;
    return <div></div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const abbreviateNumber = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toLocaleString();
  }

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container px-4 md:px-6">
        <motion.h2 
          className="text-4xl font-bold text-center mb-12 text-gray-800 dark:text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Featured Channels
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {channels.map((channel, index) => (
            <motion.div
              key={channel.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="p-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-16 h-16 border-2 border-primary">
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
                <CardContent className="p-6 pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <MessageCircle className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="font-medium">Chats:</span>
                      <span className="ml-auto">{channel.chats.toLocaleString()}</span>
                    </div>
                    {/* <div className="flex items-center text-sm">
                      <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                      <span className="font-medium">Tokens Used:</span>
                      <span className="ml-auto">{channel.tokensUsed.toLocaleString()}</span>
                    </div> */}
                    <div className="flex items-center text-sm">
                      <Zap className="w-4 h-4 mr-2 text-green-500" />
                      <span className="font-medium">Chats Remaining:</span>
                      <span className="ml-auto">{channel.tokensRemaining.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
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
      </div>
    </section>
  );
}