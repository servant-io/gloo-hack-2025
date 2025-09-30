import { sql } from 'drizzle-orm';
import { jsonb, pgSchema, timestamp, varchar } from 'drizzle-orm/pg-core';

export const contentProxySchema = pgSchema('content_proxy');

export const profiles = contentProxySchema.table('profiles', {
  /**
   * Unique identifier for the profile (UUID v4)
   * @example "550e8400-e29b-41d4-a716-446655440000"
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  id: varchar('id', { length: 36 })
    .primaryKey()
    .notNull()
    .default(sql`gen_random_uuid()`),
  /**
   * Client IP address (supports both IPv4 and IPv6)
   * @example "192.168.1.1"
   * @example "2001:0db8:85a3:0000:0000:8a2e:0370:7334"
   */
  clientIp: varchar('client_ip', { length: 39 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const metrics = contentProxySchema.table('metrics', {
  /**
   * @example viewed_content
   * @example reviewed_content_quality
   */
  name: varchar('name', { length: 255 }).primaryKey().notNull(),
});

export const metricSchemaVersions = contentProxySchema.table(
  'metric_schema_versions',
  {
    /**
     * Unique identifier for the profile (UUID v4)
     * @example "550e8400-e29b-41d4-a716-446655440000"
     * @example "123e4567-e89b-12d3-a456-426614174000"
     */
    id: varchar('id', { length: 36 })
      .primaryKey()
      .notNull()
      .default(sql`gen_random_uuid()`),
    metricName: varchar('metric_name')
      .references(() => metrics.name)
      .notNull(),
    /**
     * @see https://semver.org/
     * @example v1.0.0
     * @example v2.1.5
     * @example v3.0.0-alpha.1
     * @example v2.4.0-beta.2
     * @example v1.2.3-rc.1
     * @example v0.5.0+build.123
     */
    revision: varchar('revision', { length: 36 }),
    /**
     * @see https://json-schema.org/specification
     * @example
     * ```json
     * {
     *   "type": "object",
     *   "required": ["a", "c"],
     *   "properties": {
     *     "a": {
     *       "type": "string"
     *     },
     *     "b": {
     *       "type": "object"
     *     },
     *     "c": {
     *       "type": "array",
     *       "items": {
     *         "type": "string"
     *       }
     *     }
     *   }
     * }
     * ```
     */
    schema: jsonb('schema'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  }
);

export const events = contentProxySchema.table('events', {
  id: varchar('id', { length: 36 })
    .primaryKey()
    .notNull()
    .default(sql`gen_random_uuid()`),
  profileId: varchar('profile_id')
    .references(() => profiles.id)
    .notNull(),
  metricSchemaVersionId: varchar('metric_schema_version_id')
    .references(() => metricSchemaVersions.id)
    .notNull(),
  data: jsonb('data').notNull(),
  ts: timestamp('ts').defaultNow().notNull(),
});
