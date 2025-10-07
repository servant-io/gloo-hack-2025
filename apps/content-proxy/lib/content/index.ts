import { db } from '@/db/db';
import { contentItems, publishers } from '@/db/schemas/content';
import { eq, inArray, ilike, or, and, count } from 'drizzle-orm';
import type {
  ContentItem,
  ContentItemWithPublisher,
  PublisherId,
} from './types';
import { PublisherIds } from './types';

/**
 * Helper function to convert database publisher ID to TypeScript PublisherId type
 */
function toPublisherId(publisherId: string): PublisherId {
  // Validate that the publisher ID is one of the known values
  const validPublisherIds = Object.values(PublisherIds);
  if (!validPublisherIds.includes(publisherId as PublisherId)) {
    throw new Error(`Invalid publisher ID: ${publisherId}`);
  }
  return publisherId as PublisherId;
}

/**
 * Helper function to convert database content item to TypeScript ContentItem type
 */
function toContentItem(dbItem: typeof contentItems.$inferSelect): ContentItem {
  return {
    id: dbItem.id,
    publisherId: toPublisherId(dbItem.publisherId),
    type: dbItem.type as 'article' | 'video' | 'audio',
    name: dbItem.name,
    shortDescription: dbItem.shortDescription,
    thumbnailUrl: dbItem.thumbnailUrl,
    contentUrl: dbItem.contentUrl,
  };
}

/**
 * Get all content items
 */
export async function listContent(): Promise<ContentItem[]> {
  const dbItems = await db.select().from(contentItems);
  return dbItems.map(toContentItem);
}

/**
 * Get content items by their IDs
 */
export async function getContentItems(ids: string[]): Promise<ContentItem[]> {
  if (ids.length === 0) return [];

  const dbItems = await db
    .select()
    .from(contentItems)
    .where(inArray(contentItems.id, ids));

  return dbItems.map(toContentItem);
}

/**
 * Search content using database full-text search
 */
export async function searchContentItems(
  searchTerm: string,
  limit: number = 5
): Promise<{
  results: ContentItem[];
  totalMatches: number;
  searchTerm: string;
}> {
  if (!searchTerm.trim()) {
    return {
      results: [],
      totalMatches: 0,
      searchTerm,
    };
  }

  // Split search term into words for ILIKE matching
  const searchWords = searchTerm
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 0);

  // Build search conditions for each word
  const searchConditions = searchWords.map((word) =>
    or(
      ilike(contentItems.name, `%${word}%`),
      ilike(contentItems.shortDescription, `%${word}%`)
    )
  );

  // Combine conditions with AND to require all words to match
  const whereCondition = and(...searchConditions);

  // Get total matches count
  const totalMatchesResult = await db
    .select({ count: count() })
    .from(contentItems)
    .where(whereCondition);

  const totalMatches = totalMatchesResult[0]?.count || 0;

  // Get paginated results
  const dbResults = await db
    .select()
    .from(contentItems)
    .where(whereCondition)
    .limit(limit);

  const results = dbResults.map(toContentItem);

  return {
    results,
    totalMatches,
    searchTerm,
  };
}

/**
 * Get a single content item by ID
 */
export async function getContentItem(id: string): Promise<ContentItem | null> {
  const items = await db
    .select()
    .from(contentItems)
    .where(eq(contentItems.id, id))
    .limit(1);

  return items.length > 0 ? toContentItem(items[0]) : null;
}

/**
 * Get a single content item by content URL
 */
export async function getContentItemByUrl(url: string): Promise<ContentItem | null> {
  const items = await db
    .select()
    .from(contentItems)
    .where(eq(contentItems.contentUrl, url))
    .limit(1);

  return items.length > 0 ? toContentItem(items[0]) : null;
}

/**
 * Get paginated content items with publisher information using database join
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
  const offset = (page - 1) * limit;

  // Get total count
  const totalResult = await db.select({ count: count() }).from(contentItems);
  const total = totalResult[0]?.count || 0;

  // Get paginated content with publisher join
  const items = await db
    .select({
      id: contentItems.id,
      publisherId: contentItems.publisherId,
      type: contentItems.type,
      name: contentItems.name,
      shortDescription: contentItems.shortDescription,
      thumbnailUrl: contentItems.thumbnailUrl,
      contentUrl: contentItems.contentUrl,
      publisher: {
        id: publishers.id,
        name: publishers.name,
      },
    })
    .from(contentItems)
    .leftJoin(publishers, eq(contentItems.publisherId, publishers.id))
    .limit(limit)
    .offset(offset);

  const hasMore = offset + limit < total;

  return {
    items: items as ContentItemWithPublisher[],
    total,
    hasMore,
    page,
    limit,
  };
}

/**
 * Get all content items with publisher information using database join
 */
export async function listContentWithPublishers(): Promise<
  ContentItemWithPublisher[]
> {
  const items = await db
    .select({
      id: contentItems.id,
      publisherId: contentItems.publisherId,
      type: contentItems.type,
      name: contentItems.name,
      shortDescription: contentItems.shortDescription,
      thumbnailUrl: contentItems.thumbnailUrl,
      contentUrl: contentItems.contentUrl,
      publisher: {
        id: publishers.id,
        name: publishers.name,
      },
    })
    .from(contentItems)
    .leftJoin(publishers, eq(contentItems.publisherId, publishers.id));

  return items as ContentItemWithPublisher[];
}

/**
 * Get content items by their IDs with publisher information using database join
 */
export async function getContentItemsWithPublishers(
  ids: string[]
): Promise<ContentItemWithPublisher[]> {
  if (ids.length === 0) return [];

  const items = await db
    .select({
      id: contentItems.id,
      publisherId: contentItems.publisherId,
      type: contentItems.type,
      name: contentItems.name,
      shortDescription: contentItems.shortDescription,
      thumbnailUrl: contentItems.thumbnailUrl,
      contentUrl: contentItems.contentUrl,
      publisher: {
        id: publishers.id,
        name: publishers.name,
      },
    })
    .from(contentItems)
    .leftJoin(publishers, eq(contentItems.publisherId, publishers.id))
    .where(inArray(contentItems.id, ids));

  return items as ContentItemWithPublisher[];
}

/**
 * Get a single content item by ID with publisher information using database join
 */
export async function getContentItemWithPublisher(
  id: string
): Promise<ContentItemWithPublisher | null> {
  const items = await db
    .select({
      id: contentItems.id,
      publisherId: contentItems.publisherId,
      type: contentItems.type,
      name: contentItems.name,
      shortDescription: contentItems.shortDescription,
      thumbnailUrl: contentItems.thumbnailUrl,
      contentUrl: contentItems.contentUrl,
      publisher: {
        id: publishers.id,
        name: publishers.name,
      },
    })
    .from(contentItems)
    .leftJoin(publishers, eq(contentItems.publisherId, publishers.id))
    .where(eq(contentItems.id, id))
    .limit(1);

  return items.length > 0 ? (items[0] as ContentItemWithPublisher) : null;
}

/**
 * Search content with publisher information using database join
 */
export async function searchContentItemsWithPublishers(
  searchTerm: string,
  limit: number = 5
): Promise<{
  results: ContentItemWithPublisher[];
  totalMatches: number;
  searchTerm: string;
}> {
  if (!searchTerm.trim()) {
    return {
      results: [],
      totalMatches: 0,
      searchTerm,
    };
  }

  // Split search term into words for ILIKE matching
  const searchWords = searchTerm
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 0);

  // Build search conditions for each word
  const searchConditions = searchWords.map((word) =>
    or(
      ilike(contentItems.name, `%${word}%`),
      ilike(contentItems.shortDescription, `%${word}%`)
    )
  );

  // Combine conditions with AND to require all words to match
  const whereCondition = and(...searchConditions);

  // Get total matches count
  const totalMatchesResult = await db
    .select({ count: count() })
    .from(contentItems)
    .where(whereCondition);

  const totalMatches = totalMatchesResult[0]?.count || 0;

  // Get paginated results with publisher join
  const results = await db
    .select({
      id: contentItems.id,
      publisherId: contentItems.publisherId,
      type: contentItems.type,
      name: contentItems.name,
      shortDescription: contentItems.shortDescription,
      thumbnailUrl: contentItems.thumbnailUrl,
      contentUrl: contentItems.contentUrl,
      publisher: {
        id: publishers.id,
        name: publishers.name,
      },
    })
    .from(contentItems)
    .leftJoin(publishers, eq(contentItems.publisherId, publishers.id))
    .where(whereCondition)
    .limit(limit);

  return {
    results: results as ContentItemWithPublisher[],
    totalMatches,
    searchTerm,
  };
}
