import { authorizeProfile } from '@/lib/authentication';
import {
  forwardRequest,
  isValidContentUrl,
  registerProxyEvent,
} from '@/lib/proxy';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    // authorize request
    const authorization = await authorizeProfile(request);
    if (!authorization.authorized || !authorization.profileId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const profileId = authorization.profileId.toString();
    // validate URL parameter
    const { searchParams } = new URL(request.url);
    const incomingUrl = (searchParams.get('url') || '').trim();
    const url = await isValidContentUrl(incomingUrl);
    if (!url.valid) {
      return NextResponse.json({ error: url.error }, { status: 400 });
    }
    const contentItemId = url.contentItem.id;
    const originalUrl = url.originalUrl.toString();
    const response = await forwardRequest(request.headers, originalUrl);
    if (response.status >= 400) {
      return NextResponse.json(
        { error: 'Invalid URL provided', body: await response.text() },
        { status: response.status, statusText: response.statusText }
      );
    }

    const contentType =
      response.headers.get('content-type') || 'application/octet-stream';
    const contentLength = parseInt(
      response.headers.get('content-length') || '0'
    );
    const contentRange = response.headers.get('content-range');
    const acceptRanges = response.headers.get('accept-ranges');
    const statusCode = response.status;
    let bytesTransferred = 0;
    // stream response while collecting metrics
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        // this is to show how we could collect bytes transferred in real-time
        // the actual result is (should be) the same as content-length header
        bytesTransferred += chunk.length;
        controller.enqueue(chunk);
      },
      async flush() {
        await registerProxyEvent({
          contentItemId,
          profileId,
          contentRange,
          originalUrl,
          contentType,
          contentLength,
          acceptRanges,
          bytesTransferred,
          statusCode,
          startTime,
        });
      },
    });
    const stream = response.body?.pipeThrough(transformStream);
    const responseHeaders: HeadersInit = {
      'Content-Type': contentType,
    };
    if (contentLength)
      responseHeaders['Content-Length'] = contentLength.toString();
    // include content-range for partial content
    if (contentRange) responseHeaders['Content-Range'] = contentRange;
    // advertise range support to clients
    if (acceptRanges || statusCode === 206)
      responseHeaders['Accept-Ranges'] = acceptRanges || 'bytes';
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
