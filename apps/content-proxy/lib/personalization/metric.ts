import { db } from '@/db/db';
import { metrics, metricSchemaVersions } from '@/db/schemas/personalization';
import { and, eq, desc } from 'drizzle-orm';
import viewedContentSchema from '@/lib/personalization/metricSchemas/viewedContent.schema.json';
import transferredContentBytesSchema from '@/lib/personalization/metricSchemas/transferredContentBytes.schema.json';
import Ajv from 'ajv';
import type { JSONSchemaType } from 'ajv';

/**
 * @description follow the pattern: verb_object
 * @example viewed_content
 * @example transferred_content_bytes
 */
export type MetricName = 'viewed_content' | 'transferred_content_bytes';
type MetricConfig = {
  name: MetricName;
  revision: 'v0.1.0';
  schema: unknown;
};

const metricConfigs: MetricConfig[] = [
  {
    name: 'viewed_content',
    revision: 'v0.1.0',
    schema: viewedContentSchema,
  },
  {
    name: 'transferred_content_bytes',
    revision: 'v0.1.0',
    schema: transferredContentBytesSchema,
  },
];

export type ValidationResult = {
  success: boolean;
  message: string;
  metricSchemaVersionId: string;
};

export async function validateEventData(
  metricName: MetricName,
  eventData: unknown
): Promise<ValidationResult> {
  const metricSchemaVersion = await upsertMetricSchemaVersion(metricName);

  // Initialize Ajv validator
  const ajv = new Ajv();

  try {
    // Get the schema from the metric schema version and cast it to the expected type
    const schema = metricSchemaVersion.schema as JSONSchemaType<unknown>;

    // Validate the event data against the schema
    const validate = ajv.compile(schema);
    const isValid = validate(eventData);

    if (isValid) {
      return {
        success: true,
        message: '',
        metricSchemaVersionId: metricSchemaVersion.id,
      };
    } else {
      // Format validation errors for the message
      const errorMessages =
        validate.errors
          ?.map((error) => `${error.instancePath} ${error.message}`)
          .join(', ') || 'Unknown validation error';

      return {
        success: false,
        message: errorMessages,
        metricSchemaVersionId: metricSchemaVersion.id,
      };
    }
  } catch (error) {
    // Handle any errors during validation (e.g., invalid schema)
    return {
      success: false,
      message: `Validation error: ${error instanceof Error ? error.message : String(error)}`,
      metricSchemaVersionId: metricSchemaVersion.id,
    };
  }
}

type MetricSchemaVersion = typeof metricSchemaVersions.$inferSelect;
type UpsertMetricSchemaVersionResponse = {
  id: MetricSchemaVersion['id'];
  schema: MetricSchemaVersion['schema'];
};

export async function upsertMetricSchemaVersion(
  metricName: MetricName
): Promise<UpsertMetricSchemaVersionResponse> {
  const metricConfig = metricConfigs.find((mc) => mc.name === metricName);
  if (!metricConfig) {
    throw new Error(`metric config not found in code: ${metricName}`);
  }
  const [metric] = await db
    .select({ id: metrics.name })
    .from(metrics)
    .where(eq(metrics.name, metricName))
    .limit(1);
  if (!metric) {
    await db.insert(metrics).values({ name: metricName });
  }
  const [metricSchemaVersion] = await db
    .select({
      id: metricSchemaVersions.id,
      schema: metricSchemaVersions.schema,
    })
    .from(metricSchemaVersions)
    .where(
      and(
        eq(metricSchemaVersions.metricName, metricName),
        eq(metricSchemaVersions.revision, metricConfig.revision)
      )
    )
    .orderBy(desc(metricSchemaVersions.createdAt))
    .limit(1);
  if (!metricSchemaVersion) {
    const [newMetricSchemaVersion] = await db
      .insert(metricSchemaVersions)
      .values({
        metricName: metricName,
        revision: metricConfig.revision,
        schema: metricConfig.schema,
      })
      .returning({
        id: metricSchemaVersions.id,
        schema: metricSchemaVersions.schema,
      });
    return newMetricSchemaVersion;
  }
  return metricSchemaVersion;
}
