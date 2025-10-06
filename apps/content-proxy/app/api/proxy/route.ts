import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    const { searchParams } = new URL(request.url);
    const incomingUrl = (searchParams.get('url') || "").trim();

    if (!incomingUrl) {
      return NextResponse.json(
        { error: 'URL query parameter "url" is required' },
        { status: 400 }
      );
    }

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

    const response = await fetch(originalUrl);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Invalid URL provided', body: await response.text() },
        { status: response.status, statusText: response.statusText }
      );
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentLength = parseInt(response.headers.get('content-length') || "0");

    let bytes = 0;
    const statusCode = 200;

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        bytes += chunk.length;
        controller.enqueue(chunk);
      },
      flush() {
        // TODO: persist
        console.info("Metrics:", {
          originalUrl,
          contentType,
          contentLength,
          bytes,
          statusCode,
          duration: Date.now() - startTime,
        });
      }
    });

    const stream = response.body?.pipeThrough(transformStream);

    return new NextResponse(stream, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        ...(contentLength && { 'Content-Length': contentLength.toString() }),
      },
    });
  } catch (error) {
    console.error('Error fetching content by ID:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}
