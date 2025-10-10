/**
 * Test coverage for @apps/content-proxy/app/api/glooai/affiliate-recommendations/route.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import {
  AffiliateRecommendationsResponseItem,
  fetchAffiliateRecommendations,
} from '../../../lib/glooai/affiliateRecommendations';

// Create mock data directly instead of importing
const mockAffiliateRecommendations: AffiliateRecommendationsResponseItem[] = [
  {
    item_id: 'c2808635-7291-4fad-beb5-61053c604903',
    author: ['Revive Our Hearts'],
    filename: 'reviving-a-lifeless-bible-study-IxRunf2LVl8zyigWEewhQ.txt',
    denomination: '',
    duration: '',
    item_title: 'Reviving a Lifeless Bible Study',
    item_subtitle: '',
    item_image:
      'https://d3tfn18lzrilkz.cloudfront.net/blogs.crossmap.com/app/uploads/2023/03/28225039/kelly-sikkema-YnRNdB-XTME-unsplash-3-qEOQpTU2-scaled.jpg',
    item_url:
      'https://blogs.crossmap.com/stories/reviving-a-lifeless-bible-study-IxRunf2LVl8zyigWEewhQ',
    item_tags: 'Bible,Devotionals,Revival,Spiritual Awareness & Enlightenment',
    h2_id: '',
    h2_title: '',
    h2_subtitle: '',
    h2_image: '',
    h2_url: '',
    h2_tags: null,
    h3_id: '',
    h3_title: '',
    h3_subtitle: '',
    h3_image: '',
    h3_url: '',
    h3_tags: null,
    h2_summary: '',
    publication_date: 'Jan 13 2022',
    publisher: 'Crossmap',
    publisher_id: '1b653cec-d9ae-4310-9c66-394fcb950726',
    publisher_url: 'www.crossmap.com',
    publisher_logo:
      'https://dapologeticsimages.s3.us-east-1.amazonaws.com/logos/logo_1751930142598.png',
    summary: '',
    type: 'article',
    hosted_url:
      'https://blogs.crossmap.com/stories/reviving-a-lifeless-bible-study-IxRunf2LVl8zyigWEewhQ',
    snippet_count: 1,
    cumulative_certainty: 0.7929625511169434,
  },
  {
    item_id: '5e725ac3-8b2b-4f3b-984a-34eb6f5b64c0',
    author: ['Mary Rooney Armand'],
    filename:
      'how-to-study-the-bible-and-grow-closer-to-god-5-powerful-ways-JReeErp5zpbwmiK0VcJkS.txt',
    denomination: '',
    duration: '',
    item_title:
      'How to Study the Bible and Grow Closer to God: 5 Powerful Ways',
    item_subtitle: '',
    item_image:
      'https://d3tfn18lzrilkz.cloudfront.net/blogs.crossmap.com/images/1738197581-vBj2zuJqiCLROcHNKSwWL.png',
    item_url:
      'https://blogs.crossmap.com/stories/how-to-study-the-bible-and-grow-closer-to-god-5-powerful-ways-JReeErp5zpbwmiK0VcJkS',
    item_tags: '',
    h2_id: '',
    h2_title: '',
    h2_subtitle: '',
    h2_image: '',
    h2_url: '',
    h2_tags: null,
    h3_id: '',
    h3_title: '',
    h3_subtitle: '',
    h3_image: '',
    h3_url: '',
    h3_tags: null,
    h2_summary: '',
    publication_date: 'Jan 29 2025',
    publisher: 'Crossmap',
    publisher_id: '1b653cec-d9ae-4310-9c66-394fcb950726',
    publisher_url: 'www.crossmap.com',
    publisher_logo:
      'https://dapologeticsimages.s3.us-east-1.amazonaws.com/logos/logo_1751930142598.png',
    summary: '',
    type: 'article',
    hosted_url:
      'https://blogs.crossmap.com/stories/how-to-study-the-bible-and-grow-closer-to-god-5-powerful-ways-JReeErp5zpbwmiK0VcJkS',
    snippet_count: 1,
    cumulative_certainty: 0.7888249158859253,
  },
];

// Mock the fetchAffiliateRecommendations function
vi.mock('../../../lib/glooai/affiliateRecommendations', () => ({
  fetchAffiliateRecommendations: vi.fn(),
}));

describe('GET /api/glooai/affiliate-recommendations', () => {
  const mockFetchAffiliateRecommendations = vi.mocked(
    fetchAffiliateRecommendations
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * @todo uncomment or remove this test case
   * @see https://github.com/servant-io/gloo-hack-2025/issues/35
   **/
  it.skip('should return affiliate recommendations for a valid query', async () => {
    // Mock the function to return test data
    mockFetchAffiliateRecommendations.mockResolvedValue(
      mockAffiliateRecommendations
    );

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
    expect(data.count).toBe(mockAffiliateRecommendations.length);
  });

  it('should handle optional parameters correctly', async () => {
    // Mock the function to return test data
    mockFetchAffiliateRecommendations.mockResolvedValue(
      mockAffiliateRecommendations
    );

    const request = new Request(
      'http://localhost:3002/api/glooai/affiliate-recommendations?q=test&media_types=article,book&certainty_threshold=0.5'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('options');
    expect(data.options).toHaveProperty('media_types', ['article', 'book']);
    expect(data.options).toHaveProperty('certainty_threshold', 0.5);
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
    // Mock the function to return test data
    mockFetchAffiliateRecommendations.mockResolvedValue(
      mockAffiliateRecommendations
    );

    const request = new Request(
      'http://localhost:3002/api/glooai/affiliate-recommendations?q=test&max_snippet_count_overall=50&min_snippet_count_per_item=2'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('options');
    expect(data.options).toHaveProperty('max_snippet_count_overall', 50);
    expect(data.options).toHaveProperty('min_snippet_count_per_item', 2);
  });

  it('should parse publishers parameter as array', async () => {
    // Mock the function to return test data
    mockFetchAffiliateRecommendations.mockResolvedValue(
      mockAffiliateRecommendations
    );

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
  });

  describe('Error Handling', () => {
    /**
     * @todo uncomment or remove this test case
     * @see https://github.com/servant-io/gloo-hack-2025/issues/35
     **/
    it.skip('should handle authentication errors gracefully', async () => {
      // Mock the function to throw an error
      mockFetchAffiliateRecommendations.mockRejectedValue(
        new Error('Authentication failed')
      );

      const request = new Request(
        'http://localhost:3002/api/glooai/affiliate-recommendations?q=test'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Authentication failed');
    });

    /**
     * @todo uncomment or remove this test case
     * @see https://github.com/servant-io/gloo-hack-2025/issues/35
     **/
    it.skip('should handle network errors gracefully', async () => {
      // Mock the function to throw an error
      mockFetchAffiliateRecommendations.mockRejectedValue(
        new Error('Network error')
      );

      const request = new Request(
        'http://localhost:3002/api/glooai/affiliate-recommendations?q=test'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Network error');
    });
  });
});
