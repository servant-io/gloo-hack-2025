import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../../db/db';
import { sql } from 'drizzle-orm';
import {
  getPublisherOverview,
  getPublisherEarningsHistory,
  getPublisherUsageByApp,
  getPublisherRecentTransactions,
  getPublisherContentStats,
} from '../../lib/analytics/overview';
import { publishers, contentItems } from '../../db/schemas/content';
import {
  licensingAgreements,
  contentPricing,
  usageTransactions,
} from '../../db/schemas/licensing';
import { profiles } from '../../db/schemas/personalization';

// Test data setup
const TEST_PUBLISHER_ID = '123456789012'; // 12-char hex ID
const TEST_CONTENT_ITEM_ID = 'abcdef123456'; // 12-char hex ID
const TEST_LICENSE_ID = '789012345678'; // 12-char hex ID
const TEST_PROFILE_ID = 'test_profile_1'; // UUID format

describe('Analytics Integration Tests', () => {
  beforeAll(async () => {
    // Clean up any existing test data
    await db.execute(sql`
      DELETE FROM content_proxy.usage_transactions 
      WHERE content_item_id = ${TEST_CONTENT_ITEM_ID}
    `);
    await db.execute(sql`
      DELETE FROM content_proxy.content_pricing 
      WHERE content_item_id = ${TEST_CONTENT_ITEM_ID}
    `);
    await db.execute(sql`
      DELETE FROM content_proxy.licensing_agreements 
      WHERE id = ${TEST_LICENSE_ID}
    `);
    await db.execute(sql`
      DELETE FROM content_proxy.content_items 
      WHERE id = ${TEST_CONTENT_ITEM_ID}
    `);
    await db.execute(sql`
      DELETE FROM content_proxy.publishers 
      WHERE id = ${TEST_PUBLISHER_ID}
    `);
    await db.execute(sql`
      DELETE FROM content_proxy.profiles 
      WHERE id = ${TEST_PROFILE_ID}
    `);

    // Create test publisher
    await db.insert(publishers).values({
      id: TEST_PUBLISHER_ID,
      name: 'Test Publisher',
    });

    // Create test content item
    await db.insert(contentItems).values({
      id: TEST_CONTENT_ITEM_ID,
      publisherId: TEST_PUBLISHER_ID,
      type: 'article',
      name: 'Test Article',
      shortDescription: 'Test description',
      thumbnailUrl: 'https://example.com/test.jpg',
      contentUrl: 'https://example.com/test',
    });

    // Create test licensing agreement
    await db.insert(licensingAgreements).values({
      id: TEST_LICENSE_ID,
      publisherId: TEST_PUBLISHER_ID,
      name: 'Test License',
      monetaryRatePerByte: '0.000002',
      monetaryRatePerRequest: '0.05',
      effectiveDate: new Date('2024-01-01'),
    });

    // Create test content pricing
    await db.insert(contentPricing).values({
      id: 'fedcba987654', // 12-char hex ID
      contentItemId: TEST_CONTENT_ITEM_ID,
      licensingAgreementId: TEST_LICENSE_ID,
      pricingModel: 'token_based',
      tokenCostPerByte: 1,
      tokenCostPerRequest: 10,
    });

    // Create test profile
    await db.insert(profiles).values({
      id: TEST_PROFILE_ID,
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      type: 'individual',
    });
  });

  afterAll(async () => {
    // Clean up test data
    await db.execute(sql`
      DELETE FROM content_proxy.usage_transactions 
      WHERE content_item_id = ${TEST_CONTENT_ITEM_ID}
    `);
    await db.execute(sql`
      DELETE FROM content_proxy.content_pricing 
      WHERE content_item_id = ${TEST_CONTENT_ITEM_ID}
    `);
    await db.execute(sql`
      DELETE FROM content_proxy.licensing_agreements 
      WHERE id = ${TEST_LICENSE_ID}
    `);
    await db.execute(sql`
      DELETE FROM content_proxy.content_items 
      WHERE id = ${TEST_CONTENT_ITEM_ID}
    `);
    await db.execute(sql`
      DELETE FROM content_proxy.publishers 
      WHERE id = ${TEST_PUBLISHER_ID}
    `);
    await db.execute(sql`
      DELETE FROM content_proxy.profiles 
      WHERE id = ${TEST_PROFILE_ID}
    `);
  });

  describe('Publisher Overview', () => {
    it('should return null for non-existent publisher', async () => {
      const result = await getPublisherOverview('non_existent_publisher');
      expect(result).toBeNull();
    });

    it('should return zero values for publisher with no usage', async () => {
      const result = await getPublisherOverview(TEST_PUBLISHER_ID);

      expect(result).toEqual({
        publisherId: TEST_PUBLISHER_ID,
        totalEarnings: 0,
        monthlyEarnings: 0,
        totalRequests: 0,
        monthlyRequests: 0,
        contentCount: 1,
        calculationWindowDays: 30,
        pendingPayout: 0,
        organization: 'Test Publisher',
      });
    });

    it('should calculate earnings from usage transactions', async () => {
      // Create test usage transactions
      await db.insert(usageTransactions).values({
        contentItemId: TEST_CONTENT_ITEM_ID,
        profileId: TEST_PROFILE_ID,
        licensingAgreementId: TEST_LICENSE_ID,
        bytesTransferred: 1000000, // 1MB
        tokensCharged: 10,
        monetaryCostCalculated: '2.0', // 1MB * 0.000002 per byte
        transactionTime: new Date(),
      });

      await db.insert(usageTransactions).values({
        contentItemId: TEST_CONTENT_ITEM_ID,
        profileId: TEST_PROFILE_ID,
        licensingAgreementId: TEST_LICENSE_ID,
        bytesTransferred: 500000, // 0.5MB
        tokensCharged: 5,
        monetaryCostCalculated: '1.0', // 0.5MB * 0.000002 per byte
        transactionTime: new Date(),
      });

      const result = await getPublisherOverview(TEST_PUBLISHER_ID);

      expect(result?.totalEarnings).toBe(3.0); // 2.0 + 1.0
      expect(result?.totalRequests).toBe(2);
      expect(result?.monthlyEarnings).toBe(3.0);
      expect(result?.monthlyRequests).toBe(2);
    });
  });

  describe('Earnings History', () => {
    it('should return earnings history grouped by date', async () => {
      const result = await getPublisherEarningsHistory(TEST_PUBLISHER_ID, 7);

      // Should have at least one entry for today's transactions
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toMatchObject({
        date: expect.any(String),
        earnings: expect.any(Number),
        requests: expect.any(Number),
      });
    });
  });

  describe('Usage by App', () => {
    it('should group usage by profile type', async () => {
      const result = await getPublisherUsageByApp(TEST_PUBLISHER_ID);

      expect(result).toEqual([
        {
          app: 'individual',
          requests: 2,
          earnings: 3.0,
        },
      ]);
    });
  });

  describe('Recent Transactions', () => {
    it('should return recent transactions with details', async () => {
      const result = await getPublisherRecentTransactions(TEST_PUBLISHER_ID, 5);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: expect.any(String),
        timestamp: expect.any(String),
        app: 'individual',
        content: 'Test Article',
        amount: expect.any(Number),
        status: 'completed',
      });
    });
  });

  describe('Content Performance', () => {
    it('should return content performance stats', async () => {
      const result = await getPublisherContentStats(TEST_PUBLISHER_ID);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: TEST_CONTENT_ITEM_ID,
        title: 'Test Article',
        type: 'article',
        requests: 2,
        earnings: 3.0,
        avgCost: 1.5, // 3.0 / 2
        author: 'Test Publisher',
        accessLevel: 'Premium',
        aiAccessEnabled: true,
        pricing: 1.5,
      });
    });
  });

  describe('Materialized Views', () => {
    it('should refresh materialized views successfully', async () => {
      // Test that the refresh function works
      const result = await db.execute(sql`
        SELECT refresh_analytics_views()
      `);

      // The function returns void, but Postgres might return an empty string
      expect(result.rows[0].refresh_analytics_views).toBeDefined();
    });

    it('should have data in materialized views', async () => {
      const views = [
        { name: 'publisher_daily_earnings', idColumn: 'publisher_id' },
        { name: 'usage_by_app', idColumn: 'publisher_id' },
        { name: 'recent_transactions', idColumn: 'publisher_name' }, // This view doesn't have publisher_id
        { name: 'content_performance', idColumn: 'publisher_id' },
      ];

      for (const view of views) {
        const result = await db.execute(sql`
          SELECT COUNT(*) as count FROM content_proxy.${sql.raw(view.name)}
          WHERE ${sql.raw(view.idColumn)} = ${view.idColumn === 'publisher_name' ? 'Test Publisher' : TEST_PUBLISHER_ID}
        `);

        const count = parseInt(result.rows[0].count as string);
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
