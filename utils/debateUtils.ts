// utils/debateUtils.ts
import prisma from '@/lib/prisma';
import { getRelevantChunks } from '@/utils/yesService';
import { NextResponse } from "next/server";
import config from '@/config';

const MAX_TURNS = 10

export async function initializeDebate(channelId1: string, channelId2: string, userId: string, topicTitle: string, topicDescription: string) {
  const debate = await prisma.debate.create({
    data: {
      channelId1,
      channelId2,
      status: 'IN_PROGRESS',
      createdBy: userId,
      topicTitle, // Include the topic title
      topicDescription, // Include the topic description
    },
  });

  await prisma.channel.update({
    where: { id: channelId1 },
    data: { creditBalance: { decrement: 4 } }
  });

  // Increment the chat count for the channel
  await prisma.channel.update({
    where: { id: channelId2 },
    data: { chatsCreated: { increment: 4 } }
  });

  return debate;
}

export async function generateTopics(channelId1: string, channelId2: string) {
  // Fetch channel details
  const [channel1, channel2] = await Promise.all([
    prisma.channel.findUnique({ where: { id: channelId1 }, select: { id: true, name: true } }),
    prisma.channel.findUnique({ where: { id: channelId2 }, select: { id: true, name: true } }),
  ]);

  if (!channel1 || !channel2) throw new Error('One or both channels not found');

  // Fetch interests using getChannelInterests with a limit of 5
  let [interests1, interests2] = await Promise.all([
    getChannelInterests(channelId1, 5),
    getChannelInterests(channelId2, 5),
  ]);

  // If the channels have no interests, first update the channels to get interests using the API
  if (interests1.length === 0) {
    const response = await fetch(`${config.app.url}/api/channel/interests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelData: { id: channel1.id, name: channel1.name } }),
    });
    if (!response.ok) {
      console.error('Failed to fetch interests:', await response.text());
      throw new Error('Failed to generate topics');
    }
    // Re-fetch interests after updating
    interests1 = await getChannelInterests(channelId1, 5);
  }

  if (interests2.length === 0) {
    const response = await fetch(`${config.app.url}/api/channel/interests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelData: { id: channel2.id, name: channel2.name } }),
    });
    if (!response.ok) {
      console.error('Failed to fetch interests:', await response.text());
      throw new Error('Failed to generate topics');
    }
    // Re-fetch interests after updating
    interests2 = await getChannelInterests(channelId2, 5);
  }

  // Combine interests and send to collab topics API with channel names
  const response = await fetch(`${config.app.url}/api/collab/topics`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channel1: { name: channel1.name, interests: interests1.map(i => ({ title: i.title, description: i.description })) },
      channel2: { name: channel2.name, interests: interests2.map(i => ({ title: i.title, description: i.description })) },
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

  // Ensure topics are returned as objects with title and description
  return topics.map((topic: { title: string; description: string }) => ({
    title: topic.title,
    description: topic.description,
  }));
}

export function getTopic(topic: string | undefined) {
  if (!topic) {
    return { topicTitle: '', topicDescription: '' };
  }
  const cleanedTopic = topic.replace(/\*\*/g, '').trim(); // Remove '**' and trim spaces

  // Check if the line matches the expected numbered format (e.g., "1. Title: Description")
  const match = cleanedTopic.match(/^\d+\.\s*(.+?):\s*(.+)$/);

  // If the format doesn't match, return empty values
  if (!match) {
    return { topicTitle: '', topicDescription: '' };
  }

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

  if (!topicDescription.match(/[\.\?\!]$/)) {
    topicDescription += '...';
  }

  // Remove leading numbers and spaces from the title
  topicTitle = topicTitle.replace(/^\d+\.\s*/, '');

  if (topicTitle.length < 10 || topicDescription.length < 20) {
    return { topicTitle: '', topicDescription: '' };
  }

  return { topicTitle, topicDescription };
}

async function getDebateContext(channelId: string, topic: { title: string; description: string }, content: string) {
  try {
    const chunks = await getRelevantChunks(`${topic.title} ${topic.description} ${content}`, channelId, 5, 1);
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

export async function generateResponse(channelId: string, topicTitle: string, topicDescription: string, content: string, debate: any, stage: 'intro' | 'response' | 'conclusion') {
  const channel = await prisma.channel.findUnique({ where: { id: channelId } });
  if (!channel) throw new Error('Channel not found');

  const otherChannelId = debate.channelId1 === channelId ? debate.channelId2 : debate.channelId1;

  // Get context for both channels
  const [channelContext, otherChannelContext] = await Promise.all([
    getDebateContext(channelId, { title: topicTitle, description: topicDescription }, content),
    getDebateContext(otherChannelId, { title: topicTitle, description: topicDescription }, content),
  ]);

  const debateHistory = debate.turns.map((turn: any) => 
    `${turn.channelId === debate.channelId1 ? 'Channel 1' : 'Channel 2'}: ${turn.content}`
  ).join('\n\n');

  // Make a request to the new route to get the AI-generated response
  const response = await fetch(`${config.app.url}/api/collab/response`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channelTitle: channel.title,
      topicTitle,
      topicDescription,
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
    const response = await generateResponse(channelId, debate.topicTitle || '', debate.topicDescription || '', content, debate, stage);

    // Add new turn to the debate
    await prisma.debateTurn.create({
      data: {
        debateId,
        channelId,
        content: response,
      },
    });

    // Determine updated status
    // const updatedStatus = debate.turns.length + 1 >= MAX_TURNS ? 'READY_TO_CONCLUDE' : 'IN_PROGRESS';
    const updatedStatus = debate.turns.length + 1 >= MAX_TURNS ? 'CONCLUDED' : 'IN_PROGRESS';

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
    const summary1 = await generateResponse(debate.channelId1, debate.topicTitle || '', debate.topicDescription || '', '', debate, 'conclusion');
    const summary2 = await generateResponse(debate.channelId2, debate.topicTitle || '', debate.topicDescription || '', '', debate, 'conclusion');

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

export async function getChannelInterests(channelId: string, limit: number = 3) {
  // Get all of the interests for the channel
  const interests = await prisma.interest.findMany({
    where: { channelId },
    orderBy: { createdAt: 'desc' },
  });

  // Shuffle the interests
  for (let i = interests.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [interests[i], interests[j]] = [interests[j], interests[i]];
  }

  // Return a formatted list of interests
  return interests.slice(0, limit).map(({ title, description }) => ({
    title,
    description,
  }));
}