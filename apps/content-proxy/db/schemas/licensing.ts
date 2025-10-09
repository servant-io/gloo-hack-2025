import { sql } from 'drizzle-orm';
import { decimal, integer, timestamp, varchar } from 'drizzle-orm/pg-core';
import { contentProxySchema } from '../schema';
import { publishers } from './content';
import { contentItems } from './content';
import { profiles, events } from './personalization';

// Following the pattern from content.ts for publisher-related tables
export const licensingAgreements = contentProxySchema.table(
  'licensing_agreements',
  {
    /**
     * Unique identifier for the licensing agreement
     * `openssl rand -hex 6`
     * @example "21991dbb36be"
     * @example "dffa5eca5ccc"
     * @example "88c7702ddabb"
     */
    id: varchar('id', { length: 12 }).primaryKey().notNull(),

    /**
     * Foreign key reference to the publisher
     */
    publisherId: varchar('publisher_id', { length: 12 })
      .notNull()
      .references(() => publishers.id),

    /**
     * Human-readable name for the licensing agreement
     * @example "Standard Academic License 2024"
     * @example "Premium Content Agreement"
     */
    name: varchar('name', { length: 200 }).notNull(),

    /**
     * Monetary rate per byte for revenue calculation
     * @example 0.000002
     */
    monetaryRatePerByte: decimal('monetary_rate_per_byte', {
      precision: 10,
      scale: 8,
    }),

    /**
     * Monetary rate per request for revenue calculation
     * @example 0.045
     */
    monetaryRatePerRequest: decimal('monetary_rate_per_request', {
      precision: 10,
      scale: 4,
    }),

    /**
     * When this agreement becomes effective
     */
    effectiveDate: timestamp('effective_date').defaultNow().notNull(),

    /**
     * When this agreement expires (optional)
     */
    expiresAt: timestamp('expires_at'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  }
);

// Following the pattern from content.ts for content-related tables
export const contentPricing = contentProxySchema.table('content_pricing', {
  /**
   * Unique identifier for the pricing entry
   * `openssl rand -hex 6`
   * @example "21991dbb36be"
   * @example "dffa5eca5ccc"
   * @example "88c7702ddabb"
   */
  id: varchar('id', { length: 12 }).primaryKey().notNull(),

  /**
   * Foreign key reference to the content item
   */
  contentItemId: varchar('content_item_id', { length: 12 })
    .notNull()
    .references(() => contentItems.id),

  /**
   * Foreign key reference to the licensing agreement
   */
  licensingAgreementId: varchar('licensing_agreement_id', { length: 12 })
    .notNull()
    .references(() => licensingAgreements.id),

  /**
   * Pricing model for consumer access
   * @example "free"
   * @example "token_based"
   */
  pricingModel: varchar('pricing_model', { length: 20 }).notNull(),

  /**
   * Token cost per byte (for token-based pricing)
   * @example 1
   * @example 5
   */
  tokenCostPerByte: integer('token_cost_per_byte'),

  /**
   * Token cost per request (for token-based pricing)
   * @example 10
   * @example 25
   */
  tokenCostPerRequest: integer('token_cost_per_request'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Following the pattern from personalization.ts for transaction/event tables
export const usageTransactions = contentProxySchema.table(
  'usage_transactions',
  {
    /**
     * Unique identifier for the transaction (UUID v4)
     * @example "550e8400-e29b-41d4-a716-446655440000"
     * @example "123e4567-e89b-12d3-a456-426614174000"
     */
    id: varchar('id', { length: 36 })
      .primaryKey()
      .notNull()
      .default(sql`gen_random_uuid()`),

    /**
     * Foreign key reference to the original event
     */
    eventId: varchar('event_id', { length: 36 }).references(() => events.id),

    /**
     * Foreign key reference to the content item
     */
    contentItemId: varchar('content_item_id', { length: 12 })
      .notNull()
      .references(() => contentItems.id),

    /**
     * Foreign key reference to the profile/user
     */
    profileId: varchar('profile_id', { length: 36 })
      .notNull()
      .references(() => profiles.id),

    /**
     * Foreign key reference to the licensing agreement
     */
    licensingAgreementId: varchar('licensing_agreement_id', { length: 12 })
      .notNull()
      .references(() => licensingAgreements.id),

    /**
     * Number of tokens charged to the user (consumer-facing)
     * @example 5
     * @example 25
     */
    tokensCharged: integer('tokens_charged'),

    /**
     * Number of bytes transferred in this transaction
     * @example 1024
     * @example 5242880
     */
    bytesTransferred: integer('bytes_transferred'),

    /**
     * Calculated monetary cost for revenue tracking (publisher-facing)
     * @example 0.002048
     * @example 10.48576
     */
    monetaryCostCalculated: decimal('monetary_cost_calculated', {
      precision: 10,
      scale: 4,
    }),

    transactionTime: timestamp('transaction_time').defaultNow().notNull(),
  }
);

// Following the pattern from personalization.ts for profile-related tables
export const tokenBalances = contentProxySchema.table('token_balances', {
  /**
   * Foreign key reference to the profile
   */
  profileId: varchar('profile_id', { length: 36 })
    .primaryKey()
    .references(() => profiles.id),

  /**
   * Current token balance for the user
   * @example 100
   * @example 5000
   */
  tokenBalance: integer('token_balance').default(0).notNull(),

  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
});
