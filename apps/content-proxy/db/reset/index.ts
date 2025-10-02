import { resetContentSchemas } from './content';
import { resetPersonalizationSchemas } from './personalization';

export async function reset() {
  await resetContentSchemas();
  await resetPersonalizationSchemas;
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
