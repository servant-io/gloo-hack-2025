import { db } from '../db';
import { sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

async function createAnalyticsViews() {
  try {
    console.log('Creating analytics materialized views...');

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'analytics_views.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Split by semicolons and execute each statement
    // Handle function definitions that contain semicolons
    const statements = [];
    let currentStatement = '';
    let inFunction = false;

    const lines = sqlContent.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith('CREATE OR REPLACE FUNCTION')) {
        inFunction = true;
      }

      if (inFunction) {
        currentStatement += line + '\n';
        if (trimmedLine.includes('$$ LANGUAGE plpgsql')) {
          inFunction = false;
          statements.push(currentStatement.trim());
          currentStatement = '';
        }
      } else {
        if (trimmedLine.endsWith(';') && !trimmedLine.startsWith('--')) {
          currentStatement += line;
          statements.push(currentStatement.trim());
          currentStatement = '';
        } else if (trimmedLine.length > 0 && !trimmedLine.startsWith('--')) {
          currentStatement += line + ' ';
        }
      }
    }

    // Add any remaining statement
    if (currentStatement.trim().length > 0) {
      statements.push(currentStatement.trim());
    }

    for (const statement of statements) {
      if (statement.startsWith('--') || statement.length === 0) continue;

      try {
        await db.execute(sql.raw(statement));
        console.log('✓ Executed SQL statement');
      } catch (error) {
        console.error('✗ Failed to execute statement:', error);
        console.error('Statement:', statement);
      }
    }

    console.log('✓ Analytics views created successfully');
  } catch (error) {
    console.error('✗ Failed to create analytics views:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createAnalyticsViews()
    .then(() => {
      console.log('✓ All views created successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('✗ Failed to create views:', error);
      process.exit(1);
    });
}

export { createAnalyticsViews };
