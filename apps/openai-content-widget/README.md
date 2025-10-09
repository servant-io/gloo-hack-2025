# Scripture Journey Explorer

A modern, interactive widget for exploring biblical content with a beautiful horizontal scrolling interface.

## Purpose & Context

This app is a **proof-of-concept demonstration** of how OpenAI's Apps SDK can enhance conversational AI experiences.

### The Vision

When a user asks ChatGPT (or similar AI platforms) a question about Christian/Bible/faith-based topics, the AI could:

1. **Discover** relevant apps like Scripture Journey Explorer through the Apps SDK
2. **Recommend** the app as an enhancement to the text response
3. **Embed** this interactive widget directly in the chat thread (with user consent)
4. **Provide** a richer, more engaging experience beyond plain text

### Use Case Example

**User:** "Can you help me understand the Sermon on the Mount?"

**ChatGPT:** _[Provides text explanation]_ + "I found an interactive video series that might help. Would you like me to show you the Scripture Journey Explorer?"

**User:** "Yes"

**Result:** This widget embeds in the chat, showing curated video content, allowing the user to browse, bookmark, and watch relevant biblical content without leaving the conversation.

### Key Benefits

- **Contextual Discovery**: AI identifies when rich media would enhance understanding
- **Seamless Integration**: No context switching—explore content within the chat
- **User Control**: Explicit consent before embedding third-party experiences
- **Enhanced Learning**: Visual and interactive content supplements AI explanations

This POC demonstrates the technical feasibility and UX patterns for next-generation conversational AI interfaces.

## Monorepo Integration

This app is integrated into the Gloo Hackathon 2025 Turborepo monorepo. It runs as a standalone Vite app on port 3003.

### Development Commands

From the monorepo root:

```bash
# Run all apps including this one
pnpm dev

# Run only this app
pnpm --filter openai-content-widget dev

# Build this app
pnpm --filter openai-content-widget build

# Lint this app
pnpm --filter openai-content-widget lint

# Type check this app
pnpm --filter openai-content-widget check-types
```

### Deployment to Vercel

This app will be deployed as a standalone app to Vercel. The build configuration:

- **Framework Preset**: Vite
- **Build Command**: `cd ../.. && pnpm --filter openai-content-widget build`
- **Output Directory**: `apps/openai-content-widget/dist`
- **Install Command**: `pnpm install`

**Required Environment Variables for Vercel:**

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `VITE_CONTENT_PROXY_URL` - Your deployed content-proxy URL (e.g., `https://your-content-proxy.vercel.app`)

## Features

### 🎬 Content Discovery

- **Horizontal Scrolling Timeline**: Smooth, horizontal scrolling interface with snap-to-position behavior
- **Series Grouping**: Videos automatically organized by series (New Testament Overviews, Sermon on the Mount, etc.)
- **Rich Previews**: High-quality thumbnails with duration badges and series labels

### 💳 Credit System

- **5 Free Credits**: Each user starts with 5 credits for premium content
- **Smart Pricing**: Free content accessible without credits, premium content requires 1 credit
- **Visual Indicators**: Clear gold badges and status dots distinguish premium vs free content
- **Credit Tracking**: Real-time credit balance display in header

### 📚 Study Plan

- **Bookmark System**: Save videos to your personal study plan
- **Persistent Storage**: Bookmarks saved to Supabase database
- **Quick Access**: Easily toggle bookmarks from timeline or expanded view

### 🎨 Beautiful Design

- **Modern UI**: Clean, professional design with smooth animations
- **Responsive**: Fully responsive from mobile to desktop
- **Accessible**: Keyboard navigation and ARIA labels throughout
- **No Purple**: Design uses blues, greens, grays, and gold accents (no purple/violet)

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: Gloo AI via content-proxy API
- **Icons**: Lucide React
- **Animations**: CSS transitions + custom keyframes

### AI-Enhanced Content

The widget uses Gloo AI to generate contextual insights for videos:

- **Video Overviews**: AI-generated summaries explaining what viewers will learn
- **Key Themes**: Identified biblical themes across video collections
- **Relevance Explanations**: How content relates to user queries

All AI calls are routed through the `content-proxy` app's `/api/glooai/completions` endpoint, which handles authentication with the Gloo AI platform. This keeps API credentials centralized and secure.

#### Mock User Query Configuration

The POC simulates the ChatGPT discovery flow. The original user prompt is configured in `src/config/mockUserQuery.ts`:

```typescript
// Default: Bible study leader preparing to teach
export const DEFAULT_MOCK_QUERY: MockUserQuery = {
  originalPrompt: "I'm studying the Gospel of Luke and Acts...",
  contentTheme: 'Luke-Acts',
  conversationContext: 'User is preparing to lead a Bible study group...',
};
```

**To test different scenarios**, change which query is exported. This original prompt is passed to all Gloo AI calls, ensuring AI responses are tailored to the user's actual need from ChatGPT.

## Project Structure

```
src/
├── components/
│   ├── ScriptureJourneyTimeline.tsx  # Main container component
│   ├── SeriesGroup.tsx               # Groups videos by series
│   ├── TimelineNode.tsx              # Individual video card
│   ├── ExpandedPreviewCard.tsx       # Modal preview with actions
│   └── CreditsIndicator.tsx          # Credit balance display
│
├── hooks/
│   ├── useCredits.ts                 # Credit management
│   ├── useVideoData.ts               # Video fetching and grouping
│   └── useStudyPlan.ts               # Bookmark management
│
├── utils/
│   ├── supabase.ts                   # Supabase client config
│   ├── dataTransform.ts              # Data transformation utilities
│   └── seedDatabase.ts               # Database seeding script
│
└── types/
    └── types.ts                       # TypeScript interfaces
```

## Database Schema

### Tables

1. **content_items** - Video content metadata
   - id, name, description, thumbnail, media URL
   - series_title, duration_seconds, is_premium
   - Created with RLS for public read access

2. **user_credits** - Credit balances
   - user_id, credits_remaining, total_credits_earned
   - Tracks credit usage and history

3. **study_plan_bookmarks** - Saved content
   - user_id, content_id, bookmarked_at, notes
   - Unique constraint on user + content

4. **watch_history** - Viewing analytics
   - user_id, content_id, watched_at, credits_used
   - Tracks what users have watched

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account (or use provided credentials)

### Installation

```bash
# From monorepo root, install all dependencies
pnpm install

# Run development server (port 3003)
pnpm --filter openai-content-widget dev

# Build for production
pnpm --filter openai-content-widget build
```

### Environment Variables

Create a `.env.local` file in the `apps/openai-content-widget` directory:

```env
# Supabase configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Content Proxy API (for Gloo AI completions)
VITE_CONTENT_PROXY_URL=http://localhost:3002
```

**Note:** These values need to be added manually. Do not commit the `.env.local` file.

**For production/Vercel:**

- Set `VITE_CONTENT_PROXY_URL` to your deployed content-proxy URL
- The widget calls the content-proxy's `/api/glooai/completions` endpoint for AI-generated content

### First Run

On first launch, the app will:

1. Check if database is seeded
2. If not, automatically load video content from `public/extracted_video_data_all.json`
3. Insert all videos into Supabase
4. Set localStorage flag to prevent re-seeding

## Usage

### Browsing Content

- **Scroll horizontally** through video series
- **Click any video** to see expanded preview
- **Hover over cards** for smooth zoom effect
- **Bookmark icon** (top-left) to save to study plan

### Watching Videos

1. Click video card to open preview
2. Click "Watch Now" (free) or "Watch with Credit" (premium)
3. Video opens in new tab
4. Credits automatically deducted for premium content

### Managing Bookmarks

- Click bookmark icon on any card
- View bookmarked status in expanded preview
- Bookmarks persist across sessions
- Future: Filter view to show only bookmarks

## Components API

### ScriptureJourneyTimeline

Main container component that orchestrates the entire timeline.

```tsx
<ScriptureJourneyTimeline />
```

No props needed - handles all state internally.

### TimelineNode

Individual video card in the timeline.

```tsx
<TimelineNode
  video={videoContent}
  isBookmarked={boolean}
  onSelect={(video) => void}
  onToggleBookmark={(id) => void}
/>
```

### ExpandedPreviewCard

Modal preview when video is selected.

```tsx
<ExpandedPreviewCard
  video={videoContent}
  isBookmarked={boolean}
  hasCredits={boolean}
  onClose={() => void}
  onWatchNow={() => void}
  onToggleBookmark={() => void}
/>
```

## Custom Hooks

### useCredits()

```tsx
const {
  creditsRemaining,
  totalCreditsEarned,
  loading,
  error,
  deductCredit,
  addCredits,
  hasCredits,
} = useCredits();
```

### useVideoData()

```tsx
const { videos, seriesGroups, loading, error } = useVideoData();
```

### useStudyPlan()

```tsx
const { bookmarks, loading, error, isBookmarked, toggleBookmark, addNote } =
  useStudyPlan();
```

## Styling

### Color Palette

- **Primary Blue**: #2563eb (buttons, links, accents)
- **Premium Gold**: #f59e0b (premium badges, coins)
- **Success Green**: #10b981 (free content indicators)
- **Grays**: #111827 (text), #6b7280 (secondary), #f9fafb (backgrounds)

### Key Animations

- `animate-fade-in`: 200ms fade entrance
- `animate-scale-in`: 300ms scale entrance
- Card hover: scale(1.05) transform
- Thumbnail zoom: scale(1.1) on hover

## Future Enhancements

- [ ] Filter by series or content type
- [ ] Search functionality
- [ ] Watch progress tracking
- [ ] Auto-play next video in series
- [ ] Social sharing
- [ ] Credit purchase system
- [ ] Download transcripts
- [ ] Playback speed controls
- [ ] Picture-in-picture mode

## Performance

- **Lazy loading**: Images load as needed
- **Horizontal virtualization**: Only render visible cards (future optimization)
- **Database indexing**: Optimized queries on series, premium, dates
- **Batch inserts**: Seed database in 50-item batches

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT

## Credits

Built with ❤️ using:

- Video content from BibleProject
- Design inspired by modern video platforms
- Icons by Lucide
