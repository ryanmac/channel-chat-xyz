// app/api/collab/topics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import config from '@/config';

const openai = new OpenAI({ apiKey: config.openai.apiKey });

export async function POST(request: NextRequest) {
  try {
    const { interests1, interests2 } = await request.json();

    if (!interests1 || !interests2) {
      return NextResponse.json({ error: 'Both interests1 and interests2 are required.' }, { status: 400 });
    }

    const prompt = `Given the interests of two YouTube channels:

Channel 1 interests:
${interests1}

Channel 2 interests:
${interests2}

Suggest two interesting topics that both channels might have engaging discussions about, and one that they might have opposing views on. Do not mention "Channel" or "Channel 1" or "Channel 2", instead describe the topic without reference to the channels themselves.
Format your response as a numbered list. Starting with 1., 2., 3., etc.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
    });

    let topics = completion.choices[0]?.message?.content?.trim().split('\n') || [];

    // Clean up topics to ensure correct format and limit to 3
    topics = topics
      .filter((topic: string) => topic.trim()) // Remove empty topics
      .filter((topic: string) => /^\d+\.\s*/.test(topic)) // Keep only numbered topics
      .map((topic: string) => topic.replace(/^\d+\.\s*/, '').trim()) // Clean numbering and trim whitespace
      .slice(0, 3); // Limit to 3 topics

    return NextResponse.json({ topics });
  } catch (error) {
    console.error('Error generating topics:', error);
    return NextResponse.json({ error: 'Failed to generate topics.' }, { status: 500 });
  }
}