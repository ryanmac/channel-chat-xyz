// app/collab/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import ChannelSearch from '@/components/ChannelSearch';
import { useDebate } from '@/hooks/useDebate';
import { Channel } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Loader2, Merge } from "lucide-react";
import { toast } from '@/hooks/use-toast';
import { TopicSelection } from '@/components/TopicSelection';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from "@/components/ui/card";
import { FaRobot } from 'react-icons/fa';
import CollabList from '@/components/CollabList';
import Link from 'next/link';

type ChannelSearchResult = {
  id: string;
  name: string;
  title: string;
  imageUrl?: string;
  subscriberCount?: string;
};

export default function DebateInitPage() {
  const [channel1, setChannel1] = useState<Channel | null>(null);
  const [channel2, setChannel2] = useState<Channel | null>(null);
  const [topics, setTopics] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [topicsLoading, setTopicsLoading] = useState(false); // New state for topic loading
  const { initializeDebate, isLoading, error } = useDebate();
  const router = useRouter();

  const handleChannelSelect = (setChannel: React.Dispatch<React.SetStateAction<Channel | null>>) => async (searchResult: ChannelSearchResult) => {
    try {
      const response = await fetch(`/api/channel/info?channelId=${searchResult.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch channel data');
      }
      const channelData: Channel = await response.json();
      setChannel(channelData);
      // console.log('Channel selected:', channelData);
    } catch (error) {
      console.error('Error fetching full channel data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch channel data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFetchAndSelectTopic = async () => {
    if (!channel1 || !channel2) {
      return; // Prevent fetching if channels are not selected
    }
    setTopicsLoading(true); // Start loading spinner
    try {
      const response = await fetch('/api/debate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generateTopics', channelId1: channel1.id, channelId2: channel2.id }),
      });

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        toast({
          title: "No Topics Found",
          description: "Unable to fetch topics. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setTopics(data);
      // console.log('Topics set:', data);
    } catch (error) {
      console.error('Error fetching topics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch topics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTopicsLoading(false); // Stop loading spinner
    }
  };

  useEffect(() => {
    if (channel1 && channel2) {
      handleFetchAndSelectTopic();
    }
  }, [channel1, channel2]);

  const handleTopicSelect = async (topic: string) => {
    setSelectedTopic(topic);
    if (channel1 && channel2) {
      try {
        const debate = await initializeDebate(channel1.id, channel2.id, topic); // Start debate immediately
        if (debate && debate.id) {
          router.push(`/collab/${debate.id}`);
        } else {
          throw new Error('Failed to initialize debate');
        }
      } catch (error) {
        console.error('Error starting debate:', error);
        toast({
          title: "Error",
          description: "Failed to start the debate. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-center text-primary">Collab</h1>
        </div>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-20">
          {channel1 ? (
            <ChannelCard channel={channel1} />
          ) : (
            <div className="flex items-center justify-center gap-4">
              <ChannelSearch
                containerClassName="sm:w-[24rem] lg:mx-auto"
                inputClassName="h-16 text-lg"
                buttonClassName="w-16 h-16"
                onSelect={handleChannelSelect(setChannel1)}
                onlyActive={true}
              />
            </div>
          )}
          
          <div className="flex items-center justify-center">
            <Merge className="w-8 h-8 text-primary animate-pulse transform rotate-180" />
          </div>

          {channel2 ? (
            <ChannelCard channel={channel2} />
          ) : (
            <div className="flex items-center justify-center gap-4">
              <ChannelSearch
                containerClassName="sm:w-[24rem] lg:mx-auto"
                inputClassName="h-16 text-lg"
                buttonClassName="w-16 h-16"
                onSelect={handleChannelSelect(setChannel2)}
                onlyActive={true}
              />
            </div>
          )}
        </div>

        {topicsLoading && (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <FaRobot className="w-12 h-12 text-primary animate-spin" />
            <p className="text-lg font-semibold text-center">
              Generating topics...
            </p>
          </div>
        )}

        {topics.length > 0 && !selectedTopic && !topicsLoading && (
          <TopicSelection
            topics={topics}
            onSelect={handleTopicSelect}
            isLoading={isLoading}
          />
        )}
      </div>
      <div className="col-span-full flex items-center justify-center">
        <Avatar className="border-none mr-2">
          <AvatarImage src="/logomark-play2.png" alt="ChannelChat" />
          <AvatarFallback>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">C</span>
            </div>
          </AvatarFallback>
        </Avatar>
        <h2 className="text-3xl font-bold text-center text-primary">Collabs</h2>
      </div>
      <CollabList limit={6} />
      <Footer />
    </>
  );
}

function ChannelCard({ channel }: { channel: Channel }) {
  return (
    <Card className="w-full max-w-sm bg-slate-300/20 border-none shadow-2xl">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <Avatar className="w-24 h-24 mb-4 rounded-full">
            <AvatarImage src={channel.imageUrl || undefined} alt={channel.name} />
            <AvatarFallback className="text-2xl font-bold">{channel.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex items-center">
            <FaRobot className="w-8 h-8 text-gray-500 dark:text-white mr-1 pb-2" />
            <h2 className="text-2xl font-bold mb-2">{channel.name}</h2>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}