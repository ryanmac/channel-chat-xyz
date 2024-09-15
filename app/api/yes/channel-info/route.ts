// app/api/yes/channel-info/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getChannelInfo } from '@/utils/yesService';

export async function GET(request: NextRequest) {
  const channelUrl = request.nextUrl.searchParams.get('channel_url');
  const channelName = request.nextUrl.searchParams.get('channel_name');
  const channelId = request.nextUrl.searchParams.get('channel_id');

  if (!channelUrl && !channelName && !channelId) {
    return NextResponse.json({ error: 'Missing channel_url, channel_name, or channel_id parameter' }, { status: 400 });
  }

  try {
    const data = await getChannelInfo({
      channelUrl: channelUrl || undefined,
      channelName: channelName || undefined,
      channelId: channelId || undefined, // Pass channelId to the function
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching channel info:', error);
    return NextResponse.json({ error: 'Failed to fetch channel info' }, { status: 500 });
  }
}