// app/api/collab/topics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import config from '@/config';
import { getTopic } from '@/utils/debateUtils';

const openai = new OpenAI({ apiKey: config.openai.apiKey });

export async function POST(request: NextRequest) {
  try {
    const { channel1, channel2 } = await request.json();

    if (!channel1 || !channel2) {
      return NextResponse.json({ error: 'Both channel1 and channel2 are required.' }, { status: 400 });
    }

    const { name: name1, interests: interests1 } = channel1;
    const { name: name2, interests: interests2 } = channel2;

    // Format the interests for the prompt
    const formatInterests = (name: string, interests: { title: string; description: string }[]) =>
      `**${name}**'s interests:\n` +
      interests.map((interest, index) => `${index + 1}. **${interest.title}**: ${interest.description}`).join('\n');

    const formattedInterests1 = formatInterests(name1, interests1);
    const formattedInterests2 = formatInterests(name2, interests2);

    const prompt = `Given the interests of two YouTube channels:

${formattedInterests1}

${formattedInterests2}

Suggest two interesting or controversial topics that both ${name1} and ${name2} might have engaging and passionate discussions. Do not mention the channels directly by name in your suggestions, but describe the topics clearly and thoughtfully.
Format your response as a list of topics, each starting with a title followed by a brief description:

1. **Title 1**: Description of the topic...
2. **Title 2**: Description of the topic...
3. **Title 3**: Description of the topic...
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
    });

    // Parse the response using getTopic
    const topics = completion.choices[0]?.message?.content?.trim().split('\n')
      .map(line => getTopic(line))
      .filter(topic => topic.topicTitle && topic.topicDescription)
      .map(({ topicTitle, topicDescription }) => ({
        title: topicTitle,
        description: topicDescription,
      }));

    if (!topics || topics.length === 0) {
      console.error('No topics generated from the response:', completion.choices[0]?.message?.content);
      return NextResponse.json({ error: 'Failed to generate topics.' }, { status: 500 });
    }

    return NextResponse.json({ topics });
  } catch (error) {
    console.error('Error generating topics:', error);
    return NextResponse.json({ error: 'Failed to generate topics.' }, { status: 500 });
  }
}