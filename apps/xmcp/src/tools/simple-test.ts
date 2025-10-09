import { z } from 'zod';
import { type InferSchema, type ToolMetadata } from 'xmcp';

export const schema = {
  message: z
    .string()
    .optional()
    .describe('Optional message to display in the widget'),
};

export const metadata: ToolMetadata & { _meta?: any } = {
  name: 'simple-test',
  description: 'Test the simple widget system',
  annotations: {
    title: 'Simple Widget Test',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
  _meta: {
    'openai/outputTemplate': 'ui://widget/simple-test.html',
    'openai/toolInvocation/invoking': 'Loading test widget...',
    'openai/toolInvocation/invoked': 'Test widget loaded!',
    "openai/widgetAccessible": true,
    "openai/resultCanProduceWidget": true
  },
};

export default async function simpleTest({
  message,
}: InferSchema<typeof schema>) {
  return {
    content: [
      {
        type: 'text',
        text: 'Simple test widget loaded successfully!',
      },
    ],
    structuredContent: {
      message: message || 'Hello from the test widget!',
      timestamp: new Date().toISOString(),
      testData: {
        status: 'success',
        version: '1.0.0',
      },
    },
    _meta: {
      'openai/outputTemplate': 'ui://widget/simple-test.html',
      'openai/toolInvocation/invoking': 'Loading test widget...',
      'openai/toolInvocation/invoked': 'Test widget loaded!',
      'openai/widgetAccessible': true,
      'openai/resultCanProduceWidget': true,
    },
  };
}
