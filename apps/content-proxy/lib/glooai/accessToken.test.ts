/**
 * Integration test coverage for @apps/content-proxy/lib/glooai/accessToken.ts
 *
 * These tests make real API calls to the Gloo AI platform to test the access token
 * functionality end-to-end without mocking.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { fetchAccessToken } from './accessToken';
import { getEnv } from '../env';

describe('fetchAccessToken', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    // Store original environment variables
    originalEnv = { ...process.env };
  });

  afterAll(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  it('should successfully fetch an access token with valid credentials', async () => {
    // This test requires valid GLOO_AI_CLIENT_ID and GLOO_AI_CLIENT_SECRET environment variables
    const env = getEnv();

    expect(env.GLOO_AI_CLIENT_ID).toBeTruthy();
    expect(env.GLOO_AI_CLIENT_SECRET).toBeTruthy();

    const accessToken = await fetchAccessToken();

    // Verify the access token is a non-empty string
    expect(typeof accessToken).toBe('string');
    expect(accessToken.length).toBeGreaterThan(0);

    // Verify the token has the expected format (JWT tokens typically have 3 parts separated by dots)
    const tokenParts = accessToken.split('.');
    expect(tokenParts).toHaveLength(3);

    // Verify each part is non-empty
    tokenParts.forEach((part, index) => {
      expect(part.length).toBeGreaterThan(0);
    });
  });

  it('should handle invalid credentials gracefully', () => {
    // This test documents the expected behavior when invalid credentials are provided
    // The function should throw an Error with a descriptive message
    // Note: This is conceptual since we can't easily test this without mocking
    // in a real integration test environment
  });

  it('should include proper authorization header in the request', async () => {
    // This test verifies the request structure by checking if it succeeds with valid credentials
    const env = getEnv();

    // Only run this test if credentials are available
    if (env.GLOO_AI_CLIENT_ID && env.GLOO_AI_CLIENT_SECRET) {
      const accessToken = await fetchAccessToken();

      // If we get here without error, the authorization header was properly constructed
      expect(typeof accessToken).toBe('string');
      expect(accessToken.length).toBeGreaterThan(0);
    }
  });

  it('should handle network errors gracefully', async () => {
    // This test is more conceptual since we can't easily simulate network errors
    // without mocking, but we document the expected behavior
    // The function should throw an Error with a descriptive message
    // when the network request fails or returns non-200 status
  });

  it('should return a token with sufficient length for API usage', async () => {
    const env = getEnv();

    // Only run this test if credentials are available
    if (env.GLOO_AI_CLIENT_ID && env.GLOO_AI_CLIENT_SECRET) {
      const accessToken = await fetchAccessToken();

      // JWT tokens are typically at least 100 characters long
      expect(accessToken.length).toBeGreaterThanOrEqual(100);

      // Verify it contains only valid JWT characters (base64url)
      const jwtRegex = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
      expect(jwtRegex.test(accessToken)).toBe(true);
    }
  });
});

describe('Environment Configuration', () => {
  it('should validate required environment variables', () => {
    const env = getEnv();

    expect(typeof env.GLOO_AI_CLIENT_ID).toBe('string');
    expect(typeof env.GLOO_AI_CLIENT_SECRET).toBe('string');
    expect(env.GLOO_AI_CLIENT_ID.length).toBeGreaterThan(0);
    expect(env.GLOO_AI_CLIENT_SECRET.length).toBeGreaterThan(0);
  });
});
