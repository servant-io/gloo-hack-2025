# Pizzaz MCP server (Node)

This directory contains a minimal Model Context Protocol (MCP) server implemented with the official TypeScript SDK. The server exposes the full suite of Pizzaz demo widgets so you can experiment with UI-bearing tools in ChatGPT developer mode.

## Prerequisites

- Node.js 18+
- pnpm, npm, or yarn for dependency management

## Install dependencies

```bash
pnpm install
```

If you prefer npm or yarn, adjust the command accordingly.

## Run the server

```bash
pnpm start
```

The script bootstraps the server over stdio, which makes it compatible with the MCP Inspector as well as ChatGPT connectors. Once running you can list the tools and invoke any of the pizza experiences.

Each tool responds with:

- `content`: a short text confirmation that mirrors the original Pizzaz examples.
- `structuredContent`: a small JSON payload that echoes the topping argument, demonstrating how to ship data alongside widgets.
- `_meta.openai/outputTemplate`: metadata that binds the response to the matching Skybridge widget shell.

Feel free to extend the handlers with real data sources, authentication, and persistence.

## Dynamic assets configuration

The server returns HTML snippets that load widget bundles (CSS/JS). You can point these to your own hosted assets via environment variables:

- `ASSETS_ORIGIN` – Base URL where your versioned bundles are hosted (e.g. your Railway static assets service).
- `ASSETS_VERSION` – Optional. If omitted, the server fetches `manifest.json` from `ASSETS_ORIGIN` and uses its `hash`. You may set it explicitly to pin a version.

If unset, the server falls back to the demo CDN and a default version so the example runs without deploying assets.
