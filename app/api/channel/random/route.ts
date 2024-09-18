// app/api/random/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCache, setCache } from '@/utils/cache';

// Set cache time-to-live (TTL) in seconds, e.g., 10 minutes
const CACHE_TTL = 600;

export async function GET(request: NextRequest) {
  // Define a cache key for the random featured channel
  const cacheKey = 'random_featured_channel';

  // Attempt to retrieve the cached data
  const cachedData = getCache(cacheKey);
  if (cachedData) {
    console.log('Returning cached random featured channel');
    return NextResponse.json(cachedData);
  }

  try {
    console.log('Cache miss. Fetching random featured channel from the database...');

    // Query to find all featured channels
    const featuredChannels = await prisma.channel.findMany({
      where: {
        featured: true
      },
      select: {
        id: true,
        name: true,
        title: true,
        imageUrl: true,
        totalVideos: true,
        interests: true,
        subscriberCount: true
      }
    });

    // If no featured channels are found, return an error
    if (featuredChannels.length === 0) {
      return NextResponse.json({ error: 'No featured channels found' }, { status: 404 });
    }

    // Select one random channel from the list of featured channels
    const randomChannel = featuredChannels[Math.floor(Math.random() * featuredChannels.length)];

    // Cache the selected random channel
    setCache(cacheKey, randomChannel, CACHE_TTL);

    return NextResponse.json(randomChannel);
  } catch (error) {
    console.error('Error fetching random featured channel:', error);
    return NextResponse.json({ error: 'Failed to fetch random featured channel' }, { status: 500 });
  }
}