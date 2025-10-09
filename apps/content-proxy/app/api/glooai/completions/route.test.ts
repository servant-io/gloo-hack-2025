import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { generateCompletion } from '@/lib/glooai/completions';

// Mock the generateCompletion function
vi.mock('@/lib/glooai/completions', () => ({
  generateCompletion: vi.fn(),
}));

describe('POST /api/glooai/completions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate a completion successfully', async () => {
    const mockMessages = [{ role: 'user' as const, content: 'Hello!' }];

    const mockCompletion = {
      id: 'chatcmpl-d7007d2f',
      choices: [
        {
          finish_reason: 'stop',
          index: 0,
          logprobs: null,
          message: {
            content:
              "Hello. It's nice to meet you. Is there something I can help you with or would you like to chat?",
            refusal: null,
            role: 'assistant',
            annotations: null,
            audio: null,
            function_call: null,
            tool_calls: null,
          },
        },
      ],
      created: 1752600200,
      model: 'us.meta.llama3-3-70b-instruct-v1:0',
      object: 'chat.completion',
      service_tier: null,
      system_fingerprint: 'fp',
      usage: {
        completion_tokens: 25,
        prompt_tokens: 1707,
        total_tokens: 1732,
        completion_tokens_details: null,
        prompt_tokens_details: null,
      },
    };

    vi.mocked(generateCompletion).mockResolvedValueOnce(mockCompletion);

    const request = new Request(
      'http://localhost:3000/api/glooai/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: mockMessages,
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      completion: mockCompletion,
      messages: 1,
      model: mockCompletion.model,
      usage: mockCompletion.usage,
    });

    expect(vi.mocked(generateCompletion)).toHaveBeenCalledWith(
      mockMessages,
      {}
    );
  });

  it('should handle custom options', async () => {
    const mockMessages = [
      { role: 'user' as const, content: 'Tell me a story' },
    ];

    const mockCompletion = {
      id: 'chatcmpl-12345',
      choices: [
        {
          finish_reason: 'stop',
          index: 0,
          logprobs: null,
          message: {
            content: 'Once upon a time...',
            refusal: null,
            role: 'assistant',
            annotations: null,
            audio: null,
            function_call: null,
            tool_calls: null,
          },
        },
      ],
      created: 1752600201,
      model: 'custom-model',
      object: 'chat.completion',
      service_tier: null,
      system_fingerprint: 'fp-custom',
      usage: {
        completion_tokens: 50,
        prompt_tokens: 100,
        total_tokens: 150,
        completion_tokens_details: null,
        prompt_tokens_details: null,
      },
    };

    vi.mocked(generateCompletion).mockResolvedValueOnce(mockCompletion);

    const request = new Request(
      'http://localhost:3000/api/glooai/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: mockMessages,
          model: 'custom-model',
          max_tokens: 500,
          temperature: 0.9,
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      completion: mockCompletion,
      messages: 1,
      model: mockCompletion.model,
      usage: mockCompletion.usage,
    });

    expect(vi.mocked(generateCompletion)).toHaveBeenCalledWith(mockMessages, {
      model: 'custom-model',
      max_tokens: 500,
      temperature: 0.9,
    });
  });

  it('should return 400 when messages array is missing', async () => {
    const request = new Request(
      'http://localhost:3000/api/glooai/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: 'Messages array is required',
    });
  });

  it('should return 400 when messages is not an array', async () => {
    const request = new Request(
      'http://localhost:3000/api/glooai/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: 'not-an-array',
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: 'Messages array is required',
    });
  });

  it('should return 400 when message is missing role or content', async () => {
    const request = new Request(
      'http://localhost:3000/api/glooai/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'user' }, // missing content
          ],
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: 'Each message must have a role and content',
    });
  });

  it('should return 400 when message has invalid role', async () => {
    const request = new Request(
      'http://localhost:3000/api/glooai/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'invalid-role', content: 'Hello!' }],
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: 'Message role must be one of: user, assistant, system',
    });
  });

  it('should handle multiple messages correctly', async () => {
    const mockMessages = [
      { role: 'system' as const, content: 'You are a helpful assistant.' },
      { role: 'user' as const, content: 'What is the capital of France?' },
      {
        role: 'assistant' as const,
        content: 'The capital of France is Paris.',
      },
      { role: 'user' as const, content: 'Tell me more about it.' },
    ];

    const mockCompletion = {
      id: 'chatcmpl-multi',
      choices: [
        {
          finish_reason: 'stop',
          index: 0,
          logprobs: null,
          message: {
            content: 'Paris is known for...',
            refusal: null,
            role: 'assistant',
            annotations: null,
            audio: null,
            function_call: null,
            tool_calls: null,
          },
        },
      ],
      created: 1752600202,
      model: 'us.meta.llama3-3-70b-instruct-v1:0',
      object: 'chat.completion',
      service_tier: null,
      system_fingerprint: 'fp-multi',
      usage: {
        completion_tokens: 30,
        prompt_tokens: 200,
        total_tokens: 230,
        completion_tokens_details: null,
        prompt_tokens_details: null,
      },
    };

    vi.mocked(generateCompletion).mockResolvedValueOnce(mockCompletion);

    const request = new Request(
      'http://localhost:3000/api/glooai/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: mockMessages,
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.messages).toBe(4);
    expect(vi.mocked(generateCompletion)).toHaveBeenCalledWith(
      mockMessages,
      {}
    );
  });

  it('should handle API errors gracefully', async () => {
    const mockMessages = [{ role: 'user' as const, content: 'Hello!' }];

    vi.mocked(generateCompletion).mockRejectedValueOnce(
      new Error('Failed to generate completion: 401 Unauthorized')
    );

    const request = new Request(
      'http://localhost:3000/api/glooai/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: mockMessages,
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data).toEqual({
      error: 'Failed to generate completion from Gloo AI platform',
    });
  });

  it('should handle authentication errors', async () => {
    const mockMessages = [{ role: 'user' as const, content: 'Hello!' }];

    vi.mocked(generateCompletion).mockRejectedValueOnce(
      new Error('Failed to fetch access token: 401 Unauthorized')
    );

    const request = new Request(
      'http://localhost:3000/api/glooai/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: mockMessages,
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({
      error: 'Authentication failed with Gloo AI platform',
    });
  });

  it('should handle generic errors', async () => {
    const mockMessages = [{ role: 'user' as const, content: 'Hello!' }];

    vi.mocked(generateCompletion).mockRejectedValueOnce(
      new Error('Some other error')
    );

    const request = new Request(
      'http://localhost:3000/api/glooai/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: mockMessages,
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: 'Failed to generate completion',
    });
  });
});
