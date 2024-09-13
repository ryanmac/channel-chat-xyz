import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getRelevantChunks } from '@/utils/yesService';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { error } from 'console';

/**
 * Usage:
 * 
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 4Sy62iXHf-8Ss6-78a8-7Av0-YUCw-q7jahXF" \
  -d '{
    "channelId": "UCZf5IX90oe5gdPppMXGImwg",
    "query": "What is the best way to cook a steak?",
    "chatSessionId": "1"
  }'
 */


const openai = new OpenAI();

const MAX_TOKENS_PER_CHAT = 50000;
const WARNING_TOKENS_THRESHOLD = 40000;

export async function POST(request: NextRequest) {
  const { channelId, query, chatSessionId } = await request.json();

  if (!channelId || !query) {
    return NextResponse.json({ error: 'Missing channelId or query' }, { status: 400 });
  }

  const session = await auth();
  const userId = session?.user?.id;
  const sessionId = request.cookies.get('sessionId')?.value || '';

  try {
    // Fetch the channel
    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      select: { creditBalance: true }
    });

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    let chatSession;
    if (chatSessionId) {
      // Fetch existing chat session
      chatSession = await prisma.chatSession.findUnique({ where: { id: chatSessionId } });
      if (!chatSession) {
        console.log('Chat session not found:', chatSessionId);
        return NextResponse.json({ error: 'Chat session not found. Please start a new chat session.', errorCode: 'SESSION_NOT_FOUND' }, { status: 404 });
      }
    } else {
      // Check if channel has enough credits before creating a new session
      if (channel.creditBalance <= 0) {
        console.log('No credits remaining for channel:', channelId);
        return NextResponse.json({
          response: "Oh no, I'm out of chats. Consider supporting the bot. $1 buys 1000 chats.",
          chatSessionId: null, // No active session
          tokenCount: 0, // No tokens used since no response is generated
          warningMessage: "No credits remaining."
        }, { status: 200 });
      }

      // Create new chat session and decrement credit
      chatSession = await prisma.$transaction(async (prisma) => {
        const newSession = await prisma.chatSession.create({
          data: {
            channelId,
            userId,
            sessionId,
          }
        });

        await prisma.channel.update({
          where: { id: channelId },
          data: { creditBalance: { decrement: 1 } }
        });

        // Increment the chat count for the channel
        await prisma.channel.update({
          where: { id: channelId },
          data: { chatsCreated: { increment: 1 } }
        });

        return newSession;
      });
    }

    // Fetch relevant chunks
    const chunksResponse = await getRelevantChunks(query, channelId);
    if (!chunksResponse || !chunksResponse.chunks) {
      throw new Error('Failed to fetch relevant chunks');
    }
    const { chunks } = chunksResponse;

    // Prepare the prompt
    const prompt = `You are an AI assistant representing the YouTube channel. Use the following context to answer the user's question in the style and tone of the channel's content creator:\n\n${chunks.map((chunk: any) => chunk.main_chunk).join('\n\n')}\n\nUser: ${query}\n\nAI:`;

    // Check token count
    const promptTokens = prompt.split(' ').length; // This is a rough estimate
    if (chatSession.tokenCount + promptTokens > MAX_TOKENS_PER_CHAT) {
      return NextResponse.json({ error: 'Maximum token limit reached for this chat session' }, { status: 403 });
    }

    // Generate response using OpenAI
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: 'You are a YouTube channel AI assistant.' }, { role: 'assistant', content: prompt }],
      model: 'gpt-4o-mini',
      max_tokens: 200,
    });

    const response = completion.choices[0].message.content?.trim() || '';
    const responseTokens = response.split(' ').length; // Again, a rough estimate

    // Update chat session
    const updatedSession = await prisma.chatSession.update({
      where: { id: chatSession.id },
      data: {
        tokenCount: { increment: promptTokens + responseTokens },
        messageCount: { increment: 1 },
        messages: {
          create: [
            { content: query, tokenCount: promptTokens, type: 'USER' },
            { content: response, tokenCount: responseTokens, type: 'AI' }
          ]
        }
      }
    });

    const warningMessage = updatedSession.tokenCount > WARNING_TOKENS_THRESHOLD
      ? 'You are approaching the token limit for this chat. Consider starting a new chat soon.'
      : '';

    return NextResponse.json({ 
      response, 
      chatSessionId: chatSession.id,
      tokenCount: updatedSession.tokenCount,
      warningMessage
    });

  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}