**Preview Without Chat**
- Build + serve once: `cd apps/railway-mcp && pnpm install && pnpm run build && pnpm run serve` → open `http://localhost:4444/<entry>-<hash>.html`.
- HMR dev (module URLs): `pnpm tsx ./dev-all.mts` → load `http://localhost:4444/<entry>.js` in a scratch HTML with `<div id="<entry>-root"></div>`.

**Develop Locally — Assets (Widgets)**
- Start HMR: `cd apps/railway-mcp && pnpm install && pnpm run dev` (or `pnpm tsx ./dev-all.mts`).
- Build versioned bundles: `pnpm run build` → `apps/railway-mcp/assets/<entry>-<hash>.{html,css,js}`.

**Develop Locally — Tools (MCP Server)**
- Run server: `cd apps/railway-mcp/pizzaz_server_node && pnpm install && pnpm start` (serves `:8000`).
- Use local assets (optional): `ASSETS_ORIGIN=http://localhost:4444 ASSETS_VERSION=<hash> pnpm start`.

**Push Live — Assets**
- Railway service “assets”
  - Root Directory: `apps/railway-mcp`
  - Build: `pnpm install && pnpm run build`
  - Start: `pnpm run serve:railway` (binds `$PORT`)
- Resulting URL is your `ASSETS_ORIGIN`.

**Push Live — Tools (MCP Server)**
- Railway service “mcp”
  - Root Directory: `apps/railway-mcp/pizzaz_server_node`
  - Env: `ASSETS_ORIGIN=https://<assets>.up.railway.app`, `ASSETS_VERSION=<hash>`
  - Start: `pnpm start`
- Endpoints: `GET /mcp` (SSE), `POST /mcp/messages?sessionId=...`.

**Change Cycle**
- Edit components in `apps/railway-mcp/src/<entry>/`.
- Bump `version` in `apps/railway-mcp/package.json` (rotates 4‑char hash), `pnpm run build`.
- Update `ASSETS_VERSION` to new hash, redeploy “assets”, then “mcp”.

**Monorepo Tips**
- Use two Railway services with Root Directories; set watch paths to those subfolders.
- If `tsx` isn’t available at runtime, either enable dev install or precompile and run with `node`.
