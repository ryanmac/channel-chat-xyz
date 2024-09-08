// utils/yesService.ts
import prisma from "@/lib/prisma";
const YES_URL = process.env.YOUTUBE_EXTRACTION_SERVICE_URL;
const YES_API_KEY = process.env.YOUTUBE_EXTRACTION_SERVICE_API_KEY;

async function fetchFromYES(endpoint: string, method: 'GET' | 'POST', params?: any, body?: any) {
  const url = new URL(endpoint, YES_URL);
  if (params) {
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  }

  console.log(`Sending request to YES API: ${method} ${url.toString()}`);
  console.log('Request params:', params);
  console.log('Request body:', body);

  try {
    const response = await fetch(url.toString(), {
      method,
      headers: {
        // 'Authorization': `Bearer ${YES_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: method === 'POST' && body ? JSON.stringify(body) : undefined,  // Ensure body is only sent with POST and is not undefined
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('YES API error details:', responseData);
      throw new Error(`YES API error: ${response.status} ${response.statusText}. Details: ${JSON.stringify(responseData)}`);
    }

    // console.log('YES API response:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error in fetchFromYES:', error);
    throw error;
  }
}

export async function getChannelInfo(channelUrl: string) {
  try {
    return await fetchFromYES('/channel_info', 'GET', { channel_url: channelUrl });
  } catch (error) {
    console.error('Error fetching channel info:', error);
    throw error;
  }
}

export async function refreshChannelMetadata(channelUrl: string) {
  try {
    return await fetchFromYES('/refresh_channel_metadata', 'POST', { channel_url: channelUrl });
  } catch (error) {
    console.error('Error refreshing channel metadata:', error);
    throw error;
  }
}

export async function processChannel(channelId?: string, channelUrl?: string, videoLimit: number = 20) {
  try {
    console.log(`Processing channel: ${channelId}, ${channelUrl}, videoLimit: ${videoLimit}`);

    // Validate at least one of channelId or channelUrl is provided
    if (!channelId && !channelUrl) {
      throw new Error("Either channelId or channelUrl must be provided.");
    }

    // Ensure the request body is formatted correctly based on the provided parameters
    const requestBody: any = {
      video_limit: videoLimit
    };

    // Conditionally add optional parameters if they are provided
    if (channelId) {
      requestBody.channel_id = channelId;
    }
    if (channelUrl) {
      requestBody.channel_url = channelUrl;
    }

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
  try {
    const channelUrl = `https://www.youtube.com/@${channelName}`;
    const videoLimit = Math.floor(totalFunding * 10); // Assuming 10 videos per dollar
    await processChannel(channelId, channelUrl, videoLimit);
    console.log(`YES processing completed for channel ${channelId}`);

    // Update channel status to active
    await prisma.channel.update({
      where: { id: channelId },
      data: { isActive: true, isProcessing: false },
    });
    console.log(`Channel ${channelName} (${channelId}) activated`);
  } catch (error) {
    console.error('Error processing channel with YES:', error);
    // Update channel status to reflect the error
    await prisma.channel.update({
      where: { id: channelId },
      data: { isProcessing: false },
    });
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