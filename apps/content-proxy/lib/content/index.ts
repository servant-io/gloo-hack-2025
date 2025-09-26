import { mockContent, mockPublishers } from './mock';
import { searchContent } from './search';
import type { ContentItem, ContentItemWithPublisher } from './types';

/**
 * Get all content items with a simulated async delay
 */
export async function listContent(): Promise<ContentItem[]> {
  // Simulate async operation with a delay
  await new Promise((resolve) => setTimeout(resolve, 100));
  return [...mockContent];
}

/**
 * Get content items by their IDs with a simulated async delay
 */
export async function getContentItems(ids: string[]): Promise<ContentItem[]> {
  // Simulate async operation with a delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  const filteredContent = mockContent.filter((item) => ids.includes(item.id));

  return filteredContent;
}

/**
 * Search content with a simulated async delay
 */
export async function searchContentItems(
  searchTerm: string,
  limit: number = 5
): Promise<{
  results: ContentItem[];
  totalMatches: number;
  searchTerm: string;
}> {
  // Simulate async operation with a delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  return searchContent(mockContent, searchTerm, limit);
}

/**
 * Get a single content item by ID
 */
export async function getContentItem(id: string): Promise<ContentItem | null> {
  const items = await getContentItems([id]);
  return items.length > 0 ? items[0] : null;
}

/**
 * Helper function to join content items with their publishers
 */
function joinContentWithPublishers(
  contentItems: ContentItem[]
): ContentItemWithPublisher[] {
  return contentItems.map((item) => {
    const publisher = mockPublishers.find((p) => p.id === item.publisherId);
    if (!publisher) {
      throw new Error(`Publisher not found for content item ${item.id}`);
    }
    return {
      ...item,
      publisher,
    };
  });
}

/**
 * Get paginated content items with publisher information
 */
export async function listContentWithPublishersPaginated(
  page: number = 1,
  limit: number = 10
): Promise<{
  items: ContentItemWithPublisher[];
  total: number;
  hasMore: boolean;
  page: number;
  limit: number;
}> {
  // Simulate async operation with a delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  const allContent = [...mockContent];
  const totalItems = allContent.length;

  // Calculate pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  // Only get the items for the current page
  const paginatedContent = allContent.slice(startIndex, endIndex);

  // Join with publisher information
  const itemsWithPublishers = joinContentWithPublishers(paginatedContent);

  const hasMore = endIndex < totalItems;

  return {
    items: itemsWithPublishers,
    total: totalItems,
    hasMore,
    page,
    limit,
  };
}

/**
 * Get all content items with publisher information
 */
export async function listContentWithPublishers(): Promise<
  ContentItemWithPublisher[]
> {
  const content = await listContent();
  return joinContentWithPublishers(content);
}

/**
 * Get content items by their IDs with publisher information
 */
export async function getContentItemsWithPublishers(
  ids: string[]
): Promise<ContentItemWithPublisher[]> {
  const content = await getContentItems(ids);
  return joinContentWithPublishers(content);
}

/**
 * Get a single content item by ID with publisher information
 */
export async function getContentItemWithPublisher(
  id: string
): Promise<ContentItemWithPublisher | null> {
  const item = await getContentItem(id);
  if (!item) return null;

  const itemsWithPublishers = joinContentWithPublishers([item]);
  return itemsWithPublishers[0];
}

/**
 * Search content with publisher information
 */
export async function searchContentItemsWithPublishers(
  searchTerm: string,
  limit: number = 5
): Promise<{
  results: ContentItemWithPublisher[];
  totalMatches: number;
  searchTerm: string;
}> {
  const searchResult = await searchContentItems(searchTerm, limit);
  const resultsWithPublishers = joinContentWithPublishers(searchResult.results);

  return {
    results: resultsWithPublishers,
    totalMatches: searchResult.totalMatches,
    searchTerm: searchResult.searchTerm,
  };
}
