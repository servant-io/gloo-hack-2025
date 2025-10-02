import { db } from '../db';
import {
  events,
  metricSchemaVersions,
  metrics,
  profiles,
} from '../schemas/personalization';

export async function resetPersonalizationSchemas() {
  await db.delete(events);
  await db.delete(metricSchemaVersions);
  await db.delete(metrics);
  await db.delete(profiles);
}

/**
 * Only self-invoke if this file is being run directly
 * (not imported as a module)
 */
if (require.main === module) {
  resetPersonalizationSchemas()
    .then(() => {
      console.log(
        '(personalization schemas) Database reset completed successfully!'
      );
      process.exit(0);
    })
    .catch((error) => {
      console.error('(personalization schemas) Database reset failed:', error);
      process.exit(1);
    });
}
