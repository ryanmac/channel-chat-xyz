// components/FeaturedChatInterface.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { ChatInterface } from './ChatInterface';
import { ChannelData } from '@/utils/channelManagement';
import { Spinner } from '@/components/ui/spinner';
import { FaRobot } from 'react-icons/fa6';
import { defaultChannelData } from '@/constants/channelData';

export const FeaturedChatInterface: React.FC = () => {
  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRandomChannel = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/channel/random');
        if (!response.ok) {
          throw new Error(`Failed to fetch random featured channel: ${response.status} ${response.statusText}`);
        }
        const data: ChannelData = await response.json();
        setChannelData(data);
      } catch (error) {
        console.error('Error fetching random featured channel:', error);
        setError('Failed to load random channel data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRandomChannel();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-400/50 dark:bg-gray-900/50 rounded-xl shadow-2xl">
        <div className="flex flex-col items-center space-y-4">
          <FaRobot className="w-16 h-16 text-gray-500 dark:text-white animate-spin" />
          <div className="flex items-center space-x-2">
            <span className="text-2xl mr-2">Loading random</span>
            <FaRobot className="w-8 h-8 text-gray-500 dark:text-white" />
            <span className="text-2xl ml-0">chat...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <ChatInterface
      channelData={channelData || defaultChannelData}
      showMaximize={true}
    />
  );
};