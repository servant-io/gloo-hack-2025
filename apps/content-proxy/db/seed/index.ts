import { seedContentSchemas } from './content';
import { seedPersonalizationSchemas } from './personalization';
import { seedAnalyticsData } from './analytics';
import { seedLicensingData } from './licensing';

export async function seed() {
  await seedContentSchemas();
  await seedPersonalizationSchemas();
  await seedAnalyticsData();
  await seedLicensingData();
}

/**
 * Only self-invoke if this file is being run directly
 * (not imported as a module)
 */
if (require.main === module) {
  seed()
    .then(() => {
      console.log('Database seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database seeding failed:', error);
      process.exit(1);
    });
}
