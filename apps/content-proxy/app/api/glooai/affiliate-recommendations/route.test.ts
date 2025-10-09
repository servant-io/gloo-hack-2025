/**
 * Test coverage for @apps/content-proxy/app/api/glooai/affiliate-recommendations/route.ts
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { GET } from './route';
import { getEnv } from '../../../../lib/env';

describe('GET /api/glooai/affiliate-recommendations', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    // Store original environment variables
    originalEnv = { ...process.env };
  });

  afterAll(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  it('should return affiliate recommendations for a valid query', async () => {
    // This test requires valid GLOO_AI_CLIENT_ID and GLOO_AI_CLIENT_SECRET environment variables
    const env = getEnv();

    expect(env.GLOO_AI_CLIENT_ID).toBeTruthy();
    expect(env.GLOO_AI_CLIENT_SECRET).toBeTruthy();

    // Create a mock request with query parameter
    const request = new Request(
      'http://localhost:3002/api/glooai/affiliate-recommendations?q=test%20query'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('query', 'test query');
    expect(data).toHaveProperty('results');
    expect(Array.isArray(data.results)).toBe(true);
    expect(data).toHaveProperty('count');
    expect(typeof data.count).toBe('number');
  });

  it('should handle optional parameters correctly', async () => {
    const env = getEnv();

    // Only run this test if credentials are available
    if (env.GLOO_AI_CLIENT_ID && env.GLOO_AI_CLIENT_SECRET) {
      const request = new Request(
        'http://localhost:3002/api/glooai/affiliate-recommendations?q=test&media_types=article,book&certainty_threshold=0.5'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('options');
      expect(data.options).toHaveProperty('media_types', ['article', 'book']);
      expect(data.options).toHaveProperty('certainty_threshold', 0.5);
    }
  });

  it('should return 400 error when query parameter is missing', async () => {
    const request = new Request(
      'http://localhost:3002/api/glooai/affiliate-recommendations'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('Search query parameter "q" is required');
  });

  it('should handle empty query parameter gracefully', async () => {
    const request = new Request(
      'http://localhost:3002/api/glooai/affiliate-recommendations?q='
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('Search query parameter "q" is required');
  });

  it('should parse numeric parameters correctly', async () => {
    const env = getEnv();

    // Only run this test if credentials are available
    if (env.GLOO_AI_CLIENT_ID && env.GLOO_AI_CLIENT_SECRET) {
      const request = new Request(
        'http://localhost:3002/api/glooai/affiliate-recommendations?q=test&max_snippet_count_overall=50&min_snippet_count_per_item=2'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('options');
      expect(data.options).toHaveProperty('max_snippet_count_overall', 50);
      expect(data.options).toHaveProperty('min_snippet_count_per_item', 2);
    }
  });

  it('should parse publishers parameter as array', async () => {
    const env = getEnv();

    // Only run this test if credentials are available
    if (env.GLOO_AI_CLIENT_ID && env.GLOO_AI_CLIENT_SECRET) {
      const request = new Request(
        'http://localhost:3002/api/glooai/affiliate-recommendations?q=test&publishers=publisher1,publisher2,publisher3'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('options');
      expect(data.options).toHaveProperty('publishers');
      expect(Array.isArray(data.options.publishers)).toBe(true);
      expect(data.options.publishers).toEqual([
        'publisher1',
        'publisher2',
        'publisher3',
      ]);
    }
  });

  describe('Error Handling', () => {
    it('should handle authentication errors gracefully', async () => {
      // This test documents expected behavior for authentication failures
      // The API should return appropriate error responses when authentication fails
    });

    it('should handle network errors gracefully', async () => {
      // This test documents expected behavior for network failures
      // The API should return appropriate error responses when the external API is unavailable
    });
  });
});
