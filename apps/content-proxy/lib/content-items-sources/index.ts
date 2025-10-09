import XML from 'xml2js';
import CSV from 'papaparse';
import { db } from '@/db/db';
import { contentItemsSources } from '@/db/schemas/content';
import { eq, count, and } from 'drizzle-orm';
import type {
  ContentItemsSource,
  CsvTypeContentItemsSource,
  Rss2ItunesTypeContentItemsSource,
} from './types';
import csvSchema from '@/lib/content-items-sources/schemas/csv.schema.json';
import rss2ItunesSchema from '@/lib/content-items-sources/schemas/rss2-itunes.schema.json';
import Ajv from 'ajv';
import { generatePrimaryKey } from '@/lib/db';

export const SUPPORTED_CONTENT_ITEMS_SOURCES_TYPES = [
  'csv',
  'rss2-itunes',
] as const;

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
      response: contentItemsSources.response,
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
      response: contentItemsSources.response,
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
  autoSync?: boolean;
  instructions?:
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
    | null;
}> {
  console.log('POST DATA:', data);

  if (typeof data !== 'object' || data === null)
    return { valid: false, message: 'Data must be an object', data: null };

  const type = data.type;

  if (!SUPPORTED_CONTENT_ITEMS_SOURCES_TYPES.includes(type))
    return { valid: false, message: 'Invalid type', data: null };

  const ajv = new Ajv();

  if (type === 'csv') {
    const validate = ajv.compile(csvSchema);
    const contentItemsSourceData = {
      name: data.name,
      url: data.url,
      autoSync: data.autoSync || false,
      instructions: data.instructions,
    };
    const isValidCsvTypeSchema = validate(contentItemsSourceData);
    console.log('isValidCsvTypeSchema:', isValidCsvTypeSchema);

    if (!isValidCsvTypeSchema) {
      return { valid: false, message: 'Invalid CSV data format', data: null };
    }

    try {
      new URL(contentItemsSourceData.url);
    } catch (e) {
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
    const csvHeader: string[] = CSV.parse(csvText, { header: false }).data[0];
    const contentUrlColumn = data.instructions!.headers.contentUrl;

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
  }

  if (type === 'rss2-itunes') {
    const validate = ajv.compile(rss2ItunesSchema);
    const contentItemsSourceData = {
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
    } catch (e) {
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
    const parser = new XML.Parser({
      attrkey: '$',
      charkey: '_',
      explicitCharkey: false,
      trim: false,
      normalizeTags: false,
      normalize: false,
      explicitRoot: false, // default: true
      emptyTag: '',
      explicitArray: false, // default: true
      ignoreAttrs: false,
      mergeAttrs: false,
      validator: null,
      xmlns: false,
      explicitChildren: false,
      childkey: '$$',
      preserveChildrenOrder: false,
      charsAsChildren: false,
      includeWhiteChars: false,
      async: false,
      strict: true,
      attrNameProcessors: null,
      attrValueProcessors: null,
      tagNameProcessors: null,
      valueProcessors: null,
    });
    const rssxml = await parser.parseStringPromise(rssXmlText);
    // console.log('rssxml:', xml);
    // TODO: check for rss version and itunes namespace

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
  }

  // url validation

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
 * Trigger fetch of content items for a given source
 * @param id - ID of the content items source
 * @returns void
 */
export async function triggerFetchContentItemsForSource(
  id: string
): Promise<void> {
  const [contentItemsSource] = await db
    .select()
    .from(contentItemsSources)
    .where(eq(contentItemsSources.id, id))
    .limit(1);

  if (!contentItemsSource) {
    // throw new Error('Content items source not found');
    console.warn('Content items source not found', id);
    return;
  }

  if (
    contentItemsSource.lastSyncStartedAt &&
    !contentItemsSource.lastSyncFinishedAt
  ) {
    // throw new Error('Content items source is already syncing');
    console.info('Content items source is already syncing', id);
    return;
  }

  // Update lastSyncStartedAt
  await db
    .update(contentItemsSources)
    .set({
      lastSyncStartedAt: new Date(),
      lastSyncFinishedAt: null,
    })
    .where(eq(contentItemsSources.id, id));

  // Fetch content items based on type
  const response = await fetch(contentItemsSource.url);
  if (!response.ok) {
    console.error('Failed to fetch content items source data', id);
    // Update lastSyncFinishedAt with failure
    await db
      .update(contentItemsSources)
      .set({
        lastSyncFinishedAt: new Date(),
        statusCode: response.status,
        response: await response.text(),
      })
      .where(eq(contentItemsSources.id, id));
    return;
  }

  const responseText = await response.text();
  console.error('Successfully fetched content items source data', id);
  // Update lastSyncFinishedAt with failure
  await db
    .update(contentItemsSources)
    .set({
      lastSyncFinishedAt: new Date(),
      statusCode: response.status,
      response: responseText,
    })
    .where(eq(contentItemsSources.id, id));

  // TODO: based on type, parse and upsert content items
}
