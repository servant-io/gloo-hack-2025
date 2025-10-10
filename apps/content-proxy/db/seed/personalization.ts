import { PublisherIds } from '@/lib/content/types';
import { db } from '../db';
import {
  profiles,
  apiKeys,
  profileApiKeyLkp,
  publisherApiKeyLkp,
} from '../schemas/personalization';
import { eq, and } from 'drizzle-orm';

export async function seedPersonalizationSchemas() {
  await seedProfiles();
  await seedApiKeys();
  await seedProfileApiKeyMappings();
  await seedPublisherApiKeyMappings();
}

type Profile = typeof profiles.$inferInsert;

async function seedProfiles() {
  console.log('Seeding profiles...');
  let insertedCount = 0;
  let updatedCount = 0;

  for (const profile of seededProfiles) {
    // Check if profile already exists
    const existingProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, profile.id!))
      .limit(1);

    if (existingProfile.length === 0) {
      // Profile doesn't exist, insert it
      await db.insert(profiles).values(profile as Profile);
      insertedCount++;
    } else {
      // Profile exists, check if we need to update
      const currentProfile = existingProfile[0];
      const needsUpdate =
        currentProfile.firstName !== profile.firstName ||
        currentProfile.lastName !== profile.lastName ||
        currentProfile.email !== profile.email ||
        currentProfile.type !== profile.type ||
        currentProfile.clientIp !== profile.clientIp;

      if (needsUpdate) {
        // Update the profile if any field changed
        await db
          .update(profiles)
          .set({
            firstName: profile.firstName,
            lastName: profile.lastName,
            email: profile.email,
            type: profile.type,
            clientIp: profile.clientIp,
            updatedAt: new Date(),
          })
          .where(eq(profiles.id, profile.id!));
        updatedCount++;
      }
    }
  }
  console.log(
    `Upserted profiles: ${insertedCount} inserted, ${updatedCount} updated, ${seededProfiles.length - insertedCount - updatedCount} unchanged`
  );
}

type ApiKey = typeof apiKeys.$inferInsert;

async function seedApiKeys() {
  console.log('Seeding API keys...');
  let insertedCount = 0;
  let updatedCount = 0;

  for (const apiKey of seededApiKeys) {
    // Check if API key already exists
    const existingApiKey = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.id, apiKey.id!))
      .limit(1);

    if (existingApiKey.length === 0) {
      // API key doesn't exist, insert it
      await db.insert(apiKeys).values(apiKey as ApiKey);
      insertedCount++;
    } else {
      // API key exists, check if we need to update
      const currentApiKey = existingApiKey[0];
      const needsUpdate =
        currentApiKey.name !== apiKey.name ||
        currentApiKey.description !== apiKey.description;

      if (needsUpdate) {
        // Update the API key if any field changed
        await db
          .update(apiKeys)
          .set({
            name: apiKey.name,
            description: apiKey.description,
            updatedAt: new Date(),
          })
          .where(eq(apiKeys.id, apiKey.id!));
        updatedCount++;
      }
    }
  }
  console.log(
    `Upserted API keys: ${insertedCount} inserted, ${updatedCount} updated, ${seededApiKeys.length - insertedCount - updatedCount} unchanged`
  );
}

type ProfileApiKeyLkp = typeof profileApiKeyLkp.$inferInsert;

async function seedProfileApiKeyMappings() {
  console.log('Seeding profile-API key mappings...');
  let insertedCount = 0;

  for (const mapping of seededProfileApiKeyMappings) {
    // Check if mapping already exists
    const existingMapping = await db
      .select()
      .from(profileApiKeyLkp)
      .where(
        and(
          eq(profileApiKeyLkp.profileId, mapping.profileId!),
          eq(profileApiKeyLkp.apiKeyId, mapping.apiKeyId!)
        )
      )
      .limit(1);

    if (existingMapping.length === 0) {
      // Mapping doesn't exist, insert it
      await db.insert(profileApiKeyLkp).values(mapping as ProfileApiKeyLkp);
      insertedCount++;
    }
  }
  console.log(
    `Upserted profile-API key mappings: ${insertedCount} inserted, ${seededProfileApiKeyMappings.length - insertedCount} unchanged`
  );
}

type PublisherApiKeyLkp = typeof publisherApiKeyLkp.$inferInsert;

async function seedPublisherApiKeyMappings() {
  console.log('Seeding publisher-API key mappings...');
  let insertedCount = 0;

  for (const mapping of seededPublisherApiKeyMappings) {
    // Check if mapping already exists
    const existingMapping = await db
      .select()
      .from(publisherApiKeyLkp)
      .where(
        and(
          eq(publisherApiKeyLkp.publisherId, mapping.publisherId!),
          eq(publisherApiKeyLkp.apiKeyId, mapping.apiKeyId!)
        )
      )
      .limit(1);

    if (existingMapping.length === 0) {
      // Mapping doesn't exist, insert it
      await db.insert(publisherApiKeyLkp).values(mapping as PublisherApiKeyLkp);
      insertedCount++;
    }
  }
  console.log(
    `Upserted publisher-API key mappings: ${insertedCount} inserted, ${seededPublisherApiKeyMappings.length - insertedCount} unchanged`
  );
}

// Generate API keys with proper properties
function generateApiKey(): string {
  // Generate a 64-character hex string (equivalent to openssl rand -hex 32)
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
    ''
  );
}

// Service-level profiles representing different API clients
const seededProfiles: Profile[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    firstName: 'Production',
    lastName: 'Service',
    email: 'production@example.com',
    type: 'service',
    clientIp: '192.168.1.100',
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    firstName: 'Development',
    lastName: 'Service',
    email: 'development@example.com',
    type: 'service',
    clientIp: '10.0.0.50',
  },
  {
    id: '789e0123-e45b-67d8-a901-526614174111',
    firstName: 'Testing',
    lastName: 'Service',
    email: 'testing@example.com',
    type: 'service',
    clientIp: '172.16.0.25',
  },
];

const seededApiKeys: ApiKey[] = [
  {
    id: 'a1b2c3d4-e5f6-7890-1234-567890123456',
    key: generateApiKey(),
    name: 'Production API Key',
    description: 'Used for production mobile app authentication',
  },
  {
    id: 'b2c3d4e5-f6a7-8901-2345-678901234567',
    key: generateApiKey(),
    name: 'Development Environment',
    description: 'Internal service-to-service communication for development',
  },
  {
    id: 'c3d4e5f6-a7b8-9012-3456-789012345678',
    key: generateApiKey(),
    name: 'Testing API Key',
    description: 'Used for automated testing and CI/CD pipelines',
  },
  {
    id: '44d641bb-4612-4e55-9670-5e31e6cb97e4',
    key: generateApiKey(),
    name: 'Development "Carey Nieuwhof"',
    description: 'Local development as publisher "Carey Nieuwhof"',
  },
  {
    id: 'fcad602f-c4c2-4c93-96d4-2d917887d66b',
    key: generateApiKey(),
    name: 'Development "ACU"',
    description: 'Local development as publisher "ACU"',
  },
];

// Profile-API key mappings - dynamically reference the seeded profiles
const seededProfileApiKeyMappings: ProfileApiKeyLkp[] = [
  {
    profileId: '550e8400-e29b-41d4-a716-446655440000', // Production Service
    apiKeyId: 'a1b2c3d4-e5f6-7890-1234-567890123456', // Production API Key
  },
  {
    profileId: '123e4567-e89b-12d3-a456-426614174000', // Development Service
    apiKeyId: 'b2c3d4e5-f6a7-8901-2345-678901234567', // Development API Key
  },
  {
    profileId: '789e0123-e45b-67d8-a901-526614174111', // Testing Service
    apiKeyId: 'c3d4e5f6-a7b8-9012-3456-789012345678', // Testing API Key
  },
];

// Publisher-API key mappings - dynamically reference the seeded publishers
const seededPublisherApiKeyMappings: PublisherApiKeyLkp[] = [
  {
    publisherId: PublisherIds.CAREY_NIEUWHOF,
    apiKeyId: '44d641bb-4612-4e55-9670-5e31e6cb97e4',
  },
  {
    publisherId: PublisherIds.ACU,
    apiKeyId: 'fcad602f-c4c2-4c93-96d4-2d917887d66b',
  },
];

/**
 * Only self-invoke if this file is being run directly
 * (not imported as a module)
 */
if (require.main === module) {
  seedPersonalizationSchemas()
    .then(() => {
      console.log(
        '(personalization schemas) Database seeding completed successfully!'
      );
      process.exit(0);
    })
    .catch((error) => {
      console.error(
        '(personalization schemas) Database seeding failed:',
        error
      );
      process.exit(1);
    });
}
