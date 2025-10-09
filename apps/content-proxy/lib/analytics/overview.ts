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
  pendingPayout: number;
  organization: string;
};

export type EarningsHistory = {
  date: string;
  earnings: number;
  requests: number;
};

export type UsageByApp = {
  app: string;
  requests: number;
  earnings: number;
};

export type RecentTransaction = {
  id: string;
  timestamp: string;
  app: string;
  content: string;
  amount: number;
  status: string;
};

export type ContentItemStats = {
  id: string;
  title: string;
  type: string;
  uploadedAt: string;
  requests: number;
  earnings: number;
  avgCost: number;
  coverImage?: string;
  description: string;
  author: string;
  publishedDate: string;
  pages: number;
  accessLevel: string;
  aiAccessEnabled: boolean;
  pricing: number;
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

  // Get publisher name
  const publisherResult = await db.execute<{ name: string }>(
    sql`SELECT name FROM content_proxy.publishers WHERE id = ${publisherId}`
  );
  const publisherName = publisherResult.rows[0]?.name || 'Unknown Publisher';

  // Use our new materialized views for better performance
  const daysBackInterval = sql.raw(`${DAYS_BACK} * INTERVAL '1 day'`);

  // Get earnings from usage transactions (new approach)
  const earningsResult = await db.execute<{
    total_earnings: string | number | null;
    monthly_earnings: string | number | null;
    total_requests: string | number | null;
    monthly_requests: string | number | null;
  }>(
    sql`
      SELECT
        COALESCE(SUM(ut.monetary_cost_calculated), 0) AS total_earnings,
        COALESCE(SUM(
          CASE 
            WHEN ut.transaction_time >= NOW() - ${daysBackInterval}
            THEN ut.monetary_cost_calculated 
            ELSE 0 
          END
        ), 0) AS monthly_earnings,
        COALESCE(COUNT(ut.id), 0) AS total_requests,
        COALESCE(SUM(
          CASE 
            WHEN ut.transaction_time >= NOW() - ${daysBackInterval}
            THEN 1 
            ELSE 0 
          END
        ), 0) AS monthly_requests
      FROM content_proxy.usage_transactions ut
      JOIN content_proxy.licensing_agreements la ON ut.licensing_agreement_id = la.id
      WHERE la.publisher_id = ${publisherId}
    `
  );

  const earningsRow = earningsResult.rows[0];

  const contentCountResult = await db.execute<ContentCountResult>(
    sql`
      SELECT COUNT(*)::int AS content_count
      FROM content_proxy.content_items
      WHERE publisher_id = ${publisherId}
    `
  );

  const contentCountRow = contentCountResult.rows[0];

  const totalEarnings = toNumber(earningsRow?.total_earnings);
  const monthlyEarnings = toNumber(earningsRow?.monthly_earnings);
  const totalRequests = toNumber(earningsRow?.total_requests);
  const monthlyRequests = toNumber(earningsRow?.monthly_requests);
  const contentCount = toNumber(contentCountRow?.content_count);

  return {
    publisherId,
    totalEarnings,
    monthlyEarnings,
    totalRequests,
    monthlyRequests,
    contentCount,
    calculationWindowDays: DAYS_BACK,
    pendingPayout: monthlyEarnings, // For now, pending payout is same as monthly earnings
    organization: publisherName,
  };
}

// Additional analytics functions using materialized views
export async function getPublisherEarningsHistory(
  publisherId: string,
  days: number = 30
): Promise<EarningsHistory[]> {
  const result = await db.execute<{
    date: string;
    daily_earnings: string | number | null;
    daily_requests: string | number | null;
  }>(
    sql`
      SELECT 
        date,
        daily_earnings,
        daily_requests
      FROM content_proxy.publisher_daily_earnings
      WHERE publisher_id = ${publisherId}
        AND date >= CURRENT_DATE - ${sql.raw(`${days} * INTERVAL '1 day'`)}
      ORDER BY date DESC
    `
  );

  return result.rows.map((row) => ({
    date: row.date,
    earnings: toNumber(row.daily_earnings),
    requests: toNumber(row.daily_requests),
  }));
}

export async function getPublisherUsageByApp(
  publisherId: string
): Promise<UsageByApp[]> {
  const result = await db.execute<{
    app_type: string;
    total_requests: string | number | null;
    total_earnings: string | number | null;
  }>(
    sql`
      SELECT 
        app_type,
        total_requests,
        total_earnings
      FROM content_proxy.usage_by_app
      WHERE publisher_id = ${publisherId}
      ORDER BY total_earnings DESC
    `
  );

  return result.rows.map((row) => ({
    app: row.app_type || 'Unknown',
    requests: toNumber(row.total_requests),
    earnings: toNumber(row.total_earnings),
  }));
}

export async function getPublisherRecentTransactions(
  publisherId: string,
  limit: number = 10
): Promise<RecentTransaction[]> {
  // First get the publisher name to filter by
  const publisherResult = await db.execute<{ name: string }>(
    sql`SELECT name FROM content_proxy.publishers WHERE id = ${publisherId}`
  );
  const publisherName = publisherResult.rows[0]?.name;

  if (!publisherName) {
    return [];
  }

  const result = await db.execute<{
    id: string;
    transaction_time: string;
    publisher_name: string;
    content_name: string;
    app_type: string;
    tokens_charged: string | number | null;
    bytes_transferred: string | number | null;
    monetary_cost_calculated: string | number | null;
  }>(
    sql`
      SELECT 
        id,
        transaction_time,
        publisher_name,
        content_name,
        app_type,
        tokens_charged,
        bytes_transferred,
        monetary_cost_calculated
      FROM content_proxy.recent_transactions
      WHERE publisher_name = ${publisherName}
      ORDER BY transaction_time DESC
      LIMIT ${limit}
    `
  );

  return result.rows.map((row) => ({
    id: row.id,
    timestamp: row.transaction_time,
    app: row.app_type || 'Unknown',
    content: row.content_name,
    amount: toNumber(row.monetary_cost_calculated),
    status: 'completed', // All transactions are considered completed for now
  }));
}

export async function getPublisherContentStats(
  publisherId: string
): Promise<ContentItemStats[]> {
  const result = await db.execute<{
    content_id: string;
    content_name: string;
    publisher_name: string;
    pricing_model: string;
    total_requests: string | number | null;
    total_earnings: string | number | null;
    total_bytes: string | number | null;
    avg_cost_per_request: string | number | null;
  }>(
    sql`
      SELECT 
        content_id,
        content_name,
        publisher_name,
        pricing_model,
        total_requests,
        total_earnings,
        total_bytes,
        avg_cost_per_request
      FROM content_proxy.content_performance
      WHERE publisher_id = ${publisherId}
      ORDER BY total_earnings DESC
    `
  );

  // Get additional content item details
  const contentItemsResult = await db.execute<{
    id: string;
    name: string;
    type: string;
    short_description: string;
    thumbnail_url: string;
    created_at: string;
  }>(
    sql`
      SELECT 
        id,
        name,
        type,
        short_description,
        thumbnail_url,
        created_at
      FROM content_proxy.content_items
      WHERE publisher_id = ${publisherId}
    `
  );

  const contentItemsMap = new Map(
    contentItemsResult.rows.map((item) => [item.id, item])
  );

  return result.rows.map((row) => {
    const contentItem = contentItemsMap.get(row.content_id);
    return {
      id: row.content_id,
      title: row.content_name,
      type: contentItem?.type || 'Unknown',
      uploadedAt: contentItem?.created_at || new Date().toISOString(),
      requests: toNumber(row.total_requests),
      earnings: toNumber(row.total_earnings),
      avgCost: toNumber(row.avg_cost_per_request),
      coverImage: contentItem?.thumbnail_url,
      description: contentItem?.short_description || '',
      author: row.publisher_name,
      publishedDate: contentItem?.created_at || new Date().toISOString(),
      pages: 0, // Not available in current schema
      accessLevel: 'Premium', // Default for now
      aiAccessEnabled: true, // Default for now
      pricing: toNumber(row.avg_cost_per_request),
    };
  });
}
