// app/api/channel/interests/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getRelevantChunks, getRecentChunks } from '@/utils/yesService';
import prisma from '@/lib/prisma';
import config from '@/config';
import { getTopic } from '@/utils/debateUtils';

/**
 * Usage:
 * 
curl -X POST http://localhost:3000/api/interests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 4Sy62iXHf-8Ss6-78a8-7Av0-YUCw-q7jahXF" \
  -d '{
    "channelId": "UCZf5IX90oe5gdPppMXGImwg"
  }'
 */

const openai = new OpenAI({ apiKey: config.openai.apiKey });

export async function POST(request: NextRequest) {
  const { channelData } = await request.json();

  if (!channelData) {
    return NextResponse.json({ error: 'Missing channelData or query' }, { status: 400 });
  }

  try {
    const chunkLimit = 50;
    const query = 'interesting conversations and topics';
    const chunksResponse = await getRelevantChunks(query, channelData.id, chunkLimit);

    if (!chunksResponse || !chunksResponse.chunks) {
      throw new Error('Failed to fetch recent chunks');
    }
    const { chunks } = chunksResponse;

    const prompt = `You are an AI assistant representing the YouTube channel.
Use the following recent transcripts to briefly list the top 10 interesting topics in the style and tone of the channel's content creator, written from the creator's perspective:

${chunks.map((chunk: any) => chunk.main_chunk).join('\n\n')}

Format your response as a list of topics, each starting with a title followed by a description:

1. **Title 1**: Description of the topic...
2. **Title 2**: Description of the topic...
...
10. **Title 10**: Description of the topic...
`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: 'You are a YouTube channel AI assistant.' }, { role: 'assistant', content: prompt }],
      model: 'gpt-4o-mini',
      max_tokens: 400,
    });

    const response = completion.choices[0].message.content?.trim() || '';

    // Parse the response into individual interests
    // To preprocess the topics to remove empty lines or lines shorter than a certain length
    const topics = response
      .split('\n')
      .map(getTopic)
      .filter(topic => topic.topicTitle && topic.topicDescription);

    // Delete the current interests, if they exist
    const currentInterests = await prisma.interest.findMany({
      where: {
        channelId: channelData.id,
      },
    });
    if (currentInterests.length > 0) {
      await prisma.interest.deleteMany({
        where: {
          channelId: channelData.id,
        },
      });
    }

    // Save each interest as a separate record in the database
    await Promise.all(
      topics.map(async (topic) => {
        await prisma.interest.create({
          data: {
            title: topic.topicTitle,
            description: topic.topicDescription,
            channelId: channelData.id,
          },
        });
      })
    );

    return NextResponse.json({ response });

  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}