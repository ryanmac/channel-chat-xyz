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

// The main API route handler
export async function POST(request: Request) {
  try {
    const { channelId, channelUrl, amountInDollars } = await request.json();

    console.log(`Processing channel: ${channelId}, ${channelUrl}`);
    const videoLimit = Math.floor(amountInDollars * 10); // Assuming 10 videos per dollar

    const response = await fetchFromYES('/process_channel', 'POST', {
      channel_url: channelUrl,
      video_limit: videoLimit
    });

    // Start polling for job status
    let jobStatus = await checkJobStatus(response.job_id);
    while (jobStatus.status !== 'SUCCESS' && jobStatus.status !== 'FAILED') {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      jobStatus = await checkJobStatus(response.job_id);
    }

    if (jobStatus.status === 'FAILED') {
      throw new Error(`Channel processing failed: ${jobStatus.error}`);
    }

    return new Response(JSON.stringify(jobStatus), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Type assertion to handle the unknown type
    console.error('Error processing channel:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function checkJobStatus(jobId: string) {
  return await fetchFromYES(`/job_status/${jobId}`, 'GET');
}