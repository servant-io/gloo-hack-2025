import { NextResponse } from 'next/server';
import { getContentItemsWithPublishers } from '@/lib/content';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Handle comma-separated IDs for multiple content items
    const ids = id.split(',');

    // Use the content service to get items by IDs with publisher information
    const filteredContent = await getContentItemsWithPublishers(ids);

    // If no content found, return 404
    if (filteredContent.length === 0) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // Return filtered content with publisher information as JSON
    return NextResponse.json(filteredContent);
  } catch (error) {
    console.error('Error fetching content by ID:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}
