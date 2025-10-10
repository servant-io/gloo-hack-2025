import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
import { searchContent } from '@/lib/content/search/v2';

// Mock the searchContent function
vi.mock('@/lib/content/search/v2', () => ({
  searchContent: vi.fn(),
}));

describe('GET /api/content/search/v2', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 if query parameter is missing', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/content/search/v2'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Query parameter "q" is required' });
  });

  it('should return search results when query is provided', async () => {
    const mockResults = [
      {
        id: '1',
        contentCreatorId: 'creator-1',
        type: 'video' as const,
        name: 'Test Video',
        shortDescription: 'A test video description',
        thumbnailUrl: 'http://example.com/thumb.jpg',
        mediaUrl: 'http://example.com/video.mp4',
        transcript: 'This is a test transcript',
        fullTextUrl: 'http://example.com/full',
        biblicalNarrative: 'Genesis',
      },
    ];

    vi.mocked(searchContent).mockResolvedValue(mockResults);

    const request = new NextRequest(
      'http://localhost:3000/api/content/search/v2?q=test'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ results: mockResults });
    expect(vi.mocked(searchContent)).toHaveBeenCalledWith('test');
  });

  it('should handle search errors gracefully', async () => {
    vi.mocked(searchContent).mockRejectedValue(new Error('Search failed'));

    const request = new NextRequest(
      'http://localhost:3000/api/content/search/v2?q=test'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Internal server error' });
  });
});
