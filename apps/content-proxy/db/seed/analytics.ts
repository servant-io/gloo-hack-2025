import { randomUUID } from 'node:crypto';
import { db } from '../db';
import { events, profiles } from '../schemas/personalization';
import { contentItems } from '../schemas/content';
import { eq, sql } from 'drizzle-orm';
import { upsertMetricSchemaVersion } from '@/lib/personalization/metric';

type EventInsert = typeof events.$inferInsert;

const DEFAULT_PROFILE_ID = '550e8400-e29b-41d4-a716-446655440000';
const DEMO_DAYS = 14;
const VIEW_EVENTS_PER_DAY = 6;

function toViewEvent(
  contentItem: typeof contentItems.$inferSelect,
  timestamp: Date,
  metricSchemaVersionId: string
): EventInsert {
  return {
    id: randomUUID(),
    profileId: DEFAULT_PROFILE_ID,
    metricSchemaVersionId,
    data: {
      contentItemId: contentItem.id,
      url: contentItem.contentUrl,
    },
    ts: timestamp,
  };
}

function toTransferEvent(
  contentItem: typeof contentItems.$inferSelect,
  timestamp: Date,
  metricSchemaVersionId: string,
  bytesTransferred: number
): EventInsert {
  return {
    id: randomUUID(),
    profileId: DEFAULT_PROFILE_ID,
    metricSchemaVersionId,
    data: {
      contentItemId: contentItem.id,
      url: contentItem.contentUrl,
      contentRange: null,
      duration: 750 + Math.floor(Math.random() * 400),
      contentType: 'text/html',
      contentLength: bytesTransferred,
      acceptRanges: 'bytes',
      rangeStart: null,
      rangeEnd: null,
      totalSize: bytesTransferred,
      bytesTransferred,
      statusCode: 200,
    },
    ts: timestamp,
  };
}

export async function seedAnalyticsData() {
  console.log('Seeding analytics demo data...');

  const existingEvents = await db.execute<{ count: number }>(
    sql`SELECT COUNT(*)::int AS count FROM content_proxy.events`
  );
  const totalExisting = existingEvents.rows[0]?.count ?? 0;

  if (totalExisting > 0) {
    console.log(
      `Found ${totalExisting} existing events. Skipping analytics seeding.`
    );
    return;
  }

  const allContent = await db.select().from(contentItems);

  if (allContent.length === 0) {
    console.warn(
      'No content items found. Skipping analytics seeding. Run content seeding first.'
    );
    return;
  }

  const [profile] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.id, DEFAULT_PROFILE_ID))
    .limit(1);

  if (!profile) {
    console.warn(
      `Profile ${DEFAULT_PROFILE_ID} not found. Skipping analytics seeding. Run personalization seeding first.`
    );
    return;
  }

  const viewedSchema = await upsertMetricSchemaVersion('viewed_content');
  const transferSchema = await upsertMetricSchemaVersion(
    'transferred_content_bytes'
  );

  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  const earliest = new Date(now.getTime() - DEMO_DAYS * dayMs);
  const eventsToInsert: EventInsert[] = [];

  for (
    let dayOffset = 0;
    dayOffset < DEMO_DAYS;
    dayOffset += 1
  ) {
    const day = new Date(earliest.getTime() + dayOffset * dayMs);

    allContent.slice(0, 6).forEach((item, index) => {
      const viewCount = Math.max(1, VIEW_EVENTS_PER_DAY - index);
      for (let i = 0; i < viewCount; i += 1) {
        const timestamp = new Date(day.getTime() + (i * dayMs) / 24);
        eventsToInsert.push(
          toViewEvent(item, timestamp, viewedSchema.id)
        );
        const bytesTransferred =
          32_000 + index * 5_000 + Math.floor(Math.random() * 3_000);
        eventsToInsert.push(
          toTransferEvent(
            item,
            timestamp,
            transferSchema.id,
            bytesTransferred
          )
        );
      }
    });
  }

  if (eventsToInsert.length === 0) {
    console.log('No analytics events generated.');
    return;
  }

  await db
    .insert(events)
    .values(eventsToInsert)
    .onConflictDoNothing();

  console.log(`Inserted ${eventsToInsert.length} analytics events.`);
}
