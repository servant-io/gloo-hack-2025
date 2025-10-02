import { timestamp, varchar } from 'drizzle-orm/pg-core';
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
