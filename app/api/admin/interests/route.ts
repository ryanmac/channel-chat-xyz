// app/api/admin/interests/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getRelevantChunks, getRecentChunks } from '@/utils/yesService';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { error } from 'console';

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

const openai = new OpenAI();
export async function POST(request: NextRequest) {
  const { channelData } = await request.json();

  if (!channelData) {
    return NextResponse.json({ error: 'Missing channelData or query' }, { status: 400 });
  }

  try {
    // Fetch relevant chunks
    const chunkLimit = 50;
    // const chunksResponse = await getRecentChunks(channelData.id, 50);
    const query = 'interesting conversations and topics';
    const chunksResponse = await getRelevantChunks(query, channelData.id, chunkLimit);

    if (!chunksResponse || !chunksResponse.chunks) {
      throw new Error('Failed to fetch recent chunks');
    }
    const { chunks } = chunksResponse;

    // Prepare the prompt
    const prompt = `You are an AI assistant representing the YouTube channel.
Use the following recent transcripts to briefly list the top 3 interesting topics in the style and tone of the channel's content creator, written from the creator's perspective:

${chunks.map((chunk: any) => chunk.main_chunk).join('\n\n')}

Format your response as a list of 3 topics, starting with "1." and continuing with each new topic on a new line until 3.

Start your response with:
"""
Here's a list of topics we could discuss:
1. """
`;

    // Generate response using OpenAI
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: 'You are a YouTube channel AI assistant.' }, { role: 'assistant', content: prompt }],
      model: 'gpt-4o-mini',
      max_tokens: 400,
    });

    const response = completion.choices[0].message.content?.trim() || '';

    // save the text of the response in the channel.interests field as text.
    await prisma.channel.update({
      where: { id: channelData.id },
      data: { interests: response },
    });

    return NextResponse.json({ response });

  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}