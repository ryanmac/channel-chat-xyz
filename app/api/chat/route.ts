// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getRelevantChunks } from '@/utils/yesService';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import config from '@/config';

const openai = new OpenAI({ apiKey: config.openai.apiKey });

const MAX_TOKENS_PER_CHAT = 50000;
const WARNING_TOKENS_THRESHOLD = 40000;

export async function POST(request: NextRequest) {
  const { channelData, query, chatSessionId, debateId } = await request.json();

  if (!channelData || !query) {
    return NextResponse.json({ error: 'Missing channelData or query' }, { status: 400 });
  }

  const session = await auth();
  const userId = session?.user?.id;
  const sessionId = request.cookies.get('sessionId')?.value || '';

  try {
    let chatSession;
    if (chatSessionId) {
      chatSession = await prisma.chatSession.findUnique({ where: { id: chatSessionId } });
      if (!chatSession) {
        console.log('Chat session not found:', chatSessionId);
        return NextResponse.json({ error: 'Chat session not found. Please start a new chat session.', errorCode: 'SESSION_NOT_FOUND' }, { status: 404 });
      }
    } else {
      // Check if channel has enough credits before creating a new session
      if (channelData.creditBalance <= 0) {
        console.log('No credits remaining for channel:', channelData.id);
        return NextResponse.json({
          response: "Oh no, I'm out of chats. Consider supporting the bot. $1 buys 1000 chats.",
          chatSessionId: null,
          tokenCount: 0,
          warningMessage: "No credits remaining."
        }, { status: 200 });
      }

      // Create new chat session and decrement credit
      chatSession = await prisma.$transaction(async (prisma) => {
        const newSession = await prisma.chatSession.create({
          data: {
            channelId: channelData.id,
            userId,
            sessionId,
          }
        });

        await prisma.channel.update({
          where: { id: channelData.id },
          data: { creditBalance: { decrement: 1 } }
        });

        // Increment the chat count for the channel
        await prisma.channel.update({
          where: { id: channelData.id },
          data: { chatsCreated: { increment: 1 } }
        });

        return newSession;
      });
    }

    let debate;
    if (debateId) {
      debate = await prisma.debate.findUnique({
        where: { id: debateId },
        include: { turns: { orderBy: { createdAt: 'asc' } } },
      });
      if (!debate) {
        return NextResponse.json({ error: 'Debate not found' }, { status: 404 });
      }
    }

    // Fetch relevant chunks
    const chunkLimit = 5;
    const chunksResponse = await getRelevantChunks(query, channelData.id, chunkLimit);
    if (!chunksResponse || !chunksResponse.chunks) {
      throw new Error('Failed to fetch relevant chunks');
    }
    const { chunks } = chunksResponse;

    // Prepare the prompt
    let prompt;
    if (debate) {
      const debateHistory = debate.turns.map((turn, index) => 
        `${index % 2 === 0 ? 'Channel 1' : 'Channel 2'}: ${turn.content}`
      ).join('\n\n');

      prompt = `You are an AI assistant representing the YouTube channel "${channelData.title}" in a debate.
Topic: ${debate.topic}

Use the following context from the channel's content to inform your response:
${chunks.map((chunk: any) => chunk.main_chunk).join('\n\n')}

Debate history:
${debateHistory}

Respond to the most recent argument in the style and tone of ${channelData.title}'s content creator. 
Make sure your response is relevant to the topic and builds upon the previous arguments.

The most recent argument:
${query}

Your response:`;
    } else {
      prompt = `You are a helpful and informative AI assistant representing the YouTube channel "${channelData.title}". 
Your goal is to answer user questions based on the provided context from the channel's transcripts. 
Always strive to respond in a way that is consistent with the channel's content and the creator's style and tone.

Guidelines:
- Provide accurate and relevant information, based exclusively on the channel's content. If the content isn't relevant to the user's question, you can let the user know and suggest more relevant topics.
- Use the context provided to generate a response that is consistent with the channel's content creator, including style, tone, and expertise.
- Avoid sharing personal opinions or information that isn't supported by the channel's content.

Context:
${chunks.map((chunk: any) => chunk.main_chunk).join('\n\n')}

User:
${query}

AI:`;
    }

    // Check token count
    const promptTokens = prompt.split(' ').length; // This is a rough estimate
    if (chatSession.tokenCount + promptTokens > MAX_TOKENS_PER_CHAT) {
      return NextResponse.json({ error: 'Maximum token limit reached for this chat session' }, { status: 403 });
    }

    // Generate response using OpenAI
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4o-mini',
      max_tokens: 300,
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