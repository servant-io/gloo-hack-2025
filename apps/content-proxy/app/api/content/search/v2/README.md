# Content Search V2 API

This API provides search functionality for content items, combining results from both the local database and Gloo affiliate recommendations.

## Endpoint

`GET /api/content/search/v2`

## Query Parameters

- `q` (required): The search query string

## Response

```typescript
{
  "results": ContentItem[]
}
```

Where `ContentItem` has the following structure:

```typescript
interface ContentItem {
  id: string;
  contentCreatorId: string;
  type: 'video';
  name: string;
  shortDescription: string;
  thumbnailUrl: string;
  mediaUrl: string;
  transcript: string;
  fullTextUrl: string;
  biblicalNarrative: string;
}
```

## Example Request

```bash
curl "http://localhost:3002/api/content/search/v2?q=jesus"
```

## Example Response

```json
{
  "results": [
    {
      "id": "1",
      "contentCreatorId": "creator-1",
      "type": "video",
      "name": "The Life of Jesus",
      "shortDescription": "A comprehensive overview of Jesus' life and teachings",
      "thumbnailUrl": "http://example.com/jesus-thumb.jpg",
      "mediaUrl": "http://example.com/jesus-video.mp4",
      "transcript": "In the beginning was the Word...",
      "fullTextUrl": "http://example.com/jesus-full",
      "biblicalNarrative": "Gospels"
    }
  ]
}
```

## Error Responses

- **400 Bad Request**: Missing required query parameter `q`
- **500 Internal Server Error**: Server error during search execution

## Features

- **Combined Search**: Searches both local database content and Gloo affiliate recommendations
- **Relevance Scoring**: Results are sorted by relevance to the search query
- **Multiple Field Search**: Searches across title, description, transcript, and biblical narrative fields
- **Error Handling**: Graceful error handling with appropriate HTTP status codes

## Implementation Details

The search combines results from:

1. **Local Database**: Content stored in the application's database
2. **Gloo Affiliates**: External content recommendations from Gloo AI platform

Results are merged and sorted by relevance using a scoring algorithm that considers:

- Exact matches in content name (highest weight)
- Partial matches in content name
- Matches in description
- Matches in transcript
- Matches in biblical narrative
