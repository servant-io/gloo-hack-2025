import { db } from '@/db/db';
import { contentItems, contentItemsSources } from '@/db/schemas/content';
import { eq, count, and, inArray } from 'drizzle-orm';
import type {
  ContentItemsSource,
  CsvTypeContentItemsSource,
  Rss2ItunesTypeContentItemsSource,
  SourcedContentItem,
  YouTubeChannelContentItemsSource,
} from './types';
import csvSchema from '@/lib/content-items-sources/schemas/csv.schema.json';
import rss2ItunesSchema from '@/lib/content-items-sources/schemas/rss2-itunes.schema.json';
import youtubeChannelSchemaSchema from '@/lib/content-items-sources/schemas/youtube-channel.schema.json';
import Ajv from 'ajv';
import { generatePrimaryKey } from '@/lib/db';
import {
  extractContentItemsFromParsedCsv,
  getCsvHeaderColumns,
  getCsvRows,
} from '@/lib/content-items-sources/type-csv';
import {
  extractContentItemsFromParsedRss2Itunes,
  parseRss2Itunes,
} from '@/lib/content-items-sources/type-rss2-itunes';
import {
  extractYouTubeChannelVideos,
  getYouTubeChannelUploadsPlaylistId,
  isValidYouTubeChannelHandle,
} from '@/lib/content-items-sources/type-youtube';

export const SUPPORTED_CONTENT_ITEMS_SOURCES_TYPES = [
  'csv',
  'rss2-itunes',
  'youtube-channel',
] as const;

export function toContentItemsSourceName(
  fullName: string | null | undefined
): string {
  if (!fullName || typeof fullName !== 'string') return "";

  return fullName.slice(0, 200);
}

export function toContentItemsSourceShortDescription(
  fullDescription: string | null | undefined
): string {
  if (!fullDescription || typeof fullDescription !== 'string') return "";

  return fullDescription.slice(0, 500);
}

/**
 * Get paginated content items sources using database join
 */
export async function listContentItemsSourcesPaginated(
  publisherId: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  items: ContentItemsSource[];
  total: number;
  hasMore: boolean;
  page: number;
  limit: number;
}> {
  const offset = (page - 1) * limit;

  // Get total count
  const totalResult = await db
    .select({ count: count() })
    .from(contentItemsSources);
  const total = totalResult[0]?.count || 0;

  // Get paginated content items sources
  const items = await db
    .select({
      id: contentItemsSources.id,
      // publisherId: contentItemsSources.publisherId,
      type: contentItemsSources.type,
      name: contentItemsSources.name,
      url: contentItemsSources.url,
      instructions: contentItemsSources.instructions,
      statusCode: contentItemsSources.statusCode,
      // response: contentItemsSources.response,
    })
    .from(contentItemsSources)
    .where(eq(contentItemsSources.publisherId, publisherId))
    .limit(limit)
    .offset(offset);

  const hasMore = offset + limit < total;

  return {
    items: items as ContentItemsSource[],
    total,
    hasMore,
    page,
    limit,
  };
}

/**
 * Get content items source by ID, scoped on publisher ID
 */
export async function getContentItemsSourceById(
  publisherId: string,
  id: string
): Promise<ContentItemsSource | null> {
  const items = await db
    .select({
      id: contentItemsSources.id,
      // publisherId: contentItemsSources.publisherId,
      type: contentItemsSources.type,
      name: contentItemsSources.name,
      url: contentItemsSources.url,
      instructions: contentItemsSources.instructions,
      statusCode: contentItemsSources.statusCode,
      // response: contentItemsSources.response,
    })
    .from(contentItemsSources)
    .where(
      and(
        eq(contentItemsSources.publisherId, publisherId),
        eq(contentItemsSources.id, id)
      )
    )
    .limit(1);

  return items.length > 0 ? (items[0] as ContentItemsSource) : null;
}

/**
 * Validate content items source data
 */
export async function validateContentItemsSourceData(data: {
  type: (typeof SUPPORTED_CONTENT_ITEMS_SOURCES_TYPES)[number];
  name: string;
  url: string;
  autoSync: boolean;
  instructions:
    | CsvTypeContentItemsSource['instructions']
    | Rss2ItunesTypeContentItemsSource['instructions'];
}): Promise<{
  valid: boolean;
  message?: string;
  data:
    | {
        type: 'csv';
        name: string;
        url: string;
        autoSync: boolean;
        instructions: CsvTypeContentItemsSource['instructions'];
        statusCode: number;
        response: string;
      }
    | {
        type: 'rss2-itunes';
        name: string;
        url: string;
        autoSync: boolean;
        instructions: Rss2ItunesTypeContentItemsSource['instructions'];
        statusCode: number;
        response: string;
      }
    | {
        type: 'youtube-channel';
        name: string;
        url: string;
        autoSync: boolean;
        instructions: YouTubeChannelContentItemsSource['instructions'];
        statusCode: number;
        response: string;
      }
    | null;
}> {
  if (typeof data !== 'object' || data === null)
    return { valid: false, message: 'Data must be an object', data: null };

  const type = data.type;

  if (!SUPPORTED_CONTENT_ITEMS_SOURCES_TYPES.includes(type))
    return { valid: false, message: 'Invalid type', data: null };

  const ajv = new Ajv();

  if (type === 'csv') {
    const validate = ajv.compile(csvSchema);
    const contentItemsSourceData: Pick<
      CsvTypeContentItemsSource,
      'name' | 'url' | 'autoSync' | 'instructions'
    > = {
      name: data.name,
      url: data.url,
      autoSync: data.autoSync || false,
      instructions:
        data.instructions as CsvTypeContentItemsSource['instructions'],
    };
    const isValidCsvTypeSchema = validate(contentItemsSourceData);

    if (!isValidCsvTypeSchema) {
      return { valid: false, message: 'Invalid CSV data format', data: null };
    }

    try {
      new URL(contentItemsSourceData.url);
      // TODO: validate that URL is unique
    } catch {
      return { valid: false, message: 'Invalid URL format', data: null };
    }

    const response = await fetch(contentItemsSourceData.url);
    if (!response.ok) {
      return {
        valid: false,
        message: `URL is not reachable, status: ${response.status}`,
        data: null,
      };
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/csv')) {
      return {
        valid: false,
        message: `URL does not point to a CSV file, content-type: ${contentType}`,
        data: null,
      };
    }

    const csvText: string = await response.text();
    const csvHeader: string[] = getCsvHeaderColumns(csvText);
    const contentUrlColumn =
      contentItemsSourceData.instructions.headers.contentUrl;

    if (!csvHeader.includes(contentUrlColumn)) {
      return {
        valid: false,
        message: `CSV must contain the "${contentUrlColumn}" column in it's header. Found: ${csvHeader.join(', ')}`,
        data: null,
      };
    }

    const newContentItemsSourceData = {
      type,
      statusCode: response.status,
      response: csvText,
      ...contentItemsSourceData,
    };

    return { valid: true, data: newContentItemsSourceData };
  } else if (type === 'rss2-itunes') {
    const validate = ajv.compile(rss2ItunesSchema);
    const contentItemsSourceData: Pick<
      Rss2ItunesTypeContentItemsSource,
      'name' | 'url' | 'autoSync'
    > = {
      name: data.name,
      url: data.url,
      autoSync: data.autoSync || false,
    };
    const isValidRss2ItunesType = validate(contentItemsSourceData);

    if (!isValidRss2ItunesType) {
      return {
        valid: false,
        message: 'Invalid RSS 2.0  data format',
        data: null,
      };
    }

    try {
      new URL(contentItemsSourceData.url);
      // TODO: validate that URL is unique
    } catch {
      return { valid: false, message: 'Invalid URL format', data: null };
    }

    const response = await fetch(contentItemsSourceData.url);
    if (!response.ok) {
      return {
        valid: false,
        message: `URL is not reachable, status: ${response.status}`,
        data: null,
      };
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/rss+xml')) {
      return {
        valid: false,
        message: `URL does not point to a RSS 2.0 XML file, content-type: ${contentType}`,
        data: null,
      };
    }

    const rssXmlText: string = await response.text();
    const rssxml = await parseRss2Itunes(rssXmlText);

    if (rssxml.$.version !== '2.0') {
      return { valid: false, message: 'RSS version must be 2.0', data: null };
    }

    if (
      rssxml.$['xmlns:itunes'] !== 'http://www.itunes.com/dtds/podcast-1.0.dtd'
    ) {
      return {
        valid: false,
        message: 'RSS must contain "xmlns:itunes" namespace',
        data: null,
      };
    }

    if (
      rssxml.$['xmlns:podcast'] !== 'https://podcastindex.org/namespace/1.0'
    ) {
      return {
        valid: false,
        message: 'RSS must contain "xmlns:podcast" namespace',
        data: null,
      };
    }

    const newContentItemsSourceData = {
      type,
      statusCode: response.status,
      response: rssXmlText,
      instructions: {},
      ...contentItemsSourceData,
    };

    return { valid: true, data: newContentItemsSourceData };
  } else if (type === 'youtube-channel') {
    const validate = ajv.compile(youtubeChannelSchemaSchema);
    const contentItemsSourceData: Pick<
      YouTubeChannelContentItemsSource,
      'name' | 'url' | 'autoSync'
    > = {
      name: data.name,
      url: data.url,
      autoSync: data.autoSync || false,
    };
    const isValidYouTubeChannelType = validate(contentItemsSourceData);

    if (!isValidYouTubeChannelType) {
      return {
        valid: false,
        message: 'Invalid YouTube channel data format',
        data: null,
      };
    }

    if (!data.url.startsWith('https://www.youtube.com/@')) {
      return {
        valid: false,
        message: 'Invalid YouTube channel URL',
        data: null,
      };
    }

    const channelHandle = `@${data.url.split('@')[1]}`;
    if (!isValidYouTubeChannelHandle(channelHandle)) {
      return {
        valid: false,
        message: 'Invalid YouTube channel handle format',
        data: null,
      };
    }

    const uploadsPlaylistId = await getYouTubeChannelUploadsPlaylistId(
      data.url
    );
    if (!uploadsPlaylistId) {
      return {
        valid: false,
        message: `YouTube channel ${channelHandle} has no uploads`,
        data: null,
      };
    }

    try {
      new URL(contentItemsSourceData.url);
      // TODO: validate that URL is unique
    } catch {
      return { valid: false, message: 'Invalid URL format', data: null };
    }

    const newContentItemsSourceData = {
      type,
      statusCode: 200,
      response: JSON.stringify({ channelHandle, uploadsPlaylistId }),
      instructions: {},
      ...contentItemsSourceData,
    };

    return { valid: true, data: newContentItemsSourceData };
  }

  return { valid: false, message: 'Unsupported type', data: null };
}

/**
 * Create a new content items source
 * @param publisherId - ID of the publisher
 * @param data - Data for the new content items source
 * @returns The created content items source
 */
export async function createContentItemsSource(
  publisherId: string,
  data: Omit<ContentItemsSource, 'id' | 'publisherId'>
): Promise<ContentItemsSource> {
  const [created] = await db
    .insert(contentItemsSources)
    .values({
      id: generatePrimaryKey(),
      publisherId,
      type: data.type,
      name: data.name,
      url: data.url,
      autoSync: data.autoSync,
      instructions: data.instructions,
    })
    .returning({
      id: contentItemsSources.id,
      // publisherId: contentItemsSources.publisherId,
      type: contentItemsSources.type,
      name: contentItemsSources.name,
      url: contentItemsSources.url,
      autoSync: contentItemsSources.autoSync,
      instructions: contentItemsSources.instructions,
    });

  return created as ContentItemsSource;
}

/**
 * Indicate the sync finished
 */
async function markContentItemsSourceAsSynced({
  id,
  statusCode,
  responseText,
}: {
  id: string;
  statusCode: number;
  responseText: string;
}) {
  await db
    .update(contentItemsSources)
    .set({
      statusCode,
      response: responseText,
      lastSyncFinishedAt: new Date(),
    })
    .where(eq(contentItemsSources.id, id));
}

type FetchContentItemsForSourceResult = {
  id: string;
  httpCode: number;
  items: number;
  valid: boolean;
  message?: string;
};

/**
 * Handle error during fetch content items for source
 * @param statusCode - HTTP status code
 * @param responseText - Response text
 * @param data - return data
 * @returns return data
 */
async function fetchContentItemsForSourceError({
  statusCode,
  responseText,
  ...data
}: FetchContentItemsForSourceResult & {
  statusCode: number;
  responseText: string;
}) {
  await markContentItemsSourceAsSynced({
    id: data.id,
    statusCode,
    responseText,
  });
  return data;
}

/**
 * Performs the actual sync. Database transaction:
 * 1. Update all the existing content items that changed
 * 2. Insert all the new content items (filtering by URL)
 * 3. TODO?: Delete all items that no longer exist at the source,
 *    with content_items.content_items_source_id = contentItemsSourceId
 */
async function syncContentItemsFromSource({
  statusCode,
  responseText,
  sourcedContentItems,
  publisherId,
  contentItemsSourceId,
}: {
  statusCode: number;
  responseText: string;
  sourcedContentItems: SourcedContentItem[];
  publisherId: string;
  contentItemsSourceId: string;
}) {
  try {
    await db.transaction(async (tx) => {
      const urls = sourcedContentItems.map(({ contentUrl }) => contentUrl);
      const existingContentItems = await tx
        .select()
        .from(contentItems)
        .where(
          and(
            eq(contentItems.publisherId, publisherId),
            inArray(contentItems.contentUrl, urls)
          )
        );

      const existingUrls = existingContentItems.map(
        ({ contentUrl }) => contentUrl
      );
      const newContentItems = sourcedContentItems.filter(
        ({ contentUrl }) => !existingUrls.includes(contentUrl)
      );

      const now = new Date();
      await Promise.all([
        // update existing items one by one
        ...existingContentItems.map((item) => {
          const newData = sourcedContentItems.find(
            ({ contentUrl }) => contentUrl === item.contentUrl
          )!;
          const needsUpdate =
            item.name !== newData.name ||
            item.shortDescription !== newData.shortDescription ||
            item.thumbnailUrl !== newData.thumbnailUrl;

          if (!needsUpdate) return new Promise(() => {});

          return tx
            .update(contentItems)
            .set({
              ...(item.name !== newData.name && {
                name: toContentItemsSourceName(newData.name),
              }),
              ...(item.shortDescription !== newData.shortDescription && {
                shortDescription: newData.shortDescription,
              }),
              ...(item.thumbnailUrl !== newData.thumbnailUrl && {
                thumbnailUrl: newData.thumbnailUrl,
              }),
              contentItemsSourceId,
              updatedAt: now,
            })
            .where(eq(contentItems.id, item.id));
        }),
        // insert all new items at once
        newContentItems.length
          ? tx.insert(contentItems).values(
              newContentItems.map((item) => ({
                id: generatePrimaryKey(),
                publisherId,
                contentItemsSourceId,
                name: toContentItemsSourceName(item.name),
                type: item.type,
                contentUrl: item.contentUrl,
                shortDescription: toContentItemsSourceShortDescription(
                  item.shortDescription
                ),
                thumbnailUrl: item.thumbnailUrl,
                createdAt: now,
                updatedAt: now,
              }))
            )
          : new Promise(() => {}),
      ]);
    });
    await markContentItemsSourceAsSynced({
      id: contentItemsSourceId,
      statusCode,
      responseText,
    });
  } catch (exception) {
    console.error(
      'Exception syncContentItemsFromSource:',
      JSON.stringify(exception)
    );
    await markContentItemsSourceAsSynced({
      id: contentItemsSourceId,
      statusCode,
      responseText,
    });
  }
}

/**
 * Trigger fetch of content items for a given source
 * @param publisherId - ID of the publisher
 * @param id - ID of the content items source
 * @returns void
 */
export async function triggerFetchContentItemsForSource(
  publisherId: string,
  id: string
): Promise<FetchContentItemsForSourceResult> {
  let sourcedContentItems: SourcedContentItem[] = [];
  let statusCode: number | undefined = undefined;
  let responseText: string | undefined = undefined;

  const [contentItemsSource] = await db
    .select()
    .from(contentItemsSources)
    .where(
      and(
        eq(contentItemsSources.publisherId, publisherId),
        eq(contentItemsSources.id, id)
      )
    )
    .limit(1);

  if (!contentItemsSource) {
    return {
      id,
      httpCode: 404,
      items: 0,
      valid: false,
      message: 'Content items source not found',
    };
  }

  if (
    contentItemsSource.lastSyncStartedAt &&
    !contentItemsSource.lastSyncFinishedAt
  ) {
    return {
      id,
      httpCode: 202,
      items: 0,
      valid: true,
      message: 'Content items source is already syncing',
    };
  }

  try {
    await db
      .update(contentItemsSources)
      .set({
        lastSyncStartedAt: new Date(),
        lastSyncFinishedAt: null,
      })
      .where(eq(contentItemsSources.id, id));

    const response = await fetch(contentItemsSource.url);
    statusCode = response.status;
    responseText = await response.text();
    if (!response.ok) {
      return await fetchContentItemsForSourceError({
        statusCode,
        responseText,
        id,
        httpCode: 422,
        items: 0,
        valid: false,
        message: "Content items source URL isn't reachable",
      });
    }

    if (contentItemsSource.type === 'csv') {
      const source = contentItemsSource as CsvTypeContentItemsSource;
      const csvRows: string[][] = getCsvRows(responseText);
      const csvHeader: string[] = csvRows[0];
      const contentUrlColumn = source.instructions.headers.contentUrl;

      if (!csvHeader.includes(contentUrlColumn)) {
        return await fetchContentItemsForSourceError({
          statusCode,
          responseText,
          id,
          httpCode: 422,
          items: 0,
          valid: false,
          message: `CSV must contain the "${contentUrlColumn}" column in it's header. Found: ${csvHeader.join(', ')}`,
        });
      }
      sourcedContentItems = extractContentItemsFromParsedCsv(
        csvRows,
        source.instructions
      );
    } else if (contentItemsSource.type === 'rss2-itunes') {
      const rssxml = await parseRss2Itunes(responseText);

      if (rssxml.$.version !== '2.0') {
        return await fetchContentItemsForSourceError({
          statusCode,
          responseText,
          id,
          httpCode: 422,
          items: 0,
          valid: false,
          message: 'RSS version must be 2.0',
        });
      }

      if (
        rssxml.$['xmlns:itunes'] !==
        'http://www.itunes.com/dtds/podcast-1.0.dtd'
      ) {
        return await fetchContentItemsForSourceError({
          statusCode,
          responseText,
          id,
          httpCode: 422,
          items: 0,
          valid: false,
          message: 'RSS must contain "xmlns:itunes" namespace',
        });
      }

      if (
        rssxml.$['xmlns:podcast'] !== 'https://podcastindex.org/namespace/1.0'
      ) {
        return await fetchContentItemsForSourceError({
          statusCode,
          responseText,
          id,
          httpCode: 422,
          items: 0,
          valid: false,
          message: 'RSS must contain "xmlns:podcast" namespace',
        });
      }
      sourcedContentItems = extractContentItemsFromParsedRss2Itunes(rssxml);
    } else if (contentItemsSource.type === 'youtube-channel') {
      const source = contentItemsSource as YouTubeChannelContentItemsSource;
      sourcedContentItems = await extractYouTubeChannelVideos(source.url);
    }

    if (sourcedContentItems.length) {
      syncContentItemsFromSource({
        statusCode,
        responseText,
        sourcedContentItems,
        publisherId,
        contentItemsSourceId: id,
      });
    } else {
      await markContentItemsSourceAsSynced({
        id,
        statusCode,
        responseText,
      });
    }

    return {
      id,
      httpCode: 202,
      items: sourcedContentItems.length,
      valid: true,
      message: 'Sync started',
    };
  } catch (exception) {
    const message =
      // @ts-expect-error: get the most of the exception
      `${exception.name}: ${exception.message}`;
    console.error(`Error fetching content items for source: ${message}`);
    return {
      id,
      httpCode: 500,
      items: sourcedContentItems.length,
      valid: false,
      message,
    };
  }
}
