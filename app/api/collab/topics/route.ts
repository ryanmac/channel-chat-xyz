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

Suggest three engaging or controversial topics that would lead to a passionate discussion between the two channels. Describe each topic concisely without using phrases like "this topic would address" or "a conversation could include." Focus directly on the core of the topic and the key elements that would make the discussion compelling.

Format your response as a list of topics, each starting with a title followed by a brief, direct description:

1. **Title 1**: Directly state the discussion points, themes, or questions this topic would involve.
2. **Title 2**: Provide a straightforward description that outlines the main arguments or perspectives without introductory wording.
3. **Title 3**: Clearly define the topic, emphasizing the points of tension or interest that would be discussed.

Example format:
1. **Bridging Social Divides**: Examine the challenges of fostering unity among diverse groups with differing experiences and needs. Include strategies for bridging gaps between communities, the role of dialogue in overcoming political differences, and the importance of listening to marginalized voices.
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