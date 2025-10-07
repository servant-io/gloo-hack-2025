import { NextRequest } from "next/server";

import { db } from '@/db/db';
import { eq, count } from 'drizzle-orm';
import { apiKeys } from '@/db/schemas/personalization';

/**
 * Extract API key from either request query or headers and validate its presence
 */
export async function isAuthorized(request: NextRequest): Promise<boolean> {
  const { searchParams } = new URL(request.url);
  const apiKey =
    (searchParams.get('api_key') || "").trim() ||
    (request.headers.get('authorization') || "").replace(/^Bearer\s+/i, "").trim();

  if (!apiKey) return false

  return await apiKeyExists(apiKey);
}

/**
 * Check if an API key exists by ID
 */
export async function apiKeyExists(key: string): Promise<boolean> {
  const result = await db
    .select({ count: count() })
    .from(apiKeys)
    .where(eq(apiKeys.key, key));

  return (result[0]?.count ?? 0) > 0;
}
