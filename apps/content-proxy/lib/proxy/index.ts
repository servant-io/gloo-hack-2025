export const RELEVANT_FORWARD_HEADERS = [
  'range',
  'if-range',
  'if-modified-since',
  'if-none-match',
  'accept',
  'accept-encoding',
  'cache-control',
]

/**
 * Validate the "url" parameter
 */
export function isValidUrl(url: string):
  | { valid: false; error: string, originalUrl: undefined }
  | { valid: true; error: undefined, originalUrl: string }
{
  // validates URL presence
  if (!url) return { valid: false, error: 'URL query parameter "url" is required', originalUrl: undefined };

  // validates that the url params is an actual URL
  let originalUrl: string;
  try {
    originalUrl = decodeURIComponent(url);
    new URL(originalUrl);
    return { valid: true, originalUrl, error: undefined };
  } catch (error: unknown) {
    return { valid: false, error: `URL query parameter "url" is invalid: ${JSON.stringify(error)}`, originalUrl: undefined };
  }
}

/**
 * Forward the request to the target URL with relevant headers
 */
export async function forwardRequest(headers: Headers, url: string): Promise<Response> {
  // prepare headers for origin request
  const forwardedHeaders: HeadersInit = {};
  // copy relevant headers from incoming request
  RELEVANT_FORWARD_HEADERS.forEach(headerName => {
    const value = headers.get(headerName);
    if (value) {
      forwardedHeaders[headerName] = value;
    }
  });
  // fetch from origin with forwarded headers
  const response = await fetch(url, {
    headers: forwardedHeaders,
  });

  return response;
}
