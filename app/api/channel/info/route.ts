// app/api/channel/info/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCache, setCache } from '@/utils/cache';

// Set cache time-to-live (TTL) in seconds, e.g., 10 minutes
const CACHE_TTL = 600;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const channelName = searchParams.get('channelName')?.trim().replace('@', '').replace('%40', '');
  const channelId = searchParams.get('channelId')?.trim();

  if (!channelName && !channelId) {
    return NextResponse.json({ error: 'Either "channelName" or "channelId" is required' }, { status: 400 });
  }

  // Create a cache key based on the provided identifier (channelName or channelId)
  const cacheKey = `channel_info_${channelId ?? channelName}`;

  // Try fetching from cache first
  const cachedData = getCache(cacheKey);
  if (cachedData) {
    console.log(`Returning cached data for ${channelId ? `channelId: ${channelId}` : `channelName: ${channelName}`}`);
    return NextResponse.json(cachedData);
  }

  try {
    console.log(`Cache miss. Fetching full channel data from the database...`);

    // Query the database for the channel using either channelId or channelName
    const channel = await prisma.channel.findUnique({
      where: channelId
        ? { id: channelId }
        : { name: channelName },
      select: {
        id: true,
        name: true,
        title: true,
        description: true,
        subscriberCount: true,
        videoCount: true,
        viewCount: true,
        imageUrl: true,
        bannerUrl: true,
        status: true,
        activationFunding: true,
        activationGoal: true,
        creditBalance: true,
        isProcessing: true,
        totalEmbeddings: true,
        totalVideos: true,
        model: true,
        maxTokens: true,
        chatsCreated: true,
        isFineTuned: true,
        botScore: true,
        createdAt: true,
        updatedAt: true,
        featured: true,
        interests: true
      }
    });

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    // Cache the channel data
    setCache(cacheKey, channel, CACHE_TTL);

    return NextResponse.json(channel);
  } catch (error) {
    console.error('Error fetching channel data:', error);
    return NextResponse.json({ error: 'Failed to fetch channel data' }, { status: 500 });
  }
}