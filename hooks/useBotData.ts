// hooks/useBotData.ts
import { useState, useCallback } from 'react';
import { BotData } from '@/utils/botManagement';
import { createFetchBotInfo } from '@/utils/botManagement';

export const useBotData = (channelId: string) => {
  const [botData, setBotData] = useState<BotData>({
    tier: 'Inactive',
    isActive: false,
    boosts: [],
    embeddedTranscripts: 0,
    totalVideos: 0,
    model: 'gpt-4o-mini',
    maxTokens: 200,
    chatsCreated: 0,
    creditBalance: 0,
    maxCredits: 1000,
    botScore: 0
  });

  const fetchBotData = useCallback(async () => {
    try {
      const data = await createFetchBotInfo(channelId);
      setBotData(data);
    } catch (error) {
      console.error('Error fetching bot data:', error);
    }
  }, [channelId]);

  return { botData, fetchBotData };
};