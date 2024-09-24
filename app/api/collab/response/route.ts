// api/collab/response/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import config from '@/config';

const openai = new OpenAI({ apiKey: config.openai.apiKey });

export async function POST(request: NextRequest) {
  try {
    const {
      channelTitle,
      topicTitle,
      topicDescription,
      channelContext,
      otherChannelContext,
      debateHistory,
      stage,
    } = await request.json();

    if (!channelTitle || !topicTitle || !topicDescription || !channelContext || !otherChannelContext || !stage) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

//     let prompt = `You are an AI assistant representing the YouTube channel "${channelTitle}".
// You are participating in a debate on the topic: "${topic}".

// Be brief, direct, and get straight to the point. Avoid lengthy introductions or over-explaining your stance or listing too many arguments. Respond concisely and only provide key arguments or counterarguments relevant to the current stage of the debate.

// Use the following context from your channel's content to inform your response:
// ${channelContext}

// Context from the other channel:
// ${otherChannelContext}

// Debate history:
// ${debateHistory}

// `;
  let prompt = `You are an AI assistant speaking in the voice of the YouTube channel "${channelTitle}".
You are engaging in a conversation centered on "${topicTitle}". The context of this discussion is: ${topicDescription}

Instructions:
- Respond with the concise, direct style typical of your channel.
- Focus on advancing the conversation by addressing points of disagreement or adding new insights when necessary.
- You are encouraged to diverge from the opposing channel's perspective if it aligns with your channel's ethos.
- Keep your responses short and impactful, avoiding long-winded explanations or excessive detail.
- Prioritize the strongest arguments and counterarguments that are directly relevant to the current stage of the conversation.
- Avoid mentioning "channel" in your responses and instead refer to your channel in the first person.

Draw upon the following excerpts from your channel's transcripts to maintain consistency in tone and content:
${channelContext}

Review of the ongoing conversation:
${debateHistory}

`;

  switch (stage) {
    case 'intro':
      prompt += `Kick off the conversation by introducing the topic from your channel's unique perspective. Highlight the main points you'll explore and emphasize your channel's distinct viewpoint.`;
      break;
    case 'response':
      prompt += `Respond to the latest points raised, maintaining the style and tone of ${channelTitle}'s creator. Tackle the other channel's arguments head-on, especially where perspectives differ, using your channel's content for support. Feel free to express disagreement when warranted.`;
      break;
    case 'conclusion':
      prompt += `Conclude the discussion by summarizing your channel's stance. Avoid echoing the other channel's views. Clearly state your key points, address counterarguments, and deliver a final statement reflecting your channel's context and history in the conversation.`;
      break;
  }

    prompt += `\n\nYour ${stage}:`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
    });

    const response = completion.choices[0].message.content?.trim() || '';

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error generating response:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}