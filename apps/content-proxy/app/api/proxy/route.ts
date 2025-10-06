import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    const { searchParams } = new URL(request.url);
    const incomingUrl = (searchParams.get('url') || "").trim();
    // const apiKey =
    //   (searchParams.get('apiKey') || "").trim() ||
    //   (request.headers.get('authorization') || "").replace(/^Bearer\s+/i, "").trim();

    // validates URL presence
    if (!incomingUrl) {
      return NextResponse.json(
        { error: 'URL query parameter "url" is required' },
        { status: 400 }
      );
    }

    // validates that the url params is an actual URL
    let originalUrl: string;
    try {
      originalUrl = decodeURIComponent(incomingUrl);
      new URL(originalUrl);
    } catch (error: unknown) {
      return NextResponse.json(
        { error: `Invalid URL provided: ${JSON.stringify(error)}` },
        { status: 400 }
      );
    }

    // prepare headers for origin request
    const fetchHeaders: HeadersInit = {};

    // copy relevant headers from incoming request
    const headersToForward = [
      'range',
      'if-range',
      'if-modified-since',
      'if-none-match',
      'accept',
      'accept-encoding',
      'cache-control',
    ];

    headersToForward.forEach(headerName => {
      const value = request.headers.get(headerName);
      if (value) {
        fetchHeaders[headerName] = value;
      }
    });

    // fetch from origin with forwarded headers
    const response = await fetch(originalUrl, {
      headers: fetchHeaders,
    });

    if (response.status >= 400) {
      return NextResponse.json(
        { error: 'Invalid URL provided', body: await response.text() },
        { status: response.status, statusText: response.statusText }
      );
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentLength = response.headers.get('content-length');
    const contentRange = response.headers.get('content-range');
    const acceptRanges = response.headers.get('accept-ranges');

    const statusCode = response.status;
    let bytes = 0;

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        bytes += chunk.length;
        controller.enqueue(chunk);
      },
      flush() {
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

        // TODO: persist to database
        console.info("Metrics:", {
          originalUrl,
          contentType,
          contentLength: contentLength ? parseInt(contentLength) : null,
          bytesTransferred: bytes,
          statusCode,
          isRangeRequest: statusCode === 206,
          rangeStart,
          rangeEnd,
          totalSize,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        });
      }
    });

    const stream = response.body?.pipeThrough(transformStream);

    const responseHeaders: HeadersInit = {
      'Content-Type': contentType,
    };
    if (contentLength) responseHeaders['Content-Length'] = contentLength;
    // include content-range for partial content
    if (contentRange) responseHeaders['Content-Range'] = contentRange;
    // advertise range support to clients
    if (acceptRanges || statusCode === 206) responseHeaders['Accept-Ranges'] = acceptRanges || 'bytes';
    // important: allow clients to make range requests on subsequent calls
    responseHeaders['Cache-Control'] = 'public, max-age=3600';

    return new NextResponse(stream, {
      status: statusCode,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Error fetching content by ID:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}
