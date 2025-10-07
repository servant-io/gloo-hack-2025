import { z } from 'zod';
import { type ToolMetadata, type InferSchema } from 'xmcp';
import { searchTranscripts } from '../utils/fuzzySearch';

// Define the schema for tool parameters
export const schema = {
  query: z.string().describe('The search query to look for content'),
};

// Define tool metadata
export const metadata: ToolMetadata = {
  name: 'search',
  description:
    'Search for documents using a query. Returns a list of relevant search results with basic information.',
  annotations: {
    title: 'Search Documents',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

// Tool implementation
export default async function search({ query }: InferSchema<typeof schema>) {
  try {
    if (!query || !query.trim()) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ results: [] }),
          },
        ],
      };
    }

    // Search transcripts using fuzzy search
    const transcriptResults = await searchTranscripts(query, 10);

    // Format results for MCP search pattern
    const results = transcriptResults.map((result) => ({
      id: result.id,
      title: result.title,
      url: result.training_url || result.video_url,
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ results }),
        },
      ],
    };
  } catch (error) {
    console.error('Search error:', error);

    // Return empty results on error
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ results: [] }),
        },
      ],
    };
  }
}
