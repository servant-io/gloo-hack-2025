import { NextResponse } from 'next/server';
import { searchContentItemsWithPublishers } from '@/lib/content';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q) {
      return NextResponse.json(
        { error: 'Search query parameter "q" is required' },
        { status: 400 }
      );
    }

    // Use the content service for search with publisher information
    const searchResult = await searchContentItemsWithPublishers(q, 5);

    return NextResponse.json(searchResult);
  } catch (error) {
    console.error('Error performing search:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}
