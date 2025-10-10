import {
  pgTable,
  index,
  check,
  varchar,
  text,
  timestamp,
  integer,
  jsonb,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const contentItems = pgTable(
  'content_items',
  {
    id: varchar({ length: 50 }).primaryKey().notNull(),
    source: varchar({ length: 20 }).notNull(),
    contentType: varchar('content_type', { length: 20 }).notNull(),
    title: text().notNull(),
    description: text(),
    url: text().notNull(),
    mediaUrl: text('media_url'),
    thumbnailUrl: text('thumbnail_url'),
    uploadDate: timestamp('upload_date', { mode: 'string' }),
    durationSeconds: integer('duration_seconds'),
    seriesTitle: varchar('series_title', { length: 255 }),
    posterImages: jsonb('poster_images'),
    ogTitle: text('og_title'),
    ogDescription: text('og_description'),
    bibleBook: varchar('bible_book', { length: 50 }),
    fullText: text('full_text'),
    date: varchar({ length: 100 }),
    createdAt: timestamp('created_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`
    ),
    updatedAt: timestamp('updated_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`
    ),
  },
  (table) => [
    index('idx_content_items_bible_book').using(
      'btree',
      table.bibleBook.asc().nullsLast().op('text_ops')
    ),
    index('idx_content_items_source').using(
      'btree',
      table.source.asc().nullsLast().op('text_ops')
    ),
    index('idx_content_items_type').using(
      'btree',
      table.contentType.asc().nullsLast().op('text_ops')
    ),
    index('idx_content_items_upload_date').using(
      'btree',
      table.uploadDate.asc().nullsLast().op('timestamp_ops')
    ),
    check(
      'content_items_content_type_check',
      sql`(content_type)::text = ANY ((ARRAY['video'::character varying, 'message'::character varying])::text[])`
    ),
    check(
      'content_items_source_check',
      sql`(source)::text = ANY ((ARRAY['bibleproject'::character varying, 'desiringgod'::character varying])::text[])`
    ),
  ]
);
