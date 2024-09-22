// app/api/debate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { initializeDebate, processTurn, concludeDebate, generateTopics } from '@/utils/debateUtils';

export async function POST(request: NextRequest) {
  const session = await auth();
  // if (!session?.user) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  const { action, channelId1, channelId2, debateId, content, topic } = await request.json();
  console.log('Debate API called with action:', action, 'and content:', content);

  try {
    let result;

    // Validate action types and required parameters
    switch (action) {
      case 'initialize':
        if (!channelId1 || !channelId2 || !topic) {
          return NextResponse.json({ error: 'Missing parameters for initialization.' }, { status: 400 });
        }
        const userId = session?.user.id ?? '';
        result = await initializeDebate(channelId1, channelId2, userId, topic);
        break;

      case 'turn':
        if (!debateId) {
          return NextResponse.json({ error: 'Debate ID is required for processing a turn.' }, { status: 400 });
        }

        // Check the debate status before processing a turn
        const currentDebate = await prisma.debate.findUnique({
          where: { id: debateId },
          include: { turns: true },
        });

        if (!currentDebate) {
          return NextResponse.json({ error: 'Debate not found.' }, { status: 404 });
        }

        if (currentDebate.status !== 'IN_PROGRESS') {
          return NextResponse.json({ error: 'Debate is not in progress or has already concluded.' }, { status: 400 });
        }

        if (currentDebate.turns.length >= 10) {
          return NextResponse.json({ error: 'Maximum number of turns reached.' }, { status: 400 });
        }

        result = await processTurn(debateId, content);
        break;

      case 'conclude':
        if (!debateId) {
          return NextResponse.json({ error: 'Debate ID is required to conclude a debate.' }, { status: 400 });
        }

        // Validate the debate can be concluded
        const debateToConclude = await prisma.debate.findUnique({
          where: { id: debateId },
        });

        if (!debateToConclude) {
          return NextResponse.json({ error: 'Debate not found.' }, { status: 404 });
        }

        if (debateToConclude.status === 'CONCLUDED') {
          console.log('Debate already concluded:', debateToConclude);
          return NextResponse.json(debateToConclude);
        }

        if (debateToConclude.status !== 'IN_PROGRESS' && debateToConclude.status !== 'READY_TO_CONCLUDE') {
          console.log('Debate status:', debateToConclude.status);
          return NextResponse.json({ error: 'Debate cannot be concluded as it is not in progress.' }, { status: 400 });
        }

        result = await concludeDebate(debateId);
        break;

      case 'generateTopics':
        if (!channelId1 || !channelId2) {
          return NextResponse.json({ error: 'Both channel IDs are required to generate topics.' }, { status: 400 });
        }
        result = await generateTopics(channelId1, channelId2);
        break;

      default:
        return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
    }

    console.log('Debate API result:', result);
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in debate API:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const debateId = searchParams.get('id');

  if (!debateId) {
    return NextResponse.json({ error: 'Debate ID is required.' }, { status: 400 });
  }

  try {
    const debate = await prisma.debate.findUnique({
      where: { id: debateId },
      include: { turns: true },
    });

    if (!debate) {
      return NextResponse.json({ error: 'Debate not found.' }, { status: 404 });
    }

    return NextResponse.json(debate);

  } catch (error) {
    console.error('Error fetching debate:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}