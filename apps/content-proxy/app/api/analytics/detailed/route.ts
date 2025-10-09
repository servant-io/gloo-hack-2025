import { NextResponse } from 'next/server';
import {
  getPublisherEarningsHistory,
  getPublisherUsageByApp,
  getPublisherRecentTransactions,
  getPublisherContentStats,
} from '@/lib/analytics/overview';
import { preflightResponse, withCors } from '@/lib/cors';

export async function OPTIONS(request: Request) {
  return preflightResponse(request);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const publisherId = searchParams.get('publisherId');
  const dataType = searchParams.get('type');

  if (!publisherId) {
    return withCors(
      request,
      NextResponse.json(
        { error: 'publisherId query parameter is required' },
        { status: 400 }
      )
    );
  }

  if (!dataType) {
    return withCors(
      request,
      NextResponse.json(
        {
          error:
            'type query parameter is required (earningsHistory, usageByApp, recentTransactions, contentStats)',
        },
        { status: 400 }
      )
    );
  }

  try {
    let data;

    switch (dataType) {
      case 'earningsHistory':
        const days = parseInt(searchParams.get('days') || '30');
        data = await getPublisherEarningsHistory(publisherId, days);
        break;

      case 'usageByApp':
        data = await getPublisherUsageByApp(publisherId);
        break;

      case 'recentTransactions':
        const limit = parseInt(searchParams.get('limit') || '10');
        data = await getPublisherRecentTransactions(publisherId, limit);
        break;

      case 'contentStats':
        data = await getPublisherContentStats(publisherId);
        break;

      default:
        return withCors(
          request,
          NextResponse.json(
            {
              error:
                'Invalid type parameter. Use: earningsHistory, usageByApp, recentTransactions, contentStats',
            },
            { status: 400 }
          )
        );
    }

    return withCors(request, NextResponse.json(data));
  } catch (error) {
    console.error('Failed to load detailed analytics', error);
    return withCors(
      request,
      NextResponse.json(
        { error: 'Failed to load detailed analytics' },
        { status: 500 }
      )
    );
  }
}
