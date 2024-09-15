// hooks/useChannelData.ts
import { useState, useCallback } from 'react';
import { ChannelData } from '@/utils/channelManagement';
import { createFetchChannelData } from '@/utils/channelManagement';

export const useChannelData = (channelName: string) => {
  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChannelData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await createFetchChannelData(channelName);
      setChannelData(data);
    } catch (err) {
      setError('Failed to load channel data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [channelName]);

  return { channelData, isLoading, error, fetchChannelData };
};
