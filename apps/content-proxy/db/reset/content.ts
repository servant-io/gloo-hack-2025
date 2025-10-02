import { db } from '../db';
import { contentItems, publishers } from '../schemas/content';

export async function resetContentSchemas() {
  await db.delete(contentItems);
  await db.delete(publishers);
}

/**
 * Only self-invoke if this file is being run directly
 * (not imported as a module)
 */
if (require.main === module) {
  resetContentSchemas()
    .then(() => {
      console.log('(content schemas) Database reset completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('(content schemas) Database reset failed:', error);
      process.exit(1);
    });
}
