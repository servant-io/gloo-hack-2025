import { NextRequest } from 'next/server';
import { db } from '@/db/db';
import { eq } from 'drizzle-orm';
import {
  apiKeys,
  profileApiKeyLkp,
  publisherApiKeyLkp,
} from '@/db/schemas/personalization'; // Added profileApiKeyLkp

interface ProfileAuthResult {
  authorized: boolean;
  apiKey?: string;
  profileId?: string;
}

interface PublisherAuthResult {
  authorized: boolean;
  apiKey?: string;
  publisherId?: string;
}

/**
 * Extract the API key from query params or Authorization header
 * @param request The Next.js request object.
 */
function extractApiKeyFromRequest(request: NextRequest): string {
  const { searchParams } = new URL(request.url);

  const apiKey =
    (searchParams.get('api_key') || '').trim() ||
    (request.headers.get('authorization') || '')
      .replace(/^Bearer\s+/i, '')
      .trim();

  return apiKey;
}
/**
 * Performs a Drizzle query to lookup the API key and find its associated profile ID
 * via the profile_api_key_lkp table.
 * @param key The API key string.
 * @returns The profile ID string if found, otherwise undefined.
 */
async function lookupApiKeyAndProfileId(
  key: string
): Promise<string | undefined> {
  const result = await db
    .select({
      profileId: profileApiKeyLkp.profileId,
    })
    .from(apiKeys)
    .innerJoin(profileApiKeyLkp, eq(apiKeys.id, profileApiKeyLkp.apiKeyId))
    .where(eq(apiKeys.key, key))
    .limit(1);

  return result[0]?.profileId;
}

/**
 * Performs a Drizzle query to lookup the API key and find its associated profile ID
 * via the profile_api_key_lkp table.
 * @param key The API key string.
 * @returns The profile ID string if found, otherwise undefined.
 */
async function lookupApiKeyAndPublisherId(
  key: string
): Promise<string | undefined> {
  const result = await db
    .select({
      publisherId: publisherApiKeyLkp.publisherId,
    })
    .from(apiKeys)
    .innerJoin(publisherApiKeyLkp, eq(apiKeys.id, publisherApiKeyLkp.apiKeyId))
    .where(eq(apiKeys.key, key))
    .limit(1);

  return result[0]?.publisherId;
}

/**
 * Extract API key from either request query or headers, validate its existence,
 * and retrieve the associated profile ID.
 * The user is considered "authorized" only if a valid key is found AND it's
 * linked to a profile.
 */
export async function authorizeProfile(
  request: NextRequest
): Promise<ProfileAuthResult> {
  const apiKey = extractApiKeyFromRequest(request);

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

/**
 * Extract API key from either request query or headers, validate its existence,
 * and retrieve the associated profile ID.
 * The user is considered "authorized" only if a valid key is found AND it's
 * linked to a profile.
 */
export async function authorizePublisher(
  request: NextRequest
): Promise<PublisherAuthResult> {
  const apiKey = extractApiKeyFromRequest(request);

  if (!apiKey) {
    return { authorized: false };
  }

  // 2. Lookup the API key and retrieve the publisher ID
  const publisherId = await lookupApiKeyAndPublisherId(apiKey);

  // 3. Construct and return the result object
  if (publisherId) {
    return {
      authorized: true,
      apiKey: apiKey,
      publisherId: publisherId,
    };
  }

  // If the key was present but not linked to a publisher, or not found at all.
  return { authorized: false };
}
