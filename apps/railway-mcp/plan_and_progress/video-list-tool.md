# Video List MCP Tool

- Status: In Progress (2025-10-09)

## Objective
Add a minimal `video-list` MCP tool to the Node server that performs a fuzzy search against a Supabase public table and returns up to 5 matched videos. Keep all existing pizza-themed tools intact and follow the pizza server’s conventions where possible.

## High-Level Steps
- Define `video-list` tool with its own input schema (`query`, optional `limit`, optional `table`).
- Implement Supabase REST search (env-driven URL/key/table; default table `public.content_items`).
- Return text summary plus `structuredContent: { videos: [...] }` for UI consumption later.
- Register tool alongside existing widget-derived tools without altering them.

## Done Criteria
- Tool `video-list` appears in MCP `list_tools`.
- Accepts `query` and returns up to 5 results from Supabase.
- Filters `content_type=video` by default; optional `contentType` argument.
- No changes to pizza widgets/tools behavior.
- Handles missing env and upstream errors gracefully.

## Verification
- Start server: `pnpm --filter pizzaz-mcp-node start`.
- Use an MCP client (e.g., OpenAI/VSCode) to `list_tools` and `call_tool` with `{ name: "video-list", arguments: { query: "cats" } }`.
- Observe response includes `content` text and `structuredContent.videos` array (0–5 items).

## Outcomes (to fill on completion)
- Summary of changes and impact.
- Links to PR/commit.

## Follow-ups
- Add a dedicated `video-list` widget that consumes `structuredContent.videos`.
- Extend search to ranked FTS when available (pg_trgm/websearch).
- Add per-project config for default table/columns.
