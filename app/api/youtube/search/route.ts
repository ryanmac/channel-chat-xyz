// app/api/youtube/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getYouTubeChannels } from '@/utils/youtubeApi';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const channels = await getYouTubeChannels(query);
    return NextResponse.json(channels);
  } catch (error) {
    console.error('Error searching YouTube channels:', error);
    return NextResponse.json({ error: 'An error occurred while searching channels' }, { status: 500 });
  }
}