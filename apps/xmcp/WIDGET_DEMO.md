# Widget Demo - Simplest Implementation

This is the **SIMPLEST POSSIBLE** implementation to demonstrate HTML component rendering in MCP.

## What Was Created

### 1. HTML Widget Component

**File:** `src/resources/(widgets)/search-results.ts`

A self-contained HTML page with:

- **Inline CSS** - gradient background, card styling, different styles for each result
- **Inline JavaScript** - reads `window.openai.toolOutput` and renders results
- **No build step required** - everything is in one file

### 2. Updated Search Tool

**File:** `src/tools/searchContent.ts`

Modified to:

- Reference the widget via `_meta["openai/outputTemplate"]`
- Return structured data with 4 hardcoded podcast results
- Provide custom status messages during invocation

## How It Works

1. **Tool Call**: When `searchContent` is called, it returns:
   - `content`: Plain text for the model
   - `structuredContent`: JSON data with the 4 podcasts
2. **Widget Rendering**: ChatGPT:
   - Fetches the HTML template from `ui://widget/search-results.html`
   - Injects `structuredContent` as `window.openai.toolOutput`
   - Renders the HTML in an iframe

3. **Styling**: Each of the 4 podcast cards has different styling:
   - **Card 1**: White with shadow
   - **Card 2**: Purple gradient with white text
   - **Card 3**: Dark theme with blue left border
   - **Card 4**: Light gray with purple border

## Testing

### Start the Server

```bash
pnpm dev
```

### Connect from ChatGPT

1. Open ChatGPT
2. Add your MCP server (typically http://localhost:3000)
3. Ask: "Search for leadership podcasts"
4. You should see a beautifully styled widget with 4 different podcast cards

## The Data Flow

```
User: "Search for leadership podcasts"
  ↓
ChatGPT calls searchContent("leadership")
  ↓
Tool returns:
  - structuredContent: { results: [...4 podcasts...] }
  ↓
ChatGPT fetches ui://widget/search-results.html
  ↓
Injects data into iframe as window.openai.toolOutput
  ↓
JavaScript reads data and renders styled cards
  ↓
User sees beautiful gradient background with 4 differently styled podcast cards
```

## Why This Is Simple

✅ **No build tooling** - no webpack, vite, or bundlers  
✅ **No dependencies** - pure HTML/CSS/JS  
✅ **No external files** - everything inline  
✅ **No API calls** - hardcoded data  
✅ **No state management** - just render  
✅ **~100 lines total** - resource + tool combined

This is a "hello world" for MCP widgets!
