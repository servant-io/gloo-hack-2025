Updated 2025-10-09

**Preview Without Chat**

- Build + serve once (from repo root or already inside `apps/railway-mcp`):
  - `cd apps/railway-mcp && pnpm install && pnpm run build && pnpm run serve`
  - Open `http://localhost:4444/<entry>-<hash>.html` (e.g., `video-list-<hash>.html`).
- HMR dev (module URLs): `pnpm tsx ./dev-all.mts` → load `http://localhost:4444/<entry>.js` in a scratch HTML with `<div id="<entry>-root"></div>`.

**Develop Locally — Assets (Widgets)**

- Start HMR: `cd apps/railway-mcp && pnpm install && pnpm run dev` (or `pnpm tsx ./dev-all.mts`).
- Build versioned bundles: `pnpm run build` → `assets/<entry>-<hash>.{html,css,js}`.
- New entry available: `video-list` (renders `structuredContent.videos`).

**Develop Locally — Tools (MCP Server)**

- Run server: `cd apps/railway-mcp/pizzaz_server_node && pnpm install && pnpm start` (serves `:8000`).
- Use local assets (recommended during dev): `ASSETS_ORIGIN=http://localhost:4444 pnpm start`.
  - Note: `ASSETS_VERSION` is optional — the server auto-detects the hash from `/assets/manifest.json` on startup. If you deploy new assets, restart the server to pick up the new hash.
- `.env` support: The server auto-loads `pizzaz_server_node/.env` (via `dotenv`). On Railway, set env vars in the service UI.

**Expose with ngrok (optional)**

- MCP: `ngrok http 8000` → `https://<mcp>.ngrok.app/mcp` and `/mcp/messages?sessionId=...`.
- Assets: `ngrok http 4444` → set `ASSETS_ORIGIN=https://<assets>.ngrok.app` for the MCP server.

**Push Live — Assets**

Option A (recommended): Railway Static Site
- Root Directory: `apps/railway-mcp`
- Build: `pnpm install && pnpm run build`
- Output Directory: `assets`
- Resulting URL is your `ASSETS_ORIGIN`.

Option B: Railway Node Service (serving static via `serve`)
- Root Directory: `apps/railway-mcp`
- Build: `pnpm install && pnpm run build`
- Start: `pnpm run serve:railway` (binds `$PORT`)

**Push Live — Tools (MCP Server)**

- Railway Node service
  - Root Directory: `apps/railway-mcp/pizzaz_server_node`
  - Install: `pnpm install`
  - Start: `pnpm start`
  - Env:
    - `ASSETS_ORIGIN=https://<assets>.up.railway.app`
    - `SUPABASE_URL=...`
    - `SUPABASE_ANON_KEY=...`
    - `SUPABASE_TABLE=content_items` (optional)
  - Endpoints: `GET /mcp` (SSE), `POST /mcp/messages?sessionId=...`.

Runtime note on `tsx` (start script)
- If `tsx` is pruned in production: set `NIXPACKS_NODE_INSTALL_DEV=true` on the MCP service, or switch to a precompile flow (build to JS and run with `node`).

**Change Cycle**

- Edit components in `apps/railway-mcp/src/<entry>/` (e.g., `src/video-list`).
- Bump `version` in `apps/railway-mcp/package.json` to rotate the 4‑char asset hash, then `pnpm run build`.
- Deploy/restart:
  - If using Static Site, redeploy “assets”.
  - Restart the MCP service so it reloads `/assets/manifest.json` and picks the new hash (unless you pin `ASSETS_VERSION`).

**Monorepo Tips**

- Use two Railway services (assets + MCP) with distinct Root Directories.
- Set `ASSETS_ORIGIN` on MCP to the public URL of the assets service.
- The MCP tool `video-list` returns widget metadata for `video-list-widget`; ensure assets are accessible publicly for rendering.
