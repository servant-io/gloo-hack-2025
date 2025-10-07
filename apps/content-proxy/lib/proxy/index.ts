import { getContentItemByUrl } from "@/lib/content";
import { ContentItem } from "@/lib/content/types";

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
export async function isValidContentUrl(url: string):
  Promise<
    { valid: false; error: string, originalUrl: undefined, contentItem: ContentItem | undefined } |
    { valid: true; error: undefined, originalUrl: string, contentItem: ContentItem }
  >
{
  // validates URL presence
  if (!url) return { valid: false, error: 'URL query parameter "url" is required', originalUrl: undefined, contentItem: undefined };

  // validates ContentItem presence
  const contentItem = await getContentItemByUrl(url);
  if (!contentItem) return { valid: false, error: 'Content for provided query parameter "url" does not exist', originalUrl: undefined, contentItem: undefined };

  // validates that the url params is an actual URL
  let originalUrl: string;
  try {
    originalUrl = decodeURIComponent(url);
    new URL(originalUrl);
    return { valid: true, originalUrl, contentItem, error: undefined };
  } catch (error: unknown) {
    return { valid: false, error: `URL query parameter "url" is invalid: ${JSON.stringify(error)}`, originalUrl: undefined, contentItem };
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
