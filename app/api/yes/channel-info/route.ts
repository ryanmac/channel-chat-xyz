// app/api/yes/channel-info/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getChannelInfo } from '@/utils/yesService';

console.log('Channel info route loaded');

export async function GET(request: NextRequest) {
  const channelUrl = request.nextUrl.searchParams.get('channel_url');
  console.log('Channel URL:', channelUrl);
  const channelName = request.nextUrl.searchParams.get('channel_name');
  console.log('Channel Name:', channelName);

  if (!channelUrl && !channelName) {
    return NextResponse.json({ error: 'Missing channel_url or channel_name parameter' }, { status: 400 });
  }

  try {
    const data = await getChannelInfo({ channelUrl: channelUrl || undefined, channelName: channelName || undefined });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching channel info:', error);
    return NextResponse.json({ error: 'Failed to fetch channel info' }, { status: 500 });
  }
}