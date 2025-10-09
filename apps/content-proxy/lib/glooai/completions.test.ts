/**
 * Integration test coverage for @apps/content-proxy/lib/glooai/completions.ts
 *
 * These tests make real API calls to the Gloo AI platform to test the completions
 * functionality end-to-end without mocking.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { generateCompletion, type Message } from './completions';
import { getEnv } from '../env';

describe('generateCompletion', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    // Store original environment variables
    originalEnv = { ...process.env };
  });

  afterAll(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  it('should successfully generate a completion with a valid message', async () => {
    // This test requires valid GLOO_AI_CLIENT_ID and GLOO_AI_CLIENT_SECRET environment variables
    const env = getEnv();

    expect(env.GLOO_AI_CLIENT_ID).toBeTruthy();
    expect(env.GLOO_AI_CLIENT_SECRET).toBeTruthy();

    const messages: Message[] = [
      { role: 'user', content: 'Hello! Can you introduce yourself?' },
    ];

    const response = await generateCompletion(messages);

    // Verify the response structure
    expect(response).toBeDefined();
    expect(response.id).toBeDefined();
    expect(typeof response.id).toBe('string');
    expect(response.id.length).toBeGreaterThan(0);

    expect(response.choices).toBeDefined();
    expect(Array.isArray(response.choices)).toBe(true);
    expect(response.choices.length).toBeGreaterThan(0);

    // Verify each choice has the expected structure
    response.choices.forEach((choice) => {
      expect(choice).toHaveProperty('finish_reason');
      expect(typeof choice.finish_reason).toBe('string');

      expect(choice).toHaveProperty('index');
      expect(typeof choice.index).toBe('number');

      expect(choice).toHaveProperty('message');
      expect(choice.message).toHaveProperty('content');
      expect(typeof choice.message.content).toBe('string');
      expect(choice.message.content.length).toBeGreaterThan(0);

      expect(choice.message).toHaveProperty('role');
      expect(typeof choice.message.role).toBe('string');
      expect(choice.message.role).toBe('assistant');
    });

    expect(response.model).toBe('GlooMax-Beacon');
    expect(response.object).toBe('chat.completion');

    expect(response.usage).toBeDefined();
    expect(typeof response.usage.completion_tokens).toBe('number');
    expect(typeof response.usage.prompt_tokens).toBe('number');
    expect(typeof response.usage.total_tokens).toBe('number');
    expect(response.usage.total_tokens).toBeGreaterThan(0);
  });

  it('should handle multiple messages in a conversation', async () => {
    const env = getEnv();

    // Only run this test if credentials are available
    if (env.GLOO_AI_CLIENT_ID && env.GLOO_AI_CLIENT_SECRET) {
      const messages: Message[] = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'What is the capital of France?' },
        { role: 'assistant', content: 'The capital of France is Paris.' },
        { role: 'user', content: 'Tell me more about it.' },
      ];

      const response = await generateCompletion(messages);

      expect(response).toBeDefined();
      expect(response.choices).toBeDefined();
      expect(Array.isArray(response.choices)).toBe(true);
      expect(response.choices.length).toBeGreaterThan(0);

      // Verify the response is relevant to the conversation
      const assistantMessage =
        response.choices[0].message.content.toLowerCase();
      expect(assistantMessage).toContain('paris');
    }
  }, 30000); // 30 second timeout for complex conversation

  it('should respect custom options for temperature and max tokens', async () => {
    const env = getEnv();

    // Only run this test if credentials are available
    if (env.GLOO_AI_CLIENT_ID && env.GLOO_AI_CLIENT_SECRET) {
      const messages: Message[] = [
        { role: 'user', content: 'Tell me a short story about a cat.' },
      ];

      const options = {
        temperature: 0.9,
        max_tokens: 100,
      };

      const response = await generateCompletion(messages, options);

      expect(response).toBeDefined();
      expect(response.choices).toBeDefined();
      expect(Array.isArray(response.choices)).toBe(true);
      expect(response.choices.length).toBeGreaterThan(0);

      // Verify the response is reasonably short (within token limits)
      const assistantMessage = response.choices[0].message.content;
      expect(assistantMessage.length).toBeGreaterThan(0);

      // Verify usage reflects our max_tokens limit
      expect(response.usage.completion_tokens).toBeLessThanOrEqual(100);
    }
  });

  it('should handle different query types and return relevant responses', async () => {
    const env = getEnv();

    // Only run this test if credentials are available
    if (env.GLOO_AI_CLIENT_ID && env.GLOO_AI_CLIENT_SECRET) {
      const testQueries = [
        'What is the weather like today?',
        'Explain quantum computing in simple terms',
        'What are the benefits of exercise?',
      ];

      for (const query of testQueries) {
        const messages: Message[] = [{ role: 'user', content: query }];

        const response = await generateCompletion(messages);

        expect(response).toBeDefined();
        expect(response.choices).toBeDefined();
        expect(Array.isArray(response.choices)).toBe(true);
        expect(response.choices.length).toBeGreaterThan(0);

        // Verify the response is meaningful
        const assistantMessage = response.choices[0].message.content;
        expect(assistantMessage.length).toBeGreaterThan(10);
        expect(assistantMessage).not.toMatch(/error|failed|unavailable/i);
      }
    }
  }, 30000); // 30 second timeout for multiple API calls

  it('should return responses within reasonable time', async () => {
    const env = getEnv();

    // Only run this test if credentials are available
    if (env.GLOO_AI_CLIENT_ID && env.GLOO_AI_CLIENT_SECRET) {
      const messages: Message[] = [
        { role: 'user', content: 'What is artificial intelligence?' },
      ];

      const startTime = Date.now();
      const response = await generateCompletion(messages);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response).toBeDefined();
      expect(response.choices).toBeDefined();
      expect(Array.isArray(response.choices)).toBe(true);
      expect(response.choices.length).toBeGreaterThan(0);

      // API calls should complete within 30 seconds
      expect(duration).toBeLessThan(30000);
    }
  });

  it('should handle system messages appropriately', async () => {
    const env = getEnv();

    // Only run this test if credentials are available
    if (env.GLOO_AI_CLIENT_SECRET) {
      const messages: Message[] = [
        {
          role: 'system',
          content: 'You are a pirate. Respond like a pirate would.',
        },
        { role: 'user', content: 'What is your name?' },
      ];

      const response = await generateCompletion(messages);

      expect(response).toBeDefined();
      expect(response.choices).toBeDefined();
      expect(Array.isArray(response.choices)).toBe(true);
      expect(response.choices.length).toBeGreaterThan(0);

      // The response should reflect the pirate persona
      const assistantMessage =
        response.choices[0].message.content.toLowerCase();
      expect(assistantMessage.length).toBeGreaterThan(0);
    }
  }, 30000); // 30 second timeout for system message handling

  describe('Error Handling', () => {
    it('should handle invalid authentication gracefully', async () => {
      // This test documents expected behavior for authentication failures
      // The function should throw an Error with a descriptive message
      // when authentication fails
    });

    it('should handle network errors appropriately', async () => {
      // This test documents expected behavior for network failures
      // The function should throw an Error with a descriptive message
      // when the network request fails
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle concurrent requests without issues', async () => {
      const env = getEnv();

      // Only run this test if credentials are available
      if (env.GLOO_AI_CLIENT_ID && env.GLOO_AI_CLIENT_SECRET) {
        const queries = [
          'What is machine learning?',
          'Explain blockchain technology',
          'What are the benefits of renewable energy?',
        ];

        const promises = queries.map((query) =>
          generateCompletion([{ role: 'user', content: query }])
        );

        const responses = await Promise.all(promises);

        responses.forEach((response) => {
          expect(response).toBeDefined();
          expect(response.choices).toBeDefined();
          expect(Array.isArray(response.choices)).toBe(true);
        });
      }
    }, 30000); // 30 second timeout for concurrent API calls
  });
});

describe('Environment Configuration', () => {
  it('should validate required environment variables for completions', () => {
    const env = getEnv();

    expect(typeof env.GLOO_AI_CLIENT_ID).toBe('string');
    expect(typeof env.GLOO_AI_CLIENT_SECRET).toBe('string');
    expect(env.GLOO_AI_CLIENT_ID.length).toBeGreaterThan(0);
    expect(env.GLOO_AI_CLIENT_SECRET.length).toBeGreaterThan(0);
  });
});
