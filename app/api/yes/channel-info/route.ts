// app/api/yes/channel-info/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getChannelInfo } from '@/utils/yesService';

export async function GET(request: NextRequest) {
  const channelUrl = request.nextUrl.searchParams.get('channel_url');

  if (!channelUrl) {
    return NextResponse.json({ error: 'Missing channel_url parameter' }, { status: 400 });
  }

  try {
    const data = await getChannelInfo(channelUrl);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching channel info:', error);
    return NextResponse.json({ error: 'Failed to fetch channel info' }, { status: 500 });
  }
}