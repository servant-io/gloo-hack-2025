import { NextRequest, NextResponse } from 'next/server';
import {
  createContentItemsSource,
  listContentItemsSourcesPaginated,
  validateContentItemsSourceData,
} from '@/lib/content-items-sources';
import { authorizePublisher } from '@/lib/authentication';

// TODO: POST, PATCH, DELETE

export async function GET(request: NextRequest) {
  try {
    // authorize request
    const authorization = await authorizePublisher(request);
    if (!authorization.authorized || !authorization.publisherId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const publisherId = authorization.publisherId.toString();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get paginated content with publisher information
    const result = await listContentItemsSourcesPaginated(
      publisherId,
      page,
      limit
    );

    return NextResponse.json({
      items: result.items,
      total: result.total,
      hasMore: result.hasMore,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    console.error('Error fetching content item sources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content item sources' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // authorize request
    const authorization = await authorizePublisher(request);
    if (!authorization.authorized || !authorization.publisherId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const publisherId = authorization.publisherId.toString();

    // explicitly define which fields we accept
    const requestBody = await request.json();
    const data = {
      type: requestBody.type,
      name: requestBody.name,
      url: requestBody.url,
      autoSync: requestBody.autoSync || false,
      instructions: requestBody.instructions || {},
    };

    const validation = await validateContentItemsSourceData(data);
    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.message },
        { status: 422 }
      );
    }
    const newContentItemsSource = await createContentItemsSource(
      publisherId,
      validation.data
    );
    // TODO: trigger fetch of content items for this source

    return NextResponse.json(newContentItemsSource);
  } catch (error) {
    console.error('Error creating content item sources:', error);
    return NextResponse.json(
      { error: 'Failed to create content item sources' },
      { status: 500 }
    );
  }
}
