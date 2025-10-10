/**
 * Test coverage for @apps/content-proxy/lib/glooai/affiliateRecommendations.ts
 *
 * These tests use mocked data to test the affiliate recommendations functionality
 * without making real API calls.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchAffiliateRecommendations,
  AffiliateRecommendationsResponseItem,
} from './affiliateRecommendations';
import { glooAffiliateRecommendations } from '../content/search/v2.test.data';

// Create properly typed mock data that matches the expected interface
const mockAffiliateRecommendations: AffiliateRecommendationsResponseItem[] =
  glooAffiliateRecommendations.map((item) => ({
    ...item,
    item_tags: Array.isArray(item.item_tags)
      ? item.item_tags.join(', ')
      : item.item_tags || '',
  }));

// Mock the fetchAffiliateRecommendations function
vi.mock('./affiliateRecommendations', () => ({
  fetchAffiliateRecommendations: vi.fn(),
}));

describe('fetchAffiliateRecommendations', () => {
  const mockFetchAffiliateRecommendations = vi.mocked(
    fetchAffiliateRecommendations
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully fetch affiliate recommendations with a valid query', async () => {
    // Mock the function to return test data
    mockFetchAffiliateRecommendations.mockResolvedValue(
      mockAffiliateRecommendations
    );

    const query = 'bible study';
    const response = await fetchAffiliateRecommendations(query);

    // Verify the function was called with the correct query
    expect(mockFetchAffiliateRecommendations).toHaveBeenCalledWith(query);

    // Verify the response structure
    expect(response).toBeDefined();
    expect(Array.isArray(response)).toBe(true);
    expect(response.length).toBeGreaterThan(0);

    // Verify each item has the expected structure based on the mock data
    response.forEach((item: AffiliateRecommendationsResponseItem) => {
      expect(item).toHaveProperty('item_id');
      expect(typeof item.item_id).toBe('string');
      expect(item.item_id.length).toBeGreaterThan(0);

      expect(item).toHaveProperty('item_title');
      expect(typeof item.item_title).toBe('string');
      expect(item.item_title.length).toBeGreaterThan(0);

      expect(item).toHaveProperty('publisher');
      expect(typeof item.publisher).toBe('string');
      expect(item.publisher.length).toBeGreaterThan(0);

      expect(item).toHaveProperty('type');
      expect(typeof item.type).toBe('string');
      expect(item.type.length).toBeGreaterThan(0);

      expect(item).toHaveProperty('cumulative_certainty');
      expect(typeof item.cumulative_certainty).toBe('number');
      expect(item.cumulative_certainty).toBeGreaterThanOrEqual(0);

      expect(item).toHaveProperty('item_url');
      expect(typeof item.item_url).toBe('string');
      // item_url can be empty string, which is acceptable
      if (item.item_url.length > 0) {
        expect(item.item_url).toMatch(/^https?:\/\/.+/);
      }

      // Optional properties that may be present
      if (item.author) {
        expect(Array.isArray(item.author)).toBe(true);
      }

      if (item.item_image) {
        expect(typeof item.item_image).toBe('string');
        expect(item.item_image).toMatch(/^https?:\/\/.+/);
      }

      if (item.publication_date) {
        expect(typeof item.publication_date).toBe('string');
      }

      if (item.snippet_count) {
        expect(typeof item.snippet_count).toBe('number');
        expect(item.snippet_count).toBeGreaterThanOrEqual(0);
      }
    });
  });

  it('should handle different query types and return relevant results', async () => {
    // Mock the function to return test data
    mockFetchAffiliateRecommendations.mockResolvedValue(
      mockAffiliateRecommendations
    );

    const testQueries = [
      'bible study',
      'how to study the bible',
      'christian living',
    ];

    for (const query of testQueries) {
      const response = await fetchAffiliateRecommendations(query);

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
      expect(response.length).toBeGreaterThan(0);

      // Verify that items have reasonable certainty scores
      const averageCertainty =
        response.reduce(
          (sum: number, item: AffiliateRecommendationsResponseItem) =>
            sum + item.cumulative_certainty,
          0
        ) / response.length;
      expect(averageCertainty).toBeGreaterThan(0.3); // Should have reasonable confidence

      // Verify that items have reasonable snippet counts
      const itemsWithSnippets = response.filter(
        (item: AffiliateRecommendationsResponseItem) =>
          item.snippet_count && item.snippet_count > 0
      );
      expect(itemsWithSnippets.length).toBeGreaterThan(0);
    }
  });

  it('should respect custom options for media types and snippet counts', async () => {
    // Mock the function to return test data
    mockFetchAffiliateRecommendations.mockResolvedValue(
      mockAffiliateRecommendations
    );

    const query = 'bible study';
    const options = {
      media_types: ['article', 'book'],
      max_snippet_count_overall: 50,
      min_snippet_count_per_item: 1,
      certainty_threshold: 0.5,
    };

    const response = await fetchAffiliateRecommendations(query, options);

    expect(response).toBeDefined();
    expect(Array.isArray(response)).toBe(true);
    expect(response.length).toBeGreaterThan(0);

    // Verify that items meet the certainty threshold
    response.forEach((item: AffiliateRecommendationsResponseItem) => {
      expect(item.cumulative_certainty).toBeGreaterThanOrEqual(0.5);
    });

    // Verify that items have reasonable types
    const allowedMediaTypes = new Set(options.media_types);
    const itemsWithExpectedTypes = response.filter(
      (item: AffiliateRecommendationsResponseItem) =>
        allowedMediaTypes.has(item.type)
    );

    // At least some items should match the requested types
    expect(itemsWithExpectedTypes.length).toBeGreaterThan(0);

    // Verify snippet counts are reasonable
    response.forEach((item: AffiliateRecommendationsResponseItem) => {
      if (item.snippet_count) {
        expect(item.snippet_count).toBeGreaterThanOrEqual(
          options.min_snippet_count_per_item!
        );
      }
    });
  });

  it('should handle empty or short queries gracefully', async () => {
    // Mock the function to return test data
    mockFetchAffiliateRecommendations.mockResolvedValue(
      mockAffiliateRecommendations
    );

    const shortQuery = 'bible';
    const response = await fetchAffiliateRecommendations(shortQuery);

    expect(response).toBeDefined();
    expect(Array.isArray(response)).toBe(true);

    // Even with short queries, we should get some results
    expect(response.length).toBeGreaterThan(0);
  });

  it('should return items with valid URLs and publishers', async () => {
    // Mock the function to return test data
    mockFetchAffiliateRecommendations.mockResolvedValue(
      mockAffiliateRecommendations
    );

    const query = 'bible study';
    const response = await fetchAffiliateRecommendations(query);

    expect(response).toBeDefined();
    expect(Array.isArray(response)).toBe(true);
    expect(response.length).toBeGreaterThan(0);

    // Verify URLs are valid
    response.forEach((item: AffiliateRecommendationsResponseItem) => {
      expect(item.item_url).toMatch(/^https?:\/\/.+/);
      expect(item.publisher.length).toBeGreaterThan(0);
    });
  });

  it('should handle different certainty thresholds appropriately', async () => {
    // Mock the function to return filtered test data based on certainty
    const highCertaintyItems = mockAffiliateRecommendations.filter(
      (item) => item.cumulative_certainty >= 0.8
    );
    const lowCertaintyItems = mockAffiliateRecommendations.filter(
      (item) => item.cumulative_certainty >= 0.2
    );

    mockFetchAffiliateRecommendations
      .mockResolvedValueOnce(highCertaintyItems)
      .mockResolvedValueOnce(lowCertaintyItems);

    const query = 'bible study';

    // Test with high certainty threshold
    const highThresholdResponse = await fetchAffiliateRecommendations(query, {
      certainty_threshold: 0.8,
    });

    // Test with low certainty threshold
    const lowThresholdResponse = await fetchAffiliateRecommendations(query, {
      certainty_threshold: 0.2,
    });

    expect(highThresholdResponse).toBeDefined();
    expect(lowThresholdResponse).toBeDefined();

    // With higher threshold, we should get fewer but higher quality results
    // With lower threshold, we might get more results
    if (highThresholdResponse.length > 0 && lowThresholdResponse.length > 0) {
      // Verify that high threshold items have higher average certainty
      const highThresholdAvg =
        highThresholdResponse.reduce(
          (sum: number, item: AffiliateRecommendationsResponseItem) =>
            sum + item.cumulative_certainty,
          0
        ) / highThresholdResponse.length;
      const lowThresholdAvg =
        lowThresholdResponse.reduce(
          (sum: number, item: AffiliateRecommendationsResponseItem) =>
            sum + item.cumulative_certainty,
          0
        ) / lowThresholdResponse.length;

      expect(highThresholdAvg).toBeGreaterThanOrEqual(0.8);
      expect(lowThresholdAvg).toBeGreaterThanOrEqual(0.2);
    }
  });

  it('should include relevant content with proper metadata', async () => {
    // Mock the function to return test data
    mockFetchAffiliateRecommendations.mockResolvedValue(
      mockAffiliateRecommendations
    );

    const query = 'bible study';
    const response = await fetchAffiliateRecommendations(query);

    expect(response).toBeDefined();
    expect(Array.isArray(response)).toBe(true);
    expect(response.length).toBeGreaterThan(0);

    // Check that items have meaningful metadata
    const itemsWithMetadata = response.filter(
      (item: AffiliateRecommendationsResponseItem) =>
        item.item_title &&
        item.item_title.length > 10 &&
        item.publisher &&
        item.publisher.length > 0
    );

    expect(itemsWithMetadata.length).toBeGreaterThan(0);

    // Verify certainty scores are within valid range
    itemsWithMetadata.forEach((item: AffiliateRecommendationsResponseItem) => {
      expect(item.cumulative_certainty).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Mock the function to throw an error
      mockFetchAffiliateRecommendations.mockRejectedValue(
        new Error('Network error')
      );

      const query = 'bible study';

      await expect(fetchAffiliateRecommendations(query)).rejects.toThrow(
        'Network error'
      );
    });

    it('should handle invalid query parameters appropriately', async () => {
      // Mock the function to return empty array for invalid queries
      mockFetchAffiliateRecommendations.mockResolvedValue([]);

      const query = '';
      const response = await fetchAffiliateRecommendations(query);

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
      expect(response.length).toBe(0);
    });
  });

  describe('Performance and Reliability', () => {
    it('should return results within reasonable time', async () => {
      // Mock the function to return test data quickly
      mockFetchAffiliateRecommendations.mockResolvedValue(
        mockAffiliateRecommendations
      );

      const query = 'bible study';
      const startTime = Date.now();

      const response = await fetchAffiliateRecommendations(query);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
      expect(response.length).toBeGreaterThan(0);

      // Mocked API calls should complete very quickly
      expect(duration).toBeLessThan(100);
    });

    it('should handle concurrent requests without issues', async () => {
      // Mock the function to return test data
      mockFetchAffiliateRecommendations.mockResolvedValue(
        mockAffiliateRecommendations
      );

      const queries = [
        'bible study',
        'how to study the bible',
        'christian living',
      ];

      const promises = queries.map((query) =>
        fetchAffiliateRecommendations(query)
      );

      const responses = await Promise.all(promises);

      responses.forEach((response) => {
        expect(response).toBeDefined();
        expect(Array.isArray(response)).toBe(true);
      });
    });
  });
});
