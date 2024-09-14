// utils/channelManagement.ts
import prisma from '@/lib/prisma'

export interface ChannelData {
  channel_id: string;
  unique_video_count: number;
  total_embeddings: number;
  metadata: {
    snippet: {
      title: string;
      description: string;
      thumbnails: {
        default: { url: string };
        high: { url: string };
      };
      customUrl: string;
      localized: {
        title: '404 Title',
        description: '404 Description',
      },
      country: 'USA',
    };
    statistics: {
      subscriberCount: string;
      viewCount: string;
      videoCount: string;
    };
    brandingSettings: {
      image: {
        bannerExternalUrl: string;
      };
    };
  };
}

export async function getOrCreateChannel(channelData: ChannelData) {
  const { channel_id, metadata } = channelData;

  let channel = await prisma.channel.findUnique({ where: { id: channel_id } });

  if (!channel) {
    console.log(`Channel ${channel_id} not found. Creating new channel record.`);
    channel = await prisma.channel.create({
      data: {
        id: channel_id,
        name: metadata.snippet.customUrl.replace('@', ''),
        title: metadata.snippet.title,
        description: metadata.snippet.description,
        subscriberCount: (parseInt(metadata.statistics.subscriberCount) || 0).toString(), // Convert to string
        videoCount: (parseInt(metadata.statistics.videoCount) || 0).toString(), // Convert to string
        viewCount: (parseInt(metadata.statistics.viewCount) || 0).toString(), // Convert to string
        imageUrl: metadata.snippet.thumbnails.high.url,
        bannerUrl: metadata.brandingSettings.image.bannerExternalUrl,
        status: 'PENDING',
        totalEmbeddings: channelData.total_embeddings,
        totalVideos: channelData.unique_video_count,
      },
    });
  } else {
    console.log(`Updating existing channel ${channel_id}`);
    channel = await prisma.channel.update({
      where: { id: channel_id },
      data: {
        name: metadata.snippet.customUrl.replace('@', ''),
        title: metadata.snippet.title,
        description: metadata.snippet.description,
        subscriberCount: (parseInt(metadata.statistics.subscriberCount) || 0).toString(), // Convert to string
        videoCount: (parseInt(metadata.statistics.videoCount) || 0).toString(), // Convert to string
        viewCount: (parseInt(metadata.statistics.viewCount) || 0).toString(), // Convert to string
        imageUrl: metadata.snippet.thumbnails.high.url,
        bannerUrl: metadata.brandingSettings.image.bannerExternalUrl,
        totalEmbeddings: channelData.total_embeddings,
        totalVideos: channelData.unique_video_count,
      },
    });
  }

  return channel;
}

export async function updateChannelMetrics(channelId: string, totalEmbeddings: number, totalVideos: number) {
  return prisma.channel.update({
    where: { id: channelId },
    data: {
      totalEmbeddings,
      totalVideos,
    },
  });
}