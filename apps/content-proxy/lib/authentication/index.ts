import { NextRequest } from "next/server";

// Assuming db, apiKeys, and profileApiKeyLkp are correctly imported from your project's setup
import { db } from '@/db/db';
import { eq } from 'drizzle-orm';
import { apiKeys, profileApiKeyLkp } from '@/db/schemas/personalization'; // Added profileApiKeyLkp

/**
 * Defines the structured result for the authorization check.
 */
interface AuthResult {
  authorized: boolean;
  apiKey?: string;
  profileId?: string;
}

/**
 * Performs a Drizzle query to lookup the API key and find its associated profile ID
 * via the profile_api_key_lkp table.
 * @param key The API key string.
 * @returns The profile ID string if found, otherwise undefined.
 */
async function lookupApiKeyAndProfileId(key: string): Promise<string | undefined> {
  // Select only the profileId column
  const result = await db
    .select({
      profileId: profileApiKeyLkp.profileId,
    })
    .from(apiKeys)
    // Join apiKeys with the lookup table on the key's ID
    .innerJoin(profileApiKeyLkp, eq(apiKeys.id, profileApiKeyLkp.apiKeyId))
    // Filter by the provided API key value
    .where(eq(apiKeys.key, key))
    .limit(1); // Limit to 1 result since the key is unique

  // If a result is found, return the profileId, otherwise return undefined
  return result[0]?.profileId;
}

/**
 * Extract API key from either request query or headers, validate its existence,
 * and retrieve the associated profile ID.
 * The user is considered "authorized" only if a valid key is found AND it's
 * linked to a profile.
 */
export async function authorize(request: NextRequest): Promise<AuthResult> {
  const { searchParams } = new URL(request.url);

  // 1. Extract the API key from query params or Authorization header
  const apiKey =
    (searchParams.get('api_key') || "").trim() ||
    (request.headers.get('authorization') || "").replace(/^Bearer\s+/i, "").trim();

  if (!apiKey) {
    return { authorized: false };
  }

  // 2. Lookup the API key and retrieve the profile ID
  const profileId = await lookupApiKeyAndProfileId(apiKey);

  // 3. Construct and return the result object
  if (profileId) {
    return {
      authorized: true,
      apiKey: apiKey,
      profileId: profileId,
    };
  }

  // If the key was present but not linked to a profile, or not found at all.
  return { authorized: false };
}
