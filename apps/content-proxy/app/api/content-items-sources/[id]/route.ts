import { NextRequest, NextResponse } from 'next/server';
import { getContentItemsSourceById } from '@/lib/content-items-sources';
import { authorizePublisher } from '@/lib/authentication';

export async function GET(
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
    const { id: contentItemSourceId } = await params;

    // Use the content service to get items by IDs with publisher information
    const contentItemSource = await getContentItemsSourceById(
      publisherId,
      contentItemSourceId
    );

    // If no content found, return 404
    if (!contentItemSource) {
      return NextResponse.json(
        { error: 'Content items source not found' },
        { status: 404 }
      );
    }

    // Return content items source as JSON
    return NextResponse.json(contentItemSource);
  } catch (error) {
    console.error('Error fetching content items source by ID:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content items source' },
      { status: 500 }
    );
  }
}
