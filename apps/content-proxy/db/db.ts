import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { getEnv } from '../lib/env';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as contentProxySchemas from '@/db/schema';

const { POSTGRES_URL } = getEnv();
const pool = new Pool({
  connectionString: POSTGRES_URL,
});

const schema = {
  ...contentProxySchemas,
};

export const db: NodePgDatabase<typeof schema> = drizzle(pool, {
  schema,
});

export const getPool = (): InstanceType<typeof Pool> => pool;
