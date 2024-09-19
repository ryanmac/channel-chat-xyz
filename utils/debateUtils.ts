// utils/debateUtils.ts
import prisma from '@/lib/prisma';
import { getRelevantChunks } from '@/utils/yesService';
import { NextResponse } from "next/server";
import config from '@/config';

const MAX_TURNS = 10

export async function initializeDebate(channelId1: string, channelId2: string, userId: string, topic: string) {
  const debate = await prisma.debate.create({
    data: {
      channelId1,
      channelId2,
      status: 'IN_PROGRESS', // Adjust status if needed
      createdBy: userId,
      topic, // Include the selected topic
    },
  });

  return debate;
}

export async function generateTopics(channelId1: string, channelId2: string) {
  const [channel1, channel2] = await Promise.all([
    prisma.channel.findUnique({ where: { id: channelId1 }, select: { interests: true } }),
    prisma.channel.findUnique({ where: { id: channelId2 }, select: { interests: true } }),
  ]);

  if (!channel1 || !channel2) throw new Error('One or both channels not found');

  const response = await fetch(`${config.app.url}/api/collab/topics`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      interests1: channel1.interests,
      interests2: channel2.interests,
    }),
  });

  if (!response.ok) {
    console.error('Failed to fetch topics:', await response.text());
    throw new Error('Failed to generate topics');
  }

  const { topics } = await response.json();

  if (!topics || topics.length === 0) {
    throw new Error('No topics generated');
  }

  return topics;
}

export function getTopic(topic: string) {
  const cleanedTopic = topic.replace(/\*\*/g, '').trim(); // Remove '**' and trim spaces
  const parts = cleanedTopic.split(':');

  let topicTitle = '';
  let topicDescription = '';

  if (parts.length === 3) {
    // Format: Title: Subtitle: Description
    topicTitle = `${parts[0].trim()}: ${parts[1].trim()}`; // Preserve the colon between Title and Subtitle
    topicDescription = parts[2].trim();
  } else if (parts.length === 2) {
    // Format: Title: Description
    topicTitle = parts[0].trim();
    topicDescription = parts[1].trim();
  } else {
    // No colons, treat as single title
    topicTitle = cleanedTopic;
  }

  return { topicTitle, topicDescription };
}

async function getDebateContext(channelId: string, topic: string, content: string) {
  try {
    const chunks = await getRelevantChunks(`${topic} ${content}`, channelId, 5, 1);
    if (!chunks || !Array.isArray(chunks.chunks)) {
      console.error('Invalid response from getRelevantChunks:', chunks);
      return ''; // Return an empty string if there are no relevant chunks
    }
    return chunks.chunks.map((chunk: any) => chunk.main_chunk).join('\n\n');
  } catch (error) {
    console.error('Error in getDebateContext:', error);
    return ''; // Return an empty string in case of error
  }
}

export async function generateResponse(channelId: string, topic: string, content: string, debate: any, stage: 'intro' | 'response' | 'conclusion') {
  const channel = await prisma.channel.findUnique({ where: { id: channelId } });
  if (!channel) throw new Error('Channel not found');

  const otherChannelId = debate.channelId1 === channelId ? debate.channelId2 : debate.channelId1;

  // Get context for both channels
  const [channelContext, otherChannelContext] = await Promise.all([
    getDebateContext(channelId, topic, content),
    getDebateContext(otherChannelId, topic, content),
  ]);

  const debateHistory = debate.turns.map((turn: any) => 
    `${turn.channelId === debate.channelId1 ? 'Channel 1' : 'Channel 2'}: ${turn.content}`
  ).join('\n\n');

  // Make a request to the new route to get the AI-generated response
  console.log('Sending data to /api/collab/response:', {
    channelTitle: channel.title,
    topic,
    channelContext,
    otherChannelContext,
    debateHistory,
    stage,
  });
  const response = await fetch(`${config.app.url}/api/collab/response`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channelTitle: channel.title,
      topic,
      channelContext,
      otherChannelContext,
      debateHistory,
      stage,
    }),
  });

  if (!response.ok) {
    console.error('Failed to fetch response:', await response.text());
    throw new Error('Failed to generate response');
  }

  const { response: generatedResponse } = await response.json();

  return generatedResponse;
}

export async function processTurn(debateId: string, content: string) {
  try {
    const debate = await prisma.debate.findUnique({
      where: { id: debateId },
      include: { turns: { orderBy: { createdAt: 'asc' } } },
    });

    if (!debate) throw new Error('Debate not found');

    // Determine the stage and channel turn
    const isFirstTurn = debate.turns.length === 0;
    const isChannel1Turn = debate.turns.length % 2 === 0; // Alternates between channels based on the turn count
    const channelId = isChannel1Turn ? debate.channelId1 : debate.channelId2;

    // Determine stage based on the number of turns
    let stage: 'intro' | 'response' | 'conclusion';
    if (isFirstTurn) {
      stage = 'intro';
    } else if (debate.turns.length >= MAX_TURNS - 2) {
      stage = 'conclusion';
    } else {
      stage = 'response';
    }

    // Generate response for the current turn
    const response = await generateResponse(channelId, debate.topic || content, content, debate, stage);

    // Add new turn to the debate
    await prisma.debateTurn.create({
      data: {
        debateId,
        channelId,
        content: response,
      },
    });

    // Determine updated status
    const updatedStatus = debate.turns.length + 1 >= MAX_TURNS ? 'READY_TO_CONCLUDE' : 'IN_PROGRESS';

    // Update debate status and include latest turn
    const updatedDebate = await prisma.debate.update({
      where: { id: debateId },
      data: { status: updatedStatus },
      include: { turns: { orderBy: { createdAt: 'asc' } } },
    });

    console.log('Updated debate:', updatedDebate);
    return updatedDebate;
  } catch (error) {
    console.error('Error processing turn:', error);
    throw error;
  }
}

export async function concludeDebate(debateId: string) {
  try {
    const debate = await prisma.debate.findUnique({
      where: { id: debateId },
      include: { turns: { orderBy: { createdAt: 'asc' } } },
    });

    if (!debate) throw new Error('Debate not found');

    // Handle already concluded debates gracefully
    if (debate.status === 'CONCLUDED') {
      console.log('Debate already concluded:', debate);
      return debate; // Return the already concluded debate
    }

    // Adjust the status check to include READY_TO_CONCLUDE
    if (debate.status !== 'IN_PROGRESS' && debate.status !== 'READY_TO_CONCLUDE') {
      return NextResponse.json({ error: 'Debate cannot be concluded as it is not ready to be concluded.' }, { status: 400 });
    }

    // Generate conclusions for both channels
    const summary1 = await generateResponse(debate.channelId1, debate.topic!, '', debate, 'conclusion');
    const summary2 = await generateResponse(debate.channelId2, debate.topic!, '', debate, 'conclusion');

    // Update debate status to concluded with summaries
    const concludedDebate = await prisma.debate.update({
      where: { id: debateId },
      data: {
        status: 'CONCLUDED',
        summary1,
        summary2,
      },
    });

    return concludedDebate;
  } catch (error) {
    console.error('Error concluding debate:', error);
    throw error;
  }
}