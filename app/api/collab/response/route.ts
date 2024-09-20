// api/collab/response/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import config from '@/config';

const openai = new OpenAI({ apiKey: config.openai.apiKey });

export async function POST(request: NextRequest) {
  try {
    const { channelTitle, topic, channelContext, otherChannelContext, debateHistory, stage } = await request.json();

    if (!channelTitle || !topic || !channelContext || !otherChannelContext || !stage) {
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
    let prompt = `You are an AI assistant representing the YouTube channel "${channelTitle}".
You are participating in a debate on the topic: "${topic}".

Be brief, direct, and get straight to the point. Avoid lengthy introductions or over-explaining your stance or listing too many arguments. Respond concisely and only provide key arguments or counterarguments relevant to the current stage of the debate.

Use the following context from your channel's content to inform your response:
${channelContext}

Debate history:
${debateHistory}

`;

    switch (stage) {
      case 'intro':
        prompt += `Provide an introduction to the debate topic from your channel's perspective. 
        Highlight key points you plan to discuss and your channel's unique viewpoint.`;
        break;
      case 'response':
        prompt += `Respond to the most recent argument in the style and tone of ${channelTitle}'s content creator. 
        Make sure your response is relevant to the topic, builds upon the previous arguments, and addresses points raised by the other channel.
        Use information from your channel's context to support your arguments, and consider the other channel's context in your response.`;
        break;
      case 'conclusion':
        prompt += `Provide a conclusion to the debate from your channel's perspective. 
        Summarize your main points, address the counterarguments, and provide your final statement on the topic using channel context and your debate history.`;
        break;
    }

    prompt += `\n\nYour ${stage}:`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
    });

    const response = completion.choices[0].message.content?.trim() || '';

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error generating response:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}