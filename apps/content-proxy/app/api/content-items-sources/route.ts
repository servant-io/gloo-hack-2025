import { NextRequest, NextResponse } from 'next/server';
import {
  createContentItemsSource,
  listContentItemsSourcesPaginated,
  triggerFetchContentItemsForSource,
  validateContentItemsSourceData,
} from '@/lib/content-items-sources';
import { authorizePublisher } from '@/lib/authentication';

export async function GET(request: NextRequest) {
  try {
    // authorize request
    const authorization = await authorizePublisher(request);
    if (!authorization.authorized || !authorization.publisherId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const publisherId = authorization.publisherId.toString();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

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
      { message: 'Failed to fetch content item sources' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // authorize request
    const authorization = await authorizePublisher(request);
    if (!authorization.authorized || !authorization.publisherId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
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
        { valid: false, message: validation.message },
        { status: 422 }
      );
    }
    const newContentItemsSource = await createContentItemsSource(
      publisherId,
      validation.data
    );
    await triggerFetchContentItemsForSource(
      publisherId,
      newContentItemsSource.id
    );

    return NextResponse.json(newContentItemsSource);
  } catch (error) {
    console.error('Error creating content item sources:', error);
    return NextResponse.json(
      { message: 'Failed to create content item sources' },
      { status: 500 }
    );
  }
}
