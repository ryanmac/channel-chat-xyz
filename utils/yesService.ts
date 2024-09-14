// utils/yesService.ts
import prisma from "@/lib/prisma";
import config from "@/config";
import { setCache, getCache, deleteCache } from '@/utils/cache';
import { getOrCreateChannel, updateChannelMetrics, ChannelData } from '@/utils/channelManagement';

const YES_URL = config.yes.url;
const YES_API_KEY = config.yes.apiKey;

async function fetchFromYES(
  endpoint: string,
  method: 'GET' | 'POST',
  params?: Record<string, any>,
  body?: any
) {
  const url = new URL(endpoint, YES_URL);

  // Append parameters to the URL if provided
  if (params) {
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  }

  // Define headers as a Record type to allow dynamic access
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${YES_API_KEY}`,
    'Content-Type': 'application/json'
  };

  console.log(`Sending request to YES API: ${method} ${url.toString()}`);
  console.log('Request params:', params);
  console.log('Request body:', body);

  try {
    const fetchOptions = {
      method: method,
      headers: headers,
      body: method === 'POST' && body ? JSON.stringify(body) : undefined, // Ensure body is only sent with POST
    };

    // Construct the curl command for debugging
    const curlCommand = `curl -X ${method} "${url.toString()}" \\\n` +
      Object.entries(headers)
        .map(([key, value]) => `-H "${key}: ${value}"`)
        .join(" \\\n") +
      (body ? ` -d '${JSON.stringify(body)}'` : '');

    console.log(curlCommand); // Log the curl command

    const response = await fetch(url.toString(), fetchOptions);

    const responseData = await response.json();

    if (!response.ok) {
      console.error('YES API error details:', responseData);
      throw new Error(`YES API error: ${response.status} ${response.statusText}. Details: ${JSON.stringify(responseData)}`);
    }

    return responseData;
  } catch (error) {
    console.error('Error in fetchFromYES:', error);
    throw error;
  }
}

export async function getChannelInfo(options: { channelId?: string; channelName?: string; channelUrl?: string; }) {
  const { channelId, channelName, channelUrl } = options;

  console.log('yesService: getChannelInfo');
  const cacheKey = `channel_info_${channelId || channelName || channelUrl}`; // Unique cache key for channel info
  const cachedData = getCache(cacheKey); // Check cache for existing data

  if (cachedData) {
    return cachedData; // Return cached data if available
  }

  try {
    console.log(`Fetching channel info for ${channelId || channelName || channelUrl}`);

    if (!channelId && !channelName && !channelUrl) {
      throw new Error('At least one of channelId, channelName, or channelUrl must be provided.');
    }

    const params: Record<string, string> = {};
    if (channelId) {
      params['channel_id'] = channelId;
    } else if (channelName) {
      params['channel_name'] = channelName;
    } else if (channelUrl) {
      params['channel_url'] = channelUrl;
    }

    const channelInfo: ChannelData = await fetchFromYES('/channel_info', 'GET', params);

    // Create or update the channel record
    const channel = await getOrCreateChannel(channelInfo);

    // Update the channel metrics
    await updateChannelMetrics(channel.id, channelInfo.total_embeddings, channelInfo.unique_video_count);

    setCache(cacheKey, channelInfo, 600000); // Cache the result for 10 minutes
    return channelInfo; // Return the fetched data
  } catch (error) {
    console.error('Error fetching channel info:', error);
    throw error;
  }
}

export async function refreshChannelInfo(options: { channelId?: string; channelName?: string; channelUrl?: string; }) {
  const { channelId, channelName, channelUrl } = options;
  const cacheKey = `channel_info_${channelId || channelName || channelUrl}`; // Unique cache key
  deleteCache(cacheKey); // Delete the cache entry to force a refresh
  return await getChannelInfo(options); // Fetch the data again
}

export async function refreshChannelMetadata(options: { channelId?: string; channelName?: string; channelUrl?: string; }) {
  const { channelId, channelName, channelUrl } = options;

  try {
    if (!channelId && !channelName && !channelUrl) {
      throw new Error('At least one of channelId, channelName, or channelUrl must be provided.');
    }

    const params: Record<string, string> = {};
    if (channelId) {
      params['channel_id'] = channelId;
    } else if (channelName) {
      params['channel_name'] = channelName;
    } else if (channelUrl) {
      params['channel_url'] = channelUrl;
    }

    return await fetchFromYES('/refresh_channel_metadata', 'POST', params);
  } catch (error) {
    console.error('Error refreshing channel metadata:', error);
    throw error;
  }
}

export async function processChannel(channelId: string, videoLimit: number = 20) {
  try {
    console.log(`Processing channel: ${channelId}, videoLimit: ${videoLimit}`);

    const requestBody: any = {
      channel_id: channelId,
      video_limit: videoLimit
    };

    const response = await fetchFromYES('/process_channel', 'POST', undefined, requestBody);

    // Start polling for job status
    let jobStatus = await getJobStatus(response.job_id);
    while (jobStatus.status !== 'SUCCESS' && jobStatus.status !== 'FAILED') {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      jobStatus = await getJobStatus(response.job_id);
    }

    if (jobStatus.status === 'FAILED') {
      throw new Error(`Channel processing failed: ${jobStatus.error}`);
    }

    return jobStatus;
  } catch (error) {
    console.error('Error processing channel:', error);
    throw error;
  }
}

export async function processChannelAsync(channelId: string, channelName: string, totalFunding: number) {
  console.log(`Starting async processing for channel ${channelName} (${channelId}) with total funding: $${totalFunding}`);

  try {
    const videoLimit = Math.floor(totalFunding * 10); // Assuming 10 videos per dollar
    console.log(`Processing @${channelName} with video limit: ${videoLimit}`);

    // Update channel status to processing
    await prisma.channel.update({
      where: { id: channelId },
      data: { isProcessing: true },
    });
    console.log(`Channel ${channelName} (${channelId}) set to processing`);

    // Process the channel
    const jobStatus = await processChannel(channelId, videoLimit);
    console.log(`YES processing completed for channel ${channelId}. Job status:`, jobStatus);

    // Fetch updated channel info
    const updatedChannelInfo = await getChannelInfo({ channelId });
    console.log(`Updated channel info:`, updatedChannelInfo);

    // Update channel status to active and update metrics
    await prisma.channel.update({
      where: { id: channelId },
      data: {
        status: 'ACTIVE',
        isProcessing: false,
        totalEmbeddings: updatedChannelInfo.total_embeddings,
        totalVideos: updatedChannelInfo.unique_video_count,
      },
    });
    console.log(`Channel ${channelName} (${channelId}) activated and metrics updated`);

    // Invalidate cache for this channel
    const cacheKey = `channel_info_${channelId}`;
    deleteCache(cacheKey);
    console.log(`Cache invalidated for channel ${channelName}`);

  } catch (error) {
    console.error(`Error processing channel ${channelName} (${channelId}):`, error);

    // Update channel status to reflect the error
    await prisma.channel.update({
      where: { id: channelId },
      data: { isProcessing: false },
    });
    console.log(`Channel ${channelName} (${channelId}) processing failed, isProcessing set to false`);
  }
}

export async function getJobStatus(jobId: string) {
  try {
    return await fetchFromYES(`/job_status/${jobId}`, 'GET');
  } catch (error) {
    console.error('Error fetching job status:', error);
    throw error;
  }
}

export async function getRelevantChunks(query: string, channelId: string, chunkLimit: number = 5, contextWindow: number = 1) {
  try {
    return await fetchFromYES('/relevant_chunks', 'GET', {
      query,
      channel_id: channelId,
      chunk_limit: chunkLimit,
      context_window: contextWindow,
    });
  } catch (error) {
    console.error('Error fetching relevant chunks:', error);
    throw error;
  }
}