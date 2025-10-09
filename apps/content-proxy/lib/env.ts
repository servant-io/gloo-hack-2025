import { z } from 'zod';
import { config } from 'dotenv';

const envSchema = z.object({
  POSTGRES_URL: z.string().min(1, 'POSTGRES_URL must be a non-empty string'),
  CONTENT_PROXY_ALLOWED_ORIGINS: z
    .string()
    .optional()
    .transform((value) => value ?? undefined),
  GLOO_AI_CLIENT_ID: z
    .string()
    .min(1, 'GLOO_AI_CLIENT_ID must be a non-empty string'),
  GLOO_AI_CLIENT_SECRET: z
    .string()
    .min(1, 'GLOO_AI_CLIENT_SECRET must be a non-empty string'),
});

export function getEnv() {
  config({ path: '.env.local' });

  return envSchema.parse(process.env);
}
