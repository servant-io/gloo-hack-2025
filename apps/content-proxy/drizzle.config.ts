import { defineConfig } from 'drizzle-kit';
import { getEnv } from '@/lib/env';

const { POSTGRES_URL } = getEnv();

export default defineConfig({
  schema: ['./db/schemas/personalization.ts'],
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: POSTGRES_URL,
  },
  verbose: true,
  strict: true,
});
