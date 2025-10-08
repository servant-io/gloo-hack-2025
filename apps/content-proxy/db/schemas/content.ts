import { boolean, jsonb, timestamp, varchar } from 'drizzle-orm/pg-core';
import { contentProxySchema } from '../schema';

export const publishers = contentProxySchema.table('publishers', {
  /**
   * Unique identifier for the publisher
   * `openssl rand -hex 6`
   * @example "21991dbb36be"
   * @example "dffa5eca5ccc"
   * @example "88c7702ddabb"
   */
  id: varchar('id', { length: 12 }).primaryKey().notNull(),

  /**
   * Publisher name
   * @example "Austin Christian University (ACU)"
   * @example "Indiana Wesleyan University (IWU)"
   * @example "Bethel Tech"
   */
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const contentItemsSources = contentProxySchema.table(
  'content_items_sources',
  {
    /**
     * FIXME: I don't think we ACTUALLY use the UUID v4 format here.
     * Should we?
     * Unique identifier for the content item source (UUID v4)
     * @example "72f20c838bb0"
     * @example "9d12fa6e1c84"
     */
    id: varchar('id', { length: 12 }).primaryKey().notNull(),

    /**
     * Foreign key reference to the publisher
     */
    publisherId: varchar('publisher_id', { length: 12 })
      .notNull()
      .references(() => publishers.id),

    /**
     * Type of content item source
     * @example "csv"
     * @example "ftp"
     * @example "s3"
     * @example "rss-podcast"
     * @example "google-sheet"
     * @example "youtube-channel"
     * @example "youtube-playlist"
     */
    type: varchar('type', { length: 256 }).notNull(),

    /**
     * Readable name of the content item source for the publisher to identify it
     * @example "The Carey Nieuwhof Leadership Podcast"
     * @example "@AustinChristianUniversity on YouTube"
     */
    name: varchar('name', { length: 256 }).notNull(),

    /**
     * URL to the actual content source
     * @example "https://christianed.com/courses/biblical-theology"
     */
    url: varchar('url', { length: 500 }).notNull(),

    /**
     * Is content supposed to be auto-synced
     * @example true
     * @example false
     */
    autoSync: boolean('auto_sync').default(false).notNull(),
    // TODO: consider using sync_frequency instead, with null value for manual sync only

    /**
     * Type-specific data for the content item source
     * @example {}
     */
    data: jsonb('data').notNull(),

    /**
     * Sync-related timestamps to determine its current status in the UI and get the idea on how long it takes to sync
     */
    lastSyncStartedAt: timestamp('last_sync_started_at').defaultNow().notNull(),
    lastSyncFinishedAt: timestamp('last_sync_finished_at')
      .defaultNow()
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  }
);

export const contentItems = contentProxySchema.table('content_items', {
  /**
   * Unique identifier for the content item (UUID v4)
   * @example "72f20c838bb0"
   * @example "9d12fa6e1c84"
   */
  id: varchar('id', { length: 12 }).primaryKey().notNull(),

  /**
   * Foreign key reference to the publisher
   */
  publisherId: varchar('publisher_id', { length: 12 })
    .notNull()
    .references(() => publishers.id),

  /**
   * Optional foreign key reference to the content item source
   */
  contentItemsSourcesId: varchar('content_items_source_id', {
    length: 12,
  }).references(() => contentItemsSources.id),

  /**
   * Type of content
   * @example "article"
   * @example "video"
   * @example "audio"
   */
  type: varchar('type', { length: 10 }).notNull(),

  /**
   * Content item name/title
   * @example "Introduction to Biblical Theology"
   * @example "Advanced Systematic Theology"
   */
  name: varchar('name', { length: 200 }).notNull(),

  /**
   * Short description of the content
   * @example "Explore the grand narrative of Scripture and discover how God's redemptive plan unfolds from Genesis to Revelation."
   */
  shortDescription: varchar('short_description', { length: 500 }).notNull(),

  /**
   * URL to the thumbnail image
   * @example "https://picsum.photos/300/200?random=11"
   */
  thumbnailUrl: varchar('thumbnail_url', { length: 500 }).notNull(),

  /**
   * URL to the actual content
   * @example "https://christianed.com/courses/biblical-theology"
   */
  contentUrl: varchar('content_url', { length: 500 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
