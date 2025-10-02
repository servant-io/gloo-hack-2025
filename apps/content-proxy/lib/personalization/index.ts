import { db } from '@/db/db';
import { events } from '@/db/schemas/personalization';
import type { MetricName } from '@/lib/personalization/metric';
import {
  upsertMetricSchemaVersion,
  validateEventData,
} from '@/lib/personalization/metric';
import { upsertProfile } from './profile';

/** @see apps/content-proxy/lib/personalization/metricSchemas/viewedContent.schema.json */
export type ViewedContentParams = {
  contentItemId: string;
  url?: string;
  /** @todo forward the most recent search term
   * before clicking through to the content item,
   * likely from url query params */
  searchTerm?: string;
};

export async function emitViewedContentEvent(
  profileId: string,
  params: ViewedContentParams
) {
  // Filter out undefined values before sending to validation
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== ''
    )
  );

  return await emitPersonalizationEvent(
    profileId,
    'viewed_content',
    filteredParams
  );
}

type InsertEvent = typeof events.$inferInsert;

async function emitPersonalizationEvent(
  profileId: string,
  metricName: MetricName,
  eventData: unknown
): Promise<string> {
  const profile = await upsertProfile({ id: profileId });
  const metricSchemaVersion = await upsertMetricSchemaVersion(metricName);
  const isValidEventData = await validateEventData(metricName, eventData);
  if (!isValidEventData.success) {
    throw new Error(
      `invalid event data for metric ${metricName}: ${isValidEventData.message}`
    );
  }
  const [event] = await db
    .insert(events)
    .values({
      profileId: profile.id,
      metricSchemaVersionId: metricSchemaVersion.id,
      data: eventData,
    } as InsertEvent)
    .returning({ id: events.id });

  return event.id;
}
