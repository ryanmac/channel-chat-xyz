// app/api/channel/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCache, setCache } from '@/utils/cache';

// Set cache time-to-live (TTL) in seconds, e.g., 10 minutes
const CACHE_TTL = 600;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim().replace('@', '').replace('%40', '');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  // Create a cache key based on the query to avoid cache collisions
  const cacheKey = `channel_search_${query}`;

  const cachedData = getCache(cacheKey);
  if (cachedData) {
    console.log(`Returning cached search results for query: ${query}`);
    return NextResponse.json(cachedData);
  }

  try {
    console.log(`Cache miss for query: ${query}. Fetching from the database...`);

    // Query the database for matching channels (optimize for speed)
    const channels = await prisma.channel.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { title: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        title: true,
        imageUrl: true,
        subscriberCount: true
      },
      take: 10 // Limit results to avoid overload
    });

    // Cache the search results
    // revalidateTag(cacheKey, channels, CACHE_TTL);
    setCache(cacheKey, channels, CACHE_TTL);

    return NextResponse.json(channels);
  } catch (error) {
    console.error('Error fetching channel search results:', error);
    return NextResponse.json({ error: 'Failed to fetch channel search results' }, { status: 500 });
  }
}