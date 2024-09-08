// app/api/yes/process-channel/route.ts
const YES_API_URL = process.env.YES_API_URL || 'http://localhost:8000';

async function fetchFromYES(endpoint: string, method: string, data?: any) {
  try {
    const response = await fetch(`${YES_API_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: method === 'POST' ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('YES API error details:', errorData);
      throw new Error(`YES API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in fetchFromYES:', error);
    throw error;
  }
}

export async function processChannel(channelId: string, channelUrl: string, amountInDollars: number) {
  try {
    console.log(`Processing channel: ${channelId}, ${channelUrl}`);
    const videoLimit = Math.floor(amountInDollars * 10); // Assuming 10 videos per dollar

    const response = await fetchFromYES('/process_channel', 'POST', {
      channel_url: channelUrl,
      video_limit: videoLimit
    });

    // console.log('YES API response:', response);

    // Start polling for job status
    let jobStatus = await checkJobStatus(response.job_id);
    while (jobStatus.status !== 'SUCCESS' && jobStatus.status !== 'FAILED') {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      jobStatus = await checkJobStatus(response.job_id);
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

async function checkJobStatus(jobId: string) {
  return await fetchFromYES(`/job_status/${jobId}`, 'GET');
}