const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:3000'];
const DEFAULT_ALLOWED_METHODS = 'GET,POST,PUT,PATCH,DELETE,OPTIONS';
const DEFAULT_ALLOWED_HEADERS = 'Content-Type, Authorization, X-Requested-With';

function parseAllowedOrigins(): string[] {
  const raw = process.env.CONTENT_PROXY_ALLOWED_ORIGINS;
  if (!raw) {
    return DEFAULT_ALLOWED_ORIGINS;
  }

  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

/**
 * Checks if an origin matches a wildcard pattern.
 * Supports patterns like: https://*.vercel.app, https://*-servant-io.vercel.app
 *
 * POC: Simple wildcard matching for preview deployments.
 * PRODUCTION: Consider allowlist of valid wildcard domains, rate limiting per origin.
 */
function matchesWildcardPattern(origin: string, pattern: string): boolean {
  if (!pattern.includes('*')) {
    return origin === pattern;
  }

  // Escape special regex chars, then convert * to match any non-slash characters
  const regexPattern = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape special chars
    .replace(/\*/g, '[^/]+'); // * matches any non-slash chars

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(origin);
}

function resolveAllowedOrigin(requestOrigin: string | null): string {
  const allowedOrigins = parseAllowedOrigins();

  // Allow-all wildcard
  if (allowedOrigins.includes('*')) {
    return '*';
  }

  if (!requestOrigin) {
    return allowedOrigins[0] ?? DEFAULT_ALLOWED_ORIGINS[0];
  }

  // Exact match first (faster)
  if (allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }

  // Check wildcard patterns
  for (const pattern of allowedOrigins) {
    if (matchesWildcardPattern(requestOrigin, pattern)) {
      return requestOrigin;
    }
  }

  return allowedOrigins[0] ?? DEFAULT_ALLOWED_ORIGINS[0];
}

export function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin');
  const allowOrigin = resolveAllowedOrigin(origin);

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': DEFAULT_ALLOWED_METHODS,
    'Access-Control-Allow-Headers': DEFAULT_ALLOWED_HEADERS,
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

export function withCors<T extends Response>(request: Request, response: T): T {
  const headers = corsHeaders(request);
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  return response;
}

export function preflightResponse(request: Request): Response {
  const headers = corsHeaders(request);
  return new Response(null, {
    status: 204,
    headers: {
      ...headers,
    },
  });
}
