// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getRelevantChunks } from '@/utils/yesService';
import config from '@/config';

const openai = new OpenAI();

export async function POST(request: NextRequest) {
  const { channelId, query } = await request.json();

  if (!channelId || !query) {
    return NextResponse.json({ error: 'Missing channelId or query' }, { status: 400 });
  }

  try {
    // Fetch relevant chunks using the utility function from yesService
    const chunksResponse = await getRelevantChunks(query, channelId);

    // If chunksResponse is empty or not as expected, handle it accordingly
    if (!chunksResponse || !chunksResponse.chunks) {
      throw new Error('Failed to fetch relevant chunks');
    }

    const { chunks } = chunksResponse;

    // Prepare the prompt for OpenAI
    const prompt = `You are an AI assistant representing the YouTube channel. Use the following context to answer the user's question in the style and tone of the channel's content creator:\n\n${chunks.map((chunk: any) => chunk.main_chunk).join('\n\n')}\n\nUser: ${query}\n\nAI:`;

    // Generate response using OpenAI
    const completion: OpenAI.Chat.ChatCompletion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: 'You are a YouTube channel AI assistant.' }, { role: 'assistant', content: prompt }],
      model: 'gpt-3.5-turbo',
      max_tokens: 200,
    });

    const response = completion.choices[0].message.content?.trim();

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}