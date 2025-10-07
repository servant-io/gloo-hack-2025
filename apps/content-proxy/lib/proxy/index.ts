import { getContentItemByUrl } from "@/lib/content";
import { ContentItem } from "@/lib/content/types";
import { ContentBytesTransferParams } from "@/lib/personalization";
import { emitContentBytesTransferEvent } from "@/lib/personalization/actions";
import { validateEventData } from "@/lib/personalization/metric";

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

/**
 * Register proxy event
 */
export async function registerProxyEvent({
  contentItemId, profileId, contentRange, originalUrl, contentType, contentLength, acceptRanges, bytesTransferred, statusCode, startTime
}: {
  contentItemId: string,
  profileId: string;
  contentRange: string | null;
  originalUrl: string;
  contentType: string;
  contentLength: number | null;
  acceptRanges: string | null;
  bytesTransferred: number;
  statusCode: number;
  startTime: number;
}) {
  // parse range info for detailed metrics
  let rangeStart: number | null = null;
  let rangeEnd: number | null = null;
  let totalSize: number | null = null;

  if (contentRange) {
    // content-Range format: "bytes 0-1023/5000" or "bytes 0-1023/*"
    const match = contentRange.match(/bytes (\d+)-(\d+)\/(\d+|\*)/);
    if (match) {
      rangeStart = parseInt(match[1]);
      rangeEnd = parseInt(match[2]);
      totalSize = match[3] !== '*' ? parseInt(match[3]) : null;
    }
  }
  const eventData: ContentBytesTransferParams = {
    contentItemId,
    url: originalUrl,
    contentRange,
    duration: Date.now() - startTime,
    bytesTransferred,
    contentLength,
    acceptRanges,
    rangeStart,
    rangeEnd,
    totalSize,
    contentType,
    statusCode,
  }
  const metricSchemaValidation = await validateEventData('content_bytes_transfer', eventData);
  if (!metricSchemaValidation.success) {
    throw Error(`Metric schema validation failed: ${metricSchemaValidation.message}`);
  }

  await emitContentBytesTransferEvent(
    profileId,
    eventData
  );
}
