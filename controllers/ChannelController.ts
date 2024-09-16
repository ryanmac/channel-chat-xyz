// controllers/ChannelController.ts
/**
 * This file contains the ChannelController class
 * This class is used to handle all channel-related operations
 * This class is used by the admin channels API route
 * This class is used by the admin dashboard to display all channels
 * This class is used by the admin dashboard to search for channels
 */

import prisma from "@/lib/prisma";
import { Channel, Prisma } from "@prisma/client";

interface GetAllChannelsOptions {
  search?: string;
  sort?: string;
  direction?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

interface SerializedChannel {
  id: string;
  name: string;
  imageUrl: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  activationFunding: number;
  activationGoal: number;
  creditBalance: number;
  totalEmbeddings: number;
  totalVideos: number;
  maxTokens: number;
  chatsCreated: number;
  botScore: number;
  isProcessing: boolean;
  status: string;
  interests: string;
  featured: boolean;
}

export default class ChannelController {
  async getAllChannels(
    options: GetAllChannelsOptions = {}
  ): Promise<{ channels: SerializedChannel[]; totalPages: number }> {
    const { search, sort, direction, page = 1, pageSize = 10 } = options;

    // Build the 'where' clause for filtering
    const whereClause: Prisma.ChannelWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { id: { contains: search, mode: Prisma.QueryMode.insensitive } },
            // Add other fields if needed
          ],
        }
      : {};

    // Validate sort field
    const allowedSortFields = [
      'name',
      'subscriberCount',
      'videoCount',
      'activationFunding',
      'creditBalance',
      'totalEmbeddings',
      'totalVideos',
      'chatsCreated',
      'status',
      'featured',
      // Add other allowed fields here
    ];

    // Build the 'orderBy' clause for sorting
    let orderByClause: Prisma.ChannelOrderByWithRelationInput | undefined;
    if (sort && allowedSortFields.includes(sort)) {
      orderByClause = {
        [sort]: direction === 'desc' ? 'desc' : 'asc',
      };
    }

    // Calculate pagination
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // Fetch total count for pagination
    const totalChannels = await prisma.channel.count({
      where: whereClause,
    });
    const totalPages = Math.ceil(totalChannels / pageSize);

    // Fetch channels with filtering, sorting, and pagination
    const channels = await prisma.channel.findMany({
      where: whereClause,
      orderBy: orderByClause,
      skip,
      take,
      select: {
        id: true,
        name: true,
        imageUrl: true,
        subscriberCount: true,
        videoCount: true,
        viewCount: true,
        activationFunding: true,
        activationGoal: true,
        creditBalance: true,
        totalEmbeddings: true,
        totalVideos: true,
        maxTokens: true,
        chatsCreated: true,
        botScore: true,
        isProcessing: true,
        status: true,
        interests: true,
        featured: true,
        // Include any other fields you need
      },
    });

    return {
      channels: channels.map(this.serializeChannel),
      totalPages,
    };
  }

  async getChannelById(channelId: string): Promise<Channel | null> {
    return prisma.channel.findUnique({
      where: { id: channelId },
    });
  }

  async getChannelByName(channelName: string): Promise<Channel | null> {
    return prisma.channel.findUnique({
      where: { name: channelName },
    });
  }

  private serializeChannel(channel: any): SerializedChannel {
    return {
      id: channel.id,
      name: channel.name,
      imageUrl: channel.imageUrl,
      subscriberCount: channel.subscriberCount ? channel.subscriberCount.toString() : null,
      videoCount: channel.videoCount ? channel.videoCount.toString() : null,
      viewCount: channel.viewCount ? channel.viewCount.toString() : null,
      activationFunding: channel.activationFunding ? channel.activationFunding.toString() : null,
      activationGoal: channel.activationGoal ? channel.activationGoal.toString() : null,
      creditBalance: channel.creditBalance ? channel.creditBalance.toString() : null,
      totalEmbeddings: channel.totalEmbeddings ? channel.totalEmbeddings.toString() : null,
      totalVideos: channel.totalVideos ? channel.totalVideos.toString() : null,
      maxTokens: channel.maxTokens ? channel.maxTokens.toString() : null,
      chatsCreated: channel.chatsCreated ? channel.chatsCreated.toString() : null,
      botScore: channel.botScore ? channel.botScore.toString() : null,
      isProcessing: channel.isProcessing,
      status: channel.status,
      interests: channel.interests,
      featured: channel.featured,
    };
  }
}