import { NextRequest, NextResponse } from 'next/server';
import {
  createContentItemsSource,
  getContentItemsSourceById,
  listContentItemsSourcesPaginated,
  triggerFetchContentItemsForSource,
  validateContentItemsSourceData,
} from '@/lib/content-items-sources';
import { authorizePublisher } from '@/lib/authentication';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // authorize request
    const authorization = await authorizePublisher(request);
    if (!authorization.authorized || !authorization.publisherId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const publisherId = authorization.publisherId.toString();
    const { id } = await params;

    const contentItemSource = await getContentItemsSourceById(publisherId, id);
    if (!contentItemSource) {
      return NextResponse.json(
        { error: 'Content items source not found' },
        { status: 404 }
      );
    }

    const sync = await triggerFetchContentItemsForSource(publisherId, id);

    return NextResponse.json(
      {
        id: sync.id,
        valid: sync.valid,
        items: sync.items,
        message: sync.message,
      },
      { status: sync.httpCode }
    );
  } catch (error) {
    console.error('Error syncing content item sources:', error);
    return NextResponse.json(
      { error: 'Failed to sync content item sources' },
      { status: 500 }
    );
  }
}
