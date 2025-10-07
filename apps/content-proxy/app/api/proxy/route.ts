import { isAuthorized } from '@/lib/authentication';
import { forwardRequest, isValidUrl } from '@/lib/proxy';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    // authorize request
    const isRequestAuthorized = await isAuthorized(request);
    if (!isRequestAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    // validate URL parameter
    const { searchParams } = new URL(request.url);
    const incomingUrl = (searchParams.get('url') || "").trim();
    const urlValidation = isValidUrl(incomingUrl);
    if (!urlValidation.valid) {
      return NextResponse.json(
        { error: urlValidation.error },
        { status: 400 }
      );
    }
    const originalUrl = urlValidation.originalUrl.toString();
    const response = await forwardRequest(request.headers, originalUrl);
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
    // stream response while collecting metrics
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        // this is to show how we could collect bytes transferred in real-time
        // the actual result is (should be) the same as content-length header
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
