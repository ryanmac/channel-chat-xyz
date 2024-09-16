// utils/channelManagement.ts
import prisma from '@/lib/prisma'
import { ChannelStatus } from '@prisma/client';
import { fetchFromYES } from '@/utils/yesService';

export interface ChannelMetadata {
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

export interface ApiData {
  channel_id: string;
  unique_video_count: number;
  total_embeddings: number;
  metadata: ChannelMetadata;
}

export interface ChannelData {
  id: string;
  name: string;
  title: string; // Ensure type is string, not null
  description: string; // Ensure type is string, not null
  subscriberCount: string;
  videoCount: string;
  viewCount: string;
  imageUrl: string;
  bannerUrl: string;
  status: ChannelStatus;
  activationFunding: number;
  activationGoal: number;
  creditBalance: number;
  isProcessing: boolean;
  totalEmbeddings: number;
  totalVideos: number;
  model: string;
  maxTokens: number;
  chatsCreated: number;
  isFineTuned: boolean;
  interests: string;
  metadata: ChannelMetadata;
}

export async function fetchAndMergeChannelData(options: { channelId?: string; channelName?: string; channelUrl?: string; }) {
  const { channelId, channelName, channelUrl } = options;

  if (!channelId && !channelName && !channelUrl) {
    throw new Error('At least one of channelId, channelName, or channelUrl must be provided.');
  }

  // Fetch data from the API
  const params: Record<string, string> = {};
  if (channelId) {
    params['channel_id'] = channelId;
  } else if (channelName) {
    params['channel_name'] = channelName;
  } else if (channelUrl) {
    params['channel_url'] = channelUrl;
  }

  const apiData: ApiData = await fetchFromYES('/channel_info', 'GET', params);
  
  if (!apiData) {
    throw new Error('Failed to fetch channel data');
  }

  // Extract necessary fields from API response
  const { 
    channel_id, 
    unique_video_count, 
    total_embeddings, 
    metadata 
  } = apiData;

  const {
    snippet, 
    statistics, 
    brandingSettings 
  } = metadata;

  // Ensure we have an ID or Name for the Prisma query
  let channel = await prisma.channel.findUnique({
    where: { id: channel_id }
  });

  if (!channel) {
    console.log(`Channel ${channel_id} not found in DB. Creating new channel.`);
    channel = await prisma.channel.create({
      data: {
        id: channel_id,
        name: snippet.customUrl.replace('@', ''),
        title: snippet.title || '', 
        description: snippet.description || '', 
        subscriberCount: statistics.subscriberCount || '0',
        videoCount: statistics.videoCount || '0',
        viewCount: statistics.viewCount || '0',
        imageUrl: snippet.thumbnails.default.url,
        bannerUrl: brandingSettings.image.bannerExternalUrl || '',
        status: 'PENDING', // Set a default status; adjust as needed
        activationFunding: 0, // Default to 0; adjust as needed
        activationGoal: 10, // Default goal; adjust as needed
        creditBalance: 0, // Default credit balance; adjust as needed
        isProcessing: false, // Default to false; adjust as needed
        totalEmbeddings: total_embeddings || 0,
        totalVideos: unique_video_count || 0,
        model: 'gpt-4o-mini', // Default model; adjust as needed
        maxTokens: 200, // Default token count; adjust as needed
        chatsCreated: 0, // Default chats created; adjust as needed
        isFineTuned: false, // Default to false; adjust as needed
        interests: '', // Default to empty string; adjust as needed
      },
    });
  } else {
    channel = await prisma.channel.update({
      where: { id: channel_id },
      data: {
        name: snippet.customUrl.replace('@', ''), // Update name to customUrl
        title: snippet.title || '', 
        description: snippet.description || '', 
        subscriberCount: statistics.subscriberCount || '0',
        videoCount: statistics.videoCount || '0',
        viewCount: statistics.viewCount || '0',
        imageUrl: snippet.thumbnails.default.url,
        bannerUrl: brandingSettings.image.bannerExternalUrl || '',
        totalEmbeddings: total_embeddings,
        totalVideos: unique_video_count,
        model: channel.model, // Keep the model consistent
        maxTokens: channel.maxTokens, // Keep the maxTokens consistent
        isFineTuned: channel.isFineTuned, // Keep fine-tuning status consistent
        interests: channel.interests, // Update interests as necessary
        status: channel.status, // Update status as necessary
      },
    });
  }

  // Merge API and DB data
  const mergedData: ChannelData = {
    id: channel_id,
    name: snippet.customUrl.replace('@', '') || channel.name, // Use customUrl or fallback to DB name
    title: snippet.title || channel.title || '', 
    description: snippet.description || channel.description || '', 
    subscriberCount: statistics.subscriberCount || channel.subscriberCount || '0',
    videoCount: statistics.videoCount || channel.videoCount || '0',
    viewCount: statistics.viewCount || channel.viewCount || '0',
    imageUrl: snippet.thumbnails.default.url || channel.imageUrl || '',
    bannerUrl: brandingSettings.image.bannerExternalUrl || channel.bannerUrl || '',
    status: channel.status || 'PENDING',
    activationFunding: channel.activationFunding || 0,
    activationGoal: channel.activationGoal || 10,
    creditBalance: channel.creditBalance || 0,
    isProcessing: channel.isProcessing || false,
    totalEmbeddings: total_embeddings || channel.totalEmbeddings || 0,
    totalVideos: unique_video_count || channel.totalVideos || 0,
    model: channel.model || 'gpt-4o-mini', // Keep model consistent
    maxTokens: channel.maxTokens || 200, // Keep maxTokens consistent
    chatsCreated: channel.chatsCreated || 0,
    isFineTuned: channel.isFineTuned, // Keep fine-tuning status consistent
    interests: channel.interests || '', // Update interests as necessary
    metadata: metadata
  };

  return mergedData;
}

export async function getOrCreateChannel(channelData: ChannelData) {
  // Update to utilize fetchAndMergeChannelData for unified fetching/creating logic
  return await fetchAndMergeChannelData({ channelId: channelData.id });
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

export const createFetchChannelData = async (channelName: string): Promise<ChannelData> => {
  const response = await fetch(`/api/yes/channel-info?channel_name=${channelName}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch channel data: ${response.status} ${response.statusText}`);
  }
  const channelInfo = await response.json();
  return channelInfo;
};