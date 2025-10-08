import { z } from 'zod';
import { type ToolMetadata, type InferSchema } from 'xmcp';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required'
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Define the schema for tool parameters
export const schema = {
  id: z.string().describe('The unique identifier for the document to fetch'),
};

// Define tool metadata with widget reference
export const metadata: ToolMetadata & { _meta?: any } = {
  name: 'fetch',
  description:
    'Retrieve complete document content by ID for detailed analysis and citation.',
  annotations: {
    title: 'Fetch Document',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
  _meta: {
    'openai/outputTemplate': 'widgets://document-content-widget',
    'openai/toolInvocation/invoking': 'Fetching document content...',
    'openai/toolInvocation/invoked': 'Document content retrieved!',
  },
};

// Tool implementation
export default async function fetch({ id }: InferSchema<typeof schema>) {
  try {
    if (!id || !id.trim()) {
      throw new Error('Document ID is required');
    }

    // Fetch the document from Supabase
    const { data: transcript, error } = await supabase
      .from('transcripts_videos')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !transcript) {
      throw new Error(`Document with ID ${id} not found`);
    }

    // Format the full transcript text
    let fullText = transcript.transcript || '';

    // If we have timestamped segments, we can optionally include them
    // For now, just return the main transcript
    if (transcript.transcript_ts && Array.isArray(transcript.transcript_ts)) {
      // Optionally add segment markers for better context
      const segmentTexts = transcript.transcript_ts
        .filter((segment: any) => segment.text)
        .map((segment: any) => segment.text)
        .join(' ');

      if (segmentTexts && segmentTexts !== fullText) {
        fullText = segmentTexts; // Use segment text if it's different/better
      }
    }

    const result = {
      id: transcript.id,
      title: transcript.title || `Document ${id}`,
      text: fullText,
      url: transcript.training_url || transcript.video_url,
      metadata: {
        source: 'supabase_transcripts_videos',
        video_url: transcript.video_url,
        training_url: transcript.training_url,
        created_at: transcript.created_at,
        updated_at: transcript.updated_at,
      },
    };

    return {
      content: [
        {
          type: 'text',
          text: `Retrieved document: ${result.title}`,
        },
      ],
      structuredContent: {
        document: result,
        metadata: {
          id: result.id,
          title: result.title,
          url: result.url,
          textLength: result.text.length,
          source: result.metadata.source,
        },
      },
    };
  } catch (error) {
    console.error('Fetch error:', error);

    // Return error information
    const errorResult = {
      id: id,
      title: 'Error',
      text: `Error fetching document: ${error instanceof Error ? error.message : 'Unknown error'}`,
      url: '',
      metadata: {
        error: true,
        source: 'transcripts_videos',
      },
    };

    return {
      content: [
        {
          type: 'text',
          text: `Error fetching document: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      structuredContent: {
        document: errorResult,
        metadata: {
          error: true,
          id: id,
          title: 'Error',
        },
      },
    };
  }
}
