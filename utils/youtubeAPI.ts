// utils/youtubeApi.ts
import axios from 'axios';
import config from "@/config";
import { setCache, getCache, deleteCache } from '@/utils/cache';
// import { LRUCache } from 'lru-cache';

const YOUTUBE_API_KEY = config.yes.YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

export async function getYouTubeChannels(query: string) {
  const cacheKey = query.slice(0, 6).toLowerCase();
  const cachedResult = getCache(cacheKey);

  if (cachedResult) {
    return cachedResult;
  }

  const params = new URLSearchParams({
    part: 'snippet',
    type: 'channel',
    q: query,
    key: YOUTUBE_API_KEY!,
    maxResults: '5',
  });

  try {
    const response = await axios.get(`${YOUTUBE_API_URL}?${params.toString()}`);
    const channels = response.data.items.map((item: any) => ({
      id: item.id.channelId,
      name: item.snippet.channelTitle,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnailUrl: item.snippet.thumbnails.default.url,
    }));

    // Cache the result using the first 6 characters of the query as the key
    cache.set(cacheKey, channels);

    return channels;
  } catch (error) {
    console.error('Error fetching YouTube channels:', error);
    throw error;
  }
}