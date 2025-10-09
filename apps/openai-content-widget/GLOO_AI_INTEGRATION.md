# Gloo AI Integration

This document explains how the Scripture Journey Explorer widget integrates with Gloo AI through the content-proxy API, simulating the full ChatGPT discovery flow.

## Mock User Query Configuration

The POC simulates a user discovering this widget through ChatGPT. The original ChatGPT prompt is configured in `src/config/mockUserQuery.ts`:

```typescript
export const DEFAULT_MOCK_QUERY: MockUserQuery = {
  originalPrompt:
    "I'm studying the Gospel of Luke and Acts for a Bible study group I'm leading. Can you help me understand how these two books connect and what the main themes are?",
  contentTheme: 'Luke-Acts',
  conversationContext: 'User is preparing to lead a Bible study group...',
};
```

**To test different scenarios**, simply change which query is exported in the config file. Several alternatives are provided:

- `EARLY_CHURCH_QUERY` - Focus on church history
- `THEOLOGICAL_QUERY` - Comparative Gospel study
- `NEW_BELIEVER_QUERY` - New Christian seeking guidance
- `ACADEMIC_QUERY` - Research-focused approach

This original prompt and context is passed through to all Gloo AI calls, ensuring AI responses are tailored to the user's actual need.

## Architecture

```
┌─────────────────────────┐
│  openai-content-widget  │
│   (Vite/React App)      │
│                         │
│  - Video display        │
│  - User interactions    │
│  - AI content requests  │
└────────┬────────────────┘
         │
         │ HTTP POST
         │ /api/glooai/completions
         ▼
┌─────────────────────────┐
│    content-proxy        │
│   (Next.js API)         │
│                         │
│  - Auth management      │
│  - API credentials      │
│  - Request routing      │
└────────┬────────────────┘
         │
         │ Authenticated request
         │
         ▼
┌─────────────────────────┐
│   Gloo AI Platform      │
│                         │
│  - Chat completions     │
│  - AI models            │
└─────────────────────────┘
```

## Why This Approach?

**Centralized Authentication**: The content-proxy handles Gloo AI credentials (client ID/secret), keeping them secure and out of the client app.

**Single Source of Truth**: All apps in the monorepo can use the same API endpoint for Gloo AI completions.

**Simpler Client**: The widget just needs the content-proxy URL, not direct Gloo AI access.

## Implementation

### Configuration

Set the content-proxy URL in `.env.local`:

```env
VITE_CONTENT_PROXY_URL=http://localhost:3002
```

### AI Functions

**1. `fetchGlooAIRelevance(contentList, userQuery)`**

Generates AI content for a collection of videos:

- **Overview**: 2-3 sentence summary of the video collection
- **Key Themes**: 3-5 biblical themes formatted as bullet points
- **Relevance**: 3-4 sentence explanation of how content relates to user query

Used in: `useAIWidget` hook (loads when widget initializes)

**2. `generateVideoContext(video)`**

Generates AI content for a single video:

- **Overview**: 2-3 sentence summary of what viewers will learn
- **Relevance**: 2-3 sentence explanation of why this content matters

Used in: `ExpandedPreviewCard` component (loads when user clicks a video)

### API Calls

Each function constructs appropriate system and user messages, then calls:

```typescript
POST ${CONTENT_PROXY_URL}/api/glooai/completions

Body:
{
  "messages": [
    { "role": "system", "content": "You are a biblical expert..." },
    { "role": "user", "content": "Generate overview for..." }
  ],
  "temperature": 0.7,
  "max_tokens": 800
}
```

### Error Handling

If the API call fails:

1. Error is logged to console
2. Fallback to generic (but contextual) content
3. User experience is not disrupted

This ensures the widget works even if:

- Content-proxy is unavailable
- Network issues occur
- API rate limits are hit

## Performance

**Parallel Requests**: Multiple AI generations (overview, themes, relevance) are called in parallel using `Promise.all()` for faster response times.

**Reasonable Limits**:

- Max tokens: 800 (controls response length and cost)
- Temperature: 0.7 (balanced between accuracy and creativity)

## Testing

### Local Development

1. **Configure CORS** in content-proxy's `.env.local`:

   ```bash
   CONTENT_PROXY_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3003
   ```

2. Start content-proxy: `pnpm --filter content-proxy dev` (port 3002)
3. Start widget: `pnpm --filter openai-content-widget dev` (port 3003)
4. Widget will call `http://localhost:3002/api/glooai/completions`

**Important:** Without `http://localhost:3003` in `CONTENT_PROXY_ALLOWED_ORIGINS`, you'll get CORS errors.

### Production

1. Deploy content-proxy to Vercel
2. Set `VITE_CONTENT_PROXY_URL` in widget's Vercel env vars
3. Widget will call your deployed API URL

## Example Prompts

### Video Overview

```
System: You are a biblical content expert. Provide concise, engaging video overviews.

User: Write a 2-3 sentence overview for a video titled "Luke 1-9".
Description: An overview of the first nine chapters of Luke's Gospel.
Explain what viewers will learn.
```

### Key Themes

```
System: You are a theological expert. Identify key biblical themes in content.

User: List 3-5 key themes from these videos about "Luke-Acts":
Luke 1-9, Luke 10-24, Acts 1-12, Acts 13-28.
Format each theme as "**Theme Name**: Brief explanation."
Separate with double newlines.
```

### Relevance

```
System: You are a helpful assistant explaining why biblical content is relevant to user questions.

User: Explain in 3-4 sentences how these videos about "Luke-Acts"
(Luke 1-9, Luke 10-24, Acts 1-12) relate to this question:
"Tell me about Luke-Acts". Be specific about what the content covers.
```

## Future Enhancements

- **Caching**: Cache AI responses in Supabase to reduce API calls
- **Personalization**: Use conversation history to tailor responses
- **Streaming**: Stream responses for real-time feedback
- **User Feedback**: Allow users to rate AI content quality
