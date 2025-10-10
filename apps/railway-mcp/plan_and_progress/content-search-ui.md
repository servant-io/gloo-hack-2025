# Content Search UI (Internal Re-implementation)

- Status: In Progress (2025-10-10)

## Objective
Re-implement the desired UI components directly inside `apps/railway-mcp`, using the layouts/interactions as inspiration from `apps/openai-content-widget`. Preserve existing MCP tool/widget contracts and Supabase-backed shapes. Phase 1 targets strict parity: show thumbnails and titles from the existing `video-list` tool output. Enhanced interactions (bookmarks, credits, AI summaries, series groups) are stubbed/mocked until APIs are wired. Note the canonical documentation provided by the creator of apps sdk is the pizzaz components like pizzaz-carousel. 


## High-Level Steps
- Audit both implementations and identify minimal component set to re-implement (e.g., `VideoCarousel`, `TimelineNode`, optionally `ExpandedPreviewCard`). You may rename things as you deem fit - timelinenode is probably more appropriate as carousel. 
- Create internal component(s) under `src/content-search/components/` designed for MCP data directly.
- Add a tiny transform utility under `src/content-search/transform.ts` to normalize Supabase rows to the internal `VideoItem` view model (still within MCP schema assumptions).
- Scaffold a new widget entry `src/content-search/index.tsx` that renders the updated UI and reads data via `useWidgetProps`.
- Add the entry to Vite build targets in `build-all.mts` (target: `"content-search"`).
- Register a new widget-backed tool in `pizzaz_server_node/src/server.ts` using `bundleUrls('content-search')` and a template `ui://widget/content-search.html`.
- Do not create a separate non-widget tool; only the widget-backed `content-search` tool is needed.
- After parity, delete `apps/openai-content-widget/`.
- Provide mock/static props for features not yet wired (AI content, credits, bookmarks) to match component expectations.

## Done Criteria
- Parity: invoking the new tool renders a list of up to N results showing thumbnail, title, source/type (if present), and an "Open" action identical to current behavior.
- Data contract unchanged: server returns `structuredContent: { videos: [...], query, limit }` compatible with `useWidgetProps` defaults.
- Build + bundle: `pnpm build` includes `content-search.css/js` in `assets/` and `manifest.json` updated.
- Server registered: `list_tools` shows the new tool; `read_resource` returns the new template; `_meta.openai/outputTemplate` points to `ui://widget/content-search.html`.
- No regressions to existing pizza widgets or the current `video-list` path.
- `apps/openai-content-widget/` removed post‑parity (and archived in git history only).
- Lint/typecheck pass in this package; zero ESLint disables beyond config.

## Verification
- Build assets: `pnpm build` (from `apps/railway-mcp`).
- Run server: `pnpm --filter railway-mcp start` or equivalent.
- Tools visible: confirm via MCP client `list_tools` contains `content-search` and existing tools unaffected.
- Call tool: `call_tool { name: "content-search", arguments: { query: "acts" } }` → response includes text summary, `_meta` for new widget, and `structuredContent.videos` populated.
- UI render: widget shows carousel/list with thumbnails and titles; clicking an item opens `url` in new tab (via `window.openai.openExternal` when present).

## Implementation Notes
- Internal view model (from MCP/Supabase row → `VideoItem` used by the content_search components):
  - `id`: `id` or fallback index
  - `title`: `title` | `og_title` | `series_title` | `id`
  - `description`: `og_description` | `description` | `series_title` | ""
  - `thumbnail`: `thumbnail_url` | `poster_images.thumbnail`
  - `url`: `mp4_url` | `url` | "#"
  - `seriesTitle`: `series_title` | null
  - `durationSeconds`: `duration_seconds` | 0
  - `isPremium`: `is_premium` | (duration_seconds > 600) | false
  - `uploadDate`: `upload_date` | null
- For Phase 1, the widget relies solely on `useWidgetProps` tool output (no direct Supabase calls from the browser).
- Minimal component set: start with `VideoCarousel` + `TimelineNode`. Optionally add a lightweight preview card with mocked text.
- Ensure Tailwind styles load via the per-entry and global CSS import path used by `build-all.mts`.

## Progress (2025-10-10)
- Scaffolded new entry at `src/content-search/index.tsx` with carousel and preview panel components tailored to MCP data.
- Added transform utilities and shared types to normalize Supabase rows for the UI.
- Registered the `content-search` widget/tool in `pizzaz_server_node/src/server.ts` and added the build target to `build-all.mts`.
- `pnpm build` currently fails inside the sandbox (`EPERM` opening a tsx IPC pipe); needs re-run in a non-restricted environment.

## Outcomes (to fill on completion)
- Summary of changed files and impact.
- Links to PR/commits.
- Screenshots or short clip of content_search widget rendering tool output.

## Follow-ups
- Wire real AI completion flows used by any preview card (replace mocks).
- Connect credits/bookmarks state and persistence.
- Add series grouping display (`SeriesGroup`) for larger result sets.
- Consolidate shared UI in `packages/ui` later if we need reuse across apps.
- Optionally deprecate old `video-list` after stabilization and usages audit.
