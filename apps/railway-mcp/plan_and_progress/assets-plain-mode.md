# Assets Plain Mode

- Status: Completed (2025-10-09)

## Objective
Reduce deployment friction by allowing stable, unversioned asset filenames (`name.js`, `name.css`) and a server toggle to load them.

## Steps
- Build script copies hashed outputs to plain names and generates plain HTML per entry.
- Server accepts `ASSETS_USE_PLAIN=1` (or `true`) to reference plain filenames and normalizes `ASSETS_ORIGIN` to include `https://` if omitted.

## Done Criteria
- `assets/<entry>.{js,css,html}` are produced by `pnpm build`.
- MCP server loads plain files when `ASSETS_USE_PLAIN` is set.
- Backwards compatible with versioned mode and manifest auto-detection.

## Verification
- Build: `pnpm build` → verify `assets/video-list.js` and `assets/video-list.css` exist.
- Run server with `ASSETS_ORIGIN=http://localhost:4444 ASSETS_USE_PLAIN=1 pnpm --filter pizzaz-mcp-node start`.
- Widget links in inspector point to `/video-list.js` and `/video-list.css`.

## Outcomes
- Simplified Railway deploys: set `ASSETS_ORIGIN=https://<assets>.up.railway.app` and `ASSETS_USE_PLAIN=1` on MCP service, no need to manage hashes.

## Follow-ups
- Optional cache-busting header config on the assets service if using plain filenames.

