import { db } from '@/db/db';
import { sql } from 'drizzle-orm';

const DEFAULT_RATE_PER_BYTE = 0.000002;
const DAYS_BACK = 30;

function resolveRatePerByte(): number {
  const raw = process.env.CONTENT_PROXY_RATE_PER_BYTE;
  if (!raw) {
    return DEFAULT_RATE_PER_BYTE;
  }

  const parsed = Number(raw);
  if (Number.isFinite(parsed) && parsed >= 0) {
    return parsed;
  }

  console.warn(
    `Invalid CONTENT_PROXY_RATE_PER_BYTE value "${raw}", falling back to default ${DEFAULT_RATE_PER_BYTE}`
  );

  return DEFAULT_RATE_PER_BYTE;
}

export type PublisherOverviewStats = {
  publisherId: string;
  totalEarnings: number;
  monthlyEarnings: number;
  totalRequests: number;
  monthlyRequests: number;
  contentCount: number;
  calculationWindowDays: number;
};

type OverviewQueryResult = {
  total_bytes: string | number | null;
  monthly_bytes: string | number | null;
  total_views: string | number | null;
  monthly_views: string | number | null;
};

type PublisherExistsResult = {
  exists: boolean;
};

type ContentCountResult = {
  content_count: number;
};

function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function getPublisherOverview(
  publisherId: string
): Promise<PublisherOverviewStats | null> {
  if (!publisherId.trim()) {
    throw new Error('publisherId is required');
  }

  const publisherExistsResult = await db.execute<PublisherExistsResult>(
    sql`SELECT EXISTS(
          SELECT 1
          FROM content_proxy.publishers
          WHERE id = ${publisherId}
        ) AS exists`
  );

  const publisherExistsRow = publisherExistsResult.rows[0];

  if (!publisherExistsRow?.exists) {
    return null;
  }

  const daysBackInterval = sql.raw(`${DAYS_BACK} * INTERVAL '1 day'`);

  const overviewResult = await db.execute<OverviewQueryResult>(
    sql`
      SELECT
        COALESCE(SUM(
          CASE
            WHEN msv.metric_name = 'transferred_content_bytes'
            THEN COALESCE((events.data->>'bytesTransferred')::numeric, 0)
            ELSE 0
          END
        ), 0) AS total_bytes,
        COALESCE(SUM(
          CASE
            WHEN msv.metric_name = 'transferred_content_bytes'
              AND events.ts >= NOW() - ${daysBackInterval}
            THEN COALESCE((events.data->>'bytesTransferred')::numeric, 0)
            ELSE 0
          END
        ), 0) AS monthly_bytes,
        COALESCE(SUM(
          CASE
            WHEN msv.metric_name = 'viewed_content' THEN 1
            ELSE 0
          END
        ), 0) AS total_views,
        COALESCE(SUM(
          CASE
            WHEN msv.metric_name = 'viewed_content'
              AND events.ts >= NOW() - ${daysBackInterval}
            THEN 1
            ELSE 0
          END
        ), 0) AS monthly_views
      FROM content_proxy.events AS events
      INNER JOIN content_proxy.metric_schema_versions AS msv
        ON msv.id = events.metric_schema_version_id
      WHERE msv.metric_name IN ('viewed_content', 'transferred_content_bytes')
        AND (events.data->>'contentItemId') IN (
          SELECT id
          FROM content_proxy.content_items
          WHERE publisher_id = ${publisherId}
        )
    `
  );

  const overviewRow = overviewResult.rows[0];

  const contentCountResult = await db.execute<ContentCountResult>(
    sql`
      SELECT COUNT(*)::int AS content_count
      FROM content_proxy.content_items
      WHERE publisher_id = ${publisherId}
    `
  );

  const contentCountRow = contentCountResult.rows[0];

  const totalBytes = toNumber(overviewRow?.total_bytes);
  const monthlyBytes = toNumber(overviewRow?.monthly_bytes);
  const totalViews = toNumber(overviewRow?.total_views);
  const monthlyViews = toNumber(overviewRow?.monthly_views);
  const contentCount = toNumber(contentCountRow?.content_count);
  const ratePerByte = resolveRatePerByte();

  return {
    publisherId,
    totalEarnings: totalBytes * ratePerByte,
    monthlyEarnings: monthlyBytes * ratePerByte,
    totalRequests: totalViews,
    monthlyRequests: monthlyViews,
    contentCount,
    calculationWindowDays: DAYS_BACK,
  };
}
