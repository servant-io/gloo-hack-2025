import { defineConfig } from 'drizzle-kit';
import { getEnv } from '@/lib/env';

const { POSTGRES_URL } = getEnv();

export default defineConfig({
  schema: [
    './db/schema.ts',
    './db/schemas/personalization.ts',
    './db/schemas/content.ts',
    './db/schemas/licensing.ts',
  ],
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: POSTGRES_URL,
  },
  verbose: true,
  strict: true,
});
