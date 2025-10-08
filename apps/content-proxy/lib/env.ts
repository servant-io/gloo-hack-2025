import { z } from 'zod';
import { config } from 'dotenv';

const envSchema = z.object({
  POSTGRES_URL: z.string().min(1, 'POSTGRES_URL must be a non-empty string'),
  CONTENT_PROXY_ALLOWED_ORIGINS: z
    .string()
    .optional()
    .transform((value) => value ?? undefined),
});

export function getEnv() {
  config({ path: '.env.local' });

  return envSchema.parse(process.env);
}
