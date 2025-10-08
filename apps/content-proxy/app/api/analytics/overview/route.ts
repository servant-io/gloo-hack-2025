import { NextResponse } from 'next/server';
import { getPublisherOverview } from '@/lib/analytics/overview';
import { preflightResponse, withCors } from '@/lib/cors';

export async function OPTIONS(request: Request) {
  return preflightResponse(request);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const publisherId = searchParams.get('publisherId');

  if (!publisherId) {
    return withCors(
      request,
      NextResponse.json(
        { error: 'publisherId query parameter is required' },
        { status: 400 }
      )
    );
  }

  try {
    const overview = await getPublisherOverview(publisherId);

    if (!overview) {
      return withCors(
        request,
        NextResponse.json(
          {
            error: 'Publisher not found',
            publisherId,
          },
          { status: 404 }
        )
      );
    }

    return withCors(request, NextResponse.json(overview));
  } catch (error) {
    console.error('Failed to load publisher overview', error);
    return withCors(
      request,
      NextResponse.json(
        { error: 'Failed to load publisher overview' },
        { status: 500 }
      )
    );
  }
}
