import { NextRequest, NextResponse } from 'next/server';
import { listContentWithPublishersPaginated } from '@/lib/content';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get paginated content with publisher information
    const result = await listContentWithPublishersPaginated(page, limit);

    return NextResponse.json({
      items: result.items,
      total: result.total,
      hasMore: result.hasMore,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}
