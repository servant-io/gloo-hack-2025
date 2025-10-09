import { NextResponse } from 'next/server';
import { generateCompletion, type Message } from '@/lib/glooai/completions';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Validate each message structure
    for (const message of body.messages) {
      if (!message.role || !message.content) {
        return NextResponse.json(
          { error: 'Each message must have a role and content' },
          { status: 400 }
        );
      }
      if (!['user', 'assistant', 'system'].includes(message.role)) {
        return NextResponse.json(
          { error: 'Message role must be one of: user, assistant, system' },
          { status: 400 }
        );
      }
    }

    // Extract options from request body
    const { messages, ...options } = body;

    // Generate completion using the Gloo AI platform
    const completion = await generateCompletion(messages as Message[], options);

    return NextResponse.json({
      completion,
      messages: messages.length,
      model: completion.model,
      usage: completion.usage,
    });
  } catch (error) {
    console.error('Error generating completion:', error);

    // Provide more specific error messages based on the error type
    if (error instanceof Error) {
      if (error.message.includes('Failed to generate completion')) {
        return NextResponse.json(
          { error: 'Failed to generate completion from Gloo AI platform' },
          { status: 502 }
        );
      }
      if (error.message.includes('Failed to fetch access token')) {
        return NextResponse.json(
          { error: 'Authentication failed with Gloo AI platform' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate completion' },
      { status: 500 }
    );
  }
}
