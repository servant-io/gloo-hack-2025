import { db } from '../db';

import {
  contentItems,
  contentItemsSources,
  publishers,
} from '../schemas/content';
import {
  apiKeys,
  events,
  metricSchemaVersions,
  metrics,
  profileApiKeyLkp,
  profiles,
  publisherApiKeyLkp,
} from '../schemas/personalization';

export async function reset() {
  await db.delete(profileApiKeyLkp);
  await db.delete(publisherApiKeyLkp);
  await db.delete(contentItems);
  await db.delete(contentItemsSources);
  await db.delete(apiKeys);
  await db.delete(events);
  await db.delete(metricSchemaVersions);
  await db.delete(metrics);
  await db.delete(publishers);
  await db.delete(profiles);
}

/**
 * Only self-invoke if this file is being run directly
 * (not imported as a module)
 */
if (require.main === module) {
  reset()
    .then(() => {
      console.log('Database reset completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database reset failed:', error);
      process.exit(1);
    });
}
