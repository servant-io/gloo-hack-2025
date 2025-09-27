import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { getEnv } from '../lib/env';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as contentProxySchemas from '@/db/schema';

const { POSTGRES_URL } = getEnv();

// Configure connection pool for serverless environments
const pool = new Pool({
  connectionString: POSTGRES_URL,
  // Limit connections to prevent pool exhaustion
  max: process.env.NODE_ENV === 'production' ? 5 : 10,
  // Timeout for acquiring connection
  connectionTimeoutMillis: 5000,
  // Timeout for queries
  idleTimeoutMillis: 30000,
  // Allow connections to be closed after use
  allowExitOnIdle: true,
});

// Handle pool errors gracefully
pool.on('error', (err) => {
  console.error('Database pool error:', err);
});

const schema = {
  ...contentProxySchemas,
};

export const db: NodePgDatabase<typeof schema> = drizzle(pool, {
  schema,
});

export const getPool = (): InstanceType<typeof Pool> => pool;
