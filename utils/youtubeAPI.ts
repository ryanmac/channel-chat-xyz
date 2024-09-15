// utils/youtubeApi.ts
import config from "@/config";
import { getChannelInfo } from '@/utils/yesService';
import { getCache, setCache } from '@/utils/cache';

export async function getYouTubeChannels(query: string) {
  const cacheKey = query.toLowerCase();
  const cachedResult = getCache(cacheKey);

  if (cachedResult) {
    return cachedResult;
  }

  const params = new URLSearchParams({
    part: 'snippet',
    type: 'channel',
    q: query,
    key: config.youtube.apiKey!,
    maxResults: '5',
  });

  try {
    const url = `${config.youtube.url}?${params.toString()}`;
    console.log('Fetching YouTube channels:', url);
    const response = await fetch(`${config.youtube.url}?${params.toString()}`);

    const channelsData = await response.json();
    const channels = await Promise.all(
      channelsData.items.map(async (item: any) => {
        const channelId = item.id.channelId;
        console.log('Channel ID:', channelId);
        console.log('item:', item);
        
        // Fetch detailed channel info to get the channel name
        const channelInfo = await getChannelInfo({ channelId });
        console.log('Channel info:', channelInfo);

        return {
          id: channelId,
          name: channelInfo.name || '', // Fetched channel name or empty if not found
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnailUrl: item.snippet.thumbnails.default.url,
        };
      })
    );

    // Cache the result using the first 6 characters of the query as the key
    // if (query.length <= 6) {
    setCache(cacheKey, channels, 7 * 24 * 60 * 60 * 1000); // 7 days
    // }

    return channels;
  } catch (error) {
    console.error('Error fetching YouTube channels:', error);
    throw error;
  }
}