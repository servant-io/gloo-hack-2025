import 'dotenv/config';
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from 'node:http';
import { URL } from 'node:url';

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  CallToolRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  type CallToolRequest,
  type ListResourceTemplatesRequest,
  type ListResourcesRequest,
  type ListToolsRequest,
  type ReadResourceRequest,
  type Resource,
  type ResourceTemplate,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// --- Supabase config (env-driven) ---
const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? '';
const SUPABASE_DEFAULT_TABLE = process.env.SUPABASE_TABLE ?? 'content_items';

// Dynamic asset configuration
// Point ASSETS_ORIGIN to where your built assets are hosted (e.g. your Railway static service).
// Set ASSETS_VERSION to the 4-char hash that build-all.mts appends to filenames.
// Falls back to the OpenAI demo CDN and version for local/testing.
const ASSETS_ORIGIN =
  process.env.ASSETS_ORIGIN ??
  'https://persistent.oaistatic.com/ecosystem-built-assets';
let ASSETS_VERSION = process.env.ASSETS_VERSION ?? '';

async function detectAssetsVersion() {
  if (ASSETS_VERSION) return ASSETS_VERSION;
  try {
    const url = `${ASSETS_ORIGIN}/manifest.json`;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2500);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { accept: 'application/json' },
    });
    clearTimeout(t);
    if (res.ok) {
      const m = (await res.json()) as { hash?: string };
      if (m && typeof m.hash === 'string' && m.hash.length >= 1) {
        ASSETS_VERSION = m.hash;
        return ASSETS_VERSION;
      }
    }
  } catch {
    // ignore and fall through to default
  }
  ASSETS_VERSION = '0038'; // fallback to demo version
  return ASSETS_VERSION;
}

function bundleUrls(name: string) {
  const base = `${ASSETS_ORIGIN}/${name}-${ASSETS_VERSION}`;
  return {
    css: `${base}.css`,
    js: `${base}.js`,
  } as const;
}

type PizzazWidget = {
  id: string;
  title: string;
  templateUri: string;
  invoking: string;
  invoked: string;
  html: string;
  responseText: string;
};

function widgetMeta(widget: PizzazWidget) {
  return {
    'openai/outputTemplate': widget.templateUri,
    'openai/toolInvocation/invoking': widget.invoking,
    'openai/toolInvocation/invoked': widget.invoked,
    'openai/widgetAccessible': true,
    'openai/resultCanProduceWidget': true,
  } as const;
}

// Ensure version is resolved before composing widget HTML
await detectAssetsVersion();

const widgets: PizzazWidget[] = [
  {
    id: 'pizza-map',
    title: 'Show Pizza Map',
    templateUri: 'ui://widget/pizza-map.html',
    invoking: 'Hand-tossing a map',
    invoked: 'Served a fresh map',
    html: (() => {
      const { css, js } = bundleUrls('pizzaz');
      return `
<div id="pizzaz-root"></div>
<link rel="stylesheet" href="${css}">
<script type="module" src="${js}"></script>
      `.trim();
    })(),
    responseText: 'Rendered a pizza map!',
  },
  {
    id: 'pizza-carousel',
    title: 'Show Pizza Carousel',
    templateUri: 'ui://widget/pizza-carousel.html',
    invoking: 'Carousel some spots',
    invoked: 'Served a fresh carousel',
    html: (() => {
      const { css, js } = bundleUrls('pizzaz-carousel');
      return `
<div id="pizzaz-carousel-root"></div>
<link rel="stylesheet" href="${css}">
<script type="module" src="${js}"></script>
      `.trim();
    })(),
    responseText: 'Rendered a pizza carousel!',
  },
  {
    id: 'pizza-albums',
    title: 'Show Pizza Album',
    templateUri: 'ui://widget/pizza-albums.html',
    invoking: 'Hand-tossing an album',
    invoked: 'Served a fresh album',
    html: (() => {
      const { css, js } = bundleUrls('pizzaz-albums');
      return `
<div id="pizzaz-albums-root"></div>
<link rel="stylesheet" href="${css}">
<script type="module" src="${js}"></script>
      `.trim();
    })(),
    responseText: 'Rendered a pizza album!',
  },
  {
    id: 'pizza-list',
    title: 'Show Pizza List',
    templateUri: 'ui://widget/pizza-list.html',
    invoking: 'Hand-tossing a list',
    invoked: 'Served a fresh list',
    html: (() => {
      const { css, js } = bundleUrls('pizzaz-list');
      return `
<div id="pizzaz-list-root"></div>
<link rel="stylesheet" href="${css}">
<script type="module" src="${js}"></script>
      `.trim();
    })(),
    responseText: 'Rendered a pizza list!',
  },
  {
    id: 'pizza-video',
    title: 'Show Pizza Video',
    templateUri: 'ui://widget/pizza-video.html',
    invoking: 'Hand-tossing a video',
    invoked: 'Served a fresh video',
    html: (() => {
      const { css, js } = bundleUrls('pizzaz-video');
      return `
<div id="pizzaz-video-root"></div>
<link rel="stylesheet" href="${css}">
<script type="module" src="${js}"></script>
      `.trim();
    })(),
    responseText: 'Rendered a pizza video!',
  },
  {
    id: 'video-list-widget',
    title: 'Show Video List',
    templateUri: 'ui://widget/video-list.html',
    invoking: 'Assembling video list',
    invoked: 'Served a fresh video list',
    html: (() => {
      const { css, js } = bundleUrls('video-list');
      return `
<div id="video-list-root"></div>
<link rel="stylesheet" href="${css}">
<script type="module" src="${js}"></script>
      `.trim();
    })(),
    responseText: 'Rendered a video list!',
  },
];

const widgetsById = new Map<string, PizzazWidget>();
const widgetsByUri = new Map<string, PizzazWidget>();

widgets.forEach((widget) => {
  widgetsById.set(widget.id, widget);
  widgetsByUri.set(widget.templateUri, widget);
});

const toolInputSchema = {
  type: 'object',
  properties: {
    pizzaTopping: {
      type: 'string',
      description: 'Topping to mention when rendering the widget.',
    },
  },
  required: ['pizzaTopping'],
  additionalProperties: false,
} as const;

const toolInputParser = z.object({
  pizzaTopping: z.string(),
});

// Define a dedicated tool for video search via Supabase REST.
// Separate from widget tools to avoid changing existing pizza flows.
const videoListInputSchema = {
  type: 'object',
  properties: {
    query: {
      type: 'string',
      description: 'Fuzzy search query for videos',
    },
    limit: {
      type: 'number',
      description: 'Max results (default 5, max 50)',
    },
    table: {
      type: 'string',
      description: 'Optional table override (default env SUPABASE_TABLE or "videos")',
    },
    contentType: {
      type: 'string',
      description: 'Optional content_type filter (e.g., "video" | "message"). Defaults to "video".',
      enum: ['video', 'message'],
    },
  },
  required: ['query'],
  additionalProperties: false,
} as const;

const videoListTool: Tool = {
  name: 'video-list',
  description: 'Search Supabase public.content_items (or override) and return up to 5 results.',
  inputSchema: videoListInputSchema,
  title: 'Video List (Supabase Search)',
};

const tools: Tool[] = [
  ...widgets.map((widget) => ({
  name: widget.id,
  description: widget.title,
  inputSchema: toolInputSchema,
  title: widget.title,
  _meta: widgetMeta(widget),
  })),
  videoListTool,
];

const resources: Resource[] = widgets.map((widget) => ({
  uri: widget.templateUri,
  name: widget.title,
  description: `${widget.title} widget markup`,
  mimeType: 'text/html+skybridge',
  _meta: widgetMeta(widget),
}));

const resourceTemplates: ResourceTemplate[] = widgets.map((widget) => ({
  uriTemplate: widget.templateUri,
  name: widget.title,
  description: `${widget.title} widget markup`,
  mimeType: 'text/html+skybridge',
  _meta: widgetMeta(widget),
}));

function createPizzazServer(): Server {
  const server = new Server(
    {
      name: 'pizzaz-node',
      version: '0.1.0',
    },
    {
      capabilities: {
        resources: {},
        tools: {},
      },
    }
  );

  server.setRequestHandler(
    ListResourcesRequestSchema,
    async (_request: ListResourcesRequest) => ({
      resources,
    })
  );

  server.setRequestHandler(
    ReadResourceRequestSchema,
    async (request: ReadResourceRequest) => {
      const widget = widgetsByUri.get(request.params.uri);

      if (!widget) {
        throw new Error(`Unknown resource: ${request.params.uri}`);
      }

      return {
        contents: [
          {
            uri: widget.templateUri,
            mimeType: 'text/html+skybridge',
            text: widget.html,
            _meta: widgetMeta(widget),
          },
        ],
      };
    }
  );

  server.setRequestHandler(
    ListResourceTemplatesRequestSchema,
    async (_request: ListResourceTemplatesRequest) => ({
      resourceTemplates,
    })
  );

  server.setRequestHandler(
    ListToolsRequestSchema,
    async (_request: ListToolsRequest) => ({
      tools,
    })
  );

  server.setRequestHandler(
    CallToolRequestSchema,
    async (request: CallToolRequest) => {
      // Handle the custom video-list tool separately (not a widget-backed tool)
      if (request.params.name === 'video-list') {
        const args = z
          .object({
            query: z.string().min(1),
            limit: z.number().int().min(1).max(50).optional(),
            table: z.string().min(1).optional(),
            contentType: z.enum(['video', 'message']).optional(),
          })
          .parse(request.params.arguments ?? {});

        const limit = args.limit ?? 5;
        const table = args.table ?? SUPABASE_DEFAULT_TABLE;
        const contentType = args.contentType ?? 'video';

        const { rows, errorText } = await searchSupabase(
          table,
          args.query,
          limit,
          contentType
        );

        if (errorText) {
          return {
            content: [
              {
                type: 'text',
                text: `video-list error: ${errorText}`,
              },
            ],
            structuredContent: {
              videos: [],
              error: errorText,
            },
          };
        }

        const summary =
          rows.length === 0
            ? `No videos found for query: "${args.query}".`
            : `Found ${rows.length} video(s) for "${args.query}":\n` +
              rows
                .map((r: Record<string, unknown>, idx: number) => {
                  const title = String(r.title ?? r.name ?? r.id ?? `#${idx + 1}`);
                  return `- ${title}`;
                })
                .join('\n');

        // Attach widget metadata so the host renders our video list widget
        const videoWidget = widgetsById.get('video-list-widget');
        return {
          content: [
            {
              type: 'text',
              text: summary,
            },
          ],
          structuredContent: {
            videos: rows,
            query: args.query,
            limit,
            table,
            contentType,
          },
          _meta: videoWidget ? widgetMeta(videoWidget) : undefined,
        };
      }

      // Default: treat as a widget-backed pizza tool
      const widget = widgetsById.get(request.params.name);
      if (!widget) {
        throw new Error(`Unknown tool: ${request.params.name}`);
      }

      const args = toolInputParser.parse(request.params.arguments ?? {});
      return {
        content: [
          {
            type: 'text',
            text: widget.responseText,
          },
        ],
        structuredContent: {
          pizzaTopping: args.pizzaTopping,
        },
        _meta: widgetMeta(widget),
      };
    }
  );

  return server;
}

type SessionRecord = {
  server: Server;
  transport: SSEServerTransport;
};

const sessions = new Map<string, SessionRecord>();

const ssePath = '/mcp';
const postPath = '/mcp/messages';

async function handleSseRequest(res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const server = createPizzazServer();
  const transport = new SSEServerTransport(postPath, res);
  const sessionId = transport.sessionId;

  sessions.set(sessionId, { server, transport });

  transport.onclose = async () => {
    sessions.delete(sessionId);
    await server.close();
  };

  transport.onerror = (error) => {
    console.error('SSE transport error', error);
  };

  try {
    await server.connect(transport);
  } catch (error) {
    sessions.delete(sessionId);
    console.error('Failed to start SSE session', error);
    if (!res.headersSent) {
      res.writeHead(500).end('Failed to establish SSE connection');
    }
  }
}

async function handlePostMessage(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  const sessionId = url.searchParams.get('sessionId');

  if (!sessionId) {
    res.writeHead(400).end('Missing sessionId query parameter');
    return;
  }

  const session = sessions.get(sessionId);

  if (!session) {
    res.writeHead(404).end('Unknown session');
    return;
  }

  try {
    await session.transport.handlePostMessage(req, res);
  } catch (error) {
    console.error('Failed to process message', error);
    if (!res.headersSent) {
      res.writeHead(500).end('Failed to process message');
    }
  }
}

const portEnv = Number(process.env.PORT ?? 8000);
const port = Number.isFinite(portEnv) ? portEnv : 8000;

const httpServer = createServer(
  async (req: IncomingMessage, res: ServerResponse) => {
    if (!req.url) {
      res.writeHead(400).end('Missing URL');
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);

    if (
      req.method === 'OPTIONS' &&
      (url.pathname === ssePath || url.pathname === postPath)
    ) {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'content-type',
      });
      res.end();
      return;
    }

    if (req.method === 'GET' && url.pathname === ssePath) {
      await handleSseRequest(res);
      return;
    }

    if (req.method === 'POST' && url.pathname === postPath) {
      await handlePostMessage(req, res, url);
      return;
    }

    res.writeHead(404).end('Not Found');
  }
);

httpServer.on('clientError', (err: Error, socket) => {
  console.error('HTTP client error', err);
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

httpServer.listen(port, () => {
  console.log(`Pizzaz MCP server listening on http://localhost:${port}`);
  console.log(`  SSE stream: GET http://localhost:${port}${ssePath}`);
  console.log(
    `  Message post endpoint: POST http://localhost:${port}${postPath}?sessionId=...`
  );
  console.log('  Tool available: video-list (Supabase search)');
});

// --- helpers ---
async function searchSupabase(
  table: string,
  query: string,
  limit: number,
  contentType?: 'video' | 'message'
): Promise<{ rows: any[]; errorText?: string }> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return {
      rows: [],
      errorText:
        'Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables.',
    };
  }

  // Fuzzy via ilike across relevant columns from content_items schema
  // title, description, og_title, og_description, series_title, full_text, url
  const pattern = `*${encodeURIComponent(query)}*`;
  const or =
    `or=(title.ilike.${pattern},` +
    `description.ilike.${pattern},` +
    `og_title.ilike.${pattern},` +
    `og_description.ilike.${pattern},` +
    `series_title.ilike.${pattern},` +
    `full_text.ilike.${pattern},` +
    `url.ilike.${pattern})`;
  const params = new URLSearchParams({
    select: '*',
    limit: String(limit),
  });

  if (contentType) {
    // PostgREST style equality filter
    params.append('content_type', `eq.${contentType}`);
  }

  // Append the OR filter (not via URLSearchParams to keep PostgREST syntax intact)
  const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${encodeURIComponent(
    table
  )}?${params.toString()}&${or}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Prefer: 'count=exact',
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { rows: [], errorText: `Supabase error ${res.status}: ${text}` };
    }

    const data = (await res.json()) as any[];
    return { rows: Array.isArray(data) ? data : [] };
  } catch (err: any) {
    return { rows: [], errorText: String(err?.message ?? err) };
  }
}
