# Legacy Search Content Tool

This was the original search tool implementation before we switched to the MCP `search` and `fetch` pattern.

## Original Implementation

```typescript
import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import { searchTranscripts, searchSegments } from "../utils/fuzzySearch";

// Define the schema for tool parameters
export const schema = {
  searchQuery: z.string().describe("The search query to look for content"),
};

// Define tool metadata with component reference
export const metadata: ToolMetadata & { _meta?: any } = {
  name: "searchContent",
  description: "Search for content using a query",
  annotations: {
    title: "Search Content",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
  _meta: {
    "openai/outputTemplate": "widgets://search-results-widget",
    "openai/toolInvocation/invoking": "Searching for podcasts...",
    "openai/toolInvocation/invoked": "Found podcasts!",
  },
};

// Tool implementation
export default async function searchContent({ searchQuery }: InferSchema<typeof schema>) {
  try {
    // Search transcripts using fuzzy search
    const transcriptResults = await searchTranscripts(searchQuery, 10);
    
    // Search for specific segments
    const segmentResults = await searchSegments(searchQuery, 15);
    
    // Format results for the widget
    const formattedResults = transcriptResults.map(result => ({
      title: result.title,
      description: result.transcript.substring(0, 200) + (result.transcript.length > 200 ? '...' : ''),
      host: "Life.Church Training", // Default host since these are training videos
      training_url: result.training_url,
      video_url: result.video_url,
      relevance_score: result.relevance_score,
      matched_segments: result.matched_segments?.slice(0, 3) || [] // Top 3 segments
    }));

    return {
      content: [
        {
          type: "text",
          text: `Found ${transcriptResults.length} training videos and ${segmentResults.length} segments matching "${searchQuery}"`
        }
      ],
      structuredContent: {
        query: searchQuery,
        results: formattedResults,
        totalResults: transcriptResults.length,
        segmentResults: segmentResults.slice(0, 10), // Top 10 segments
        searchMetadata: {
          totalTranscripts: transcriptResults.length,
          totalSegments: segmentResults.length,
          searchType: "fuzzy"
        }
      }
    };
  } catch (error) {
    console.error('Search error:', error);
    
    // Fallback to mock data if search fails
    const podcasts = [
      {
        title: "The Carey Nieuwhof Leadership Podcast",
        description: "Interviews with leaders you'd actually want to meet for coffee. Learn from their wins and losses.",
        host: "Carey Nieuwhof"
      },
      {
        title: "Andy Stanley Leadership Podcast", 
        description: "Leadership principles and practical insights from one of today's most influential leadership voices.",
        host: "Andy Stanley"
      },
      {
        title: "Craig Groeschel Leadership Podcast",
        description: "Practical leadership strategies to help you lead yourself, your team, and your organization.",
        host: "Craig Groeschel"
      }
    ];

    return {
      content: [
        {
          type: "text",
          text: `Search temporarily unavailable. Showing ${podcasts.length} sample podcasts for "${searchQuery}"`
        }
      ],
      structuredContent: {
        query: searchQuery,
        results: podcasts,
        totalResults: podcasts.length,
        searchMetadata: {
          error: "Search service unavailable",
          fallback: true
        }
      }
    };
  }
}
```

## Key Features

- **Widget Integration**: Used `openai/outputTemplate` to render results in a custom widget
- **Dual Search**: Searched both transcripts and segments
- **Rich Formatting**: Returned structured content with metadata
- **Fallback Data**: Provided mock podcast data when search failed
- **Segment Highlighting**: Included matched segments with timestamps

## Why It Was Replaced

This tool was replaced with the MCP `search` and `fetch` pattern to:
- Follow the standard MCP protocol for ChatGPT connectors
- Enable deep research functionality
- Provide a simpler, more focused API
- Allow for better integration with external tools

## Migration Notes

The new MCP pattern separates concerns:
- `search`: Returns basic document info (id, title, url)
- `fetch`: Returns full document content
- Widget rendering is handled separately if needed

The fuzzy search logic in `src/utils/fuzzySearch.ts` remains unchanged and is reused by the new tools.

